import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL('https://bot.ycideas.com'),
    title: {
        default: "LINE 官方帳號 AI 店長｜比請工讀生便宜 10 倍！您的 LINE OA 24/7 自動回覆與轉型神器",
        template: "%s | LINE 官方帳號 AI 店長"
    },
    description: "專為 LINE 官方帳號 (OA) 老闆打造。免寫程式、免 API Key，三分鐘將 AI 注入您的 LINE 商店。24 小時幫您自動回覆、介紹產品、收集預約。首 500 位早鳥永久優惠中，數位轉型最省成本的選擇！",
    keywords: ["LINE 官方帳號", "LINE OA 經營", "LINE 客服機器人", "LINE 自動回覆", "AI 店長", "個人店長版", "LINE 官方帳號 API", "免 API Key", "數位轉型", "LINE 購物機器人"],
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
