import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { StockService } from '@/lib/services/StockService';
import { WeatherService } from '@/lib/services/WeatherService';
import { ForexService } from '@/lib/services/ForexService';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "analyze_stock_market",
            description: "獲取股市即時報價與技術分析數據",
            parameters: {
                type: "object",
                properties: {
                    symbol: { type: "string", description: "股票代號，例如 2330.TW" }
                },
                required: ["symbol"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_current_weather",
            description: "獲取台灣各縣市的即時天氣報告",
            parameters: {
                type: "object",
                properties: {
                    location: { type: "string", description: "台灣縣市名稱，如：台北市" }
                },
                required: ["location"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "analyze_forex_rate",
            description: "查詢國際匯率報價",
            parameters: {
                type: "object",
                properties: {
                    from: { type: "string", description: "來源貨幣 (如 USD)" },
                    to: { type: "string", description: "目標貨幣 (如 TWD)" },
                    amount: { type: "number" }
                },
                required: ["from", "to"]
            }
        }
    }
];

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: '你是一個專業的助理，擁有的工具包括股市、天氣與匯率查詢。請直接、精確地回答使用者的問題，不要拒絕獲取即時資訊。' },
                ...messages
            ],
            tools: TOOLS,
            tool_choice: 'auto',
        });

        const responseMessage = response.choices[0].message;

        if (responseMessage.tool_calls) {
            const toolMessages = [...messages, responseMessage];

            for (const toolCall of responseMessage.tool_calls) {
                const functionName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);
                let result = {};

                if (functionName === 'analyze_stock_market') {
                    result = await StockService.getTaiwanStockData(args.symbol) || { error: "找不到該股票" };
                } else if (functionName === 'get_current_weather') {
                    result = await WeatherService.getCountyForecast(args.location) || { error: "找不到該地區" };
                } else if (functionName === 'analyze_forex_rate') {
                    result = await ForexService.getLatestRate(args.from, args.to, args.amount || 1) || { error: "無法獲取匯率" };
                }

                toolMessages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result)
                });
            }

            const finalResponse = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: '請根據工具回傳的即時數據，簡潔地回答使用者。' },
                    ...toolMessages
                ]
            });

            return NextResponse.json({ message: finalResponse.choices[0].message.content });
        }

        return NextResponse.json({ message: responseMessage.content });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
