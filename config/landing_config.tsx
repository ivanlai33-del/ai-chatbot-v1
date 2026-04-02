import { Zap, Crown } from 'lucide-react';
import React from 'react';

export const getPricingPlans = (billingCycle: 'monthly' | 'yearly') => [
    {
        name: '個人店長版',
        price: billingCycle === 'monthly' ? '499' : '5500',
        originalPrice: billingCycle === 'monthly' ? '999' : '9990',
        period: billingCycle === 'monthly' ? '/月' : '/年',
        description: '限時前 500 名：原價 $999 優惠中',
        features: [
            '1 組 AI 店長正式上線服役',
            '每月 5,000 則智慧對話',
            '免 OpenAI API Key',
            '🤖 智慧文字客服',
            '🎯 產品/服務精準介紹',
            '🕒 24小時自動回訊',
            '🧬 品牌 DNA 個性設定'
        ],
        icon: <Zap className="w-6 h-6 text-emerald-500" />,
        color: 'emerald'
    },
    {
        name: '公司強力店長版',
        price: billingCycle === 'monthly' ? '1199' : '11000',
        originalPrice: billingCycle === 'monthly' ? '1999' : '19188',
        period: billingCycle === 'monthly' ? '/月' : '/年',
        description: '限時前 500 名：原價 $1999 優惠中',
        features: [
            '可串接 5 組官方帳號AI店長',
            '每月 35,000 則對話 (共享額度)',
            '各 AI 店長專屬獨立智庫',
            '📁 支援 PDF、DOC 文件學習',
            '📜 每組店長限額 5 份知識文件',
            'GPT-4o 旗艦級 AI 大腦'
        ],
        icon: <Crown className="w-6 h-6 text-amber-500" />,
        color: 'amber',
        popular: true
    }
];

export const landingJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Line 官方 Ai 智能店長",
    "description": "專為個人與公司打造的 LINE 官方帳號專屬店長。提升 3 倍客服效率，支援商品導購、自動查庫存、即時物流追蹤，讓您的 LINE 帳號變成 24 小時不打烊的金牌銷售員。",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
        "@type": "Offer",
        "price": "499",
        "priceCurrency": "TWD"
    },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "1250"
    }
};
