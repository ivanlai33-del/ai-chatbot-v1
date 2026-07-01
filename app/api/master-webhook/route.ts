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

// ---[ INLINED Pricing Carousel — 唯一自助體驗方案 ]---
const getPricingFlexMessage = () => {
    const createCard = (c: any) => ({
        type: "bubble",
        size: "mega",
        header: { type: "box", layout: "vertical", contents: [
            ...(c.badge ? [{ type: "box", layout: "vertical", backgroundColor: c.badgeColor || "#ff0000", cornerRadius: "md", paddingStart: "8px", paddingEnd: "8px", paddingTop: "2px", paddingBottom: "2px", contents: [{ type: "text", text: c.badge, color: "#ffffff", size: "xs", weight: "bold", align: "center" }] }] : []),
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
        footer: { type: "box", layout: "vertical", contents: [{ type: "button", action: { type: "uri", label: "官網查看詳情", uri: c.url }, style: "primary", color: c.color }] }
    });
    return { 
        type: "flex", 
        altText: "🎉 【YC Ideas】AI 智能店長 方案價格表", 
        contents: { type: "carousel", contents: [
            createCard({ 
                title: "入門嚐鮮 (自助封測版)", 
                subtitle: "1店 / 最多 500 則 (公測送單店主力全功能)", 
                price: "199", 
                period: "/ 月", 
                color: "#06C755", 
                badge: "🔥 公測特惠 4 折",
                badgeColor: "#06C755",
                features: ["24H AI 自動接單", "FAQ 常見問題自動秒回", "⚠️ 無人客服 / 自助設定"], 
                url: "https://bot.ycideas.com/dashboard/billing" 
            })
        ]}
    };
};

const DEFAULT_MASTER_PROMPT = `
你是一位具備頂尖商業思維與技術底蘊的「AI 智能店長」總店長（Master Concierge）。
你的使命是幫助老闆，以極低的百元門檻實現 AI 自動化，幫老闆買回珍貴的下班睡眠時間。

### 📚 您的產品方案 (YC Ideas Catalog):
目前產品處於公測極簡改版階段，我們僅提供一個方案：
- 🌱 **入門嚐鮮 (自助封測版)**：
  - 價格：NT$ 199 / 月 (原價 NT$ 499/月，公測特惠 4 折)
  - 規格：最多 1 店，對外宣傳 500 則訊息/月 (後台彩蛋免費加贈至 2000 則)。
  - 功能：24H 自動秒回 FAQ 常見問題。
  - 客服：為壓低成本，本方案【100% 自助操作，不提供人工客服與技術指導】。
  - 年繳優惠：NT$ 2,189 / 年 (月費 × 11，直接送 1 個月)。

### 🚨 指令規則：
- 嚴禁提及任何 1,299 / 2,490 等其他收費方案。
- 明確告知用戶本系統目前僅限自助使用。
- 視覺展示：當用戶問到「價格」、「怎麼買」、「方案」時，務必在文末加上 [SHOW_PRICING] 標記。
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
                const showPricing = /\[SHOW_PRICING\]/i.test(aiResponse);
                const cleanResponse = aiResponse.replace(/\[SHOW_PRICING\]/gi, '').trim();

                const finalMsgText = cleanResponse || (showPricing ? '老闆，為您介紹我們的專業店長方案：' : '老闆好！請問有什麼我可以幫您的？');
                messagesToSend.push({ type: 'text', text: finalMsgText });
                
                if (showPricing) { 
                    try {
                        const pricingCard = getPricingFlexMessage();
                        messagesToSend.push(pricingCard); 
                    } catch (cardErr) {
                        console.error('Flex Card Build Error:', cardErr);
                        messagesToSend.push({ type: 'text', text: '（方案卡片目前維護中，建議前往官網查看最新方案：https://bot.ycideas.com）' });
                    }
                }

                try {
                    await client.replyMessage(event.replyToken, messagesToSend as any);
                } catch (lineErr: any) {
                    console.error('LINE Reply API Error:', lineErr.data || lineErr);
                    if (messagesToSend.length > 1) {
                        try {
                            await client.replyMessage(event.replyToken, [{ type: 'text', text: finalMsgText + "\n\n(方案圖文訊息暫時無法顯示，請稍後再試)" }] as any);
                        } catch (e) {}
                    }
                }
            }
        }
        return NextResponse.json({ status: 'ok' });
    } catch (error: any) {
        console.error('Master Webhook Global Error:', error);
        return NextResponse.json({ status: 'ok' });
    }
}
