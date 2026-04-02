import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL('https://bot.ycideas.com'),
    title: {
        default: "LINE 智能店長 Pro | 專為【官方帳號】設計的 24H 自動銷售助手",
        template: "%s | LINE 智能店長 Pro"
    },
    description: "全台灣唯一無需程式背景，一分鐘開通 AI 智能店長。專為 LINE 官方帳號打造，具備 24H 自動化銷售、客服與智庫學習能力。讓您的 LINE OA 具備自動成交能力！",
    keywords: ['LINE AI 機器人', 'LINE 官方帳號自動化', 'AI 店長', 'LINE 客服機器人', '智能銷售助手'],
    authors: [{ name: "Ai 智能店長團隊" }],
    openGraph: {
        type: "website",
        locale: "zh_TW",
        url: "https://bot.ycideas.com",
        title: '【老闆專屬】立即開通 LINE 官方帳號 AI 店長 - 三分鐘極速串接',
        description: '不必懂技術，免 API Key！為您的 LINE 官方帳號 (OA) 注入 AI 靈魂。24 小時幫您介紹商品、處理瑣碎客服。首 500 名早鳥享永久優惠，比請小編便宜 10 倍！',
        siteName: "Ai 智能店長",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "LINE 官方帳號 AI 店長",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "LINE 官方帳號 AI 店長｜LINE AI Assistant: 24/7 Automated Sales & Support",
        description: "專為 LINE 官方帳號 (OA) 老闆打造。24 小時不打烊幫您顧 Line、接客、賣東西。",
        images: ["/og-image.jpg"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh-TW">
            <head>
            </head>
            <body className={inter.className}>{children}</body>
        </html>
    );
}
