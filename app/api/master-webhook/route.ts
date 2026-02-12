import { NextResponse } from 'next/server';
import { Client, WebhookEvent } from '@line/bot-sdk';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';
import { SECURITY_DEFENSE_HEADER, maskSensitiveOutput } from '@/lib/security';

export const dynamic = 'force-dynamic';

const lineConfig = {
    channelAccessToken: process.env.MASTER_LINE_TOKEN || '',
    channelSecret: process.env.MASTER_LINE_SECRET || '',
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
    console.log('Master Webhook POST received');
    try {
        let body: any;
        try {
            body = await req.json();
        } catch (e) {
            console.log('Master Webhook: Non-JSON or empty body');
            return NextResponse.json({ status: 'ok' });
        }

        const events: WebhookEvent[] = body.events || [];
        if (events.length === 0) return NextResponse.json({ status: 'ok' });

        if (!lineConfig.channelAccessToken || !lineConfig.channelSecret) {
            console.error('Master Bot: Missing Line credentials in Environment Variables');
            return NextResponse.json({ error: 'Config missing' }, { status: 500 });
        }

        const client = new Client(lineConfig);

        for (const event of events) {
            if (event.type === 'message' && event.message.type === 'text') {
                const userMessage = event.message.text;
                const lineUserId = event.source.userId!;

                const { count: botCount } = await supabase.from('bots').select('*', { count: 'exact', head: true });                // 2. Build Dynamic System Prompt
                const masterPrompt = (process.env.MASTER_SYSTEM_PROMPT || DEFAULT_MASTER_PROMPT)
                    .replace('{botCount}', (botCount || 0).toString());

                console.log('Sending message to OpenAI for Master Bot');

                const messages = [
                    { role: "system", content: SECURITY_DEFENSE_HEADER + "\n" + masterPrompt },
                    { role: "user", content: userMessage }
                ];

                // 3. Call OpenAI
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: messages as any,
                });

                let aiResponse = completion.choices[0].message.content || '抱歉，系統正在忙碌中。';
                aiResponse = maskSensitiveOutput(aiResponse);

                // 4. Reply
                await client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: aiResponse,
                });
                console.log('Master Bot replied successfully');
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error: any) {
        console.error('Master Webhook Error:', error);
        // Important: Still return 200 for Line if possible, but log the error
        return NextResponse.json({ status: 'error', message: error.message });
    }
}
