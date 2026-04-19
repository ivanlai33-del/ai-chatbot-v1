import { Metadata } from 'next';
import SEOMetadata from '@/components/landing/SEOMetadata';
import LandingPageClient from '@/components/landing/LandingPageClient';
import { landingJsonLd } from '@/config/landing_config';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
    title: "AI 智能店長 Pro｜3 分鐘讓 LINE 官方帳號變成 24 小時銷售員",
    description: "不用寫程式、不用自己申請 API Key，今天開通今晚就上線。專為中小企業打造的 AI 客服機器人，支援自動回覆、商品導購、知識庫學習與自動接單。",
    keywords: [
        'LINE 官方帳號 AI 客服', 'LINE AI 聊天機器人', 'LINE 自動回覆', 'LINE 自動接單', 
        'AI 客服系統', '智能店長 Pro', 'LINE 數位轉型', '商家 AI 工具'
    ],
    openGraph: {
        title: "LINE 官方帳號 AI 客服機器人｜AI 智能店長 Pro",
        description: "3 分鐘開通，24 小時幫您自動回覆、介紹商品、引導下單。",
        images: ['/og-image.jpg'],
    }
};

export default function Home() {
    // Check for cookie on server side if possible
    const cookieStore = cookies();
    const isLoggedIn = !!cookieStore.get('line_user_id');

    return (
        <main className="relative min-h-screen w-full min-w-[1024px] bg-[#0F172A] font-sans overflow-x-auto">
            <SEOMetadata jsonLd={landingJsonLd} />
            <LandingPageClient isLoggedInInit={isLoggedIn} />
        </main>
    );
}
