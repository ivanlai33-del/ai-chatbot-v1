import { NextRequest, NextResponse } from 'next/server';
import { IntentInterceptor } from '@/lib/services/IntentInterceptor';
import { StockService } from '@/lib/services/StockService';
import { WeatherService } from '@/lib/services/WeatherService';
import { ForexService } from '@/lib/services/ForexService';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { text, isMaster } = await req.json();

        // 1. Test Interceptor
        const intercepted = await IntentInterceptor.intercept(text);

        // 2. Test Services directly
        let serviceResult = null;
        if (intercepted.intent === 'stock') {
            const query = text.replace(/[請問幫我查看看的行情股價分析?？\s]/g, '');
            serviceResult = await StockService.getTaiwanStockData(query);
        } else if (intercepted.intent === 'weather') {
            serviceResult = await WeatherService.getCountyForecast("臺北市");
        }

        // 3. Test OpenAI Tool Call Isolation
        const response = await openai.chat.completions.create({
            model: isMaster ? 'gpt-4o' : 'gpt-4o-mini',
            messages: [{ role: 'user', content: text }],
            tools: [
                {
                    type: "function",
                    function: {
                        name: "get_current_weather",
                        description: "獲取天氣",
                        parameters: { type: "object", properties: { location: { type: "string" } } }
                    }
                }
            ],
            tool_choice: "auto"
        });

        return NextResponse.json({
            input: text,
            intercepted,
            serviceResult,
            openAIResponse: response.choices[0]
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
