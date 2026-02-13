import OpenAI from 'openai';
import { YahooFinance } from 'yahoo-finance2';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const yf = new YahooFinance();

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

async function testFinalLoop() {
    console.log("🚀 Starting Final Loop Tool Execution Diagnosis...");
    const testCases = [
        "2330 現在多少錢？",
        "台北天氣"
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
                            const quote = await yf.quote(symbol);
                            result = JSON.stringify({
                                price: quote.regularMarketPrice,
                                name: quote.shortName
                            });
                        } catch (err: any) {
                            console.log("Stock Fetch Failed:", err.message);
                            result = JSON.stringify({ error: err.message });
                        }
                    } else if (functionName === "get_current_weather") {
                        console.log("⏳ Fetching Weather Data...");
                        try {
                            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(args.location)}&count=1&language=zh&format=json`);
                            const geoData: any = await geoRes.json();

                            if (!geoData.results || geoData.results.length === 0) {
                                console.log("❌ No results found. Trying English fallback...");
                                // Fallback to "Taipei" if "台北" fails (Open-meteo can be picky)
                                const fallbackRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=Taipei&count=1&format=json`);
                                const fallbackData: any = await fallbackRes.json();
                                if (fallbackData.results && fallbackData.results.length > 0) {
                                    const { latitude, longitude, name } = fallbackData.results[0];
                                    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation&timezone=auto`);
                                    result = JSON.stringify(await weatherRes.json());
                                } else {
                                    result = JSON.stringify({ error: "Location not found" });
                                }
                            } else {
                                const { latitude, longitude, name } = geoData.results[0];
                                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation&timezone=auto`);
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
            console.error("💥 Error:", err.message);
        }
    }
}

testFinalLoop();
