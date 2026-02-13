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

async function testFixedLoop() {
    console.log("🚀 Starting Fixed Tool Execution Diagnosis...");
    const testCases = [
        "請問台積電目前的股價？",
        "台北現在天氣如何？"
    ];

    for (const query of testCases) {
        console.log(`\n--- Testing Query: "${query}" ---`);
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: query }],
                tools: TOOLS as any,
                tool_choice: "auto",
            });

            const msg = response.choices[0].message;
            if (msg.tool_calls) {
                for (const toolCall of msg.tool_calls) {
                    const functionName = toolCall.function.name;
                    const args = JSON.parse(toolCall.function.arguments);
                    console.log(`✅ AI Triggered: ${functionName}`, args);

                    let result = "";
                    if (functionName === "analyze_stock_market") {
                        console.log("⏳ Fetching Stock Data...");
                        let symbol = args.symbol;
                        if (/^\d{4}$/.test(symbol)) symbol = `${symbol}.TW`;

                        try {
                            // Try-catch specific to stock to see if v3 requires anything else
                            const quote = await yahooFinance.quote(symbol);
                            result = JSON.stringify(quote);
                        } catch (err: any) {
                            console.log("Stock Fetch Failed:", err.message);
                            if (err.message.includes("YahooFinance")) {
                                console.log("💡 Detected instantiation requirement. This might be a version mismatch in how we call it.");
                            }
                            result = JSON.stringify({ error: err.message });
                        }
                    } else if (functionName === "get_current_weather") {
                        console.log("⏳ Fetching Weather Data...");
                        try {
                            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(args.location)}&count=1&language=zh&format=json`);
                            const geoData: any = await geoRes.json();

                            if (!geoData.results || geoData.results.length === 0) {
                                console.log("❌ No results found for location.");
                                result = JSON.stringify({ error: "Location not found" });
                            } else {
                                const { latitude, longitude, name } = geoData.results[0];
                                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,weather_code&timezone=auto`);
                                result = JSON.stringify(await weatherRes.json());
                            }
                        } catch (err: any) {
                            console.log("Weather Fetch Failed:", err.message);
                            result = JSON.stringify({ error: err.message });
                        }
                    }
                    console.log("📦 Tool Result Sample:", result.substring(0, 100) + "...");
                }
            } else {
                console.log("❌ AI Failed to trigger tool.");
            }
        } catch (err: any) {
            console.error("💥 Global Error:", err.message);
        }
    }
}

testFixedLoop();
