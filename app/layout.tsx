import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "AI 智慧客服助手",
    description: "24/7 自動銷售與開通服務",
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
