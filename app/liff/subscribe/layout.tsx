import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    title: 'LINE 智能店長 Pro | 讓您的【LINE 官方帳號】具備 24H 自動成交能力',
    description: '全台灣唯一無需程式背景，一分鐘開通 AI 智能店長。專為 LINE 官方帳號打造，具備 24H 自動化銷售、客服與智庫學習能力。讓您的 LINE OA 具備自動成交能力！',
    keywords: [
        'LINE AI 機器人', 
        'LINE 官方帳號自動化', 
        'AI 店長', 
        'LINE 客服機器人', 
        '智能銷售助手'
    ],
    openGraph: {
        title: 'LINE 智能店長 Pro | 讓您的【官方帳號】具備 24H 自動成交能力',
        description: '您的 LINE 官方帳號還在手動回覆嗎？立即升級 AI 智能店長，享受 24H 業績不中斷！',
        url: 'https://bot.ycideas.com/liff/subscribe',
        siteName: 'LINE 智能店長 Pro',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
            }
        ],
        locale: 'zh_TW',
        type: 'website',
    },
};

export default function LiffSubscribeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
