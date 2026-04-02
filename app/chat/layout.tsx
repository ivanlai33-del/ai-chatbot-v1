import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '🗨️ LINE 官方帳號 AI 顧問體驗：讓您的 OA 變身智能商店',
    description: '您的 LINE 官方帳號 (OA) 還在手動回覆嗎？在此體驗 AI 是如何 24/7 自動介紹產品並回答客情。三分鐘免 API 快速串接，讓您的 LINE 商店營運效率提升 10 倍。',
    keywords: [
        'LINE OA AI 測試', 
        'LINE 官方帳號 客服優化', 
        '免 API Key Line 機器人', 
        'LINE 商店 AI 化', 
        '個人店長版 經營',
        'LINE OA 自動化銷售'
    ],
    openGraph: {
        title: '🗨️ LINE 官方帳號專屬：您的 24 小時不打烊 AI 店長',
        description: '體驗 AI 的極速回覆價值。專為 OA 老闆設計，免 API 快速升級您的 LINE 官方帳號處理瑣事。',
        url: 'https://bot.ycideas.com/chat',
        images: ['/og-image.jpg'],
        siteName: 'Ai 智能店長',
        locale: 'zh_TW',
        type: 'website',
    },
};

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
