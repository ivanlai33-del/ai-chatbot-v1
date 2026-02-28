// This file defines the executable tools available to the AI via OpenAI Function Calling
import fetch from 'node-fetch';

export interface AITool {
    definition: {
        type: "function";
        function: {
            name: string;
            description: string;
            parameters: any;
        }
    };
    execute: (args: any) => Promise<string>;
}

// 1. Exchange Rate Tool (Using ExchangeRate-API free tier for demonstration)
const getExchangeRate: AITool = {
    definition: {
        type: "function",
        function: {
            name: "get_exchange_rate",
            description: "獲取目前的即時匯率資訊。如果使用者詢問匯率、外幣換算，或是美金對台幣的比例，請呼叫此工具。",
            parameters: {
                type: "object",
                properties: {
                    base_currency: {
                        type: "string",
                        description: "被兌換的貨幣代碼，例如 USD, EUR, JPY, TWD 等等。若使用者沒有特別說，預設通常是 USD 或 TWD。",
                    },
                    target_currency: {
                        type: "string",
                        description: "目標兌換貨幣代碼，例如 TWD, USD, JPY。"
                    }
                },
                required: ["base_currency", "target_currency"],
            },
        }
    },
    execute: async (args: { base_currency: string; target_currency: string }) => {
        try {
            const base = args.base_currency.toUpperCase();
            const target = args.target_currency.toUpperCase();

            // Using a standard public free endpoint
            const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
            if (!res.ok) throw new Error("API Limit or Error");

            const data: any = await res.json();
            const rate = data.rates[target];

            if (rate !== undefined) {
                return JSON.stringify({
                    success: true,
                    rate: rate,
                    message: `目前 1 ${base} 等於 ${rate} ${target}。更新時間：${data.date}`
                });
            } else {
                return JSON.stringify({ success: false, error: `找不到 ${target} 的匯率資料。` });
            }
        } catch (error) {
            console.error("Exchange Rate API failure:", error);
            return JSON.stringify({ success: false, error: "匯率系統連線超時，請稍後再試。" });
        }
    }
};

// 2. Weather Tool (Using public weather, replace with API key if needed)
const getWeather: AITool = {
    definition: {
        type: "function",
        function: {
            name: "get_current_weather",
            description: "查詢特定城市的即時天氣情況與溫度。如果使用者問到出門要不要帶傘、會不會冷，就呼叫這個。",
            parameters: {
                type: "object",
                properties: {
                    location: {
                        type: "string",
                        description: "城市名稱，最好是英文或標準中文（例如 Taipei, Kaohsiung, Tokyo, London）。",
                    },
                },
                required: ["location"],
            },
        }
    },
    execute: async (args: { location: string }) => {
        // NOTE: For a production app, use proper CWA (台灣氣象署) API or OpenWeatherMap API key.
        // This is a free endpoint (wttr.in) for demonstration of the concept.
        try {
            const city = encodeURIComponent(args.location);
            const res = await fetch(`https://wttr.in/${city}?format=j1`);
            if (!res.ok) throw new Error("Weather API Error");

            const data: any = await res.json();
            const current = data.current_condition[0];

            return JSON.stringify({
                success: true,
                location: data.nearest_area[0].areaName[0].value,
                temperature: current.temp_C,
                description: current.weatherDesc[0].value,
                humidity: current.humidity,
                wind_speed: current.windspeedKmph
            });
        } catch (error) {
            console.error("Weather API failure:", error);
            return JSON.stringify({ success: false, error: "無法取得該地區的天氣資訊，可能是地名無法辨識。" });
        }
    }
};

// 3. Simple Calculator (As an extra generic skill)
const calculateMath: AITool = {
    definition: {
        type: "function",
        function: {
            name: "calculate_math",
            description: "進行簡單或複雜的數學運算。當使用者需要計算總價、折扣、稅率或任何數學問題時，呼叫此工具。",
            parameters: {
                type: "object",
                properties: {
                    expression: {
                        type: "string",
                        description: "數學計算表達式，例如 '100 * 0.85', '1200 / 3', '45 + 50 * 2'。",
                    },
                },
                required: ["expression"],
            },
        }
    },
    execute: async (args: { expression: string }) => {
        try {
            // Very basic strict math evaluation. 
            // In production, use a library like 'mathjs' to strictly prevent arbitrary code execution via eval.
            // For now, sanitize out anything but numbers and basic operators.
            const sanitized = args.expression.replace(/[^0-9+\-*/(). ]/g, '');
            const result = eval(sanitized);
            return JSON.stringify({ success: true, result: result });
        } catch (error) {
            return JSON.stringify({ success: false, error: "數學算式格式有誤。" });
        }
    }
};


// 4. Transit Data Tool (Taiwan Railways - Basic TDX concept)
const getTransitData: AITool = {
    definition: {
        type: "function",
        function: {
            name: "get_train_schedule",
            description: "查詢台鐵(火車)的班次時間與票價。如果使用者問到某個車站到滿個車站在特定時刻的火車班次，請呼叫此工具。",
            parameters: {
                type: "object",
                properties: {
                    origin: {
                        type: "string",
                        description: "起點站名稱（例如：台北、台中、高雄、板橋）。",
                    },
                    destination: {
                        type: "string",
                        description: "終點站名稱（例如：新左營、花蓮、台南）。",
                    },
                    date: {
                        type: "string",
                        description: "日期，格式為 YYYY-MM-DD，預設為今天。",
                    }
                },
                required: ["origin", "destination"],
            },
        }
    },
    execute: async (args: { origin: string; destination: string; date?: string }) => {
        // NOTE: In production, this requires TDX Client ID and Client Secret to get a bearer token.
        // For demonstration, we simulate the output or use a public unprotected endpoint if available.
        // Implementing actual TDX OAuth flow is heavy, so we simulate a generic smart response based on typical train durations.
        try {
            console.log(`Querying transit for ${args.origin} to ${args.destination}`);
            return JSON.stringify({
                success: true,
                origin: args.origin,
                destination: args.destination,
                trains: [
                    { type: "自強號 (3000)", departure: "10:30", arrival: "12:15", price: 375 },
                    { type: "普悠瑪", departure: "11:00", arrival: "12:35", price: 375 },
                    { type: "區間快", departure: "11:15", arrival: "13:40", price: 241 }
                ],
                message: `已為您查詢 ${args.origin} 到 ${args.destination} 的班次（因 TDX 金鑰尚未設定，此為模擬示範數據）。`
            });
        } catch (error) {
            console.error("Transit API failure:", error);
            return JSON.stringify({ success: false, error: "交通部 TDX 服務連線異常，請稍後再查。" });
        }
    }
};

// The Registry
export const GenericToolsRegistry: Record<string, AITool> = {
    [getExchangeRate.definition.function.name]: getExchangeRate,
    [getWeather.definition.function.name]: getWeather,
    [calculateMath.definition.function.name]: calculateMath,
    [getTransitData.definition.function.name]: getTransitData
};

// Helper array for OpenAI payload
export const GenericToolsPayload = Object.values(GenericToolsRegistry).map(t => t.definition);
