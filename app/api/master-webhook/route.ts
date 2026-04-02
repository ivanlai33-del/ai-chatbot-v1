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
// ---[ INLINED Pricing Carousel for Stability ]---
const getPricingFlexMessage = () => {
    const createCard = (c: any) => ({
        type: "bubble",
        size: "mega", // 修正：從 "medium" 改為官方支援的 "mega"
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
    return { 
        type: "flex", 
        altText: "🎉 【YC Ideas】AI 智能店長方案價格表", 
        contents: { type: "carousel", contents: [
            createCard({ title: "個人店長 Pro", subtitle: "月繳 (啟動版)", price: "499", period: "/ 月", color: "#4A90E2", features: ["24H 自然對話接客", "智庫 (Dojo) 錄音訓練"], url: "https://bot.ycideas.com/checkout?plan=lite&cycle=monthly" }),
            createCard({ title: "公司強力店長版", subtitle: "月繳 (旗艦級)", price: "1,199", period: "/ 月", color: "#7B61FF", features: ["GPT-4o 旗艦大腦", "PDF / 文件深度學習"], url: "https://bot.ycideas.com/checkout?plan=premium&cycle=monthly" }),
            createCard({ title: "個人店長 Pro", subtitle: "年繳 (激省 17%)", price: "4,990", period: "/ 年", color: "#F5A623", badge: "🔥 熱推款", features: ["24H 自然對話接客", "現省 2 個月費用"], url: "https://bot.ycideas.com/checkout?plan=lite&cycle=yearly" }),
            createCard({ title: "公司強力店長版", subtitle: "年繳 (最划算)", price: "11,990", period: "/ 年", color: "#D0021B", badge: "💎 最首選", features: ["GPT-4o 旗艦大腦", "全功能完整解放"], url: "https://bot.ycideas.com/checkout?plan=premium&cycle=yearly" })
        ]}
    };
};

const DEFAULT_MASTER_PROMPT = `
你是一位具備頂尖商業思維與技術底蘊的「LINE 智能店長 Pro」總店長（Master Concierge）。
你的使命是幫助老闆，用最划算的成本實現 AI 自動化，將每一則 LINE 訊息都轉化為成交機會。

### 📚 您的核心知識庫 (Single Source of Truth):

#### 1. 產品核心價值 (The Selling Points)
- **24/7 全天候接客**：不需要人手，AI 自動回答客人問題、推廣產品、處理預約。
- **品牌 DNA 設定**：老闆可以自由設定店長的個性（親切、專業、幽默等），讓 AI 講話就像老闆本人。
- **店長練功房 (Dojo)**：支援「語音錄音訓練」與「PDF 文件深度學習」，店長能背下整本操作手冊或產品目錄。
- **三分鐘閃電開通**：不需要懂程式，只要掃碼、按幾個按鈕就能讓 AI 住進官方帳號。

#### 2. 資安與穩定性 (Enterprise Grade)
- **Token Burning (代碼自毀)**：LINE 金鑰在驗證成功後立即加密存儲並自毀原始碼，駭客無法竊取。
- **Rate Limiting (防刷閘門)**：金融級流控，防止惡意洗版導致帳單暴增。
- **AI 防暴走護盾**：嚴格商業道德名單，不談政治、不亂罵人，穩重如金牌業務。

#### 3. 行業應用場景 (Case Studies)
- **美業/診所**：自動處理預約時間、回覆服務價目表、術後/療程衛教。
- **餐飲/零售**：尖峰時刻接單、推薦今日特餐、告知店址與營業時間。
- **專業顧問/電商**：24小時解答 FAQ、收集潛在客戶資料、引導官網成交。

#### 4. 串接教學 (Setup Guide - 三步驟)
1. **【加書籤】**：將官網提供的「AI店長設定專用書籤」拉到瀏覽器工具列。
2. **【開後台】**：登入 LINE Developers Console 進入您的專案。
3. **【點啟動】**：在 LINE 後台點擊剛才的書籤，一鍵完成所有自動化串接。

### 📦 官方方案（嚴禁捏造）：
1. **個人店長版 (Pro)**：月繳 $499 / 年繳 $4,990 (激省 2 個月)。主打錄音訓練。
2. **公司強力店長版 (Enterprise)**：月繳 $1,199 / 年繳 $11,990。主打 GPT-4o 旗艦腦與 PDF 讀盤。

### 🚫 禁止事項：
- 禁止提及 2490/2499/3000 等舊方案。
- 禁止拍馬屁。
- 嚴格禁止胡扯尚未開發的功能。

### 🚨 視覺展示指令：
當用戶詢問「怎麼買」、「方案」、「價格」時，務必在文末加上 [SHOW_PRICING]。
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
                const showPricing = /\[SHOW_PRICING\]/i.test(aiResponse); // 修正：改為不分大小寫正則偵測
                const cleanResponse = aiResponse.replace(/\[SHOW_PRICING\]/gi, '').trim();

                // 🛡️ Ensure text is NEVER empty (LINE won't send empty text)
                const finalMsgText = cleanResponse || (showPricing ? '老闆，為您介紹我們的專業店長方案：' : '老闆好！請問有什麼我可以幫您的？');
                messagesToSend.push({ type: 'text', text: finalMsgText });
                
                if (showPricing) { 
                    try {
                        const pricingCard = getPricingFlexMessage();
                        messagesToSend.push(pricingCard); 
                    } catch (cardErr) {
                        console.error('Flex Card Build Error:', cardErr);
                        messagesToSend.push({ type: 'text', text: '（方案卡片目前維護中，建議前往官網查看最新方案：https://bot.ycideas.com/pricing）' });
                    }
                }

                try {
                    await client.replyMessage(event.replyToken, messagesToSend as any);
                } catch (lineErr: any) {
                    console.error('LINE Reply API Error:', lineErr.data || lineErr);
                    // Fallback to simpler reply if first one fails
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
