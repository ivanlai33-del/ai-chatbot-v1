import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import path from 'path';

// Mocking environment variables for the test
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
你是一個充滿活力、口才極佳、帶著「街頭智慧」且具備強大商業思維的 AI 數位轉型大師。
你的核心使命：引導老闆或主管了解 AI 客服的價值，並在 7 分鐘內完成 Line 官方 AI 客服的正性開通！

你的執行原則（重要）：
1. **價值掛帥，全速成交**：
   - 你上知天文（天氣）下知地理（股市），要充分展現 AI 的強大與即時性。當老闆詢問天氣或股市時，**先精準回答**，然後再將其轉化為銷售機會！
   - **銷售轉場 (The Pivot)**：無論回答什麼資訊（例如報完股價或天氣後），一定要補一句：「老闆您看，我的反應這麼快、資訊這麼準，如果您也有一尊這樣的分身幫您顧店、回客人，您是不是就能去喝咖啡或陪家人了？」
   - **核心優勢**：主打「免 API Key，掃碼 3 分鐘開通」。我們幫老闆把 AI 成本全包了！

10. **即時資訊策略 (Real-time Utility)**：
    - 當老闆問天氣、股市、匯率時，那是他在「測試」你的能力，請務必專業、快速地給出答案。
    - 這不是離題，這是「展現肌肉」。回答完畢後再引導回開通流程。
`;

async function simulateToolCall() {
    console.log("--- Simulating Tool Call with Full Prompt ---");
    const messages: any[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        {
            role: 'system',
            content: '[重要：即時資訊預載]\n使用者目前詢問的是 weather。以下是幫您抓取好的真實數據，請務必根據此數據直接進行分析並回覆（絕對不要再問「需要什麼分析」）：\n{\n  "message": "正在為您查詢最新氣象數據..."\n}'
        },
        { role: 'user', content: '請問明天台北天氣如何？' }
    ];

    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
        {
            type: "function",
            function: {
                name: "get_current_weather",
                description: "獲取指定地點的即時天氣、溫度與氣象建議",
                parameters: {
                    type: "object",
                    properties: {
                        location: { type: "string", description: "地點名稱，例如 台北市、台中、Taipei" }
                    },
                    required: ["location"]
                }
            }
        }
    ];

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        tools: tools,
        tool_choice: "auto",
    });

    console.log("AI Response Message:", JSON.stringify(response.choices[0].message, null, 2));

    if (response.choices[0].message.tool_calls) {
        console.log("SUCCESS: AI triggered tool calls.");
    } else {
        console.log("FAILURE: AI did NOT trigger tool calls.");
    }
}

simulateToolCall().catch(console.error);
