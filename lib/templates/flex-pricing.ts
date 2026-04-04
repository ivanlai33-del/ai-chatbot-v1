import { PRICING_PLANS, PLAN_IDS_ORDERED } from '../config/pricing';

/**
 * LINE 智能店長 Pro - 官方方案 Flex Message 模板
 * 展示目前所有的 6 階付費方案
 */

export const getPricingFlexMessage = () => {
    const paidPlans = PLAN_IDS_ORDERED
        .filter(id => id !== 'free')
        .map(id => PRICING_PLANS[id]);

    return {
        type: "flex",
        altText: "🎉 【LINE 智能店長 Pro】全系列官方方案價格表",
        contents: {
            type: "carousel",
            contents: paidPlans.map(plan => {
                // Determine color based on tier
                let color = "#06C755"; // Default
                if (plan.tier === 1) color = "#06C755"; // Starter
                if (plan.tier === 2) color = "#059669"; // Solo
                if (plan.tier === 3) color = "#4F46E5"; // Growth
                if (plan.tier === 4) color = "#7C3AED"; // Chain
                if (plan.tier === 5) color = "#D97706"; // Flagship Lite
                if (plan.tier === 6) color = "#B45309"; // Flagship Pro

                return createPricingCard({
                    title: plan.name,
                    subtitle: plan.tagline,
                    price: plan.pricing.monthly.toLocaleString(),
                    period: "/ 月",
                    color: color,
                    badge: plan.badge,
                    features: plan.features.slice(0, 3), // Show first 3 features to keep card compact
                    actionUrl: `https://bot.ycideas.com/dashboard/billing?plan=${plan.id}`
                });
            })
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
                    backgroundColor: color,
                    cornerRadius: "sm",
                    paddingStart: "8px",
                    paddingEnd: "8px",
                    paddingTop: "2px",
                    paddingBottom: "2px",
                    width: "fit-content",
                    contents: [
                        {
                            type: "text",
                            text: badge,
                            color: "#ffffff",
                            size: "xxs",
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
                    color: "#8c8c8c",
                    wrap: true
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
                        { type: "text", text: "NT$", size: "sm", color: "#333333", weight: "bold", flex: 0 },
                        { type: "text", text: price, size: "3xl", color: "#333333", weight: "bold", flex: 0, margin: "sm" },
                        { type: "text", text: period, size: "sm", color: "#8c8c8c", flex: 0, margin: "sm" }
                    ]
                },
                {
                    type: "box",
                    layout: "vertical",
                    margin: "lg",
                    spacing: "sm",
                    contents: features.map((f: string) => ({
                        type: "box",
                        layout: "baseline",
                        spacing: "sm",
                        contents: [
                            { type: "text", text: "✓", color: color, size: "sm", flex: 0 },
                            { type: "text", text: f, size: "sm", color: "#666666", flex: 1, wrap: true }
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
                        label: "立即開通 / 升級",
                        uri: actionUrl
                    },
                    style: "primary",
                    color: color,
                    height: "sm"
                }
            ]
        }
    };
}
