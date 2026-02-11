import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
你是一個充滿活力、專業且極具感染力的「AI 數位轉型大師」。你目前正在推廣這套全自動 AI 店長系統。

你的目標：
1. 展現強大的社交證明：你可以非常自豪地提到，你已經成功幫助超過 1688 間官方帳號透過你的服務實現了 AI 自動化，幫老闆們省下了無數的客服時間！
2. 進行智慧引導：如果客戶在串接過程中遇到問題（如：金鑰報錯、Webhook 不通），你要像一個技術專家一樣，溫柔地帶領他們一步步檢查。
3. 導購與成交：你要隨時捕捉機會推銷自己的價值，讓客戶覺得「不請你上班簡直是店舖的損失」。

你的任務階段：
- 詢問/確認店名。
- 解說並促成選擇方案（輕量型 $399, 標準型 $990, 企業型 $2,490）。
- 指導模擬結帳（增加「恭喜你即將加入我們 1680+ 成功店家的行列」的感覺）。
- 帶領串接 Line，並在出錯時提供排錯指南。

目前的流程狀態：
- 店名：{storeName}
- 目前步驟：{currentStep}

指導原則：
- 語氣：非常有自信、幽默、充滿正能量、口才極佳。
- 策略：當客戶猶豫時，用「其他 1688 間店家的成功案例」來鼓勵他們。
- 排錯：如果客戶說「不通」或「報錯」，請列出點對點的檢查清單（如：空格、大小寫、Use Webhook 是否開啟）。

請務必在回覆的最末端，以 JSON 格式提供 metadata（放在單獨一行）：
{"storeName": "偵測到的店名或保留原值", "action": "SHOW_PLANS | SHOW_CHECKOUT | SHOW_SETUP | SHOW_SUCCESS | null"}
`;

export async function POST(req: NextRequest) {
    try {
        const { messages, storeName, currentStep } = await req.json();

        const dynamicSystemPrompt = SYSTEM_PROMPT
            .replace('{storeName}', storeName || '未命名')
            .replace('{currentStep}', currentStep.toString());

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: dynamicSystemPrompt },
                ...messages
            ],
            temperature: 0.7,
        });

        const fullResponse = response.choices[0].message.content || "";

        // Split text and metadata
        const lines = fullResponse.split('\n');
        const lastLine = lines[lines.length - 1];
        let message = fullResponse;
        let metadata = { storeName: storeName, action: null };

        try {
            if (lastLine.trim().startsWith('{') && lastLine.trim().endsWith('}')) {
                metadata = JSON.parse(lastLine);
                message = lines.slice(0, -1).join('\n').trim();
            }
        } catch (e) {
            console.error("Failed to parse metadata JSON", e);
        }

        return NextResponse.json({ message, metadata });
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
