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

        // 系統提示詞
        const systemPrompt = `你是 AGI 數位店長，一個極度專業且具備視覺調度能力的 AI 運營專家。
你的目標是協助使用者管理他們的 LINE 官方帳號與營運積木。

你可以隨時調動以下工具：
1. project_tool: 當使用者需要查看報表、發布優惠券、或管理 CRM 時，調用此工具。
   參數: type (coupon, analytics, crm)
2. generate_image: 當使用者需要生成行銷素材、海報或任何圖片時，調用此工具。
   參數: prompt (詳細的英文敘述)

你的回覆應該保持專業、有禮貌，並且適時展示你的投影能力。`;

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
