import { NextResponse } from 'next/server';
import { Client, WebhookEvent } from '@line/bot-sdk';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/lib/encryption';
import yahooFinance from 'yahoo-finance2';

export async function GET() {
    return new Response('Bot Webhook is Active.', { status: 200 });
}

export async function POST(
    req: Request,
    { params }: { params: { botId: string } }
) {
    const botId = params.botId;

    try {
        let body: any;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ status: 'ok' });
        }

        const events: WebhookEvent[] = body.events || [];
        if (events.length === 0) return NextResponse.json({ status: 'ok' });

        // 1. Fetch bot config
        const { data: bot, error: botError } = await supabase
            .from('bots')
            .select('*')
            .eq('id', botId)
            .single();

        if (botError || !bot) {
            console.error('Bot not found:', botError);
            return NextResponse.json({ status: 'error', message: 'Bot not found' }, { status: 404 });
        }

        if (bot.status !== 'active') {
            // Polited suspension reply (already decrypted in previous version, keeping logic)
            return NextResponse.json({ status: 'suspended' });
        }

        const lineConfig = {
            channelAccessToken: decrypt(bot.line_channel_access_token),
            channelSecret: decrypt(bot.line_channel_secret),
        };
        const decryptedUserKey = bot.openai_api_key ? decrypt(bot.openai_api_key) : "";
        const openaiApiKey = decryptedUserKey || process.env.MASTER_OPENAI_KEY || process.env.OPENAI_API_KEY;

        const client = new Client(lineConfig);
        const openai = new OpenAI({ apiKey: openaiApiKey });

        for (const event of events) {
            if (event.type === 'message' && event.message.type === 'text') {
                const userMessage = event.message.text.trim();
                const lineUserId = event.source.userId!;

                // A. Fetch History
                const { data: history } = await supabase
                    .from('chat_logs')
                    .select('role, content')
                    .eq('bot_id', botId)
                    .eq('user_id', lineUserId)
                    .order('created_at', { ascending: false })
                    .limit(10);

                const messages: any[] = [
                    {
                        role: "system", content: `${bot.system_prompt || "你是一個專業助手。"}

你的執行原則（重要）：
1. **價值掛帥，全速成交**：
   - 你雖然具備強大的資訊查詢功能（股市、天氣），但你的目的「不是」當免費的查詢機，而是要展現 AI 的強大，回報完資訊後一定要補一句轉場台詞，引導用戶了解你的專業。
   - **銷售轉場 (The Pivot)**：無論回答什麼資訊（例如報完股價或天氣後），一定要補一句：「老闆您看，我的反應這麼快、資訊這麼準，如果您也有一尊這樣的分身幫您顧店、回客人，您是不是就能去喝咖啡或陪家人了？」
2. **方案推廣與專業感**：
   - **399 方案 (Lite)**：基本的 AI 客服。
   - **990 方案 (專業版)**：經營管家（查詢庫存、算毛利、訂單追蹤、股市分析工具）。
3. **股市分析準則**：
    - 拿到數據後，請嚴格遵守專業分析格式輸出（包含支撐、壓力、趨勢分析）。
4. **氣象與溫馨提醒**：
    - 拿到氣象數據後，務必根據溫度或降雨主動加入「溫馨提醒」（如：太陽大要防曬、下雨要帶傘）。

目前使用的 Line User ID: ${lineUserId}`
                    },
                    ...(history || []).reverse().map((m: any) => ({
                        role: m.role === 'ai' ? 'assistant' : m.role,
                        content: m.content
                    })),
                    { role: "user", content: userMessage }
                ];

                // B. Define Tools
                const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
                    {
                        type: "function",
                        function: {
                            name: "query_inventory",
                            description: "查詢商品庫存與價格",
                            parameters: {
                                type: "object",
                                properties: {
                                    keyword: { type: "string", description: "產品關鍵字" }
                                }
                            }
                        }
                    },
                    {
                        type: "function",
                        function: {
                            name: "get_order_status",
                            description: "查詢客戶的訂單進度",
                            parameters: {
                                type: "object",
                                properties: {
                                    lineUserId: { type: "string", description: "Line 用戶 ID" }
                                }
                            }
                        }
                    },
                    {
                        type: "function",
                        function: {
                            name: "query_faq",
                            description: "從知識庫查詢常見問題解答",
                            parameters: {
                                type: "object",
                                properties: {
                                    question: { type: "string", description: "客戶的問題" }
                                }
                            }
                        }
                    },
                    {
                        type: "function",
                        function: {
                            name: "calculate_business_metrics",
                            description: "計算業務指標，如總營收、毛利等",
                            parameters: {
                                type: "object",
                                properties: {
                                    timeframe: { type: "string", enum: ["today", "this_month", "all_time"], description: "時間範圍" }
                                }
                            }
                        }
                    },
                    {
                        type: "function",
                        function: {
                            name: "analyze_stock_market",
                            description: "獲取股市即時報價與技術分析數據（含支撐壓力）",
                            parameters: {
                                type: "object",
                                properties: {
                                    symbol: { type: "string", description: "股票代號，例如 2330.TW 或 AAPL" }
                                },
                                required: ["symbol"]
                            }
                        }
                    },
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

                // C. Call OpenAI with Tool Support
                let aiResponse = '';
                try {
                    const response = await openai.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages,
                        tools,
                        tool_choice: "auto",
                    });

                    let responseMessage = response.choices[0].message;

                    // Handle Tool Calls
                    if (responseMessage.tool_calls) {
                        const toolMessages = [...messages, responseMessage];

                        for (const toolCall of responseMessage.tool_calls) {
                            const functionName = toolCall.function.name;
                            const args = JSON.parse(toolCall.function.arguments);
                            let functionResponse = "";

                            if (functionName === "query_inventory") {
                                const { data } = await supabase
                                    .from('products')
                                    .select('*')
                                    .eq('bot_id', botId)
                                    .ilike('name', `%${args.keyword}%`);
                                functionResponse = JSON.stringify(data || []);
                            } else if (functionName === "get_order_status") {
                                const { data } = await supabase
                                    .from('orders')
                                    .select('*')
                                    .eq('bot_id', botId)
                                    .eq('line_user_id', args.lineUserId || lineUserId)
                                    .order('created_at', { ascending: false })
                                    .limit(1);
                                functionResponse = JSON.stringify(data || []);
                            } else if (functionName === "query_faq") {
                                const { data } = await supabase
                                    .from('faq')
                                    .select('*')
                                    .eq('bot_id', botId)
                                    .ilike('question', `%${args.question}%`);
                                functionResponse = JSON.stringify(data || []);
                            } else if (functionName === "calculate_business_metrics") {
                                // 1. Fetch all orders (simplifying timeframe for this version)
                                const { data: orders } = await supabase
                                    .from('orders')
                                    .select('items, total_amount')
                                    .eq('bot_id', botId);

                                // 2. Fetch all products to get costs
                                const { data: products } = await supabase
                                    .from('products')
                                    .select('id, cost')
                                    .eq('bot_id', botId);

                                const productCosts = (products || []).reduce((acc: any, p: any) => {
                                    acc[p.id] = p.cost;
                                    return acc;
                                }, {});

                                let totalRevenue = 0;
                                let totalCost = 0;

                                (orders || []).forEach((order: any) => {
                                    totalRevenue += Number(order.total_amount);
                                    if (order.items && Array.isArray(order.items)) {
                                        order.items.forEach((item: any) => {
                                            const cost = productCosts[item.product_id] || 0;
                                            totalCost += Number(cost) * Number(item.quantity);
                                        });
                                    }
                                });

                                functionResponse = JSON.stringify({
                                    total_revenue: totalRevenue,
                                    total_cost: totalCost,
                                    gross_profit: totalRevenue - totalCost,
                                    profit_margin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(2) + "%" : "0%"
                                });
                            } else if (functionName === "analyze_stock_market") {
                                try {
                                    const symbol = args.symbol.includes('.') ? args.symbol : `${args.symbol}.TW`;
                                    const quote: any = await yahooFinance.quote(symbol);

                                    // Fetch history for support/resistance calculation (last 30 days)
                                    const to = new Date();
                                    const from = new Date();
                                    from.setDate(from.getDate() - 45); // Get enough days to cover 30 trading days

                                    const history: any[] = await yahooFinance.historical(symbol, {
                                        period1: from,
                                        interval: '1d'
                                    });

                                    const last30Days = history.slice(-30);
                                    const support = Math.min(...last30Days.map((h: any) => h.low));
                                    const resistance = Math.max(...last30Days.map((h: any) => h.high));
                                    const sma20 = last30Days.slice(-20).reduce((a: any, b: any) => a + (b.close || 0), 0) / 20;

                                    functionResponse = JSON.stringify({
                                        symbol: quote.symbol,
                                        name: quote.shortName || quote.longName,
                                        price: quote.regularMarketPrice,
                                        currency: quote.currency,
                                        change: quote.regularMarketChange,
                                        changePercent: quote.regularMarketChangePercent,
                                        dayLow: quote.regularMarketDayLow,
                                        dayHigh: quote.regularMarketDayHigh,
                                        supportLevel: support.toFixed(2),
                                        resistanceLevel: resistance.toFixed(2),
                                        sma20: sma20.toFixed(2),
                                        trend: quote.regularMarketPrice > sma20 ? "多頭" : "空頭",
                                        marketState: quote.marketState
                                    });
                                } catch (err: any) {
                                    console.error('Stock API Error:', err);
                                    functionResponse = JSON.stringify({ error: "無法獲取該股票數據，請確認代號是否正確。" });
                                }
                            } else if (functionName === "get_current_weather") {
                                try {
                                    // 1. Geocoding
                                    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(args.location)}&count=1&language=zh&format=json`);
                                    const geoData = await geoRes.json();

                                    if (!geoData.results || geoData.results.length === 0) {
                                        functionResponse = JSON.stringify({ error: `找不到 "${args.location}" 的地理資訊。` });
                                    } else {
                                        const { latitude, longitude, name, admin1 } = geoData.results[0];

                                        // 2. Weather
                                        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code&timezone=auto`);
                                        const weatherData = await weatherRes.json();
                                        const current = weatherData.current;

                                        functionResponse = JSON.stringify({
                                            location: `${admin1 || ""} ${name}`,
                                            temperature: current.temperature_2m,
                                            apparent_temperature: current.apparent_temperature,
                                            humidity: current.relative_humidity_2m,
                                            precipitation: current.precipitation,
                                            is_day: current.is_day,
                                            weather_code: current.weather_code,
                                            timestamp: current.time
                                        });
                                    }
                                } catch (err) {
                                    console.error('Weather API Error:', err);
                                    functionResponse = JSON.stringify({ error: "天氣服務暫時無法連線。" });
                                }
                            }

                            toolMessages.push({
                                tool_call_id: toolCall.id,
                                role: "tool",
                                name: functionName,
                                content: functionResponse,
                            });
                        }

                        // Final response after tools
                        const secondResponse = await openai.chat.completions.create({
                            model: "gpt-4o-mini",
                            messages: toolMessages,
                        });
                        aiResponse = secondResponse.choices[0].message.content || "";
                    } else {
                        aiResponse = responseMessage.content || "";
                    }
                } catch (e: any) {
                    console.error('AI Error:', e.message);
                    aiResponse = "抱歉，我剛才大腦斷線了，請再說一次。";
                }

                // D. Logging & Reply
                (async () => {
                    try {
                        await supabase.from('chat_logs').insert([
                            { bot_id: botId, user_id: lineUserId, role: 'user', content: userMessage },
                            { bot_id: botId, user_id: lineUserId, role: 'ai', content: aiResponse }
                        ]);
                    } catch (e) { console.error('Log failed'); }
                })();

                await client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: aiResponse.trim() || '收到您的訊息！'
                });
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
