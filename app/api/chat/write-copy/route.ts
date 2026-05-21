import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { prompt, targetAudience } = await req.json();

        if (!prompt) {
            return NextResponse.json({ success: false, error: 'Missing prompt' }, { status: 400 });
        }

        const systemInstruction = `
你是一位頂尖的品牌行銷文案專家。
請根據老闆給的「目標大綱/意圖」以及「受眾標籤」，寫出一則「適合發在 LINE 官方帳號群發」的促銷或引導文字。
要求：
1. 語氣自然、平易近人，不要像機器人。
2. 開頭可以根據受眾標籤加入適當的稱呼或吸引注意的話語（例如：給喜歡新品的你）。
3. 善用 Emoji 來增加可讀性，但不要過多。
4. 結尾請加上行動呼籲 (Call to Action)，例如請他們直接回覆訊息。
5. 字數控制在 100-200 字以內，符合 LINE 閱讀習慣。
只回傳你寫好的推播文案內容，不要回應其他廢話，不要加 "文案：" 這類的字眼。
        `.trim();

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: `受眾特徵：${targetAudience}\n老闆的大綱/意圖：${prompt}` }
            ],
            temperature: 0.7,
            max_tokens: 300
        });

        const generatedMessage = response.choices[0].message?.content?.trim();

        return NextResponse.json({ success: true, message: generatedMessage });
    } catch (err: any) {
        console.error('[API:WriteCopy] Error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
