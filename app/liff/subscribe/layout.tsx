import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '【官方】LINE 官方帳號 AI 立即開通 - 3 分鐘免 API 極速串接',
    description: '您的 LINE 官方帳號 (OA) 需要一位店長！免寫程式、免 API Key，一鍵注入 AI 靈魂。24 小時幫您介紹商品、處理瑣碎客服。比請小編便宜 10 倍，首 500 名早鳥享永久優惠！',
    keywords: [
        'LINE 官方帳號 管理', 
        'LINE OA 自動化', 
        'LINE 客服機器人 開通', 
        '免 API 串接 AI', 
        'LINE 店鋪經營 神器', 
        '個人店長版', 
        'LINE 分身店長'
    ],
    openGraph: {
        title: '【官方】為您的 LINE 官方帳號開通 AI 店長 - 立即提升 10 倍效率',
        description: '專為 OA 老闆設計。三分鐘完成 AI 串接，24 小時不打烊。比工讀生便宜，讓您的 LINE 帳號變成賺錢機器。',
        url: 'https://bot.ycideas.com/liff/subscribe',
        siteName: 'Ai 智能店長',
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
