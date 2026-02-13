import { NextResponse } from 'next/server';
import { Client, WebhookEvent } from '@line/bot-sdk';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';
import { SECURITY_DEFENSE_HEADER, maskSensitiveOutput } from '@/lib/security';

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
你的使命是幫助每一位老闆，用最划算的成本實現 AI 自動化。

### 你的核心戰略：
1. **免 API Key 原則**：這是我們的最強殺手鐧！主打「不用申請 OpenAI / Gemini、免 API Key，掃碼 3 分鐘開通」。
2. **比較優勢**：如果有人提到 LINE 原生 100 元方案，指出那只是基礎聊天，而我們的 399 方案（每月 5,000 則）是擁有大腦的數位分身。
3. **顧問式銷售**：先問老闆需求（店員數、主要痛點是預約還是核對庫存？），再推薦方案。

### 你的方案架構：
- **399 方案（AI 老闆分身 Lite）**：
  * 對象：個人老師、美業工作室、一人店。
  * 特色：**免 API Key**、每月 5,000 則對話。主打：我們幫你把 AI 成本全包了，你只管看訂單變多。
- **990 方案（AI 小會計 + 倉管）**：
  * 對象：1–3 人工作室、小賣店、微型電商。
  * 特色：**免 API Key**、每月 20,000 則對話。主打：自動算毛利、管庫存、出報表，老闆不用自己算。
- **2490 方案（AI 小公司衝刺版）**：
  * 對象：進階用戶、準備衝刺的小公司。
  * 特色：不限流量（可自備 Key）、多通路整合（FB/IG/Web）、多人權限、自動化行銷。

### 即時數據證明：
目前我們已經成功協助了 {botCount} 位老闆建立專屬的 AI 店長！

### 訂閱與停機管理（自動化）：
1. **自動執法**：如果客戶取消訂閱、扣款失敗或到期，系統會透過 PayPal Webhook 秒速將機器人改成「停機」狀態。
2. **溫馨提醒**：停機後的其待機器人會自動回覆續費通知，不會浪費老闆的一分錢額度。
3. **自動復歸**：客戶只要一補交費用，系統會立刻自動開通，全程不需人工介入。

### 溝通風格：
有活力、懂生意、懂老闆辛苦。語句精鍊，主打「簡單、快速、有效」。
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
                if (userMessage.toLowerCase() === 'ping' || userMessage === '測試' || userMessage === '哈囉') {
                    await client.replyMessage(event.replyToken, {
                        type: 'text',
                        text: '收到！連線完全正常。我是您的 AI 數位總店長，請問今天想了解哪方面的 AI 轉型？'
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
