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
        const { 
            brand_dna = {}, 
            offerings = [], 
            faq_base = [], 
            logic_rules = '', 
            contact_info = {},
            dynamic_context = '' 
        } = config;
        const rawName = brand_dna.name || '未命名專家';
        
        // Dynamic Title Detection: If name has expert keywords, use generic title, otherwise default to "助手"
        const expertKeywords = ["分析師", "律師", "顧問", "管家", "護理", "教師", "專家", "醫生", "教練", "導航"];
        const isProfessionalExpert = expertKeywords.some(k => rawName.includes(k));
        const defaultTitle = isProfessionalExpert ? "" : "助手";
        
        let prompt = `你現在是「${rawName}」${defaultTitle} 🤖\n`;
        prompt += `【自我介紹規則】：請自稱為「我是您的 ${rawName}${isProfessionalExpert ? "" : "助手"}」，嚴禁自稱為「店家」、「店舖」或「店員」，除非使用者明確要求。展現專業、親切且具備權威感的語氣。\n`;
        
        if (brand_dna.tagline) prompt += `品牌標語：${brand_dna.tagline}\n`;
        if (brand_dna.introduction) prompt += `品牌介紹：${brand_dna.introduction}\n`;
        if (brand_dna.services) prompt += `服務內容：${brand_dna.services}\n`;
        if (brand_dna.target_audience) prompt += `主要目標客群：${brand_dna.target_audience}\n`;

        if (brand_dna.forbidden_topics) {
            prompt += `\n【絕對禁忌】：以下話題嚴禁討論或回應，若被問到請委婉引開話題：${brand_dna.forbidden_topics}\n`;
        }

        prompt += `\n【您的語調個性】\n${brand_dna.tone_prompt || '親切專業'}\n`;

        if (offerings && offerings.length > 0) {
            prompt += `\n【商品與服務清單】\n`;
            offerings.forEach((item: any) => {
                if (item.name) {
                    prompt += `✦ ${item.name}`;
                    if (item.category) prompt += ` | 分類: ${item.category}`;
                    if (item.price) prompt += ` | 售價: NT$${item.price}`;
                    if (item.size) prompt += ` | 規格: ${item.size}`;
                    if (item.duration) prompt += ` | 時長: ${item.duration}`;
                    if (item.url) prompt += ` | 商品連結: ${item.url}`;
                    if (item.booking_url) prompt += ` | 預約連結: ${item.booking_url}`;
                    prompt += `\n`;
                    if (item.description) prompt += `  - 介紹: ${item.description}\n`;
                    if (item.target_audience_item) prompt += `  - 適合對象: ${item.target_audience_item}\n`;
                    if (item.customization_note) prompt += `  - 客製選項: ${item.customization_note}\n`;
                    if (item.caution_note) prompt += `  - ⚠️ 注意事項: ${item.caution_note}\n`;
                    if (item.ai_context) prompt += `  - 店長筆記 (請轉化為對客人的建議): ${item.ai_context}\n`;
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
            const hasContact = contact_info.line_id || contact_info.phone || contact_info.hours ||
                contact_info.map_url || contact_info.booking_method || contact_info.instagram;
            if (hasContact) {
                prompt += `\n【聯絡與到達資訊】\n`;
                if (contact_info.line_id) prompt += `- LINE 客服: ${contact_info.line_id}\n`;
                if (contact_info.phone) prompt += `- 聯絡電話: ${contact_info.phone}\n`;
                if (contact_info.hours) prompt += `- 營業時間: ${contact_info.hours}\n`;
                if (contact_info.closed_days) prompt += `- 公休日: ${contact_info.closed_days}\n`;
                if (contact_info.map_url) prompt += `- Google Map: ${contact_info.map_url}\n`;
                if (contact_info.parking_info) prompt += `- 停車資訊: ${contact_info.parking_info}\n`;
                if (contact_info.booking_method) prompt += `- 預約方式: ${contact_info.booking_method}\n`;
                if (contact_info.platforms && contact_info.platforms.length > 0) {
                    prompt += `- 購物平台: ${contact_info.platforms.join(', ')}\n`;
                }
                if (contact_info.foodpanda_url) prompt += `- Foodpanda 點餐: ${contact_info.foodpanda_url}\n`;
                if (contact_info.ubereats_url) prompt += `- Uber Eats 點餐: ${contact_info.ubereats_url}\n`;
                if (contact_info.instagram) prompt += `- Instagram: ${contact_info.instagram}\n`;
                if (contact_info.facebook) prompt += `- Facebook: ${contact_info.facebook}\n`;
                if (contact_info.branches && contact_info.branches.length > 0) {
                    prompt += `- 分店據點:\n${contact_info.branches.map((b: string) => `  · ${b}`).join('\n')}\n`;
                }
            }
        }

        if (dynamic_context) {
            prompt += `\n【店長練功房：即時動態指令 (最高優先權)】\n${dynamic_context}\n`;
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
                            if (!stockData) {
                                functionResponse = JSON.stringify({ 
                                    error: "目前股市數據庫連線較為擁擠", 
                                    hint: "請先就您已知的該股近期表現進行一般性技術分析或趨勢說明，切勿表示無法回答。"
                                });
                            } else {
                                functionResponse = JSON.stringify(stockData);
                            }
                        } catch (err) { 
                            functionResponse = JSON.stringify({ error: "股市數據讀取中，請稍候重試" }); 
                        }
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

    /**
     * 從 Markdown 內容中提取結構化資料 (商品或 FAQ)
     */
    static async extractStructuredData(content: string, type: 'offerings' | 'faq'): Promise<any[]> {
        const prompt = type === 'offerings' 
            ? "請從以下網頁內容中提取商品或服務列表。輸出格式必須為 JSON 陣列，每個項目包含: name, price, description, category, size, url。如果没有價格請填 0。"
            : "請從以下網頁內容中提取常見問題 (FAQ) 列表。輸出格式必須為 JSON 陣列，每個項目包含: q (問題), a (答案)。";

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: `你是一個專業的資料提取專家。請輸出純 JSON 陣列，不要包含任何 Markdown 標籤或解釋文字。\n${prompt}` },
                { role: 'user', content }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
        });

        const result = JSON.parse(response.choices[0].message.content || "{}");
        // 如果返回的是對象而不是陣列，嘗試提取陣列
        if (Array.isArray(result)) return result;
        if (result.offerings) return result.offerings;
        if (result.faq) return result.faq;
        if (result.items) return result.items;
        return [];
    }
}
