import { Zap, Crown, Sprout, Link2, Network, Flame, Rocket } from 'lucide-react';
import React from 'react';
import { PRICING_PLANS, PLAN_IDS_ORDERED, PlanId } from '@/lib/config/pricing';

// ─── 將 pricing.ts 積木轉換為 PricingModal 需要的格式 ─────────────────
// 這是唯一需要維護的轉換層，所有數字從 pricing.ts 自動讀取

const PLAN_ICONS: Record<PlanId, React.ReactNode> = {
    free:          <span className="text-2xl">🎁</span>,
    starter:       <span className="text-2xl">🌱</span>,
    solo:          <span className="text-2xl">🏪</span>,
    growth:        <span className="text-2xl">🔗</span>,
    chain:         <span className="text-2xl">👑</span>,
    flagship_lite: <span className="text-2xl">🔥</span>,
    flagship_pro:  <span className="text-2xl">🚀</span>,
};

export const getPricingPlans = (billingCycle: 'monthly' | 'yearly') => {
    // 排除免費方案（不顯示在定價頁）
    const paidPlanIds: PlanId[] = ['starter', 'solo', 'growth', 'chain', 'flagship_lite', 'flagship_pro'];

    return paidPlanIds.map((id) => {
        const plan = PRICING_PLANS[id];
        const isYearly = billingCycle === 'yearly';

        const price = isYearly
            ? String(plan.pricing.annual)
            : String(plan.pricing.monthly);

        const originalPrice = isYearly
            ? String(plan.pricing.originalMonthly * 11) // 原價年付估算
            : String(plan.pricing.originalMonthly);

        const period = isYearly ? '/年' : '/月';

        // 年付標籤
        const annualTag = isYearly
            ? `（年付送 1 個月，省 NT$${plan.pricing.annualSaving.toLocaleString()}）`
            : '';

        return {
            id,
            name: plan.name,
            price,
            originalPrice,
            period,
            description: plan.tagline,
            annualTag,
            features: plan.features,
            icon: PLAN_ICONS[id],
            color: plan.color,
            popular: id === 'solo',           // 單店主力標為推薦
            badge: plan.badge,
            storeCount: plan.limits.stores,
            monthlyQuota: plan.limits.monthlyQuota,
            isStartingPrice: plan.pricing.isStartingPrice,
            newebpayLink: isYearly
                ? plan.payment.newebpayAnnualLink
                : plan.payment.newebpayMonthlyLink,
        };
    });
};

// 只取前 2 個方案給首頁 ChatWidget 用（保持簡潔）
export const getSimplePricingPlans = (billingCycle: 'monthly' | 'yearly') =>
    getPricingPlans(billingCycle).slice(0, 2);

export const landingJsonLd = [
    {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'AI 智能店長 Pro',
        description:
            '想要 LINE 官方帳號自動回覆？LINE AI 助手為實體店與工作室提供智慧客服機器人，3 分鐘快速開通，協助處理詢問、介紹商品，助您降低客服工作負擔並提升服務效率！',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: {
            '@type': 'Offer',
            price: '199',
            priceCurrency: 'TWD',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '5.0',
            reviewCount: '100',
        },
    },
    {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'AI 智能店長 Pro',
        alternateName: 'AI 店長 Pro',
        url: 'https://bot.ycideas.com',
        logo: 'https://bot.ycideas.com/Lai%20Logo.svg',
        image: 'https://bot.ycideas.com/og-image.jpg',
        sameAs: [
            'https://www.facebook.com/ycideas',
            'https://www.instagram.com/ycideas'
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            'contactType': 'customer support',
            'url': 'https://line.me/R/ti/p/@788hryuq'
        }
    },
    {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: '首頁',
                item: 'https://bot.ycideas.com'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Saas 夥伴計畫',
                item: 'https://bot.ycideas.com/saas-partnership'
            }
        ]
    },
    {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'AI 智能店長需要自己申請 OpenAI API Key 嗎？',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: '不需要。AI 智能店長 Pro 採用 SaaS 模式，店家不必自行處理複雜的 API 串接或模型設定，就能快速開通 LINE 官方帳號 AI 客服。'
                }
            },
            {
                '@type': 'Question',
                name: '可以教 AI 認識我的商品與服務內容嗎？',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: '可以。您可以整理官網、商品介紹、價目表、常見問題、PDF 文件或店內說明，系統會把這些資訊轉成 AI 可使用的知識內容，讓回覆更貼近您的品牌與商品。'
                }
            },
            {
                '@type': 'Question',
                name: 'LINE AI 客服可以回覆哪些問題？',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: '常見像是價格、規格、商品差異、營業時間、地址、預約方式、運費、付款方式、活動內容與初步購買引導，都很適合交給 AI 先處理。'
                }
            },
            {
                '@type': 'Question',
                name: '如果 AI 不會回答，可以轉給真人嗎？',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: '可以。實務上最好的做法不是讓 AI 取代所有客服，而是由 AI 處理高重複問題，再把需要成交、客訴、特殊案例或人工判斷的對話交給真人。'
                }
            },
            {
                '@type': 'Question',
                name: '適合哪些產業導入？',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: '特別適合美容、零售、餐飲、預約型服務、課程顧問與其他高度依賴 LINE 官方帳號接客的中小企業。'
                }
            },
            {
                '@type': 'Question',
                name: '導入 LINE 官方帳號 AI 客服要多久？',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: '若資料齊全，導入速度通常會比傳統客製開發快很多，因為 SaaS 型工具能先從標準化功能快速上線，再逐步優化知識內容與對話流程。'
                }
            },
            {
                '@type': 'Question',
                name: 'AI 智能店長和 LINE 內建 AI 聊天機器人有什麼不同？',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'LINE 官方帳號近年已推出內建 AI 聊天機器人功能。若店家需要更完整的品牌語氣調整、知識庫管理、導購流程與方案彈性，通常會考慮 AI 智能店長 Pro。'
                }
            },
            {
                '@type': 'Question',
                name: '中小企業適合先怎麼開始？',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: '最好的做法是先鎖定最常見、最重複、最耗時的客服問題，先從小規模試辦開始，驗證能否減少訊息處理時間、提高回覆率，再逐步擴充。'
                }
            }
        ]
    }
];
