import { NextResponse } from 'next/server';
import { Client, WebhookEvent } from '@line/bot-sdk';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/lib/encryption';
import { IntentInterceptor } from '@/lib/services/IntentInterceptor';

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
            const lineUserId = event.source.userId!;
            const isOwner = lineUserId === bot.owner_line_id;

            // --- KNOWLEDGE UPDATE INTERCEPTION (Owner Only) ---
            if (isOwner) {
                let trainingText = "";

                if (event.type === 'message' && event.message.type === 'text') {
                    const text = event.message.text.trim();
                    if (text.startsWith('@店長聽令') || text.startsWith('@更新知識')) {
                        trainingText = text.replace(/^@店長聽令\s*|^@更新知識\s*/, '').trim();
                    }
                } else if (event.type === 'message' && event.message.type === 'audio') {
                    // For audio, we always assume it's a training command from the owner
                    try {
                        const stream = await client.getMessageContent(event.message.id);

                        // Whisper requires a File-like object or a stream with a known filename.
                        // We will convert the readable stream to a buffer.
                        const chunks = [];
                        for await (const chunk of stream) {
                            chunks.push(chunk);
                        }
                        const buffer = Buffer.concat(chunks);

                        // OpenAI Node SDK expects a File for audio transcriptions. 
                        const audioFile = new File([buffer], 'audio.m4a', { type: 'audio/m4a' });

                        const transcription = await openai.audio.transcriptions.create({
                            file: audioFile,
                            model: 'whisper-1'
                        });

                        trainingText = transcription.text;
                    } catch (error) {
                        console.error("Audio Processing Error:", error);
                        await client.replyMessage((event as any).replyToken, {
                            type: 'text',
                            text: "老闆抱歉，我剛剛耳朵不太好，沒聽清楚您的語音指令，能請您再說一次嗎？"
                        });
                        continue; // Skip the rest of the loop for this event
                    }
                }

                if (trainingText) {
                    try {
                        // Classify the intent using LLM
                        const classificationResponse = await openai.chat.completions.create({
                            model: "gpt-4o-mini",
                            response_format: { type: "json_object" },
                            messages: [
                                {
                                    role: "system",
                                    content: `你是一個知識分類員。請閱讀店長的話，判斷這是一條「常見問題(FAQ)」還是「商品資訊(Product)」。
請輸出 JSON 格式：
如果是 FAQ：{"type": "faq", "question": "客戶可能會問的問題", "answer": "回答內容"}
如果是 產品：{"type": "product", "name": "商品名稱", "price": 價格數字(若無提則設為0), "cost": 成本數字(若無提則設為0)}
不要輸出多餘的字元。`
                                },
                                { role: "user", content: trainingText }
                            ]
                        });

                        const result = JSON.parse(classificationResponse.choices[0].message.content || "{}");
                        let replyMsg = "";

                        if (result.type === 'faq') {
                            await supabase.from('faq').insert([{ bot_id: botId, question: result.question, answer: result.answer }]);
                            replyMsg = `老闆收到！我已經把這條知識記下來了：\nQ: ${result.question}\nA: ${result.answer}`;
                        } else if (result.type === 'product') {
                            // Simple upsert logic
                            const { data: existingProduct } = await supabase.from('products').select('id').eq('bot_id', botId).eq('name', result.name).single();
                            if (existingProduct) {
                                await supabase.from('products').update({ price: result.price, cost: result.cost }).eq('id', existingProduct.id);
                                replyMsg = `老闆收到！商品「${result.name}」的價格已更新為 ${result.price} 元。`;
                            } else {
                                await supabase.from('products').insert([{ bot_id: botId, name: result.name, price: result.price, cost: result.cost }]);
                                replyMsg = `老闆收到！新商品「${result.name}」已上架，價格為 ${result.price} 元。`;
                            }
                        } else {
                            replyMsg = `老闆抱歉，我不太確定這條指令要存在哪裡，能請您換個說法嗎？（聽到的內容：${trainingText}）`;
                        }

                        // Reply to owner and move to next event
                        await client.replyMessage((event as any).replyToken, { type: 'text', text: replyMsg });
                        continue;
                    } catch (error) {
                        console.error("Training Processing Error:", error);
                        await client.replyMessage((event as any).replyToken, {
                            type: 'text',
                            text: "老闆抱歉，我剛剛腦袋卡住了，沒能記下您的指令，請稍後再試..."
                        });
                        continue;
                    }
                }
            }

            // --- NORMAL CHAT PROCESSING ---
            if (event.type === 'message' && event.message.type === 'text') {
                const userMessage = event.message.text.trim();

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
   - 你雖然具備強大的資訊查詢功能（股市、天氣、匯率），但你的目的「不是」當免費的查詢機，而是要展現 AI 的強大，回報完資訊後一定要補一句轉場台詞，引導用戶了解你的專業。
   - **銷售轉場 (The Pivot)**：無論回答什麼資訊（例如報完報價後），一定要補一句：「老闆您看，我的反應這麼快、資訊這麼準，如果您也有一尊這樣的分身幫您顧店、回客人，您是不是就能去喝咖啡或陪家人了？」
2. **股市分析專家指令**：
    - 當接到股票數據時，請嚴格遵守以下 **Emoji 報告格式**：
    📊 **公司概況**
    - 名稱：...
    - 背景：...
    
    💰 **基本面分析**
    - 即時價：{price} ({changePercent}%)
    - 獲利能力：良好／普通／需注意
    
    📈 **技術面分析**
    - 目前趨勢：{trend}
    - 支撐區：{supportLevel}
    - 壓力區：{resistanceLevel}
    
    🧭 **投資建議**
    ✅ **總評價**：(買入／持有／觀望／賣出)
    💡 **理由**：...

3. **即時氣象與溫馨提醒指令**：
    - 氣象報告格式：
    ☀️ **今日天氣摘要**
    - 地點：{location}
    - 狀態：{description}
    - 氣溫：{temperature}
    - 降雨機率：💧 {rainChance}
    
    😷 **專屬溫馨提醒**
    - (根據氣溫與降雨提供體貼叮嚀)

4. **匯率查詢指令**：
    - 格式：
    💵 **匯率報價**
    - 貨幣：{from} -> {to}
    - 匯率：{rate} (1 {from} = {rate} {to})
    - 日期：{date}

5. **專業排版**：多使用 Emoji、粗體與分段，增加可讀性。

目前使用的 Line User ID: ${lineUserId}`
                    },
                    ...(history || []).reverse().map((m: any) => ({
                        role: m.role === 'ai' ? 'assistant' : m.role,
                        content: m.content
                    }))
                ];

                // Intent Interceptor (Real-time Context Pre-fetching)
                const intercepted = await IntentInterceptor.intercept(userMessage);
                if (intercepted.intent !== 'chat') {
                    messages.push({
                        role: "system",
                        content: `[重要：即時資訊預載]\n使用者目前詢問的是 ${intercepted.intent}。以下是幫您抓取好的真實數據，請務必根據此數據直接進行分析並回覆（絕對不要再問「需要什麼分析」）：\n${JSON.stringify(intercepted.data, null, 2)}`
                    });
                }
                messages.push({ role: "user", content: userMessage });

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

                // C. Call OpenAI
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
                            } else if (functionName === "query_faq") {
                                const { data } = await supabase
                                    .from('faq')
                                    .select('*')
                                    .eq('bot_id', botId)
                                    .ilike('question', `%${args.question}%`);
                                functionResponse = JSON.stringify(data || []);
                            } else if (functionName === "calculate_business_metrics") {
                                const { data: orders } = await supabase.from('orders').select('*').eq('bot_id', botId);
                                const { data: products } = await supabase.from('products').select('*').eq('bot_id', botId);

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
                                const symbol = args.symbol.includes('.') ? args.symbol.split('.')[0] : args.symbol;
                                const data = await IntentInterceptor.intercept(symbol);
                                functionResponse = JSON.stringify(data.data || { error: "查無此股票數據" });
                            } else if (functionName === "get_current_weather") {
                                const data = await IntentInterceptor.intercept(args.location + "天氣");
                                functionResponse = JSON.stringify(data.data || { error: "查無此天氣數據" });
                            }

                            toolMessages.push({
                                tool_call_id: toolCall.id,
                                role: "tool",
                                name: functionName,
                                content: functionResponse,
                            });
                        }

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

                // D. Log & Reply
                (async () => {
                    try {
                        await supabase.from('chat_logs').insert([
                            { bot_id: botId, user_id: lineUserId, role: 'user', content: userMessage },
                            { bot_id: botId, user_id: lineUserId, role: 'ai', content: aiResponse }
                        ]);
                    } catch (e) {
                        console.error('Log failed:', e);
                    }
                })();

                await client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: aiResponse.trim() || '收到您的訊息！'
                });
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error: any) {
        console.error('Webhook Global Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
