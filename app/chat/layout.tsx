import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'LINE 智能店長 Pro | 專為 LINE 官方帳號設計的 24H 自動銷售助手',
    description: '專為 LINE 官方帳號設計的 24H 自動銷售助手。無需程式背景，一分鐘開通 AI 智能店長，讓您的 LINE OA 具備自動成交與客服能力。',
    keywords: [
        'LINE 智能店長 Pro', 
        'LINE 官方帳號自動化', 
        'AI 銷售助手', 
        'LINE 客服機器人', 
        'LINE OA 自動化銷售'
    ],
    openGraph: {
        title: 'LINE 智能店長 Pro | 專為 LINE 官方帳號設計的 24H 自動銷售助手',
        description: '您的 LINE 官方帳號還在手動回覆嗎？立即升級 AI 智能店長，享受 24H 業績不中斷！',
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
