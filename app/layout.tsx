import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL('https://bot.ycideas.com'),
    title: {
        default: "AI 智能店長 Pro｜3 分鐘讓 LINE 官方帳號具備 24 小時智慧客服能力",
        template: "%s | LINE 智能店長 Pro"
    },
    description: "想要 LINE 官方帳號自動回覆？LINE AI 助手為實體店與工作室提供智慧客服機器人，3 分鐘快速開通，協助自動處理詢問、介紹商品，助您減少大量重複客服工作並提升服務品質！",
    keywords: [
        "LINE官方帳號AI客服", "LINE AI機器人", "智能店長", "LINE自動回覆",
        "AI客服系統", "LINE機器人", "美容LINE客服", "餐飲LINE客服",
        "零售LINE機器人", "SaaS客服", "LINE官方帳號自動化", "AI智能店長"
    ],
    authors: [{ name: "AI 智能店長 Pro 團隊" }],
    openGraph: {
        type: "website",
        locale: "zh_TW",
        url: "https://bot.ycideas.com",
        title: "AI 智能店長 Pro｜3 分鐘讓 LINE 官方帳號具備 24 小時智慧客服能力",
        description: "想要 LINE 官方帳號自動回覆？LINE AI 助手為實體店與工作室提供智慧客服機器人，3 分鐘快速開通，協助自動處理詢問、介紹商品，助您減少大量重複客服工作並提升服務品質！",
        siteName: "AI 智能店長 Pro | LINE 智能店長 Pro",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "AI 智能店長 Pro - LINE 官方帳號 AI 客服",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "AI 智能店長 Pro｜LINE 官方帳號 24 小時 AI 客服",
        description: "3 分鐘開通 LINE 官方帳號 AI 客服，自動處理詢問、介紹商品，24 小時不中斷。",
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
    alternates: {
        canonical: 'https://bot.ycideas.com',
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
                <script src="https://www.paypal.com/sdk/js?client-id=Aa2CoGPu323kc3ROGqYyMqTBIpx2hfbAjN2G7M7HFQbzSESPM97x4uhCQJhQlExrkhcUoLcGjsv9BuUZ&vault=true&intent=subscription" data-sdk-integration-source="button-factory" async></script>
            </head>
            <body className={inter.className}>{children}</body>
        </html>
    );
}
