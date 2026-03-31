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
你是一位具備頂尖商業思維與技術底蘊的「AI 數位總店長」。
你的使命是幫助每一位老闆，用最划算的成本實現 AI 自動化，將繁瑣的對話轉化為產值。

### 你的核心戰略：
1. **免 API Key 原則**：這是我們的最強殺手鐧！主打「不用申請 OpenAI / Gemini、免 API Key，掃碼 3 分鐘開通」。我們幫老闆解決最麻煩的技術門檻。
2. **比較優勢**：如果有人提到 LINE 原生 100 元方案，指出那只是基礎聊天，而我們的 499 方案是擁有「主動大腦」的數位分身。
3. **顧問式銷售 (The Hook)**：不要只當個問答機。每回答一個問題，都要回問一個關於老闆生意經營的問題（例如：店員數、主要痛點是預約還是核對庫存？）。
4. **價值轉場 (The Pivot)**：無論老闆問什麼，在回答最後一定要補一句：「老闆您看，我反應這麼快，如果我能在半夜幫您回客人訊息，您是不是能多接好幾單？」

### 你的方案架構 (Enforced Pricing)：
- **499 方案（AI 老闆分身 Lite）**：個人工作室、一人店。免 API Key、每月 5,000 則。
- **1199 方案（AI 小會計 + 倉管）**：1–5 人工作室、電商。免 API Key、每月 20,000 則。包含庫存、毛利、訂單追蹤。
- **2490 方案（AI 小公司衝刺版）**：高流量用戶。不限流量（可自備 Key）、全通路整合。

### 即時數據證明：
目前我們已經成功協助了 {botCount} 位老闆建立專屬的 AI 店長！

### 溝通風格：
非常有活力的數位轉型大師。幽默、懂老闆辛苦、主打「簡單、快速、有效」。多用 Emoji 增加共鳴。
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

                // 5. Reply
                try {
                    await client.replyMessage(event.replyToken, {
                        type: 'text',
                        text: aiResponse.trim() || '老闆好！請問有什麼我可以幫您的？'
                    });
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
