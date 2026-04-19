import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import VisitorTracker from "@/components/VisitorTracker";
import CookieBanner from "@/components/CookieBanner";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
    width: 1024,
    initialScale: 1,
};

export const metadata: Metadata = {
    metadataBase: new URL('https://bot.ycideas.com'),
    alternates: {
        canonical: '/',
    },
    title: {
        default: "AI 智能店長 Pro | LINE 官方帳號 API 自動銷售與客服助手",
        template: "%s | LINE 智能店長 Pro"
    },
    description: "全台灣快速開通的 AI 智能店長。專為 LINE 官方帳號打造，整合 GPT-4o 技術，具備 24H 智慧客服與 RAG 智庫對話。讓您的 LINE OA 轉型為更高效的服務入口！",
    keywords: [
        'LINE AI 機器人', 'LINE 官方帳號自動化', 'AI 店長', 'LINE 客服機器人', 
        '智能銷售助手', 'LINE 數位轉型', '自動接單機器人', 'LINE CRM 系統',
        'GPT-4o LINE 應用', '官方帳號經營工具'
    ],
    authors: [{ name: "Ai 智能店長團隊" }],
    verification: {
        google: "lAhGP3I12r-WLoAUaKxHn5R2BherC51FqCKoZcMAgBA",
    },
    themeColor: "#020617",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "AI 智能店長 Pro",
    },
    openGraph: {
        type: "website",
        locale: "zh_TW",
        url: "https://bot.ycideas.com",
        siteName: "AI 智能店長 Pro",
        title: '【官方帳號老專屬】AI 智能店長 - 三分鐘極速開通，24H 自動成交',
        description: '三分鐘完成 AI 串接。24 小時幫您介紹商品、處理瑣碎客服、引導潛在客戶轉單。顯著提升回覆效率，降低人力負擔。',
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "AI 智能店長 - LINE 官方帳號最佳夥伴",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "AI 智能店長 Pro｜LINE AI Assistant: 24/7 Automated Sales & Support",
        description: "專為 LINE 官方帳號老闆打造。24 小時不打烊的 AI 銷售員，幫您接客、導購、成交。",
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
            <body className={inter.className}>
                {children}
                <VisitorTracker />
                <CookieBanner />
            </body>
        </html>
    );
}
