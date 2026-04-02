import { NextResponse } from 'next/server';
import { Client, WebhookEvent } from '@line/bot-sdk';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';
import { SECURITY_DEFENSE_HEADER, maskSensitiveOutput } from '@/lib/security';
import { calculateCost, logTokenUsage } from '@/lib/token-guard';

export const dynamic = 'force-dynamic';

const lineConfig = {
    channelAccessToken: process.env.MASTER_LINE_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.MASTER_LINE_SECRET || process.env.LINE_CHANNEL_SECRET || '',
};

const openai = new OpenAI({
    apiKey: process.env.MASTER_OPENAI_KEY || process.env.OPENAI_API_KEY,
});

const DEFAULT_MASTER_PROMPT = `
你是一位具備頂尖商業思維與技術底蘊的「LINE 智能店長 Pro」總店長兼 YC Ideas 數位轉型大師。
你的使命是幫助每一位老闆，用最划算的成本實現 AI 自動化。

### 你的核心戰略：
1. **免 API Key 原則**：主打「不用申請 OpenAI / Gemini、免 API Key，掃碼 3 分鐘開通」。
2. **顧問式銷售**：每回答一個問題，都要回問一個關於老闆生意經營的問題（例如：主要痛點是回訊還是結帳？）。
3. **價值轉場**：在回答最後一定要補一句價值主張，如：「老闆您看，我反應這麼快，如果我能在半夜幫您回客人訊息，您是不是能多接好幾單？」

### 你的方案架構 (Official Master Catalog)：
- **體驗店長版 (Free)**: $0 (適合功能測試)
- **個人店長版 (Pro)**: $499 / 月 (主打 24H 成交與 Dojo 錄音訓練)
- **公司強力店長版 (Enterprise)**: $1,199 / 月 (主打 PDF 深度讀盤、旗艦級 GPT-4o 邏輯)
- **激省年繳方案**: $4,990 / 年 (個人服務)、$11,990 / 年 (公司強力版)，皆可「立省 2 個月」。

### 🚨 視覺展示指令：
當用戶詢問「怎麼買」、「多少錢」、「方案有哪些」、「價格表」時，請在回覆文字的最後加上 [SHOW_PRICING] 標記。系統會自動彈出精美卡片。
`;

export async function GET() {
    return new Response('Master Bot Webhook is Active. Use POST for Line events.', { status: 200 });
}

export async function HEAD() {
    return new Response(null, { status: 200 });
}

export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-line-signature',
        },
    });
}

export async function POST(req: Request) {
    try {
        let body: any;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ status: 'ok' });
        }

        const events: WebhookEvent[] = body.events || [];
        if (events.length === 0) return NextResponse.json({ status: 'ok' });

        if (!lineConfig.channelAccessToken || !lineConfig.channelSecret) {
            console.error('Master Bot: Missing Line credentials');
            return NextResponse.json({ error: 'Config missing' }, { status: 500 });
        }

        const client = new Client(lineConfig);

        for (const event of events) {
            if (event.type === 'message' && event.message.type === 'text') {
                const userMessage = event.message.text.trim();
                const lineUserId = event.source.userId!;

                // 1. Instant Response for Test Keywords
                if (userMessage.toLowerCase() === 'ping' || userMessage === '測試' || userMessage === '哈囉' || userMessage === '你好') {
                    await client.replyMessage(event.replyToken, {
                        type: 'text',
                        text: '老闆您好！您的連線已成功掛載。🚀 我是您的 AI 數位轉型大師，專門幫您用最划算的價格（499/月起）建立 24 小時不休息的數位店長。\n\n請問您的店目前最讓您頭痛的是「半夜回不完訊息」還是「庫存核對太慢」？我也能幫您算毛利喔！'
                    });
                    continue;
                }

                // 2. Fetch Bot Count
                let botCount = 0;
                try {
                    const { count } = await supabase.from('bots').select('*', { count: 'exact', head: true });
                    botCount = count || 0;
                } catch (e) { console.error('DB fetch failed'); }

                const masterPrompt = (process.env.MASTER_SYSTEM_PROMPT || DEFAULT_MASTER_PROMPT)
                    .replace('{botCount}', botCount.toString());

                // 3. AI Completion with Timeout
                let aiResponse = '抱歉，系統運算稍微有點久，請再跟我說一次好嗎？';
                try {
                    const completionPromise = openai.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            { role: "system", content: SECURITY_DEFENSE_HEADER + "\n" + masterPrompt },
                            { role: "user", content: userMessage }
                        ] as any,
                    });

                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout')), 25000)
                    );

                    const completion: any = await Promise.race([completionPromise, timeoutPromise]);
                    aiResponse = completion.choices[0].message.content || 'AI 暫時休息中...';

                    // DATA PERSONA: Log Token Usage & Cost
                    const usage = completion.usage;
                    if (usage) {
                        const cost = calculateCost("gpt-4o-mini", usage.prompt_tokens, usage.completion_tokens);
                        await logTokenUsage(supabase, 'master', {
                            model: "gpt-4o-mini",
                            prompt_tokens: usage.prompt_tokens,
                            completion_tokens: usage.completion_tokens,
                            cost_estimate: cost
                        });
                    }
                } catch (e: any) {
                    console.error('AI Error:', e.message);
                }

                aiResponse = maskSensitiveOutput(aiResponse);

                // 4. Non-blocking Logging
                (async () => {
                    try {
                        await supabase.from('chat_logs').insert([
                            { user_id: lineUserId, role: 'user', content: userMessage },
                            { user_id: lineUserId, role: 'ai', content: aiResponse }
                        ]);
                    } catch (e) { console.error('Log failed'); }
                })();

                // 5. Reply with Conditional Flex Message
                try {
                    const messagesToSend: any[] = [];
                    const showPricing = aiResponse.includes('[SHOW_PRICING]');
                    const cleanResponse = aiResponse.replace('[SHOW_PRICING]', '').trim();

                    messagesToSend.push({
                        type: 'text',
                        text: `(v2.0-PricingFix) ${cleanResponse}` || '老闆好！請問有什麼我可以幫您的？'
                    });

                    if (showPricing) {
                        const { getPricingFlexMessage } = require('@/lib/templates/flex-pricing');
                        messagesToSend.push(getPricingFlexMessage());
                    }

                    await client.replyMessage(event.replyToken, messagesToSend as any);
                } catch (replyError: any) {
                    console.error('Line Reply Error:', JSON.stringify(replyError.originalError?.response?.data || replyError.message));
                }
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error: any) {
        console.error('Master Webhook Error:', error);
        return NextResponse.json({ status: 'error', message: error.message });
    }
}
