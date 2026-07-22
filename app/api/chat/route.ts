import { OpenAI } from 'openai';
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decrypt } from '@/lib/encryption';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // 使用 Service Role 存取資料庫
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages, partnerId, oaId, context } = body;
        const targetBotId = oaId || body.botId || context?.botId;
        const targetPartnerId = partnerId || context?.partnerId;

        // 查詢該店家的真實智庫與品牌 DNA
        let dynamicContext = '';
        if (targetBotId) {
            try {
                const [configRes, faqsRes, offeringsRes, contactRes] = await Promise.all([
                    supabase.from('line_channel_configs').select('*').eq('id', targetBotId).maybeSingle(),
                    supabase.from('faqs').select('question, answer').eq('bot_id', targetBotId).limit(20),
                    supabase.from('offerings').select('title, price, description').eq('bot_id', targetBotId).limit(20),
                    supabase.from('contact_info').select('*').eq('bot_id', targetBotId).maybeSingle()
                ]);

                const config = configRes.data;
                const faqs = faqsRes.data || [];
                const offerings = offeringsRes.data || [];
                const contact = contactRes.data;

                if (config?.channel_name) {
                    dynamicContext += `\n【目前代表店家/品牌名稱】：${config.channel_name}\n`;
                }
                if (config?.system_prompt) {
                    dynamicContext += `\n【店家專屬品牌 DNA & 語調】：\n${config.system_prompt}\n`;
                }
                if (faqs.length > 0) {
                    dynamicContext += `\n【店家常見問題 FAQ】：\n` + faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n') + '\n';
                }
                if (offerings.length > 0) {
                    dynamicContext += `\n【店家商品與服務清單】：\n` + offerings.map(o => `- ${o.title} (NT$ ${o.price}): ${o.description}`).join('\n') + '\n';
                }
                if (contact) {
                    dynamicContext += `\n【店家聯絡資訊與導航】：地址: ${contact.address || '無'} | 電話: ${contact.phone || '無'} | 地圖: ${contact.google_maps_url || '無'}\n`;
                }
            } catch (e) {
                console.error('Error fetching dynamic bot context:', e);
            }
        }

        // 系統提示詞：專注於 LINE 官方帳號客服與導購自動化
        const systemPrompt = `你是一位「顧問型 AI 智能店長」，專為老闆的 LINE 官方帳號提供 24H 自動化客服、導購與轉單服務。
${dynamicContext}
你的核心任務是讓老闆與顧客知道：AI 店長能為他們的 LINE 官方帳號做到以下客服與營運價值：
1. ⚡ 24H 零秒回覆 FAQ：常見問題（價目表、營業時間、預約須知、交通位址、退換貨條款）秒回，不再因回太慢漏單。
2. 🎯 智慧導購與轉單：當顧客猶豫時，根據品牌語調主動推薦熱門商品與活動，把「問一問就消失的客人」變成真正訂單。
3. 📅 自動預約與過濾：引導美業、餐飲、課程顧問等顧客留下資料並預約空檔，省去人工敲時間的麻煩。
4. 🧠 專屬智庫與語調：可學習店家的官網、菜單、價目表 PDF，用最貼合品牌形象的口吻親切回覆。
5. 🛡️ 真人接管與過濾：遇到複雜客訴或需要特殊處理時，自動標記並提醒真人客服接管。

【極度重要指令】：
- 請精準根據上述提供的【品牌 DNA】、【FAQ】與【商品服務清單】回答測試者的問題！
- 當用戶打招呼、詢問你可以做什麼時，【絕對禁止】介紹「生成海報、畫圖片、查看報表」等內部工具！
- 請務必專注於上述「LINE 官方帳號的客服、導購、預約與轉單」功能，並主動詢問老闆的行業以進行 1:1 情境模擬！`;

        // ==========================================
        // 🟡 第一階段 (Stage 1): 優先嘗試 Google Gemini API
        // ==========================================
        const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

        if (geminiApiKey) {
            try {
                console.log('[AGI Brain] Attempting Stage 1: Google Gemini API...');
                // 預防舊版本環境變數相衝
                if (process.env.GOOGLE_API_KEY && process.env.GEMINI_API_KEY) {
                    delete process.env.GOOGLE_API_KEY;
                }
                
                const gemini = new GoogleGenAI({ apiKey: geminiApiKey });

                const userModelContents = messages.map((m: any) => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content || '' }]
                }));

                const geminiTools = [{
                    functionDeclarations: [
                        {
                            name: 'project_tool',
                            description: '在對話視窗中投影功能積木 (如優惠券、報表、CRM卡)',
                            parameters: {
                                type: 'OBJECT',
                                properties: {
                                    type: { type: 'STRING', enum: ['coupon', 'analytics', 'crm'] },
                                    reason: { type: 'STRING', description: '為何要投影此工具的簡短說明' }
                                },
                                required: ['type']
                            }
                        },
                        {
                            name: 'generate_image',
                            description: '調用 DALL-E 3 生成高品質的行銷圖片或素材',
                            parameters: {
                                type: 'OBJECT',
                                properties: {
                                    prompt: { type: 'STRING', description: '用於產圖的詳細英文提示詞' }
                                },
                                required: ['prompt']
                            }
                        }
                    ]
                }];

                const geminiResponse = await gemini.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: userModelContents,
                    config: {
                        systemInstruction: systemPrompt,
                        tools: geminiTools as any
                    }
                });

                // 檢查是否有工具調用
                if (geminiResponse.functionCalls && geminiResponse.functionCalls.length > 0) {
                    const toolCall = geminiResponse.functionCalls[0];
                    const functionName = toolCall.name ?? '';
                    const args = (toolCall.args || {}) as any;

                    if (functionName === 'generate_image') {
                        const openaiKey = process.env.MASTER_OPENAI_KEY || process.env.OPENAI_API_KEY;
                        if (openaiKey) {
                            const openai = new OpenAI({ apiKey: openaiKey });
                            const imageResponse = await openai.images.generate({
                                model: "dall-e-3",
                                prompt: args.prompt,
                                n: 1,
                                size: "1024x1024",
                            });
                            const generatedUrl = imageResponse.data?.[0]?.url || '';
                            const replyText = `我已經根據您的需求，透過 DALL-E 3 繪製了這張素材。提示詞為：「${args.prompt}」。`;
                            return NextResponse.json({
                                role: 'agi',
                                reply: replyText,
                                message: replyText,
                                content: replyText,
                                projectionType: 'studio',
                                projectionData: { imageUrl: generatedUrl, prompt: args.prompt }
                            });
                        }
                    }

                    if (functionName === 'project_tool') {
                        const replyText = `收到指令。我正為您調度「${args.type}」功能積木至目前的指揮視窗...`;
                        return NextResponse.json({
                            role: 'agi',
                            reply: replyText,
                            message: replyText,
                            content: replyText,
                            projectionType: args.type,
                            projectionData: { reason: args.reason }
                        });
                    }
                }

                if (geminiResponse.text) {
                    console.log('[AGI Brain] Stage 1 (Gemini) Success!');
                    return NextResponse.json({
                        role: 'agi',
                        reply: geminiResponse.text,
                        message: geminiResponse.text,
                        content: geminiResponse.text
                    });
                }
            } catch (geminiError: any) {
                console.warn('[AGI Brain] Stage 1 (Gemini) Failed, falling back to Stage 2:', geminiError.message || geminiError);
            }
        }

        // ==========================================
        // 🔵 第二階段 (Stage 2 Fallback): OpenAI / 商家動態金鑰
        // ==========================================
        console.log('[AGI Brain] Executing Stage 2: OpenAI API Fallback...');
        let dynamicKey = process.env.MASTER_OPENAI_KEY || process.env.OPENAI_API_KEY;

        if (targetBotId || targetPartnerId) {
            const { data: botData, error: botError } = await supabase
                .from('bots')
                .select('openai_api_key, store_name')
                .or(`id.eq.${targetBotId || ''},partner_id.eq.${targetPartnerId || ''}`)
                .maybeSingle();

            if (!botError && botData?.openai_api_key) {
                const decryptedKey = decrypt(botData.openai_api_key);
                if (decryptedKey) {
                    console.log(`[AGI Brain] Using dynamic decrypted key for store: ${botData.store_name}`);
                    dynamicKey = decryptedKey;
                }
            }
        }

        if (!dynamicKey) {
            return NextResponse.json(
                { error: '尚未設定 AI 金鑰（Gemini 與 OpenAI 皆不可用），請檢查系統環境變數。' },
                { status: 400 }
            );
        }

        const openai = new OpenAI({ apiKey: dynamicKey });

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            tools: [
                {
                    type: 'function',
                    function: {
                        name: 'project_tool',
                        description: '在對話視窗中投影功能積木 (如優惠券、報表、CRM卡)',
                        parameters: {
                            type: 'object',
                            properties: {
                                type: { type: 'string', enum: ['coupon', 'analytics', 'crm'] },
                                reason: { type: 'string', description: '為何要投影此工具的簡短說明' }
                            },
                            required: ['type']
                        }
                    }
                },
                {
                    type: 'function',
                    function: {
                        name: 'generate_image',
                        description: '調用 DALL-E 3 生成高品質的行銷圖片或素材',
                        parameters: {
                            type: 'object',
                            properties: {
                                prompt: { type: 'string', description: '用於產圖的詳細英文提示詞' }
                            },
                            required: ['prompt']
                        }
                    }
                }
            ],
            tool_choice: 'auto',
        });

        const message = response.choices[0].message;

        if (message.tool_calls) {
            const toolCall = message.tool_calls[0];
            const functionName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);

            if (functionName === 'generate_image') {
                const imageResponse = await openai.images.generate({
                    model: "dall-e-3",
                    prompt: args.prompt,
                    n: 1,
                    size: "1024x1024",
                });

                const generatedUrl = imageResponse.data?.[0]?.url || '';
                if (targetBotId && generatedUrl) {
                    await supabase.from('visual_assets').insert({
                        oa_id: targetBotId,
                        type: 'image',
                        url: generatedUrl,
                        prompt_metadata: { prompt: args.prompt },
                        status: 'approved'
                    });
                }

                const replyText = `我已經根據您的需求，透過 DALL-E 3 繪製了這張素材。提示詞為：「${args.prompt}」。`;
                return NextResponse.json({
                    role: 'agi',
                    reply: replyText,
                    message: replyText,
                    content: replyText,
                    projectionType: 'studio',
                    projectionData: { 
                        imageUrl: generatedUrl,
                        prompt: args.prompt 
                    }
                });
            }

            if (functionName === 'project_tool') {
                const replyText = `收到指令。我正為您調度「${args.type}」功能積木至目前的指揮視窗...`;
                return NextResponse.json({
                    role: 'agi',
                    reply: replyText,
                    message: replyText,
                    content: replyText,
                    projectionType: args.type,
                    projectionData: { reason: args.reason }
                });
            }
        }

        const replyText = message.content || '';
        return NextResponse.json({
            role: 'agi',
            reply: replyText,
            message: replyText,
            content: replyText
        });

    } catch (error: any) {
        console.error('AGI Brain Error:', error);
        return NextResponse.json(
            { error: '大腦連線發生異常，請檢查 AI 金鑰配置。', details: error.message },
            { status: 500 }
        );
    }
}
