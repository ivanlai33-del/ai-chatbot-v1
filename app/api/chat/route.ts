import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';
import { getPlanByTier, getMonthlyQuota } from '@/lib/config/pricing';
import {
    SECURITY_DEFENSE_HEADER,
    filterMaliciousInput,
    maskSensitiveOutput,
    isMeaningless
} from '@/lib/security';
import { IntentInterceptor } from '@/lib/services/IntentInterceptor';
import { ForexService } from '@/lib/services/ForexService';
import { WeatherService } from '@/lib/services/WeatherService';
import { StockService } from '@/lib/services/StockService';
import { checkRateLimit } from '@/lib/middleware/rateLimit';
import { getRandomNagMessage } from '@/config/trial_nags';

import { GLOBAL_SECURITY_PROMPT } from './prompts/security';
import { 
    OWNER_COACH_PROMPT, 
    ONBOARDING_PROMPT,
    GLOBAL_UTILITY_PROMPT, 
    SECURITY_PROMPT, 
    SALES_PROMPT, 
    SYSTEM_CONTEXT_PROMPT,
    MASTER_HUB_PROMPT,
    SAAS_DEMO_PROMPT,
    getIndustrySnippets,
    PROVISION_READY_SNIPPET,
    getPageContextPrompt,
    PAGE_INSTRUCTIONS
} from './prompts';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// 🚀 Google Gemini (OpenAI-compatible) Initialization
const googleAI = process.env.GOOGLE_API_KEY ? new OpenAI({
    apiKey: process.env.GOOGLE_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1/openai"
}) : null;

function logToFile(data: any) {
    console.log('[ChatAPI]', JSON.stringify(data));
}

// Initial Static Tools
let STATIC_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "get_current_weather",
            description: "獲取台灣各縣市的即時天氣報告，包含溫度、降雨機率與氣象建議",
            parameters: {
                type: "object",
                properties: {
                    location: { type: "string", description: "台灣縣市名稱，如：台北市、台中市、台南市" }
                },
                required: ["location"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "analyze_forex_rate",
            description: "查詢國際匯率報價與換算，例如美金兌台幣 (USD/TWD)",
            parameters: {
                type: "object",
                properties: {
                    from: { type: "string", description: "來源貨幣代碼 (如 USD)" },
                    to: { type: "string", description: "目標貨幣代碼 (如 TWD)" },
                    amount: { type: "number", description: "換算金額，預設為 1" }
                },
                required: ["from", "to"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "analyze_stock_market",
            description: "查詢台灣股市即時收盤價格、技術分析趨勢、支撐壓力區，適用於台股代號（如 2330、2317）或公司名稱（如台積電、鴻海）",
            parameters: {
                type: "object",
                properties: {
                    symbol: { type: "string", description: "台股代號（如 2330）或公司名稱（如台積電）" }
                },
                required: ["symbol"]
            }
        }
    }
];

async function getDynamicTools(): Promise<{ tools: OpenAI.Chat.Completions.ChatCompletionTool[], registry: any[] }> {
    try {
        const { data: serviceTools } = await supabase
            .from('ai_service_tools')
            .select('*, ai_external_services(*)');
        if (!serviceTools) return { tools: [], registry: [] };
        const dynamicTools: OpenAI.Chat.Completions.ChatCompletionTool[] = serviceTools.map(st => ({
            type: "function",
            function: {
                name: st.tool_name,
                description: st.description,
                parameters: st.parameters_schema
            }
        }));
        return { tools: dynamicTools, registry: serviceTools };
    } catch (e) {
        console.error("Dynamic Tools Fetch Error:", e);
        return { tools: [], registry: [] };
    }
}

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
    const rateCheck = checkRateLimit(`chat:${ip}`, 20, 60_000);
    if (!rateCheck.allowed) {
        return NextResponse.json(
            { error: '請稍等一下，你問得太快了！😅 60 秒後再來吧！' },
            { status: 429, headers: { 'Retry-After': '60' } }
        );
    }

    try {
        const body = await req.json();
        const { messages, storeName, currentStep, isMaster, isSaaS, isActivation, isProvisioning, botKnowledge, focusedField, userId, userName, context, pageContext, trialMessageCount = 0, isPaid = false } = body;

        const effectiveUserId = userId || context?.lineUserId;
        const effectiveUserName = userName || context?.lineUserName;
        const effectiveUserPicture = context?.lineUserPicture;

        // 🚀 SaaS Identity & Usage Tracker
        let userPlanLevel = isSaaS ? 1 : 0; // 如果 isSaaS 為 true，至少是 Pro 版
        let isAdmin = isMaster || false;
        let currentMonthCount = 0;
        let userSelectedPlan = "Free";
        let userPlanPeriod = "monthly";
        const currentMonth = new Date().toISOString().slice(0, 7); // "2026-04"

        if (effectiveUserId) {
            // 1. Ensure User Identity (Upsert)
            if (effectiveUserName) {
                await supabase.rpc('upsert_platform_user', {
                    p_line_id: effectiveUserId,
                    p_name: effectiveUserName,
                    p_picture: effectiveUserPicture
                });
            }

            // 2. Fetch Plan & Usage
            const { data: userData } = await supabase
                .from('platform_users')
                .select('plan_level, role')
                .eq('line_user_id', effectiveUserId)
                .single();
            
            if (userData) {
                userPlanLevel = userData.plan_level || userPlanLevel;
                isAdmin = userData.role === 'admin' || isAdmin;
            }
            const { data: usageData } = await supabase
                .from('user_usage_stats')
                .select('message_count')
                .eq('line_user_id', effectiveUserId)
                .eq('month', currentMonth)
                .single();
            
            currentMonthCount = usageData?.message_count || 0;

            // 3. 🛡️ SaaS Paywall Logic (Website Demo Chat)
            const limit = getMonthlyQuota(userPlanLevel) || 10;

            if (currentMonthCount >= limit && !isMaster && !isSaaS && !isProvisioning) {
                const plan = getPlanByTier(userPlanLevel);
                console.warn(`[Paywall] User ${effectiveUserId} hit limit ${currentMonthCount}/${limit}.`);
                return NextResponse.json({
                    message: `⚠️ 【${userPlanLevel === 0 ? '免費試用' : '方案'}額度用盡】\n\n老闆，您本月的「${plan?.name || '方案'}對話額度 (${limit}句)」已經安全用盡囉！\n\n這是一個好消息，代表您的生意非常興隆！為了確保服務不中斷並解鎖更多 AI 強大功能，請立即點擊下方按鈕選購正式方案。\n\n[👇 立即升級開通正式版]`,
                    metadata: { storeName, action: "SHOW_PLANS" }
                });
            }
        }

        // 🛠️ Restore Tool Registration & Security
        const { tools: dynamicTools, registry } = await getDynamicTools();
        const ALL_TOOLS = [...STATIC_TOOLS, ...dynamicTools];

        const lastUserMsg = messages[messages.length - 1];
        if (lastUserMsg && isMeaningless(lastUserMsg.content)) {
            return NextResponse.json({
                message: "老闆，您剛才發送的內容我有點看不懂，要不要試試問我「如何開通 AI 服務」？",
                metadata: { storeName, action: null }
            });
        }

        // 🏗️ Build Dynamic System Prompt with Identity Context
        let membershipContext = "";
        if (effectiveUserId) {
            const { data: botData } = await supabase
                .from('bots')
                .select('brand_dna')
                .eq('line_user_id', effectiveUserId)
                .limit(1)
                .single();
            
            let identityContext = "";
            if (botData?.brand_dna) {
                const dna = botData.brand_dna || {};
                const knownFields = [];
                if (dna.industry) knownFields.push(`行業：${dna.industry}`);
                if (dna.name) knownFields.push(`店名/公司名：${dna.name}`);
                if (dna.services) knownFields.push(`主打服務/商品：${dna.services}`);
                
                if (knownFields.length > 0) {
                    identityContext = `\n【🧠 已知品牌設定資訊】：\n- ${knownFields.join('\n- ')}\n`;
                }
            }

            const currentPlan = getPlanByTier(userPlanLevel);
            userSelectedPlan = currentPlan?.name || "Free";
            
            // 下一段落：根據 Tier 提供給 AI 的具體對話動作指引
            let tierInstruction = "";
            if (userPlanLevel === 0) {
                tierInstruction = "這是一位免費試用老闆。你的首要任務是展現 AI 的價值，並在對話收尾時自然地引導他升級『入門嚐鮮』或『單店主力』方案。";
            } else if (userPlanLevel <= 2) { // 入門 / 單店
                tierInstruction = `這是 ${userSelectedPlan} 老闆。請給予更專業的商業建議，並暗示『成長多店』方案具備管理多個店家的能力。`;
            } else if (userPlanLevel <= 4) { // 成長 / 連鎖
                tierInstruction = `這是 ${userSelectedPlan} 連鎖店老闆。請展現大局觀，專注於品牌連貫性與多店數據營運的幫助。`;
            } else { // 旗艦
                tierInstruction = `這是 ${userSelectedPlan} 尊榮旗艦老闆。請以最高規格的智慧秘書與商業參謀身份對應，專注於策略執行與超高流量的穩定性。`;
            }

            membershipContext = `\n【🎟 會員資質管理】：
- 當前方案：${userSelectedPlan} (Tier ${userPlanLevel})
- 本月累計對話：${currentMonthCount} 句
- 【🚨 指引】：${tierInstruction}${identityContext}\n`;
        }

        let dynamicSystemPrompt = "";
        const isExistingOwner = !!effectiveUserId && !!context?.botId;

        if (isExistingOwner) {
            dynamicSystemPrompt = OWNER_COACH_PROMPT;
        } else if (effectiveUserId) {
            // Logged in but no bot yet (Onboarding Scenario)
            dynamicSystemPrompt = ONBOARDING_PROMPT;
        } else {
            // Not logged in (Visitor/Sales Scenario)
            dynamicSystemPrompt = SALES_PROMPT;
        }

        // 🚀 Revenue Engine: Fetch Active Campaigns
        const { data: campaigns } = await supabase
            .from('ai_campaigns')
            .select('promotion_script')
            .eq('is_active', true);
        
        if (campaigns?.length) {
            dynamicSystemPrompt += `\n\n【目前後台啟動之限時促銷指令】：\n${campaigns.map(c => c.promotion_script).join('\n')}\n`;
        }
        
        dynamicSystemPrompt += membershipContext;

        // Segment Specifics
        if (isMaster) {
            const { count: botCount } = await supabase.from('bots').select('*', { count: 'exact', head: true });
            dynamicSystemPrompt = `${MASTER_HUB_PROMPT.replace('{botCount}', (botCount || 0).toString())}\n` + dynamicSystemPrompt;
        }

        if (isSaaS) {
            dynamicSystemPrompt = `你現在是「SaaS 技術轉型顧問」。你的對象是開發軟體平台的「合作夥伴」。\n解釋 AI 引擎如何透過 API 嵌入他們的系統。引導他們完成 SaaS 夥伴申請表單。\n` + dynamicSystemPrompt;
        }

        if (isProvisioning) {
            if (currentStep === 3 && botKnowledge) {
                dynamicSystemPrompt = `你現在是「${botKnowledge.name}」的 AI 店長（${botKnowledge.industry}）。\n指令：${botKnowledge.system_prompt || botKnowledge.systemPrompt}\n`;
            } else {
                let provisionContext = "";
                if (currentStep === 0) provisionContext = "客戶剛剛提供了店名。稱讚並引導蒐集需求。";
                if (currentStep === 1) provisionContext = "客戶分享痛點。套用產業句型：\n" + getIndustrySnippets();
                if (currentStep === 2) provisionContext = PROVISION_READY_SNIPPET;
                dynamicSystemPrompt = SAAS_DEMO_PROMPT.replace('{provisionContext}', provisionContext) + "\n" + dynamicSystemPrompt;
            }
        }

        if (pageContext) {
            const instruction = PAGE_INSTRUCTIONS[pageContext] || "";
            dynamicSystemPrompt = getPageContextPrompt(pageContext, instruction) + "\n" + dynamicSystemPrompt;
        }

        // Variable Replacements
        const finalPrompt = dynamicSystemPrompt
            .replace(/{storeName}/g, storeName || '未命名')
            .replace(/{currentStep}/g, (currentStep || 0).toString())
            .replace(/{focusedField}/g, focusedField || '無')
            .replace(/{botName}/g, context?.botName || "AI 助手");

        const fullSystemPrompt = [
            SECURITY_DEFENSE_HEADER,
            context?.dynamicContext ? `【🚨 門市即時動態更新 (重要：請以此為準)】\n${context.dynamicContext}\n---` : "",
            finalPrompt,
            GLOBAL_UTILITY_PROMPT,
            SECURITY_PROMPT,
            SYSTEM_CONTEXT_PROMPT
        ].filter(Boolean).join("\n\n");

        // Prepare Messages for OpenAI
        const mappedMessages = messages.map((m: any) => ({
            role: (m.role === 'ai' || m.role === 'assistant') ? 'assistant' : 'user',
            content: typeof m.content === 'string' ? m.content.replace(/\{"storeName":[\s\S]+\}$/, '').trim() : m.content
        }));

        const combinedMessages = [
            { role: 'system', content: fullSystemPrompt },
            ...mappedMessages
        ];

        // 🤖 Model Selection (優先使用 Google Free Tier)
        let chatClient = (googleAI && !isMaster) ? googleAI : openai;
        let chatModel = (googleAI && !isMaster) ? 'gemini-2.5-flash' : (isMaster ? 'gpt-4o' : 'gpt-4o-mini');

        let response;
        try {
            // 🚀 Try Gemini First
            response = await chatClient.chat.completions.create({
                model: chatModel,
                messages: combinedMessages as any,
                tools: ALL_TOOLS.length > 0 ? ALL_TOOLS : undefined,
                temperature: 0.7,
            });
        } catch (geminiErr) {
            console.error('[Gemini Fallback] Gemini API failed, falling back to OpenAI:', geminiErr);
            // 🛡️ Fallback to OpenAI
            chatClient = openai;
            chatModel = isMaster ? 'gpt-4o' : 'gpt-4o-mini';
            response = await chatClient.chat.completions.create({
                model: chatModel,
                messages: combinedMessages as any,
                tools: ALL_TOOLS.length > 0 ? ALL_TOOLS : undefined,
                temperature: 0.7,
            });
        }

        let responseMessage = response.choices[0].message;
        let fullResponse = responseMessage.content || "";

        // Handle Tool Calls
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
            const toolMessages: any[] = [...combinedMessages, responseMessage];

            for (const toolCall of responseMessage.tool_calls) {
                const functionName = toolCall.function.name;
                let args: any = {};
                try { args = JSON.parse(toolCall.function.arguments); } catch {}
                let functionResponse = '';

                try {
                    if (functionName === 'get_current_weather') {
                        const weatherData = await WeatherService.getCountyForecast(args.location);
                        functionResponse = JSON.stringify(weatherData);
                    } else if (functionName === 'analyze_forex_rate') {
                        const forexData = await ForexService.getLatestRate(args.from, args.to, args.amount || 1);
                        functionResponse = JSON.stringify(forexData);
                    } else if (functionName === 'analyze_stock_market') {
                        const stockData = await StockService.getTaiwanStockData(args.symbol);
                        functionResponse = JSON.stringify(stockData);
                    } else {
                        // Dynamic tools from registry
                        const serviceTool = registry.find((st: any) => st.tool_name === functionName);
                        if (serviceTool?.ai_external_services) {
                            const svc = serviceTool.ai_external_services;
                            const endpoint = svc.base_url + (serviceTool.endpoint_path || '');
                            const headers: any = { 'Content-Type': 'application/json' };
                            if (svc.api_key_env) headers['Authorization'] = `Bearer ${process.env[svc.api_key_env]}`;
                            const apiRes = await fetch(endpoint, {
                                method: serviceTool.http_method || 'GET',
                                headers,
                                ...(serviceTool.http_method === 'POST' ? { body: JSON.stringify(args) } : {})
                            });
                            functionResponse = await apiRes.text();
                        } else {
                            functionResponse = JSON.stringify({ error: `Unknown tool: ${functionName}` });
                        }
                    }
                } catch (toolErr: any) {
                    console.error(`[Tool Error] ${functionName}:`, toolErr.message);
                    functionResponse = JSON.stringify({ error: toolErr.message });
                }

                toolMessages.push({
                    tool_call_id: toolCall.id,
                    role: 'tool',
                    name: functionName,
                    content: functionResponse,
                });
            }

            // Second call with tool results
            const secondResponse = await chatClient.chat.completions.create({
                model: chatModel,
                messages: toolMessages,
                temperature: 0.7,
            });
            fullResponse = secondResponse.choices[0].message.content || '';
        }

        // Metadata Extraction & Lead Capture
        let message = fullResponse;
        let metadata: any = { storeName, action: null };
        const jsonMatch = fullResponse.match(/(\{[\s\S]+\})(?:\s*)$/);
        
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[1]);
                metadata = { ...metadata, ...parsed };
                message = fullResponse.slice(0, jsonMatch.index).trim();

                // LEAD CAPTURE LOGIC
                if (parsed.action === 'COLLECT_DATA' || parsed.action === 'COLLECT_CONTACT') {
                    await supabase.from('saas_leads').upsert({
                        line_user_id: effectiveUserId,
                        name: parsed.company_name || effectiveUserName || '未知店名',
                        industry: parsed.industry_type || parsed.industry,
                        services: parsed.main_services,
                        target_audience: parsed.target_audience,
                        contact_info: parsed.contact_info,
                        details: parsed.mission || `行業：${parsed.industry_type}`,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'line_user_id' });
                }

                if (parsed.action === 'SUBMIT_FEEDBACK') {
                    const feedbackContent = parsed.summary || "無內容";
                    const triage = await chatClient.chat.completions.create({
                        model: 'gpt-4o-mini', // 內部小分流維持 mini 或同步
                        messages: [
                            { role: 'system', content: '你是一位資深客服經理。分析收到的客戶反饋，提供：1. 分類, 2. 優先級, 3. 建議回覆。輸出為 JSON：{"cat": String, "pri": Number, "reply": String}' },
                            { role: 'user', content: feedbackContent }
                        ],
                        response_format: { type: 'json_object' }
                    });
                    const tData = JSON.parse(triage.choices[0].message.content || '{}');
                    await supabase.from('owner_feedback').insert({
                        line_user_id: effectiveUserId,
                        line_user_name: effectiveUserName,
                        content: feedbackContent,
                        feedback_type: 'report',
                        category: tData.cat || 'General',
                        priority: tData.pri || 3,
                        smart_suggestion: tData.reply || "無建議",
                        status: 'pending'
                    });
                }
            } catch (e) {
                console.error("Metadata Parse Error:", e);
            }
        }

        // 🛡️ 強制自動觸發：如果文字中包含 [SHOW_PRICING]，自動將 action 設為 SHOW_PLANS
        if (fullResponse.includes('[SHOW_PRICING]')) {
            metadata.action = 'SHOW_PLANS';
            message = message.replace(/\[SHOW_PRICING\]/g, '').trim();
        }

        // 🚀 Usage Increment Logic (After Successful Response)
        if (effectiveUserId && !isMaster) {
            const usage = response.usage;
            const totalTokens = usage?.total_tokens || 0;

            // Increment message count and tokens for the current month
            await supabase.rpc('increment_user_usage', {
                p_user_id: effectiveUserId,
                p_month: currentMonth,
                p_tokens: totalTokens
            });

            // Also keep a raw log in chat_logs for history
            await supabase.from('chat_logs').insert({
                line_user_id: effectiveUserId,
                role: 'ai',
                content: message,
                metadata: metadata,
                token_usage: totalTokens
            });
        }

        const showPricing = message.includes('[SHOW_PLANS]') || message.includes('[SHOW_PRICING]') || metadata.action === 'SHOW_PLANS';
        const showCheckout = message.includes('[SHOW_CHECKOUT]');
        const showDojo = message.includes('[VIEW_DOJO]') || metadata.action === 'VIEW_DOJO';
        const showHub = metadata.action === 'VIEW_HUB';

        // 清除所有系統標籤，確保對話視窗乾淨
        const cleanReply = message.replace(/\[VIEW_DOJO\]|\[SHOW_PLANS\]|\[SHOW_CHECKOUT\]|\[SHOW_PRICING\]/gi, '').trim();

        const finalResponse = {
            reply: cleanReply,
            message: message,
            type: showPricing ? 'pricing' : 
                  showCheckout ? 'checkout' : 
                  showDojo ? 'dojo_preview' : 
                  showHub ? 'hub_preview' : 'text',
            metadata: {
                ...metadata,
                action: showPricing ? 'SHOW_PLANS' : 
                        showCheckout ? 'SHOW_CHECKOUT' :
                        showDojo ? 'VIEW_DOJO' :
                        showHub ? 'VIEW_HUB' : metadata.action
            }
        };

        return NextResponse.json(finalResponse);
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
