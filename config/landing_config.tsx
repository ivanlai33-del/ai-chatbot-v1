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
            '專為店長與企業打造的 LINE 官方帳號專用 AI 智能店長。提升 3 倍客服效率，支援商品導讀、智慧回訓、24H 自動成交，讓您的 LINE 帳號變成 24 小時不打烊的金牌銷售員。',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: {
            '@type': 'Offer',
            price: '199',
            priceCurrency: 'TWD',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: '1250',
        },
    },
    {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'AI 智能店長 Pro',
        url: 'https://bot.ycideas.com',
        logo: 'https://bot.ycideas.com/ Lai Logo.svg',
        sameAs: [
            'https://www.facebook.com/ycideas',
            'https://www.instagram.com/ycideas'
        ]
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
                    text: '不需要。AI 智能店長 Pro 為一站式 SaaS 服務，已內建高性能 AI 模型，老闆無需自行申請複雜的技術金鑰。'
                }
            },
            {
                '@type': 'Question',
                name: '可以教 AI 認識我的店內商品嗎？',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: '可以。您可以透過後台直接貼上官網網址或上傳 PDF 文件，AI 會自動學習並轉化為智庫內容，精準回答客戶關於商品的問題。'
                }
            }
        ]
    }
];
