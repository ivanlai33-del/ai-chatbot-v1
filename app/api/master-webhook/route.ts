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

// ---[ INLINED Pricing Carousel for Stability ]---
const getPricingFlexMessage = () => {
    const createCard = (c: any) => ({
        type: "bubble", size: "medium",
        header: { type: "box", layout: "vertical", contents: [
            ...(c.badge ? [{ type: "box", layout: "vertical", backgroundColor: "#ff0000", cornerRadius: "md", paddingStart: "8px", paddingEnd: "8px", paddingTop: "2px", paddingBottom: "2px", contents: [{ type: "text", text: c.badge, color: "#ffffff", size: "xs", weight: "bold", align: "center" }] }] : []),
            { type: "text", text: c.title, weight: "bold", size: "xl", color: c.color, margin: "md" },
            { type: "text", text: c.subtitle, size: "xs", color: "#8c8c8c" }
        ], paddingBottom: "none" },
        body: { type: "box", layout: "vertical", contents: [
            { type: "box", layout: "baseline", contents: [
                { type: "text", text: "$", size: "md", color: "#333333", weight: "bold", flex: 0 },
                { type: "text", text: c.price, size: "3xl", color: "#333333", weight: "bold", flex: 0, margin: "sm" },
                { type: "text", text: c.period, size: "md", color: "#8c8c8c", flex: 0, margin: "sm" }
            ]},
            { type: "box", layout: "vertical", margin: "xl", spacing: "sm", contents: c.features.map((f: string) => ({ type: "box", layout: "baseline", spacing: "sm", contents: [{ type: "text", text: "✓", color: c.color, size: "sm", flex: 0 }, { type: "text", text: f, size: "sm", color: "#666666", flex: 1 }] })) }
        ]},
        footer: { type: "box", layout: "vertical", contents: [{ type: "button", action: { type: "uri", label: "立即開通", uri: c.url }, style: "primary", color: c.color }] }
    });
    return { type: "flex", altText: "🎉 【LINE 智能店長 Pro】官方方案價格表", contents: { type: "carousel", contents: [
        createCard({ title: "個人店長 Pro", subtitle: "月繳 (啟動版)", price: "499", period: "/ 月", color: "#4A90E2", features: ["24H 自然對話接客", "智庫 (Dojo) 錄音訓練"], url: "https://bot.ycideas.com/checkout?plan=lite&cycle=monthly" }),
        createCard({ title: "公司強力店長版", subtitle: "月繳 (旗艦級)", price: "1,199", period: "/ 月", color: "#7B61FF", features: ["GPT-4o 旗艦大腦", "PDF / 文件深度學習"], url: "https://bot.ycideas.com/checkout?plan=premium&cycle=monthly" }),
        createCard({ title: "個人店長 Pro", subtitle: "年繳 (激省 17%)", price: "4,990", period: "/ 年", color: "#F5A623", badge: "🔥 熱推款", features: ["24H 自然對話接客", "現省 2 個月費用"], url: "https://bot.ycideas.com/checkout?plan=lite&cycle=yearly" }),
        createCard({ title: "公司強力店長版", subtitle: "年繳 (最划算)", price: "11,990", period: "/ 年", color: "#D0021B", badge: "💎 最首選", features: ["GPT-4o 旗艦大腦", "全功能完整解放"], url: "https://bot.ycideas.com/checkout?plan=premium&cycle=yearly" })
    ]}};
};

const DEFAULT_MASTER_PROMPT = `
你是一位具備頂尖商業思維與技術底蘊的「LINE 智能店長 Pro」總店長。
你的使命是幫助老闆，用最划算的成本實現 AI 自動化。

### 你的方案架構：
- **個人店長版 (Pro)**: $499 / 月 (或 $4,990 / 年)
- **公司強力店長版 (Enterprise)**: $1,199 / 月 (或 $11,990 / 年)

### 🚨 視覺展示指令：
當用戶詢問「怎麼買」、「多少錢」、「方案」、「價格」時，回覆文字最後必須加上 [SHOW_PRICING] 標記。
`;

export async function POST(req: Request) {
    try {
        let body: any;
        try { body = await req.json(); } catch (e) { return NextResponse.json({ status: 'ok' }); }
        const events: WebhookEvent[] = body.events || [];
        if (events.length === 0) return NextResponse.json({ status: 'ok' });
        const client = new Client(lineConfig);

        for (const event of events) {
            if (event.type === 'message' && event.message.type === 'text') {
                const userMessage = event.message.text.trim();
                const lineUserId = event.source.userId!;

                const { count } = await supabase.from('bots').select('*', { count: 'exact', head: true });
                const botCount = count || 0;
                const masterPrompt = (process.env.MASTER_SYSTEM_PROMPT || DEFAULT_MASTER_PROMPT).replace('{botCount}', botCount.toString());

                const completion: any = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: SECURITY_DEFENSE_HEADER + "\n" + masterPrompt },
                        { role: "user", content: userMessage }
                    ]
                });
                let aiResponse = completion.choices[0].message.content || '';
                aiResponse = maskSensitiveOutput(aiResponse);

                const messagesToSend: any[] = [];
                const showPricing = aiResponse.includes('[SHOW_PRICING]');
                const cleanResponse = aiResponse.replace('[SHOW_PRICING]', '').trim();

                messagesToSend.push({ type: 'text', text: cleanResponse || '老闆好！請問有什麼我可以幫您的？' });
                if (showPricing) { messagesToSend.push(getPricingFlexMessage()); }

                await client.replyMessage(event.replyToken, messagesToSend as any);
            }
        }
        return NextResponse.json({ status: 'ok' });
    } catch (error: any) {
        console.error('Master Webhook Error:', error);
        return NextResponse.json({ status: 'error' });
    }
}
