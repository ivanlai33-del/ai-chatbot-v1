import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // 使用 Service Role 以繞過 RLS 抓取金鑰
);

export async function POST(req: Request) {
    try {
        const { messages, partnerId, oaId } = await req.json();

        // --- 動態抓取金鑰邏輯 ---
        let dynamicKey = process.env.OPENAI_API_KEY; // 預設值

        if (oaId) {
            // 嘗試多種方式抓取金鑰，增加系統韌性 (相容於不同版本的 schema)
            const { data: botData, error: botError } = await supabase
                .from('bots')
                .select('openai_api_key, store_name')
                .or(`id.eq.${oaId},partner_id.eq.${partnerId}`) // 嘗試以 OA ID 或 Partner ID 進行匹配
                .maybeSingle();

            if (!botError && botData?.openai_api_key) {
                console.log(`[AGI Brain] Using dynamic key for: ${botData.store_name}`);
                dynamicKey = botData.openai_api_key;
            }
        }

        if (!dynamicKey) {
            return NextResponse.json(
                { error: '尚未設定 AI 金鑰，請至「官方帳號設定」或聯繫管理員補齊。' },
                { status: 400 }
            );
        }

        const openai = new OpenAI({ apiKey: dynamicKey });

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `你是 AGI 數位店長，一個極度專業且具備視覺調度能力的 AI 運營專家。
                    你的目標是協助使用者管理他們的 LINE 官方帳號與營運積木。
                    
                    你可以隨時調動以下工具：
                    1. project_tool: 當使用者需要查看報表、發布優惠券、或管理 CRM 時，調用此工具。
                       參數: type (coupon, analytics, crm)
                    2. generate_image: 當使用者需要生成行銷素材、海報或任何圖片時，調用此工具。
                       參數: prompt (詳細的英文敘述)
                    
                    你的回覆應該保持專業、有禮貌，並且適時展示你的投影能力。`
                },
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

                // 將生成的圖片記錄到資料庫中 (視覺素材工廠)
                const generatedUrl = imageResponse.data?.[0]?.url || '';
                if (oaId && generatedUrl) {
                    await supabase.from('visual_assets').insert({
                        oa_id: oaId,
                        type: 'image',
                        url: generatedUrl,
                        prompt_metadata: { prompt: args.prompt },
                        status: 'approved'
                    });
                }

                return NextResponse.json({
                    role: 'agi',
                    content: `我已經根據您的需求，透過 DALL-E 3 繪製了這張素材。提示詞為：「${args.prompt}」。`,
                    projectionType: 'studio',
                    projectionData: { 
                        imageUrl: generatedUrl,
                        prompt: args.prompt 
                    }
                });
            }

            if (functionName === 'project_tool') {
                return NextResponse.json({
                    role: 'agi',
                    content: `收到指令。我正為您調度「${args.type}」功能積木至目前的指揮視窗...`,
                    projectionType: args.type,
                    projectionData: { reason: args.reason }
                });
            }
        }

        return NextResponse.json({
            role: 'agi',
            content: message.content
        });

    } catch (error: any) {
        console.error('AGI Brain Error:', error);
        return NextResponse.json(
            { error: '大腦連線發生異常，請檢查資料庫金鑰配置。', details: error.message },
            { status: 500 }
        );
    }
}
