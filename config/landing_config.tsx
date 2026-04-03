import { Zap, Crown, Sprout, Link2, Network, Flame, Rocket } from 'lucide-react';
import React from 'react';
import { PRICING_PLANS, PLAN_IDS_ORDERED, PlanId } from '@/lib/config/pricing';

// ─── 將 pricing.ts 積木轉換為 PricingModal 需要的格式 ─────────────────
// 這是唯一需要維護的轉換層，所有數字從 pricing.ts 自動讀取

const PLAN_ICONS: Record<PlanId, React.ReactNode> = {
    free:          <Sprout className="w-6 h-6 text-slate-400" />,
    starter:       <Sprout className="w-6 h-6 text-emerald-400" />,
    solo:          <Zap className="w-6 h-6 text-emerald-500" />,
    growth:        <Link2 className="w-6 h-6 text-blue-400" />,
    chain:         <Network className="w-6 h-6 text-purple-400" />,
    flagship_lite: <Flame className="w-6 h-6 text-orange-400" />,
    flagship_pro:  <Rocket className="w-6 h-6 text-red-400" />,
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
            name: `${plan.emoji} ${plan.name}`,
            price,
            originalPrice,
            period,
            description: plan.tagline,
            annualTag,
            features: plan.features,
            icon: PLAN_ICONS[id],
            color: id === 'flagship_lite' || id === 'flagship_pro' ? 'amber' : 'emerald',
            popular: id === 'solo',           // 單店主力標為推薦
            badge: plan.badge,
            storeCount: plan.limits.stores,
            monthlyQuota: plan.limits.monthlyQuota,
            isStartingPrice: plan.pricing.isStartingPrice,
            ecpayLink: isYearly
                ? plan.payment.ecpayAnnualLink
                : plan.payment.ecpayMonthlyLink,
        };
    });
};

// 只取前 2 個方案給首頁 ChatWidget 用（保持簡潔）
export const getSimplePricingPlans = (billingCycle: 'monthly' | 'yearly') =>
    getPricingPlans(billingCycle).slice(0, 2);

export const landingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LINE 智能店長',
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
};
