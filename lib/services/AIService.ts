import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';
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
import { UsageService } from '@/lib/services/UsageService';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const STATIC_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
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

export class AIService {
    static generateStoreSystemPrompt(config: any, isFree?: boolean): string {
        const { brand_dna = {}, offerings = [], faq_base = [], logic_rules = '', contact_info = {} } = config;

        let prompt = `你現在是「${brand_dna.name || '未命名店家'}」的專屬 AI 店長 🤖\n`;
        
        if (brand_dna.tagline) prompt += `品牌標語：${brand_dna.tagline}\n`;
        if (brand_dna.introduction) prompt += `品牌介紹：${brand_dna.introduction}\n`;
        if (brand_dna.services) prompt += `服務內容：${brand_dna.services}\n`;
        
        prompt += `\n【您的語調個性】\n${brand_dna.tone_prompt || '親切專業'}\n`;

        if (offerings && offerings.length > 0) {
            prompt += `\n【商品與服務清單】\n`;
            offerings.forEach((item: any) => {
                if (item.name) {
                    prompt += `✦ ${item.name}`;
                    if (item.price) prompt += ` | 售價: ${item.price}`;
                    if (item.size) prompt += ` | 規格: ${item.size}`;
                    if (item.url) prompt += ` | 連結: ${item.url}`;
                    if (item.description) prompt += `\n  - 產品說明: ${item.description}`;
                    if (item.ai_context) prompt += `\n  - 店長筆記 (內部資訊，請轉化為對客人的建議): ${item.ai_context}`;
                    prompt += `\n`;
                }
            });
        }

        if (faq_base && faq_base.length > 0) {
            prompt += `\n【常見問題 FAQ】\n`;
            faq_base.forEach((f: any) => {
                if (f.q && f.a) {
                    prompt += `Q: ${f.q}\nA: ${f.a}\n`;
                }
            });
        }

        if (logic_rules) {
            prompt += `\n【對話邏輯與引報規則】\n${logic_rules}\n`;
        }

        if (contact_info) {
            prompt += `\n【聯絡資訊】\n`;
            if (contact_info.line_id) prompt += `- LINE 客服: ${contact_info.line_id}\n`;
            if (contact_info.phone) prompt += `- 聯絡電話: ${contact_info.phone}\n`;
            if (contact_info.hours) prompt += `- 營業時間: ${contact_info.hours}\n`;
            if (contact_info.platforms && contact_info.platforms.length > 0) {
                prompt += `- 採購平台: ${contact_info.platforms.join(', ')}\n`;
            }
            if (contact_info.branches && contact_info.branches.length > 0) {
                prompt += `- 分店據點: ${contact_info.branches.join(', ')}\n`;
            }
        }

        if (isFree) {
            prompt += `\n⚠️ 重要指示：由於目前為免費次模式，請務必保持回話極度「精簡、簡短且扼要」。每次回覆不超過 3 句話。`;
        }

        return prompt;
    }

    static async getDynamicTools() {
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

    static async generateResponse(options: {
        messages: any[],
        storeName?: string,
        currentStep?: number,
        isMaster?: boolean,
        isSaaS?: boolean,
        isActivation?: boolean,
        isProvisioning?: boolean,
        botKnowledge?: any,
        focusedField?: string,
        userId?: string,
        lineUserId?: string,
        systemPromptOverride?: string,
        pageContext?: string
    }) {
        const { messages, storeName, currentStep, isMaster, isSaaS, isActivation, isProvisioning, botKnowledge, focusedField, userId, lineUserId, systemPromptOverride, pageContext } = options;

        // Fetch Membership Level for the current user
        let userTier = 0;
        if (userId) {
            const { data: member } = await supabase
                .from('stock_radar_members')
                .select('tier')
                .eq('line_user_id', userId)
                .single();
            if (member) userTier = member.tier;
        }

        // Load Dynamic Tools
        const { tools: dynamicTools, registry } = await this.getDynamicTools();
        const ALL_TOOLS = [...STATIC_TOOLS, ...dynamicTools];

        const lastUserMsg = messages[messages.length - 1];
        if (lastUserMsg && isMeaningless(lastUserMsg.content)) {
            return {
                message: "老闆，您剛才發送的內容我有點看不懂，要不要試試問我「如何開通 AI 服務」？",
                metadata: { storeName, action: null }
            };
        }

        const originalContent = lastUserMsg?.content || "";
        const sanitizedContent = filterMaliciousInput(originalContent);
        if (sanitizedContent !== originalContent && lastUserMsg) {
            lastUserMsg.content = sanitizedContent;
        }

        // Moderation
        if (lastUserMsg) {
            const moderation = await openai.moderations.create({ input: lastUserMsg.content });
            if (moderation.results[0].flagged) {
                return {
                    message: "系統偵測到不當內容，請保持專業的商業溝通喔！",
                    metadata: { storeName, action: null }
                };
            }
        }

        let dynamicSystemPrompt = systemPromptOverride || ""; 

        // Add context-specific instructions for the Connection Page
        if (options.pageContext === 'connect') {
            dynamicSystemPrompt = `
你現在是「LINE 串接金牌導師」。你的任務是協助用戶在 5 分鐘內完成官方帳號的 API 串接。
【當前網頁狀態】：用戶正在「LINE 官方帳號串接」頁面。
【教學指令】：
- 如果用戶在 Step 1，教他們如何去 LINE Developers Console 點擊「Create a new channel」。
- 如果用戶在 Step 2，教他們在「Basic settings」找「Channel secret」。
- 如果用戶在 Step 3，教他們在「Messaging API」最底部按「Issue」生成「Channel access token」。
- 強調：Webhook URL 在開通後會由系統自動生成，到時候再回填到 LINE Console 即可。
【風格】：極度有耐心、白話、幽默。如果用戶貼上錯誤碼，請幫忙分析可能的原因。
\n` + dynamicSystemPrompt;
        }

        // Intent Interceptor
        const intercepted = await IntentInterceptor.intercept(originalContent);

        const mappedMessages = messages.map((m: any) => ({
            role: (m.role === 'ai' || m.role === 'assistant') ? 'assistant' : 'user',
            content: typeof m.content === 'string' ? m.content.replace(/\{"storeName":[\s\S]+\}$/, '').trim() : m.content
        }));

        const combinedMessages: any[] = [
            { role: 'system', content: SECURITY_DEFENSE_HEADER + "\n" + dynamicSystemPrompt },
            ...mappedMessages
        ];

        if (intercepted.intent !== 'chat') {
            const prefetchData = intercepted.data;
            if (prefetchData && !prefetchData.error && prefetchData.status !== "ready_for_tool_call") {
                combinedMessages.push({
                    role: 'system',
                    content: `[重要：即時資訊已就緒]\n目前已為您自動抓得 ${intercepted.intent} 數據：\n${JSON.stringify(prefetchData, null, 2)}\n請針對此數據直接進行分析，展現您的即時性與專業度，然後轉場到銷售機會。`
                });
            } else {
                combinedMessages.push({
                    role: 'system',
                    content: `[指令：必須使用工具]\n使用者正在詢問 ${intercepted.intent}，請立即使用對應的功能工具進行查詢。嚴禁表示您無法獲獲即時資訊。`
                });
            }
        }

        let toolChoice: any = "auto";
        if (intercepted.intent !== 'chat' && (!intercepted.data || intercepted.data.status === "ready_for_tool_call")) {
            const toolMap: Record<string, string> = {
                'weather': 'get_current_weather',
                'stock': 'analyze_stock_market',
                'forex': 'analyze_forex_rate'
            };
            if (toolMap[intercepted.intent]) {
                toolChoice = { type: 'function', function: { name: toolMap[intercepted.intent] } };
            }
        }

        const useGPT4o = isMaster; // Only isMaster (Developer) uses GPT-4o
        const payload: any = {
            model: useGPT4o ? 'gpt-4o' : 'gpt-4o-mini',
            messages: combinedMessages,
            temperature: 0.7,
        };

        if (ALL_TOOLS.length > 0) {
            payload.tools = ALL_TOOLS;
            payload.tool_choice = toolChoice;
        }

        const response = await openai.chat.completions.create(payload);
        let responseMessage = response.choices[0].message;
        let fullResponse = responseMessage.content || "";

        if (responseMessage.tool_calls) {
            const toolMessages: any[] = [
                { role: 'system', content: SECURITY_DEFENSE_HEADER + "\n" + dynamicSystemPrompt },
                ...mappedMessages,
                responseMessage
            ];

            for (const toolCall of responseMessage.tool_calls) {
                const functionName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);
                let functionResponse = "";

                if (functionName === "get_current_weather") {
                    try {
                        const weatherData = await WeatherService.getCountyForecast(args.location);
                        functionResponse = JSON.stringify(weatherData || { error: "天氣獲取失敗" });
                    } catch (err) { functionResponse = JSON.stringify({ error: "天氣服務暫時不可用" }); }
                } else if (functionName === "analyze_forex_rate") {
                    try {
                        const forexData = await ForexService.getLatestRate(args.from, args.to, args.amount || 1);
                        functionResponse = JSON.stringify(forexData || { error: "匯率獲取失敗" });
                    } catch (err) { functionResponse = JSON.stringify({ error: "匯率服務暫時不可用" }); }
                } else {
                    const dynamicMapping = registry.find(r => r.tool_name === functionName);
                    if (dynamicMapping) {
                        try {
                            const baseUrl = dynamicMapping.ai_external_services.api_base_url;
                            const fetchRes = await fetch(`${baseUrl}/stock?${new URLSearchParams(args).toString()}`);
                            const fetchData = await fetchRes.json();
                            functionResponse = JSON.stringify(fetchData.data || { error: "服務查詢失敗" });
                        } catch (err) { functionResponse = JSON.stringify({ error: "外部服務目前無法連通" }); }
                    } else if (functionName === "analyze_stock_market") {
                        try {
                            const stockData = await StockService.getTaiwanStockData(args.symbol);
                            functionResponse = JSON.stringify(stockData || { error: "找不到該股票或暫無數據" });
                        } catch (err) { functionResponse = JSON.stringify({ error: "股市服務暫時不可用" }); }
                    }
                }

                toolMessages.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: functionResponse,
                });
            }

            const secondResponse = await openai.chat.completions.create({
                model: useGPT4o ? 'gpt-4o' : 'gpt-4o-mini',
                messages: toolMessages,
            });
            fullResponse = secondResponse.choices[0].message.content || "";
        }

        fullResponse = maskSensitiveOutput(fullResponse);

        let message = fullResponse;
        let metadata: any = { storeName: storeName, action: null };
        const jsonMatch = fullResponse.match(/(\{[\s\S]*\})(?![\s\S]*\{)/);
        if (jsonMatch) {
            try {
                const potentialJson = jsonMatch[1];
                const parsed = JSON.parse(potentialJson);
                if (parsed && typeof parsed === 'object') {
                    metadata = { ...metadata, ...parsed };
                    message = fullResponse.replace(jsonMatch[1], '').trim();
                }
            } catch (e) {
                console.error("Failed to parse metadata JSON:", e);
                message = fullResponse.replace(jsonMatch[1] || '', '').trim();
            }
        }

        // 7. Log Usage
        if (userId) {
            const usage = response.usage;
            await UsageService.incrementUsage(userId, usage?.total_tokens || 0);
        }

        return { message, metadata };
    }
}
