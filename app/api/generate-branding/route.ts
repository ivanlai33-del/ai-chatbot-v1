import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
    try {
        const { brandName, industry, targetField, currentData, locks } = await req.json();

        if (!brandName || !industry) {
            return NextResponse.json({ error: 'Missing brand name or industry' }, { status: 400 });
        }

        const systemPrompt = `你是一位資深的品牌行銷顧問與 AI 訓練專家。
你的任務是根據「品牌名稱」、「垂直行業」以及『使用者已手動鎖定並確認的內容』，為客戶生成專業且具一致性的品牌 DNA 設定。

請遵循以下原則：
1. 語氣一致：新生成的內容必須在調性、用詞習慣上，完美契合【已鎖定欄位】中的風格。
2. 繁體中文：使用繁體中文（台灣習慣用語）。
3. 互補性：避免重複已鎖定欄位中的資訊，而是提供互補且協調的新內容。

請輸出一個 JSON 物件，包含以下欄位（僅生成未被鎖定的欄位）：
- tagline: 一句響亮、好記的品牌標語。
- target_audience: 具體的目標客群描述。
- forbidden_topics: 建議禁止 AI 聊的話題（如：競品名稱、非關品牌的政治議題等）。
- introduction: 100 字以內的品牌故事與核心理念。
- services: 主要服務或商品清單，請務必根據行業特色提供至少 3-5 項專業服務，每行一項（不含符號）。
- welcome_message: 溫馨且具專業感的 LINE 歡迎語。
- closing_phrase: 令人印象深刻的對話結束語。
- tone: 從『親切專業』、『熱情活潑』、『沉穩知性』、『幽默有趣』、『簡潔俐落』中選擇一個最合適的。
- tone_prompt: 根據該 tone 撰寫一段提供給 AI 的系統提示詞。

如果指定了 targetField，則只返回該欄位的內容。
輸出格式必須為純 JSON。`;

        // 整理已鎖定欄位的內容供 AI 參考
        const lockedContext = Object.keys(locks || {})
            .filter(key => locks[key] && currentData[key])
            .map(key => `【已鎖定 ${key}】：${currentData[key]}`)
            .join('\n');

        const userPrompt = `品牌名稱：${brandName}
行業類別：${industry}

${lockedContext ? `使用者已確認的高品質內容（請務必以此風格為準）：\n${lockedContext}` : '（目前尚無手動鎖定的參考內容）'}

${targetField ? `請特別針對「${targetField}」進行高品質生成。` : '請為所有未鎖定的欄位生成高品質內容，並確保與上述已鎖定內容風格統一。'}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8,
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Branding Generation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
