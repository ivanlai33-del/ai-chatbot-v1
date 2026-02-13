import OpenAI from 'openai';
import yahooFinance from 'yahoo-finance2';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TOOLS = [
    {
        type: "function",
        function: {
            name: "analyze_stock_market",
            description: "獲取股市即時報價",
            parameters: { type: "object", properties: { symbol: { type: "string" } }, required: ["symbol"] }
        }
    },
    {
        type: "function",
        function: {
            name: "get_current_weather",
            description: "獲取天氣資訊",
            parameters: { type: "object", properties: { location: { type: "string" } }, required: ["location"] }
        }
    }
];

async function testDiagnosis() {
    console.log("🚀 Starting Real-time Tool Diagnosis...");
    const testCases = [
        "請問台積電目前的股價？",
        "台北現在天氣如何？"
    ];

    for (const query of testCases) {
        console.log(`\n--- Testing Query: "${query}" ---`);
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "你是一個專業助手，必須使用工具來回答實時問題。" },
                    { role: "user", content: query }
                ],
                tools: TOOLS as any,
                tool_choice: "auto",
            });

            const msg = response.choices[0].message;
            if (msg.tool_calls) {
                console.log("✅ AI Triggered Tool Call:", msg.tool_calls[0].function.name);
                console.log("Arguments:", msg.tool_calls[0].function.arguments);
            } else {
                console.log("❌ AI Failed to trigger tool.");
                console.log("AI Response:", msg.content);
            }
        } catch (err: any) {
            console.error("💥 Error during diagnosis:", err.message);
        }
    }
}

testDiagnosis();
