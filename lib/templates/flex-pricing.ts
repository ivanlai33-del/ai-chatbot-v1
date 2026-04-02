/**
 * LINE 智能店長 Pro - 官方方案 Flex Message 模板
 * 這裡定義了四格卡片的高級視覺結構 (Carousel)
 */

export const getPricingFlexMessage = () => {
    return {
        type: "flex",
        altText: "🎉 【LINE 智能店長 Pro】官方方案價格表",
        contents: {
            type: "carousel",
            contents: [
                // 1. 個人 Pro (月繳)
                createPricingCard({
                    title: "個人店長 Pro",
                    subtitle: "月繳方案 (啟動版)",
                    price: "499",
                    period: "/ 月",
                    color: "#4A90E2",
                    features: ["24H 自然對話接客", "智庫 (Dojo) 錄音訓練", "10 次併發處理"],
                    actionUrl: "https://bot.ycideas.com/checkout?plan=lite&cycle=monthly"
                }),
                // 2. 公司強力版 (月繳)
                createPricingCard({
                    title: "公司強力店長版",
                    subtitle: "月繳方案 (旗艦級)",
                    price: "1,199",
                    period: "/ 月",
                    color: "#7B61FF",
                    features: ["GPT-4o 旗艦大腦", "PDF / 文件深度學習", "無限次併發處理"],
                    actionUrl: "https://bot.ycideas.com/checkout?plan=premium&cycle=monthly"
                }),
                // 3. 個人 Pro (年繳) - 熱推
                createPricingCard({
                    title: "個人店長 Pro",
                    subtitle: "年繳方案 (激省 17%)",
                    price: "4,990",
                    period: "/ 年",
                    color: "#F5A623",
                    badge: "🔥 熱推款 (省 $998)",
                    features: ["24H 自然對話接客", "智庫 (Dojo) 錄音訓練", "現省 2 個月費用"],
                    actionUrl: "https://bot.ycideas.com/checkout?plan=lite&cycle=yearly"
                }),
                // 4. 公司強力版 (年繳) - 最優
                createPricingCard({
                    title: "公司強力店長版",
                    subtitle: "年繳方案 (最划算)",
                    price: "11,990",
                    period: "/ 年",
                    color: "#D0021B",
                    badge: "💎 最首選 (省 $2398)",
                    features: ["GPT-4o 旗艦大腦", "PDF / 文件深度學習", "全功能完整解放"],
                    actionUrl: "https://bot.ycideas.com/checkout?plan=premium&cycle=yearly"
                })
            ]
        }
    };
};

// 輔助函式：建立單張卡片結構
function createPricingCard(config: any) {
    const { title, subtitle, price, period, color, features, actionUrl, badge } = config;
    
    return {
        type: "bubble",
        size: "medium",
        header: {
            type: "box",
            layout: "vertical",
            contents: [
                ...(badge ? [{
                    type: "box",
                    layout: "vertical",
                    backgroundColor: "#ff0000",
                    cornerRadius: "md",
                    paddingStart: "8px",
                    paddingEnd: "8px",
                    paddingTop: "2px",
                    paddingBottom: "2px",
                    contents: [
                        {
                            type: "text",
                            text: badge,
                            color: "#ffffff",
                            size: "xs",
                            weight: "bold",
                            align: "center"
                        }
                    ]
                }] : []),
                {
                    type: "text",
                    text: title,
                    weight: "bold",
                    size: "xl",
                    color: color,
                    margin: "md"
                },
                {
                    type: "text",
                    text: subtitle,
                    size: "xs",
                    color: "#8c8c8c"
                }
            ],
            paddingBottom: "none"
        },
        body: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "box",
                    layout: "baseline",
                    contents: [
                        { type: "text", text: "$", size: "md", color: "#333333", weight: "bold", flex: 0 },
                        { type: "text", text: price, size: "3xl", color: "#333333", weight: "bold", flex: 0, margin: "sm" },
                        { type: "text", text: period, size: "md", color: "#8c8c8c", flex: 0, margin: "sm" }
                    ]
                },
                {
                    type: "box",
                    layout: "vertical",
                    margin: "xl",
                    spacing: "sm",
                    contents: features.map((f: string) => ({
                        type: "box",
                        layout: "baseline",
                        spacing: "sm",
                        contents: [
                            { type: "text", text: "✓", color: color, size: "sm", flex: 0 },
                            { type: "text", text: f, size: "sm", color: "#666666", flex: 1 }
                        ]
                    }))
                }
            ]
        },
        footer: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "button",
                    action: {
                        type: "uri",
                        label: "立即開通",
                        uri: actionUrl
                    },
                    style: "primary",
                    color: color
                }
            ]
        }
    };
}
