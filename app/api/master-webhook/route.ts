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

// ---[ INLINED Pricing Carousel — 全新 6 方案版本 ]---
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
        altText: "🎉 【YC Ideas】AI 智能店長 6 大方案價格表", 
        contents: { type: "carousel", contents: [
            createCard({ title: "入門嚐鮮", subtitle: "1店 / 月 500 則", price: "199", period: "/ 月", color: "#06C755", features: ["24H 自動回話", "品牌 DNA 設定"], url: "https://bot.ycideas.com" }),
            createCard({ title: "單店主力", subtitle: "1店 / 月 2000 則", price: "499", period: "/ 月", color: "#06C755", badge: "⭐ 最熱銷", badgeColor: "#06C755", features: ["潛在客戶自動標記", "預約意圖自動記錄"], url: "https://bot.ycideas.com" }),
            createCard({ title: "成長多店", subtitle: "3店 / 月 5000 則", price: "1,299", period: "/ 月", color: "#4A90E2", features: ["多店統一管理", "各店獨立智庫"], url: "https://bot.ycideas.com" }),
            createCard({ title: "連鎖專業", subtitle: "6店 / 月 10000 則", price: "2,490", period: "/ 月", color: "#7B61FF", features: ["月度分析報表", "優先客服支援"], url: "https://bot.ycideas.com" }),
            createCard({ title: "旗艦方案", subtitle: "爆量 / 含專案導入", price: "4,990", period: "起", color: "#F5A623", badge: "🔥 企業首選", badgeColor: "#F5A623", features: ["超量彈性計費", "最優先技術支援"], url: "https://bot.ycideas.com" })
        ]}
    };
};

const DEFAULT_MASTER_PROMPT = `
你是一位具備頂尖商業思維與技術底蘊的「AI 智能店長」總店長（Master Concierge）。
你的使命是幫助老闆，用最划算的成本實現 AI 自動化，將每一則 LINE 訊息都轉化為成交機會。

### 📚 您的產品總綱 (YC Ideas Master Catalog):

#### 1. 核心定價 (6 大方案):
- 一間店：🌱 入門版 $199 / 🏪 主力版 $499 (熱銷)
- 多間店：🔗 成長多店 $1,299 / 👑 連鎖專業 $2,490
- 高流量：🔥 旗艦版 $4,990 起 (含優先支援)
* 年繳優惠：一次訂一年直接「送 1 個月」(月費 × 11)，是最划算的選擇。

#### 2. 產品價值
- **24/7 自動接客**：店長永不下班，秒速回擊成交。
- **品牌 DNA 設定**：店長講話口氣就像老闆本人。
- **資安防護**：Token Burning (金鑰加密自毀)、防刷爆閘門。

#### 3. 串接教學 (三步驟)
1. **【加書籤】**：將官網設定專用書籤拉到工具列。
2. **【開後台】**：進入 LINE Developers Console。
3. **【點啟動】**：在後台點擊書籤，一鍵自動串接。

### 🚨 指令規則：
- 嚴禁提及 499 / 1199 等舊方案說明（除非 499 剛好是單店主力方案的價格）。
- 引導邏輯：先問老闆「目前有幾間分店？」與「估計月詢問量」，再推薦方案。
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
