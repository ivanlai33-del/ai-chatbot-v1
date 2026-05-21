import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "SaaS 合作夥伴與 API 批發方案｜為軟體開發商賦能 AI 大腦 | AI 智能店長 Pro",
    description: "專為 POS 系統商、CRM 平台與接案團隊打造的 LINE AI 機器人 API 批發方案。透過單一 Partner Token 程式化管理數百位商家席次，具備多租戶隔離與 Webhook 雙向同步，協助軟體開發商極速導入 AI 智能導購能力！",
    keywords: [
        'LINE AI 機器人代理', 'API 批發方案', 'POS 系統 AI 串接', 
        'CRM 系統整合 AI', 'LINE 官方帳號經銷', '軟體開發商 AI 解決方案',
        '多租戶 AI 機器人管理', '台灣 AI 系統代理商', 'B2B AI 經銷商'
    ],
    openGraph: {
        title: "SaaS 合作夥伴與 API 批發方案｜AI 智能店長 Pro",
        description: "專為 POS 系統商與 CRM 平台打造的 LINE AI API 批發方案。單一 Partner Token 程式化管理數百位商家席次，協助開發商極速導入 AI 導購能力！",
        url: "https://bot.ycideas.com/saas-partnership",
        images: ['/og-image.jpg'],
    }
};

const partnershipJsonLd = [
    {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'AI 智能店長 Pro - B2B 合作夥伴與 API 批發系統',
        description: '專為 POS 系統商、CRM 平台與接案團隊打造的 LINE AI 機器人 API 批發方案。透過單一 Partner Token 程式化管理旗下數百位商家的機器人席次。',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web, API',
        offers: [
            {
                '@type': 'Offer',
                name: 'Starter 批發方案',
                price: '3000',
                priceCurrency: 'TWD',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock'
            },
            {
                '@type': 'Offer',
                name: 'Pro 批發方案',
                price: '9000',
                priceCurrency: 'TWD',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock'
            },
            {
                '@type': 'Offer',
                name: 'Elite 批發方案',
                price: '25000',
                priceCurrency: 'TWD',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock'
            }
        ],
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '5.0',
            reviewCount: '45',
        },
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
                name: 'SaaS 合作夥伴計畫',
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
                name: '什麼是 AI 智能店長 SaaS 合作夥伴計畫？',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: '這是一個專為 POS 系統商、CRM 平台與接案團隊打造的 API 批發方案。只需一組 Partner Token，即可一鍵賦予您的系統自動化 AI 應答與智能導購能力。'
                }
            },
            {
                '@type': 'Question',
                name: '子帳號與加盟主的數據是否會混在一起？',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: '不會。系統具備 Tenant Isolation (多租戶隔離) 架構，子帳號與加盟主的對話數據、銷售報表完全隔離，符合系統商開發合規標準。'
                }
            },
            {
                '@type': 'Question',
                name: '是否支援 Webhook 雙向同步？',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: '是的。支援即時雙向資料同步，輕鬆將 AI 收集到的客戶意圖與訂單狀態，推送回您現有的系統中。'
                }
            }
        ]
    }
];

export default function SaasLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="saas-theme-root min-h-screen w-full relative">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(partnershipJsonLd),
                }}
            />
            {children}
        </div>
    );
}
