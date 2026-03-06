import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL('https://bot.ycideas.com'),
    title: {
        default: "Line 官方 Ai 智能店長｜24H 自動化銷售與客服助手",
        template: "%s | Ai 智能店長"
    },
    description: "專為個人與公司打造的 LINE 官方帳號專屬店長。提升 3 倍客服效率，支援商品導購、自動查庫存、即時物流追蹤，讓您的 LINE 帳號變成 24 小時不打烊的金牌銷售員。",
    keywords: ["LINE 官方帳號", "AI 客服", "智能店長", "自動化銷售", "LINE 機器人", "SaaS", "客服系統", "網購客服"],
    authors: [{ name: "Ai 智能店長團隊" }],
    openGraph: {
        type: "website",
        locale: "zh_TW",
        url: "https://bot.ycideas.com",
        title: "Line 官方 Ai 智能店長｜24H 自動化銷售與客服助手",
        description: "提升 3 倍客服效率！專為個人與公司打造的 LINE 官方專屬店長，支援商品導購、自動查庫存、即時物流追蹤。",
        siteName: "Ai 智能店長",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Line 官方 Ai 智能店長",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Line 官方 Ai 智能店長｜24H 自動化銷售與客服助手",
        description: "專為個人與公司打造的 LINE 官方帳號專屬店長。24 小時不打烊的金牌銷售員。",
        images: ["/og-image.png"],
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
                <script src="https://www.paypal.com/sdk/js?client-id=Aa2CoGPu323kc3ROGqYyMqTBIpx2hfbAjN2G7M7HFQbzSESPM97x4uhCQJhQlExrkhcUoLcGjsv9BuUZ&vault=true&intent=subscription" data-sdk-integration-source="button-factory" async></script>
            </head>
            <body className={inter.className}>{children}</body>
        </html>
    );
}
