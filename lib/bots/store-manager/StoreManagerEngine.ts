/**
 * ============================================================
 * 🏆 TIER-1: StoreManagerEngine（商品店長主引擎）
 * ============================================================
 * 職責：處理所有客戶 LINE Bot 的 Webhook 事件
 *
 * 架構：
 *   Webhook Route (接收) → StoreManagerEngine.process() (分發)
 *     ├── 系統指令 (#綁定, @我是店長)
 *     ├── Partner 路由（找對應的子 Bot）
 *     ├── Owner 指令 → StoreManagerDojo
 *     └── 一般對話 → OpenAI + StoreManagerTools
 *
 * 隔離原則：
 *   - 只依賴 lib/bots/store-manager/* 與 lib/bots/(types|BotBase)
 *   - 禁止 import 任何 TIER-2/3/4 模組
 *   - 所有外部依賴（supabase, openai, line client）均由 process() 入口建立
 */

import { Client, WebhookEvent } from '@line/bot-sdk';
import OpenAI from 'openai';
import { SupabaseClient } from '@supabase/supabase-js';

import { Redis } from '@upstash/redis';
import { supabase as globalSupabase } from '@/lib/supabase';
import { decrypt } from '@/lib/encryption';
import { markAsProcessed, getIdempotencyKey } from '@/lib/middleware/idempotency';
import { acquireSlot, releaseSlot, getConcurrentLimit } from '@/lib/middleware/concurrency';
import { calculateCost, logTokenUsage } from '@/lib/token-guard';
import { IntentInterceptor } from '@/lib/services/IntentInterceptor';
import { GenericToolsRegistry } from '@/lib/services/tools';

import { BotConfig } from '../types';
import { BotLogger, safeReply, BOT_ERROR_MESSAGES } from '../BotBase';
import { StoreManagerDojo } from './StoreManagerDojo';
import { getStoreManagerTools, STORE_SECURITY_PROMPT } from './StoreManagerTools';

const TIER = 'TIER1:StoreManager' as const;

// ─── 主處理函式（由 webhook route 呼叫）─────────────────────
/**
 * 主入口：接收 botId 與 LINE events，建立所需客戶端後處理。
 * 這是從外部能呼叫到 TIER-1 的唯一入口點。
 */
export async function processStoreEvents(
    botId: string,
    events: WebhookEvent[]
): Promise<void> {
    const logger = new BotLogger(TIER, botId);
    logger.info(`Processing ${events.length} event(s)`);

    const redis = Redis.fromEnv();
    
    // 1. 取得 Bot 設定 (加上 Redis 快取防護)
    let bot: any = await redis.get(`bot_config:${botId}`);
    let botError = null;

    if (!bot) {
        const { data, error } = await globalSupabase
            .from('bots')
            .select('*')
            .eq('id', botId)
            .single();
        bot = data;
        botError = error;
        
        if (bot && !error) {
            await redis.set(`bot_config:${botId}`, bot, { ex: 300 });
        }
    }

    if (botError || !bot) {
        logger.error('Bot not found in DB', botError);
        return;
    }
    logger.info(`Bot found: ${bot.store_name}, status=${bot.status}`);

    if (bot.status !== 'active') {
        logger.warn(`Bot is ${bot.status}, dropping events`);
        return;
    }

    // 2. 解密憑證（加診斷 log）
    const accessToken = decrypt(bot.line_channel_access_token);
    const channelSecret = decrypt(bot.line_channel_secret);

    if (!accessToken) {
        logger.error('DECRYPT FAILED: line_channel_access_token is empty after decrypt. Check ENCRYPTION_KEY env var.');
        return;
    }
    if (!channelSecret) {
        logger.error('DECRYPT FAILED: line_channel_secret is empty after decrypt. Check ENCRYPTION_KEY env var.');
        return;
    }
    logger.info(`Credentials decrypted OK (token starts: ${accessToken.substring(0, 8)}...)`);

    const lineConfig = {
        channelAccessToken: accessToken,
        channelSecret: channelSecret,
    };
    const decryptedUserKey = bot.openai_api_key ? decrypt(bot.openai_api_key) : '';
    const openaiApiKey = decryptedUserKey || process.env.MASTER_OPENAI_KEY || process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
        logger.error('No OpenAI API key available (bot key empty and no MASTER_OPENAI_KEY env var)');
        return;
    }

    // 3. 建立客戶端
    const lineClient = new Client(lineConfig);
    
    // 🤖 AI Client Selection: 優先使用 Google Gemini Free Tier for OA
    const googleAI = process.env.GOOGLE_API_KEY ? new OpenAI({
        apiKey: process.env.GOOGLE_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai"
    }) : null;

    const openai = new OpenAI({ apiKey: openaiApiKey });
    const chatClient = googleAI || openai; // 用於一般對話的客戶端
    const chatModel = googleAI ? 'gemini-2.5-flash' : 'gpt-4o-mini';

    logger.info(`Clients created (Model: ${chatModel}), processing ${events.length} event(s)...`);

    // 4. 逐一處理事件
    for (const event of events) {
        await handleSingleEvent(event, bot, lineClient, openai, chatClient, chatModel, globalSupabase, logger);
    }
    logger.info('All events processed.');
}

// ─── 單一事件處理器 ───────────────────────────────────────────
async function handleSingleEvent(
    event: WebhookEvent,
    bot: BotConfig,
    lineClient: Client,
    openai: OpenAI,
    chatClient: OpenAI,
    chatModel: string,
    supabase: SupabaseClient,
    logger: BotLogger
): Promise<void> {
    const lineUserId = event.source.userId!;

    // Idempotency Guard（防止 LINE 重試造成重複處理）
    const idempotencyKey = getIdempotencyKey(event);
    if (idempotencyKey && !markAsProcessed(idempotencyKey)) {
        logger.info(`Skipping duplicate event: ${idempotencyKey}`);
        return;
    }

    // ─── A. 系統指令處理 ─────────────────────────────────────
    if (event.type === 'message' && event.message.type === 'text') {
        const text = event.message.text.trim();

        // #綁定 指令（Partner 系統）
        if (text.startsWith('#綁定')) {
            await handleBindingCommand(text, lineUserId, bot, lineClient, supabase, event, logger);
            return;
        }
    }

    // ─── B. Partner 動態路由（找用戶的子 Bot）───────────────
    let activeBot: BotConfig = bot;
    if (bot.partner_id) {
        const { data: subBot } = await supabase
            .from('bots')
            .select('*')
            .eq('partner_id', bot.partner_id)
            .eq('owner_line_id', lineUserId)
            .neq('id', bot.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (subBot) {
            activeBot = subBot;
            logger.info(`Brain swap: routing to sub-bot ${subBot.id}`);
        } else if (bot.owner_type === 'partner') {
            // 中央 OA 未綁定用戶
            if (event.type === 'message' && event.message.type === 'text' &&
                !event.message.text.trim().startsWith('@我是店長')) {
                await safeReply(lineClient, (event as any).replyToken,
                    '⚠️ 您尚未綁定專屬的 AI 助理帳號！\n請從後台點擊綁定連結，或輸入「#綁定 [您的綁定碼]」啟用服務。',
                    logger
                );
                return;
            }
        }
    }

    // ─── C. 自動綁定（獨立 Bot 的老闆第一次使用）───────────
    if (event.type === 'message' && event.message.type === 'text' &&
        event.message.text.trim() === '@我是店長') {
        await handleAutoBinding(lineUserId, activeBot, lineClient, supabase, event, logger);
        return;
    }

    const isOwner = lineUserId === activeBot.owner_line_id;

    // ─── D. 練功房（老闆專用）──────────────────────────────
    if (isOwner) {
        const dojo = new StoreManagerDojo(chatClient, supabase, lineClient, activeBot, chatModel);

        if (event.type === 'message' && event.message.type === 'text') {
            const text = event.message.text.trim();
            if (StoreManagerDojo.isDojoCommand(text)) {
                await dojo.handleText(text, (event as any).replyToken);
                return;
            }
            // @店長聽令 / @更新知識 可能不被 isDojoCommand 捕捉到，補充判斷
            if (text.startsWith('@店長聽令') || text.startsWith('@更新知識')) {
                await dojo.handleText(text, (event as any).replyToken);
                return;
            }
        }

        if (event.type === 'message' && event.message.type === 'audio') {
            await dojo.handleAudio(event.message.id, (event as any).replyToken);
            return;
        }
    }

    // ─── E. 一般顧客對話（AI 回覆）─────────────────────────
    if (event.type === 'message' && event.message.type === 'text') {
        await handleCustomerChat(
            event.message.text.trim(),
            lineUserId,
            activeBot,
            event.replyToken,
            lineClient,
            openai,
            chatClient,
            chatModel,
            supabase,
            logger
        );
    }
}

// ─── 一般顧客對話處理 ─────────────────────────────────────────
async function handleCustomerChat(
    userMessage: string,
    lineUserId: string,
    bot: BotConfig,
    replyToken: string,
    lineClient: Client,
    openai: OpenAI,
    chatClient: OpenAI,
    chatModel: string,
    supabase: SupabaseClient,
    logger: BotLogger
): Promise<void> {

    // 🚀 極速並行化：同時查詢歷史紀錄與攔截意圖 (天氣/股票/匯率)
    const [historyResult, intercepted] = await Promise.all([
        supabase
            .from('chat_logs')
            .select('role, content')
            .eq('bot_id', bot.id)
            .eq('user_id', lineUserId)
            .order('created_at', { ascending: false })
            .limit(8),
        IntentInterceptor.intercept(userMessage)
    ]);

    const history = historyResult.data;

    const messages: any[] = [
        {
            role: 'system',
            content: STORE_SECURITY_PROMPT
        },
        {
            role: 'system',
            content: `${bot.system_prompt || '你是一個專業的 AI 客服助手。'}
${bot.dynamic_context ? `\n【店長今日動態公告】：${bot.dynamic_context}` : ''}

目前使用的 Line User ID: ${lineUserId}`
        },
        ...(history || []).reverse().map((m: any) => ({
            role: m.role === 'ai' ? 'assistant' : m.role,
            content: m.content
        }))
    ];

    if (intercepted.intent !== 'chat') {
        messages.push({
            role: 'system',
            content: `[即時資訊預載] 使用者詢問 ${intercepted.intent}，數據如下：\n${JSON.stringify(intercepted.data, null, 2)}`
        });
    }
    messages.push({ role: 'user', content: userMessage });

    // Concurrency slot
    const limit = getConcurrentLimit(bot.selected_plan);
    await acquireSlot(bot.id, limit);

    let aiResponse = '';
    try {
        const tools = getStoreManagerTools();
        let response;
        try {
            // 🚀 Try Gemini First
            response = await chatClient.chat.completions.create({
                model: chatModel,
                messages,
                tools,
                tool_choice: 'auto',
            });
        } catch (geminiErr: any) {
            console.error('[Gemini Fallback] Google API failed, falling back to OpenAI:', geminiErr?.message);
            // 🛡️ Rescue with OpenAI
            response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages,
                tools,
                tool_choice: 'auto',
            });
            // 重置後續變數以便 log 使用正确的 model 名稱
            chatModel = 'gpt-4o-mini';
        }

        let responseMessage = response.choices[0].message;

        if (responseMessage.tool_calls) {
            // Tool call 處理
            const toolMessages = [...messages, responseMessage];
            for (const toolCall of responseMessage.tool_calls) {
                const fn = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);
                const result = await executeStoreTool(fn, args, bot.id, supabase);
                toolMessages.push({ tool_call_id: toolCall.id, role: 'tool', name: fn, content: result });
            }

            const secondResponse = await (chatModel === 'gpt-4o-mini' ? openai : chatClient).chat.completions.create({
                model: chatModel,
                messages: toolMessages,
            });
            aiResponse = secondResponse.choices[0].message.content || '';

            const usage = secondResponse.usage;
            if (usage) {
                const cost = calculateCost(chatModel, usage.prompt_tokens, usage.completion_tokens);
                await logTokenUsage(supabase, bot.id, {
                    model: chatModel,
                    prompt_tokens: usage.prompt_tokens,
                    completion_tokens: usage.completion_tokens,
                    cost_estimate: cost
                });
            }
        } else {
            aiResponse = responseMessage.content || '';
            const usage = response.usage;
            if (usage) {
                const cost = calculateCost(chatModel, usage.prompt_tokens, usage.completion_tokens);
                await logTokenUsage(supabase, bot.id, {
                    model: chatModel,
                    prompt_tokens: usage.prompt_tokens,
                    completion_tokens: usage.completion_tokens,
                    cost_estimate: cost
                });
            }
        }
    } catch (err: any) {
        logger.error('AI call failed', err);
        aiResponse = BOT_ERROR_MESSAGES.general;
    } finally {
        releaseSlot(bot.id);
    }

    // 異步寫 Log（不阻塞回覆）
    // ⚡ Await insertion to prevent Vercel Serverless from dropping the history
    const { error: logError } = await supabase.from('chat_logs').insert([
        { bot_id: bot.id, user_id: lineUserId, role: 'user', content: userMessage },
        { bot_id: bot.id, user_id: lineUserId, role: 'ai', content: aiResponse }
    ]);
    if (logError) logger.error('Chat log insert failed', logError);

    // 💎 強力版(1199)：自動擷取預約意圖
    const is1199Plan = (bot.selected_plan || '').includes('1199') || (bot.selected_plan || '').includes('強力');
    if (is1199Plan) {
        const reservationKeywords = ['預約', '訂位', '我要訂', '我想訂', '幫我訂', '我要預訂', '可以預訂'];
        const hasReservationIntent = reservationKeywords.some(kw => userMessage.includes(kw));
        if (hasReservationIntent) {
            const dateMatch = userMessage.match(/([\u4e00-\u9fa5]+[\d\/\-]*[日期天期週月小時午前午後]+[\u4e00-\u9fa5\d\:半]*)|(\d{1,2}[\/\-]\d{1,2})/)?.[0] || null;
            const serviceMatch = userMessage.match(/[預訂我要訂幫我訂想訂]+([\u4e00-\u9fa5]{2,10})/)?.[1] || null;
            supabase.from('reservations').insert({
                bot_id: bot.id,
                line_user_id: lineUserId,
                requested_date: dateMatch,
                service_type: serviceMatch,
                note: userMessage,
                status: 'pending'
            }).then(({ error }) => { if (error) logger.error('Reservation insert failed', error); });
        }
    }

    await safeReply(lineClient, replyToken, aiResponse || '收到您的訊息！', logger);
}

// ─── Tool 執行分發器 ──────────────────────────────────────────
async function executeStoreTool(
    functionName: string,
    args: any,
    botId: string,
    supabase: SupabaseClient
): Promise<string> {
    if (functionName === 'query_inventory') {
        const { data } = await supabase
            .from('products').select('*').eq('bot_id', botId).ilike('name', `%${args.keyword}%`);
        return JSON.stringify(data || []);
    }

    if (functionName === 'query_faq') {
        const { data } = await supabase
            .from('faq').select('*').eq('bot_id', botId)
            .or(`question.ilike.%${args.question}%,answer.ilike.%${args.question}%`);
        return JSON.stringify(data || []);
    }

    if (functionName === 'calculate_business_metrics') {
        const [{ data: orders }, { data: products }] = await Promise.all([
            supabase.from('orders').select('*').eq('bot_id', botId),
            supabase.from('products').select('*').eq('bot_id', botId)
        ]);
        const costMap = (products || []).reduce((acc: any, p: any) => { acc[p.id] = p.cost; return acc; }, {});
        let totalRevenue = 0, totalCost = 0;
        (orders || []).forEach((order: any) => {
            totalRevenue += Number(order.total_amount);
            (order.items || []).forEach((item: any) => {
                totalCost += (costMap[item.product_id] || 0) * item.quantity;
            });
        });
        return JSON.stringify({
            total_revenue: totalRevenue, total_cost: totalCost,
            gross_profit: totalRevenue - totalCost,
            profit_margin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(2) + '%' : '0%'
        });
    }

    if (functionName === 'analyze_stock_market') {
        const symbol = args.symbol.includes('.') ? args.symbol.split('.')[0] : args.symbol;
        const data = await IntentInterceptor.intercept(symbol);
        return JSON.stringify(data.data || { error: '查無此股票數據' });
    }

    // Generic tools fallback
    const { GenericToolsRegistry } = await import('@/lib/services/tools');
    if (GenericToolsRegistry[functionName]) {
        return GenericToolsRegistry[functionName].execute(args);
    }

    return JSON.stringify({ error: `Unknown tool: ${functionName}` });
}

// ─── 輔助：#綁定 指令 ────────────────────────────────────────
async function handleBindingCommand(
    text: string, lineUserId: string, bot: BotConfig,
    lineClient: Client, supabase: SupabaseClient, event: any, logger: BotLogger
) {
    const mgmtToken = text.replace(/^#綁定\s*/, '').trim();
    if (!mgmtToken) {
        await safeReply(lineClient, event.replyToken, '請輸入有效的綁定碼。例如：#綁定 1234-5678', logger);
        return;
    }

    const { data: subBotToBind } = await supabase
        .from('bots').select('id, owner_line_id, store_name')
        .eq('mgmt_token', mgmtToken).eq('partner_id', bot.partner_id).single();

    if (!subBotToBind) {
        await safeReply(lineClient, event.replyToken, '❌ 綁定失敗：無效的綁定碼或該機器人不屬於此系統。', logger);
        return;
    }

    await supabase.from('bots').update({ owner_line_id: lineUserId }).eq('id', subBotToBind.id);
    await safeReply(lineClient, event.replyToken,
        `✅ 綁定成功！您已成功連接您的專屬助理【${subBotToBind.store_name}】。\n\n之後您在這裡說的話，都會由您的專屬助理為您解答！`,
        logger
    );
}

// ─── 輔助：@我是店長 自動綁定 ──────────────────────────────
async function handleAutoBinding(
    lineUserId: string, bot: BotConfig,
    lineClient: Client, supabase: SupabaseClient, event: any, logger: BotLogger
) {
    if (!bot.owner_line_id) {
        await supabase.from('bots').update({ owner_line_id: lineUserId }).eq('id', bot.id);
        await safeReply(lineClient, event.replyToken,
            '🔑 綁定成功！您現在已被識別為本店最高權限的店長！\n\n試試輸入：\n「@調閱知識」查看知識庫\n或「@店長聽令 ...」新增知識。',
            logger
        );
    } else if (bot.owner_line_id === lineUserId) {
        await safeReply(lineClient, event.replyToken, '您已經是本店的店長囉！不用重複綁定。', logger);
    } else {
        await safeReply(lineClient, event.replyToken, '抱歉，本店已綁定其他店長，無法更換。', logger);
    }
}
