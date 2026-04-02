import { NextResponse } from 'next/server';
import { Client, WebhookEvent } from '@line/bot-sdk';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/lib/encryption';
import { IntentInterceptor } from '@/lib/services/IntentInterceptor';
import { GenericToolsRegistry, GenericToolsPayload } from '@/lib/services/tools';
import { markAsProcessed, getIdempotencyKey } from '@/lib/middleware/idempotency';
import { acquireSlot, releaseSlot, getConcurrentLimit } from '@/lib/middleware/concurrency';
import { calculateCost, logTokenUsage } from '@/lib/token-guard';

export async function GET() {
    return new Response('Bot Webhook is Active.', { status: 200 });
}

export async function POST(
    req: Request,
    { params }: { params: { botId: string } }
) {
    const botId = params.botId;

    // ⚡ INSTANT 200 — Parse body first, then fire-and-forget processing
    let body: any;
    try {
        body = await req.json();
    } catch (e) {
        return NextResponse.json({ status: 'ok' });
    }

    const events: WebhookEvent[] = body.events || [];
    if (events.length === 0) return NextResponse.json({ status: 'ok' });

    // Reply to LINE immediately — prevents LINE retry storms
    // Processing continues in the background via the fire-and-forget below
    processEvents(botId, events).catch((err) =>
        console.error(`[Webhook] Background processing error for bot ${botId}:`, err)
    );

    return NextResponse.json({ status: 'ok' });
}

// ─── Background processing (runs after 200 is already returned) ──────────────
async function processEvents(botId: string, events: WebhookEvent[]) {

    try {
        // 1. Fetch bot config
        const { data: bot, error: botError } = await supabase
            .from('bots')
            .select('*')
            .eq('id', botId)
            .single();

        if (botError || !bot) {
            console.error('Bot not found:', botError);
            return; // Background function — just return, no HTTP response needed
        }

        if (bot.status !== 'active') {
            return; // Bot suspended — silently drop
        }

        const lineConfig = {
            channelAccessToken: decrypt(bot.line_channel_access_token),
            channelSecret: decrypt(bot.line_channel_secret),
        };
        const decryptedUserKey = bot.openai_api_key ? decrypt(bot.openai_api_key) : "";
        const openaiApiKey = decryptedUserKey || process.env.MASTER_OPENAI_KEY || process.env.OPENAI_API_KEY;

        const client = new Client(lineConfig);
        const openai = new OpenAI({ apiKey: openaiApiKey });

        for (const event of events) {
            const lineUserId = event.source.userId!;

            // --- IDEMPOTENCY GUARD (Prevent duplicate processing from LINE retries) ---
            const idempotencyKey = getIdempotencyKey(event);
            if (idempotencyKey && !markAsProcessed(idempotencyKey)) {
                console.log(`[Idempotency] Skipping duplicate event: ${idempotencyKey}`);
                continue;
            }

            // --- DYNAMIC ROUTING & BINDING FOR SAAS PARTNERS ---
            let activeBot = bot; // Default to the hooked bot

            if (event.type === 'message' && event.message.type === 'text') {
                const text = event.message.text.trim();

                // 1. Account Binding Command (#綁定)
                if (text.startsWith('#綁定')) {
                    const mgmtToken = text.replace(/^#綁定\s*/, '').trim();
                    if (!mgmtToken) {
                        await client.replyMessage((event as any).replyToken, { type: 'text', text: "請輸入有效的綁定碼。例如：#綁定 1234-5678" });
                        continue;
                    }

                    // Look up the sub-bot to bind
                    const { data: subBotToBind } = await supabase
                        .from('bots')
                        .select('id, owner_line_id, store_name')
                        .eq('mgmt_token', mgmtToken)
                        .eq('partner_id', bot.partner_id) // ensure it belongs to the same SaaS
                        .single();

                    if (!subBotToBind) {
                        await client.replyMessage((event as any).replyToken, { type: 'text', text: "❌ 綁定失敗：無效的綁定碼或該機器人不屬於此系統。" });
                        continue;
                    }

                    // Proceed to bind
                    await supabase.from('bots').update({ owner_line_id: lineUserId }).eq('id', subBotToBind.id);
                    await client.replyMessage((event as any).replyToken, {
                        type: 'text',
                        text: `✅ 綁定成功！您已成功連接您的專屬助理【${subBotToBind.store_name}】。\n\n之後您在這裡說的話，都會由您的專屬助理為您解答！`
                    });
                    continue;
                }
            }

            // 2. Dynamic Routing (Sub-Bot Lookup)
            // If this webhook belongs to a partner's Central OA, try to find the user's bound sub-bot
            if (bot.partner_id) {
                const { data: subBot } = await supabase
                    .from('bots')
                    .select('*')
                    .eq('partner_id', bot.partner_id)
                    .eq('owner_line_id', lineUserId)
                    .neq('id', bot.id) // Not the central bot itself
                    .eq('status', 'active')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (subBot) {
                    activeBot = subBot; // 🧠 BRAIN SWAP: The active bot is now the user's specific SaaS sub-bot
                } else if (bot.owner_type === 'partner') {
                    // It's a Central OA, but user hasn't bound anything. Fallback gently.
                    if (event.type === 'message' && event.message.type === 'text' && !event.message.text.trim().startsWith('@我是店長')) {
                        await client.replyMessage((event as any).replyToken, {
                            type: 'text',
                            text: "⚠️ 您尚未綁定專屬的 AI 助理帳號喔！\n請從您的系統後台點擊綁定連結，或輸入「#綁定 [您的綁定碼]」來啟用專屬服務。"
                        });
                        continue;
                    }
                }
            }

            // --- AUTO-BINDING MECHANISM (For old standalone bots) ---
            if (event.type === 'message' && event.message.type === 'text' && event.message.text.trim() === '@我是店長') {
                if (!activeBot.owner_line_id) {
                    await supabase.from('bots').update({ owner_line_id: lineUserId }).eq('id', activeBot.id);
                    activeBot.owner_line_id = lineUserId; // Update local memory
                    await client.replyMessage((event as any).replyToken, { type: 'text', text: "🔑 綁定成功！您現在已經被系統識別為本店最高權限的店長了！\n\n您可以立刻試試看輸入：\n「@調閱知識」來查看知識庫\n或輸入「@店長聽令 ...」來新增知識。" });
                    continue;
                } else if (activeBot.owner_line_id === lineUserId) {
                    await client.replyMessage((event as any).replyToken, { type: 'text', text: "您已經是本店的店長囉！不用重複綁定。" });
                    continue;
                } else {
                    await client.replyMessage((event as any).replyToken, { type: 'text', text: "抱歉，本店已經有綁定其他店長了，無法更換。" });
                    continue;
                }
            }

            const isOwner = lineUserId === activeBot.owner_line_id;

            // --- KNOWLEDGE UPDATE INTERCEPTION (Owner Only) ---
            if (isOwner) {
                let trainingText = "";

                const isPaidForDojo = (activeBot.selected_plan && !activeBot.selected_plan.includes('Free')) || activeBot.plan_level > 0;

                if (event.type === 'message' && event.message.type === 'text') {
                    const text = event.message.text.trim();

                    // Check for Dojo commands on Free plan
                    if ((text.startsWith('@店長聽令') || text.startsWith('@更新知識') || text.startsWith('@修改人設')) && !isPaidForDojo) {
                        await client.replyMessage((event as any).replyToken, { 
                            type: 'text', 
                            text: "🌟 老闆！偵測到您正在使用「AI 練功房」指令。\n\n目前這項功能是【個人店長版】以上的專屬工具。如果您想讓店長聽令於您的每一句話，請點擊後台升級即可解鎖。🚀" 
                        });
                        continue;
                    }

                    // 1. 知識調閱指令 (Retrieval)
                    if (text === '@調閱知識') {
                        try {
                            const { data: faqs } = await supabase.from('faq').select('*').eq('bot_id', botId);
                            const { data: products } = await supabase.from('products').select('*').eq('bot_id', botId);

                            let report = "【📊 AI 練功房知識庫清單】\n\n";

                            report += "🛍️ ［商品/服務清單］\n";
                            if (products && products.length > 0) {
                                products.forEach(p => report += `- ${p.name}: $${p.price}${p.purchase_url ? `\n  🔗 購買: ${p.purchase_url}` : ''}\n`);
                            } else {
                                report += "(目前無商品資料)\n";
                            }

                            report += "\n💡 ［常見問題 FAQ］\n";
                            if (faqs && faqs.length > 0) {
                                faqs.forEach(f => report += `Q: ${f.question}\nA: ${f.answer}\n---\n`);
                            } else {
                                report += "(目前無常見問題)\n";
                            }

                            await client.replyMessage((event as any).replyToken, { type: 'text', text: report.trim() });
                            continue; // Skip the rest, we are done handling this event
                        } catch (err) {
                            console.error("Retrieval Error:", err);
                            await client.replyMessage((event as any).replyToken, { type: 'text', text: "老闆抱歉，調閱資料時發生錯誤，請稍後再試。" });
                            continue;
                        }
                    }

                    // 3. 人設調閱與修改指令 (System Prompt)
                    if (text === '@調閱人設') {
                        try {
                            const { data: botData } = await supabase.from('bots').select('system_prompt').eq('id', botId).single();
                            let report = "【🧠 AI 店長核心人設報告】\n\n";
                            if (botData?.system_prompt) {
                                report += botData.system_prompt;
                                report += "\n\n💡 提示：如需修改，請傳送「@修改人設 [您的新要求]」\n(例如：@修改人設 我們這個月主打中秋禮盒，請用活潑的語氣推廣)";
                            } else {
                                report += "(目前無人設資料)";
                            }
                            await client.replyMessage((event as any).replyToken, { type: 'text', text: report.trim() });
                            continue;
                        } catch (err) {
                            console.error("Retrieval Error:", err);
                            await client.replyMessage((event as any).replyToken, { type: 'text', text: "老闆抱歉，調閱人設時發生錯誤，請稍後再試。" });
                            continue;
                        }
                    }

                    if (text.startsWith('@修改人設')) {
                        const newInstruction = text.replace(/^@修改人設\s*/, '').trim();
                        if (!newInstruction) {
                            await client.replyMessage((event as any).replyToken, { type: 'text', text: "老闆，請告訴我您想修改什麼呢？\n(例如：@修改人設 我們這個月主打中秋禮盒，請用活潑的語氣推廣)" });
                            continue;
                        }

                        try {
                            const { data: botData } = await supabase.from('bots').select('system_prompt').eq('id', botId).single();
                            const currentPrompt = botData?.system_prompt || "";

                            // Call LLM to rewrite the prompt using gpt-4o for better reasoning
                            const rewriteResponse = await openai.chat.completions.create({
                                model: "gpt-4o",
                                messages: [
                                    {
                                        role: "system",
                                        content: "你是一個專業的 AI 提示詞工程師(Prompt Engineer)。你的任務是依據「店長的新要求」，來微調、擴寫或修改「現有的人設提示詞」。\n\n請遵守以下規則：\n1. 保持原有的核心角色設定、基本資料與防呆機制(如果合理且無衝突)。\n2. 將店長的『新要求』完美揉合進新的提示詞中，例如可以加在『近期重點推廣』或修改『品牌語氣』。\n3. 直接輸出純文字的「新版 System Prompt」，不要包含任何 Markdown code block 或多餘的解釋。\n4. 若原提示詞為空，則直接根據新要求從零開始寫一份專業提示詞。"
                                    },
                                    {
                                        role: "user",
                                        content: `【現有人設提示詞】：\n${currentPrompt}\n\n【店長的新要求】：\n${newInstruction}`
                                    }
                                ],
                                temperature: 0.7,
                            });

                            const newSystemPrompt = rewriteResponse.choices[0].message.content?.trim();

                            if (newSystemPrompt) {
                                await supabase.from('bots').update({ system_prompt: newSystemPrompt }).eq('id', botId);
                                await client.replyMessage((event as any).replyToken, { type: 'text', text: "老闆沒問題！我已經理解您的新指示，並重新調整好我的大腦人設了！💪\n\n您可以輸入「@調閱人設」來查看最新狀態，或直接與我對話測試看看喔！" });
                            } else {
                                throw new Error("LLM returned empty prompt");
                            }
                            continue;
                        } catch (err) {
                            console.error("Rewrite Prompt Error:", err);
                            await client.replyMessage((event as any).replyToken, { type: 'text', text: "老闆抱歉，我在重塑人設時遇到一點困難，請稍後再試。" });
                            continue;
                        }
                    }

                    // 2. 知識更新指令 (Update)
                    if (text.startsWith('@店長聽令') || text.startsWith('@更新知識')) {
                        trainingText = text.replace(/^@店長聽令\s*|^@更新知識\s*/, '').trim();
                    }
                } else if (event.type === 'message' && event.message.type === 'audio') {
                    if (!isPaidForDojo) {
                        await client.replyMessage((event as any).replyToken, { 
                            type: 'text', 
                            text: "👂 老闆！剛才收到了您的「語音指令」，這就是最新的 AI 練功房訓練技術。\n\n這項語音同步操作是【個人店長版】以上方案的專屬功能。如果您想讓店長聽得懂人話與指令，請點擊後台升級即可解鎖。🚀" 
                        });
                        continue;
                    }
                    // For audio, we always assume it's a training command from the owner
                    try {
                        const stream = await client.getMessageContent(event.message.id);

                        // Whisper requires a File-like object or a stream with a known filename.
                        // We will convert the readable stream to a buffer.
                        const chunks = [];
                        for await (const chunk of stream) {
                            chunks.push(chunk);
                        }
                        const buffer = Buffer.concat(chunks);

                        // OpenAI Node SDK expects a File for audio transcriptions. 
                        const audioFile = new File([buffer], 'audio.m4a', { type: 'audio/m4a' });

                        const transcription = await openai.audio.transcriptions.create({
                            file: audioFile,
                            model: 'whisper-1'
                        });

                        trainingText = transcription.text;
                    } catch (error) {
                        console.error("Audio Processing Error:", error);
                        await client.replyMessage((event as any).replyToken, {
                            type: 'text',
                            text: "老闆抱歉，我剛剛耳朵不太好，沒聽清楚您的語音指令，能請您再說一次嗎？"
                        });
                        continue; // Skip the rest of the loop for this event
                    }
                }

                if (trainingText) {
                    try {
                        // Classify the intent using LLM
                        const classificationResponse = await openai.chat.completions.create({
                            model: "gpt-4o-mini",
                            response_format: { type: "json_object" },
                            messages: [
                                {
                                    role: "system",
                                    content: `你是一個專業的店長助手分類員。請根據老闆剛才說的話，判斷這是一個長期知識還是一個「短期動態變動」。
請輸出 JSON 格式：
1. 如果是 長期知識 (常見問題)：{"type": "faq", "question": "客戶可能會問的問題", "answer": "回答內容"}
2. 如果是 長期知識 (商品上架)：{"type": "product", "name": "商品名稱", "price": 價格數字, "cost": 成本數字}
3. 如果是 短期動態變動 (如：XXX賣完了、今天提早打烊、臨時促銷)：{"type": "dynamic", "update": "簡短精確的描述"}
不要輸出多餘的字元。`
                                },
                                { role: "user", content: trainingText }
                            ]
                        });

                        const result = JSON.parse(classificationResponse.choices[0].message.content || "{}");
                        let replyMsg = "";

                        // Log to Dojo Logs for audit
                        await supabase.from('dojo_logs').insert({
                            bot_id: botId,
                            content: trainingText,
                            category: result.type,
                            source: event.type === 'message' && event.message.type === 'audio' ? 'line_voice' : 'line_text'
                        });

                        if (result.type === 'faq') {
                            await supabase.from('faq').insert([{ bot_id: botId, question: result.question, answer: result.answer }]);
                            replyMsg = `老闆收到！這條知識已存入智庫：\nQ: ${result.question}\nA: ${result.answer}`;
                        } else if (result.type === 'product') {
                            const { data: existingProduct } = await supabase.from('products').select('id').eq('bot_id', botId).eq('name', result.name).single();
                            if (existingProduct) {
                                await supabase.from('products').update({ price: result.price, cost: result.cost }).eq('id', existingProduct.id);
                                replyMsg = `老闆收到！商品「${result.name}」的價格已更新。`;
                            } else {
                                await supabase.from('products').insert([{ bot_id: botId, name: result.name, price: result.price, cost: result.cost }]);
                                replyMsg = `老闆收到！新商品「${result.name}」已上架。`;
                            }
                        } else if (result.type === 'dynamic') {
                            // Update the Dynamic Context of the bot (Short-term memory)
                            const currentDna = activeBot.brand_dna || {};
                            await supabase.from('bots').update({ 
                                dynamic_context: result.update,
                                last_dojo_update: new Date().toISOString()
                            }).eq('id', activeBot.id);
                            replyMsg = `老闆收到！「${result.update}」這項動態我已經記在大腦的最前端了，接下來回覆客人都會注意這點！👌`;
                        } else {
                            replyMsg = `老闆抱歉，我不太確定這條指令要存在哪裡，能請您換個說法嗎？（聽到的內容：${trainingText}）`;
                        }

                        // Reply to owner and move to next event
                        await client.replyMessage((event as any).replyToken, { type: 'text', text: replyMsg });
                        continue;
                    } catch (error) {
                        console.error("Training Processing Error:", error);
                        await client.replyMessage((event as any).replyToken, {
                            type: 'text',
                            text: "老闆抱歉，我剛剛腦袋卡住了，沒能記下您的指令，請稍後再試..."
                        });
                        continue;
                    }
                }
            }

            // --- NORMAL CHAT PROCESSING ---
            if (event.type === 'message' && event.message.type === 'text') {
                const userMessage = event.message.text.trim();

                // A. Fetch History
                const { data: history } = await supabase
                    .from('chat_logs')
                    .select('role, content')
                    .eq('bot_id', botId)
                    .eq('user_id', lineUserId)
                    .order('created_at', { ascending: false })
                    .limit(10);

                const messages: any[] = [
                    {
                        role: "system", content: `${bot.system_prompt || "你是一個專業助手。"}

你的執行原則（重要）：
1. **價值掛帥，全速成交**：
   - 你雖然具備強大的資訊查詢功能（股市、天氣、匯率），但你的目的「不是」當免費的查詢機，而是要展現 AI 的強大，回報完資訊後一定要補一句轉場台詞，引導用戶了解你的專業。
   - **銷售轉場 (The Pivot)**：無論回答什麼資訊（例如報完報價後），一定要補一句：「老闆您看，我的反應這麼快、資訊這麼準，如果您也有一尊這樣的分身幫您顧店、回客人，您是不是就能去喝咖啡或陪家人了？」
2. **股市分析專家指令**：
    - 當接到股票數據時，請嚴格遵守以下 **Emoji 報告格式**：
    📊 **公司概況**
    - 名稱：...
    - 背景：...
    
    💰 **基本面分析**
    - 即時價：{price} ({changePercent}%)
    - 獲利能力：良好／普通／需注意
    
    📈 **技術面分析**
    - 目前趨勢：{trend}
    - 支撐區：{supportLevel}
    - 壓力區：{resistanceLevel}
    
    🧭 **投資建議**
    ✅ **總評價**：(買入／持有／觀望／賣出)
    💡 **理由**：...

3. **即時氣象與溫馨提醒指令**：
    - 氣象報告格式：
    ☀️ **今日天氣摘要**
    - 地點：{location}
    - 狀態：{description}
    - 氣溫：{temperature}
    - 降雨機率：💧 {rainChance}
    
    😷 **專屬溫馨提醒**
    - (根據氣溫與降雨提供體貼叮嚀)

4. **匯率查詢指令**：
    - 格式：
    💵 **匯率報價**
    - 貨幣：{from} -> {to}
    - 匯率：{rate} (1 {from} = {rate} {to})
    - 日期：{date}

5. **專業排版**：多使用 Emoji、粗體與分段，增加可讀性。

目前使用的 Line User ID: ${lineUserId}`
                    },
                    ...(history || []).reverse().map((m: any) => ({
                        role: m.role === 'ai' ? 'assistant' : m.role,
                        content: m.content
                    }))
                ];

                // Intent Interceptor (Real-time Context Pre-fetching)
                const intercepted = await IntentInterceptor.intercept(userMessage);
                if (intercepted.intent !== 'chat') {
                    messages.push({
                        role: "system",
                        content: `[重要：即時資訊預載]\n使用者目前詢問的是 ${intercepted.intent}。以下是幫您抓取好的真實數據，請務必根據此數據直接進行分析並回覆（絕對不要再問「需要什麼分析」）：\n${JSON.stringify(intercepted.data, null, 2)}`
                    });
                }
                messages.push({ role: "user", content: userMessage });

                // B. Define Tools
                const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
                    {
                        type: "function",
                        function: {
                            name: "query_inventory",
                            description: "查詢商品庫存與價格",
                            parameters: {
                                type: "object",
                                properties: {
                                    keyword: { type: "string", description: "產品關鍵字" }
                                }
                            }
                        }
                    },
                    {
                        type: "function",
                        function: {
                            name: "query_faq",
                            description: "從知識庫查詢常見問題解答",
                            parameters: {
                                type: "object",
                                properties: {
                                    question: { type: "string", description: "客戶的問題" }
                                }
                            }
                        }
                    },
                    {
                        type: "function",
                        function: {
                            name: "calculate_business_metrics",
                            description: "計算業務指標，如總營收、毛利等",
                            parameters: {
                                type: "object",
                                properties: {
                                    timeframe: { type: "string", enum: ["today", "this_month", "all_time"], description: "時間範圍" }
                                }
                            }
                        }
                    },
                    {
                        type: "function",
                        function: {
                            name: "analyze_stock_market",
                            description: "獲取股市即時報價與技術分析數據（含支撐壓力）",
                            parameters: {
                                type: "object",
                                properties: {
                                    symbol: { type: "string", description: "股票代號，例如 2330.TW 或 AAPL" }
                                },
                                required: ["symbol"]
                            }
                        }
                    },
                    ...GenericToolsPayload
                ];

                // C. Call OpenAI (with per-bot concurrency soft limit)
                let aiResponse = '';
                const concurrentLimit = getConcurrentLimit(activeBot.selected_plan);
                const slotAcquired = await acquireSlot(botId, concurrentLimit);

                if (!slotAcquired) {
                    // All slots busy — send friendly queued message via pushMessage
                    try {
                        await client.pushMessage(lineUserId, {
                            type: 'text',
                            text: '我現在有點忙碌，請稍等一下，我很快就回來！🙏'
                        });
                    } catch { /* ignore push errors */ }
                    continue;
                }

                try {
                    const response = await openai.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages,
                        tools,
                        tool_choice: "auto",
                    });

                    let responseMessage = response.choices[0].message;

                    // Handle Tool Calls
                    if (responseMessage.tool_calls) {
                        const toolMessages = [...messages, responseMessage];

                        for (const toolCall of responseMessage.tool_calls) {
                            const functionName = toolCall.function.name;
                            const args = JSON.parse(toolCall.function.arguments);
                            let functionResponse = "";

                            if (functionName === "query_inventory") {
                                const { data } = await supabase
                                    .from('products')
                                    .select('*')
                                    .eq('bot_id', botId)
                                    .ilike('name', `%${args.keyword}%`);
                                functionResponse = JSON.stringify(data || []);
                            } else if (functionName === "query_faq") {
                                // 628SP P1: Research-led optimization for better RAG "hit rate"
                                // Search both Question AND Answer fields, and handle multiple keywords
                                const { data } = await supabase
                                    .from('faq')
                                    .select('*')
                                    .eq('bot_id', botId)
                                    .or(`question.ilike.%${args.question}%,answer.ilike.%${args.question}%`);
                                functionResponse = JSON.stringify(data || []);
                            } else if (functionName === "calculate_business_metrics") {
                                const { data: orders } = await supabase.from('orders').select('*').eq('bot_id', botId);
                                const { data: products } = await supabase.from('products').select('*').eq('bot_id', botId);

                                const productCosts = (products || []).reduce((acc: any, p: any) => {
                                    acc[p.id] = p.cost;
                                    return acc;
                                }, {});

                                let totalRevenue = 0;
                                let totalCost = 0;

                                (orders || []).forEach((order: any) => {
                                    totalRevenue += Number(order.total_amount);
                                    if (order.items && Array.isArray(order.items)) {
                                        order.items.forEach((item: any) => {
                                            const cost = productCosts[item.product_id] || 0;
                                            totalCost += Number(cost) * Number(item.quantity);
                                        });
                                    }
                                });

                                functionResponse = JSON.stringify({
                                    total_revenue: totalRevenue,
                                    total_cost: totalCost,
                                    gross_profit: totalRevenue - totalCost,
                                    profit_margin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(2) + "%" : "0%"
                                });
                            } else if (functionName === "analyze_stock_market") {
                                const symbol = args.symbol.includes('.') ? args.symbol.split('.')[0] : args.symbol;
                                const data = await IntentInterceptor.intercept(symbol);
                                functionResponse = JSON.stringify(data.data || { error: "查無此股票數據" });
                            } else if (functionName === "get_current_weather") {
                                const data = await IntentInterceptor.intercept(args.location + "天氣");
                                functionResponse = JSON.stringify(data.data || { error: "查無此天氣數據" });
                            } else if (GenericToolsRegistry[functionName]) {
                                // Execute any Generic Tool from the Registry dynamically
                                functionResponse = await GenericToolsRegistry[functionName].execute(args);
                            }

                            toolMessages.push({
                                tool_call_id: toolCall.id,
                                role: "tool",
                                name: functionName,
                                content: functionResponse,
                            });
                        }

                        const secondResponse = await openai.chat.completions.create({
                            model: "gpt-4o-mini",
                            messages: toolMessages,
                        });
                        aiResponse = secondResponse.choices[0].message.content || "";

                        // 628SP P0: Log Token Usage for the final choice
                        const usage = secondResponse.usage;
                        if (usage) {
                            const cost = calculateCost("gpt-4o-mini", usage.prompt_tokens, usage.completion_tokens);
                            await logTokenUsage(supabase, botId, {
                                model: "gpt-4o-mini",
                                prompt_tokens: usage.prompt_tokens,
                                completion_tokens: usage.completion_tokens,
                                cost_estimate: cost
                            });
                        }
                    } else {
                        aiResponse = responseMessage.content || "";
                        
                        // 628SP P0: Log Token Usage for single-turn response
                        const usage = response.usage;
                        if (usage) {
                            const cost = calculateCost("gpt-4o-mini", usage.prompt_tokens, usage.completion_tokens);
                            await logTokenUsage(supabase, botId, {
                                model: "gpt-4o-mini",
                                prompt_tokens: usage.prompt_tokens,
                                completion_tokens: usage.completion_tokens,
                                cost_estimate: cost
                            });
                        }
                    }
                } catch (e: any) {
                    console.error('AI Error:', e.message);
                    aiResponse = "抱歉，我剛才大腦斷線了，請再說一次。";
                } finally {
                    releaseSlot(botId); // Always release the slot
                }

                // D. Log & Reply
                (async () => {
                    try {
                        await supabase.from('chat_logs').insert([
                            { bot_id: botId, user_id: lineUserId, role: 'user', content: userMessage },
                            { bot_id: botId, user_id: lineUserId, role: 'ai', content: aiResponse }
                        ]);
                    } catch (e) {
                        console.error('Log failed:', e);
                    }
                })();

                // E. Auto-capture reservation intent (1199 plan only)
                const is1199 = (activeBot.selected_plan || '').includes('1199') || (activeBot.selected_plan || '').includes('強力');
                if (is1199) {
                    const reservationKeywords = ['預約', '訂位', '我要訂', '我想訂', '幫我訂', '我要預訂', '可以預訂'];
                    const hasReservationIntent = reservationKeywords.some(kw => userMessage.includes(kw));
                    if (hasReservationIntent) {
                        // Extract basic info from user message with simple heuristics
                        const dateMatch = userMessage.match(/([\u4e00-\u9fa5]+[\d\/\-]*[日期天期週月小時午前午後]+[\u4e00-\u9fa5\d\:半]*)|([\d]{1,2}[\/\-][\d]{1,2})/)?.[0] || null;
                        const serviceMatch = userMessage.match(/[預訂我要訂幫我訂想訂]+([\u4e00-\u9fa5]{2,10})/)?.[1] || null;

                        await supabase.from('reservations').insert({
                            bot_id: botId,
                            line_user_id: lineUserId,
                            requested_date: dateMatch,
                            service_type: serviceMatch,
                            note: userMessage,
                            status: 'pending'
                        });
                    }
                }

                await client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: aiResponse.trim() || '收到您的訊息！'
                });
            } // end if (event.type === 'message')
        } // end for (events)

    } catch (error: any) {
        console.error('[processEvents] Error:', error);
    }
}
