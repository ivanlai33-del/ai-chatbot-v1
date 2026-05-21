"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    MessageSquare, LogIn, ArrowRight, ChevronLeft, ChevronRight,
    Brain, Zap, MessageCircle, BarChart3, Globe, ShieldCheck,
    Star, CheckCircle, Phone, Clock, Users, TrendingUp,
    ChevronDown, ExternalLink
} from 'lucide-react';

// JSON-LD Structured Data
const structuredData = [
    {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "AI 智能店長 Pro",
        "description": "想要 LINE 官方帳號自動回覆？LINE AI 助手為實體店與工作室提供智慧客服機器人，3 分鐘快速開通，協助處理詢問、介紹商品，助您降低客服工作負擔並提升服務效率！",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": { "@type": "Offer", "price": "199", "priceCurrency": "TWD" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5.0", "reviewCount": "100" }
    },
    {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "AI 智能店長 Pro",
        "alternateName": "AI 店長 Pro",
        "url": "https://bot.ycideas.com",
        "logo": "https://bot.ycideas.com/lai_logo.svg",
        "image": "https://bot.ycideas.com/og-image.jpg",
        "sameAs": ["https://www.facebook.com/ycideas", "https://www.instagram.com/ycideas"],
        "contactPoint": { "@type": "ContactPoint", "contactType": "customer support", "url": "https://line.me/R/ti/p/@788hryuq" }
    },
    {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://bot.ycideas.com" },
            { "@type": "ListItem", "position": 2, "name": "Saas 夥伴計畫", "item": "https://bot.ycideas.com/saas-partnership" }
        ]
    },
    {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            { "@type": "Question", "name": "AI 智能店長需要自己申請 OpenAI API Key 嗎？", "acceptedAnswer": { "@type": "Answer", "text": "不需要。AI 智能店長 Pro 採用 SaaS 模式，店家不必自行處理複雜的 API 串接或模型設定，就能快速開通 LINE 官方帳號 AI 客服。" } },
            { "@type": "Question", "name": "可以教 AI 認識我的商品與服務內容嗎？", "acceptedAnswer": { "@type": "Answer", "text": "可以。您可以整理官網、商品介紹、價目表、常見問題、PDF 文件或店內說明，系統會把這些資訊轉成 AI 可使用的知識內容，讓回覆更貼近您的品牌與商品。" } },
            { "@type": "Question", "name": "LINE AI 客服可以回覆哪些問題？", "acceptedAnswer": { "@type": "Answer", "text": "常見像是價格、規格、商品差異、營業時間、地址、預約方式、運費、付款方式、活動內容與初步購買引導，都很適合交給 AI 先處理。" } },
            { "@type": "Question", "name": "如果 AI 不會回答，可以轉給真人嗎？", "acceptedAnswer": { "@type": "Answer", "text": "可以。實務上最好的做法不是讓 AI 取代所有客服，而是由 AI 處理高重複問題，再把需要成交、客訴、特殊案例或人工判斷的對話交給真人。" } },
            { "@type": "Question", "name": "適合哪些產業導入？", "acceptedAnswer": { "@type": "Answer", "text": "特別適合美容、零售、餐飲、預約型服務、課程顧問與其他高度依賴 LINE 官方帳號接客的中小企業。" } },
            { "@type": "Question", "name": "導入 LINE 官方帳號 AI 客服要多久？", "acceptedAnswer": { "@type": "Answer", "text": "若資料齊全，導入速度通常會比傳統客製開發快很多，因為 SaaS 型工具能先從標準化功能快速上線，再逐步優化知識內容與對話流程。" } },
            { "@type": "Question", "name": "AI 智能店長和 LINE 內建 AI 聊天機器人有什麼不同？", "acceptedAnswer": { "@type": "Answer", "text": "LINE 官方帳號近年已推出內建 AI 聊天機器人功能。若店家需要更完整的品牌語氣調整、知識庫管理、導購流程與方案彈性，通常會考慮 AI 智能店長 Pro。" } },
            { "@type": "Question", "name": "中小企業適合先怎麼開始？", "acceptedAnswer": { "@type": "Answer", "text": "最好的做法是先鎖定最常見、最重複、最耗時的客服問題，先從小規模試辦開始，驗證能否減少訊息處理時間、提高回覆率，再逐步擴充。" } }
        ]
    }
];

const industrySolutions = [
    {
        tag: 'Beauty & Wellness',
        title: '美容店專用',
        desc: '自動回覆療程差異、價目表與預約詢問，讓老師專心服務現場客人。',
        badge: '熱門推薦',
        badgeColor: 'text-cyan-400',
        img: '/sv-01.jpg',
        href: '/solutions/beauty-line-ai-customer-service',
    },
    {
        tag: 'Food & Beverage',
        title: '餐飲服務業',
        desc: '解決訂位諮詢、菜單查詢與營業資訊，尖峰時段不再擔心漏接 LINE 訊息。',
        badge: '高回覆率',
        badgeColor: 'text-cyan-400',
        img: '/sv-02.jpg',
        href: '/solutions/restaurant-line-ai-assistant',
    },
    {
        tag: 'Retail & E-commerce',
        title: '零售品牌商',
        desc: '24 小時處理庫存詢問、出貨進度與退換貨說明，打造永不關門的自動導購。',
        badge: '效率提升',
        badgeColor: 'text-cyan-400',
        img: '/sv-03.jpg',
        href: '/solutions/retail-line-ai-customer-service',
    },
];

const occupationCards = [
    { title: '美容工作室', desc: '療程介紹、價目表查詢、自動引導預約時段，讓老師專心服務現場客人。', img: '/images/landing/occ-beauty.png' },
    { title: '零售品牌', desc: '尺寸建議、庫存查詢、出貨進度與退換貨說明，24 小時導購不漏單。', img: '/images/landing/occ-retail.png' },
    { title: '餐飲／預約服務', desc: '營業時間、菜單內容、訂位方式引導，尖峰時段不再擔心漏接 LINE 詢問。', img: '/images/landing/occ-catering.png' },
    { title: '個人商家／課程', desc: '常見 FAQ 自動回答、引導報名流程，一個人也能維持超高回覆效率。', img: '/images/landing/occ-course.png' },
];

const features = [
    { icon: Brain, color: 'bg-purple-500 shadow-purple-500/30', title: '智慧語意大腦', desc: '搭載 GPT-4o 引擎，精準理解顧客意圖。平均縮短 60% 客服回覆時間，讓您告別僵硬的關鍵字回覆。' },
    { icon: Zap, color: 'bg-emerald-500 shadow-emerald-500/30', title: '商家知識庫學習', desc: 'AI 讀透您的官網與 PDF (RAG 技術)。10 秒掌握所有產品細節，化身 24 小時不休息的專業銷售。' },
    { icon: MessageCircle, color: 'bg-blue-500 shadow-blue-500/30', title: '24/7 自動導購', desc: '夜間詢問回覆率 100%。AI 主動引導下單與追蹤，將 LINE 變成 365 天永不收攤的自動成交機器。' },
    { icon: BarChart3, color: 'bg-amber-500 shadow-amber-500/30', title: '數據分析洞察', desc: '自動將客戶打標籤與分類。清晰看見顧客熱門痛點，用科學數據優化行銷策略，穩健提升營收。' },
    { icon: Globe, color: 'bg-pink-500 shadow-pink-500/30', title: '品牌 DNA 注入', desc: '親自調教 AI 的說話語氣與表情符號。完美呈現品牌獨特調性，讓機器人對談也像真人般溫暖。' },
    { icon: ShieldCheck, color: 'bg-cyan-500 shadow-cyan-500/30', title: '企業級安全性', desc: '銀行級 SSL 加密機制，嚴密護衛知識庫與顧客個資。讓您在數位轉型路上毫無後顧之憂。' },
];

const scenarios = [
    {
        color: 'from-rose-500/80 to-pink-600/80',
        shadow: 'rgba(244, 63, 94, 0.6)',
        label: '場景一',
        title: '深夜詢問，立即成交',
        subtitle: '23:47 ‧ 顧客傳訊後 8 秒內回覆',
        messages: [
            { role: 'user', text: '請問你們的去角質套餐多少錢？有包含臉嗎？' },
            { role: 'bot', text: '您好！我們的去角質全臉套餐目前特價 $880，包含臉部清潔、去角質、基礎保養三步驟，約 60 分鐘。週末檔期還剩 2 個位置，需要幫您預約嗎？😊' },
            { role: 'user', text: '好啊！這週六下午有嗎' },
            { role: 'bot', text: '週六下午 2:00 和 4:00 還有空位！請問您方便提供姓名和聯絡電話嗎？我幫您立即鎖位 ✅' },
        ]
    },
    {
        color: 'from-blue-500/80 to-indigo-600/80',
        shadow: 'rgba(59, 130, 246, 0.6)',
        label: '場景二',
        title: '商品查詢，秒速導購',
        subtitle: '14:22 ‧ 庫存查詢即時回應',
        messages: [
            { role: 'user', text: '你們還有 M 號的黑色連帽衛衣嗎？' },
            { role: 'bot', text: '有的！黑色連帽衛衣 M 號目前還有 3 件庫存。這款採用 320g 重磅棉，洗後不變形，很多回購客都說超值！需要幫您保留一件嗎？🔥' },
            { role: 'user', text: '好，我要一件，可以宅配嗎' },
            { role: 'bot', text: '當然可以！滿 $500 免運，您這筆剛好符合 🎉 請點這裡填寫收件資訊，今天下午 3 點前下單可以明天到喔！' },
        ]
    },
    {
        color: 'from-emerald-500/80 to-teal-600/80',
        shadow: 'rgba(16, 185, 129, 0.6)',
        label: '場景三',
        title: '訂位諮詢，一氣呵成',
        subtitle: '12:05 ‧ 午休尖峰，零漏接',
        messages: [
            { role: 'user', text: '你們今晚8點有位子嗎？4個人' },
            { role: 'bot', text: '今晚 8 點 4 人還有最後一組位置！我們的招牌炭烤牛小排和季節限定龍蝦湯底這週特別受歡迎，建議提前點菜。需要幫您預訂嗎？🍽️' },
            { role: 'user', text: '要！有沒有停車場' },
            { role: 'bot', text: '有的！餐廳地下 B1 停車場免費使用，從側門進入直達。訂位成功後我會傳詳細地址和停車指引給您 🚗 請問訂位姓名是？' },
        ]
    },
];

const faqs = [
    { q: 'AI 智能店長需要自己申請 OpenAI API Key 嗎？', a: '不需要。AI 智能店長 Pro 採用 SaaS 模式，店家不必自行處理複雜的 API 串接或模型設定，就能快速開通 LINE 官方帳號 AI 客服。' },
    { q: '可以教 AI 認識我的商品與服務內容嗎？', a: '可以。您可以整理官網、商品介紹、價目表、常見問題、PDF 文件或店內說明，系統會把這些資訊轉成 AI 可使用的知識內容，讓回覆更貼近您的品牌與商品。' },
    { q: 'LINE AI 客服可以回覆哪些問題？', a: '常見像是價格、規格、商品差異、營業時間、地址、預約方式、運費、付款方式、活動內容與初步購買引導，都很適合交給 AI 先處理。' },
    { q: '如果 AI 不會回答，可以轉給真人嗎？', a: '可以。實務上最好的做法不是讓 AI 取代所有客服，而是由 AI 處理高重複問題，再把需要成交、客訴、特殊案例或人工判斷的對話交給真人。' },
    { q: '適合哪些產業導入？', a: '特別適合美容、零售、餐飲、預約型服務、課程顧問與其他高度依賴 LINE 官方帳號接客的中小企業。' },
    { q: 'AI 智能店長和 LINE 內建 AI 聊天機器人有什麼不同？', a: 'LINE 官方帳號近年已推出內建 AI 聊天機器人功能。若店家需要更完整的品牌語氣調整、知識庫管理、導購流程與方案彈性，通常會考慮 AI 智能店長 Pro。' },
];

export default function HomePage() {
    const [scenarioIdx, setScenarioIdx] = useState(0);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const prevScenario = () => setScenarioIdx(i => (i - 1 + scenarios.length) % scenarios.length);
    const nextScenario = () => setScenarioIdx(i => (i + 1) % scenarios.length);

    const s = scenarios[scenarioIdx];

    return (
        <main className="relative min-h-screen w-full min-w-[1024px] bg-[#0F172A] font-sans overflow-x-auto">
            {/* JSON-LD */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

            <div className="relative min-h-screen bg-[#020617] selection:bg-blue-500/30 overflow-x-hidden">
                {/* Noise texture */}
                <div className="fixed inset-0 pointer-events-none -z-10 opacity-[0.03]"
                    style={{ backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PScwIDAgMjAwIDIwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz4KICA8ZmlsdGVyIGlkPSdub2lzZUZpbHRlcic+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9J2ZyYWN0YWxOb2lzZScgYmFzZUZyZXF1ZW5jeT0nMC42NScgbnVtT2N0YXZlcz0nMycgc3RpdGNoVGlsZXM9J3N0aXRjaCcvPgogIDwvZmlsdGVyPgogIDxyZWN0IHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbHRlcj0ndXJsKCNub2lzZUZpbHRlciknLz4KPC9zdmc+")` }} />

                {/* Ambient glow */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden -z-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                    <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '4s' }} />
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(37,99,235,0.05)_0%,rgba(2,6,23,0)_50%)]" />
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.05)_0%,rgba(2,6,23,0)_50%)]" />
                    <div className="absolute inset-0 bg-slate-950/40" />
                </div>

                {/* ── Header ── */}
                <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 min-w-[1024px]">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                            <img src="/lai_logo_3.svg" alt="Lai Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform drop-shadow-md" />
                            <div className="flex flex-col justify-center">
                                <span className="text-xl font-bold text-white tracking-tight leading-none mb-1">LINE <span className="text-emerald-400">AI</span> Assistant</span>
                                <span className="text-[11px] text-slate-300 font-medium tracking-widest leading-none">您的專屬AI店長</span>
                            </div>
                        </Link>
                        <nav className="flex items-center gap-6">
                            <button className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium">
                                <MessageSquare className="w-4 h-4" />來和 AI 店長聊聊您的需求
                            </button>
                            <Link href="/saas-partnership" className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all transform hover:scale-105 active:scale-95 bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                <LogIn className="w-4 h-4" />立即啟動
                            </Link>
                        </nav>
                    </div>
                    <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md -z-10 border-b border-white/5" />
                </header>

                {/* ── Hero ── */}
                <section className="relative z-10 min-h-screen flex flex-col overflow-hidden">
                    <div className="w-full relative overflow-hidden">
                        <div className="relative z-10 flex flex-col items-center gap-10 px-6 pt-24 pb-20 max-w-7xl mx-auto w-full">
                            <div className="flex flex-col items-center gap-8 text-center">
                                <div className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs font-black uppercase tracking-[0.4em] mb-2 backdrop-blur-md shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                                    24/7 Automated Sales &amp; Support
                                </div>
                                <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20 w-full max-w-[1400px]">
                                    <h1 className="text-4xl md:text-6xl lg:text-[80px] font-black tracking-tighter text-left leading-[1.15] drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)] text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 break-keep">
                                        <span className="whitespace-nowrap">LINE AI 機器人：</span><br />
                                        <span className="whitespace-nowrap">24 小時智慧回覆與</span><br />
                                        <span className="whitespace-nowrap">AI 智慧助手</span>
                                    </h1>
                                </div>
                                <p className="max-w-4xl text-xl md:text-2xl text-blue-50/90 font-medium leading-relaxed drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                                    專為實體店面與個人品牌設計，3 分鐘開通 LINE 官方帳號 AI 客服。結合最新的 AI 技術，精準回答客戶問題，有效減少大量重複諮詢，讓服務全天候不中斷。
                                </p>
                                <div className="flex flex-wrap justify-center gap-4 mt-2">
                                    {['#LINEAI機器人', '#智慧回覆系統', '#AI客服', '#LINE經營工具'].map(tag => (
                                        <div key={tag} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-black tracking-wider backdrop-blur-md">{tag}</div>
                                    ))}
                                </div>
                                <div className="flex flex-wrap justify-center gap-4 mt-4 opacity-70">
                                    {['★ 穩定運作中', '★ 眾多商家見證', '★ 處理大量訊息'].map(t => (
                                        <div key={t} className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-200 text-[10px] font-black tracking-wider backdrop-blur-md">{t}</div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg items-center justify-center mt-4">
                                <button className="flex-1 w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white py-4 px-8 rounded-2xl font-black text-xl transition-all hover:bg-white/20 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.05)] whitespace-nowrap">
                                    了解價格與功能
                                </button>
                                <button className="flex-1 w-full flex items-center justify-center gap-3 bg-[#06C755] hover:bg-[#05b34c] text-white py-4 px-8 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(6,199,85,0.5)] whitespace-nowrap">
                                    LINE賬號加入會員
                                </button>
                            </div>
                            <div className="hidden md:flex items-center gap-8 text-blue-100/40 text-[11px] font-black uppercase tracking-[0.5em] mt-4">
                                <div className="flex items-center gap-2">
                                    <img src="/lai_logo.svg" className="w-4 h-4 grayscale opacity-50" alt="YC Ideas" />
                                    <span>Powered by YC Ideas</span>
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                <span>NewebPay Secured</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                <span>LINE OA Integration</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Industry Solutions ── */}
                <section className="py-32 px-6 relative overflow-hidden bg-slate-950/20">
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="text-center mb-20">
                            <div className="inline-block px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-6 backdrop-blur-md">
                                Tailored for your business
                            </div>
                            <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight">
                                針對不同產業<br />讓您輕鬆打造 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">專屬 AI 店長</span>
                            </h2>
                            <p className="text-slate-300 text-xl md:text-2xl font-bold max-w-3xl mx-auto leading-relaxed">
                                八大智庫，輕鬆上手<br />讓您的 AI 店長一上線就具備您想要的專家水準。
                            </p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {industrySolutions.map(sol => (
                                <div key={sol.title} className="group relative h-[620px] rounded-[48px] overflow-hidden border-4 border-white/5 hover:border-emerald-500/80 transition-all duration-500 shadow-2xl hover:shadow-[0_0_50px_rgba(16,185,129,0.25)]">
                                    <Image alt={`AI 智能店長 ${sol.title}`} src={sol.img} fill className="object-cover group-hover:scale-110 transition-transform duration-1000 brightness-75 group-hover:brightness-100" sizes="(max-width: 768px) 100vw, 33vw" />
                                    <div className="absolute top-8 right-8 z-30">
                                        <span className={`px-4 py-1.5 rounded-full bg-cyan-500/20 backdrop-blur-md border border-cyan-500/30 text-xs font-black ${sol.badgeColor} shadow-[0_0_15px_rgba(34,211,238,0.25)]`}>{sol.badge}</span>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-2">{sol.tag}</div>
                                                <h3 className="text-3xl font-black text-white mb-4 group-hover:text-emerald-400 transition-colors">{sol.title}</h3>
                                                <p className="text-slate-300 font-medium leading-relaxed">{sol.desc}</p>
                                            </div>
                                            <Link href={sol.href} className="inline-flex items-center gap-3 bg-white/10 border border-white/10 text-white/50 px-8 py-5 rounded-3xl font-black text-xl transition-all duration-500 group/btn w-full justify-center group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-emerald-500/30">
                                                查看解決方案 <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-emerald-500/5 rounded-full blur-[150px] -z-10" />
                </section>

                {/* ── Who Is This For ── */}
                <section className="py-24 px-6 relative z-30 overflow-hidden">
                    <div className="absolute inset-0 z-0 opacity-50 pointer-events-none" style={{ backgroundImage: "url('/images/landing/industry-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-0 px-4">
                            <div className="relative w-[511px] h-[511px] md:w-[640px] md:h-[640px] flex-shrink-0 translate-y-[80px] translate-x-[130px] z-20">
                                <Image alt="AI Mascot" fill className="object-contain" src="/images/landing/ai-mascot.svg" />
                            </div>
                            <div className="text-center md:text-left flex-1 z-10 translate-x-[-230px]">
                                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                                    AI 智能店長，<br className="hidden md:block" />適不適合我的店家？
                                </h2>
                                <p className="text-slate-200 text-lg md:text-xl font-bold max-w-2xl drop-shadow-sm">
                                    不論您的產業規模，只要您在 LINE 官方帳號經營上遇到重複問答的痛點，這就是為您設計的解決方案。
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-30 -mt-24 md:-mt-20">
                            {occupationCards.map(card => (
                                <div key={card.title} className="relative aspect-[4/5] rounded-[32px] overflow-hidden group cursor-pointer border border-white/10 select-none shadow-2xl transition-all">
                                    <div className="absolute inset-0 z-0 opacity-70 group-hover:opacity-90 transition-opacity" style={{ backgroundImage: "url('/images/landing/card-base.png')", backgroundSize: 'cover' }} />
                                    <div className="relative w-full h-full flex flex-col items-center">
                                        <div className="absolute inset-0 z-10 bg-emerald-900/40 backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-20 w-full h-full flex items-center justify-center p-4">
                                            <div className="relative w-full h-full">
                                                <Image alt={card.title} fill className="object-contain" src={card.img} sizes="25vw" />
                                            </div>
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 z-20 p-8 flex flex-col items-center justify-end text-center h-full opacity-0 group-hover:opacity-100 translate-y-5 group-hover:translate-y-0 transition-all duration-300">
                                            <h3 className="text-3xl font-bold text-white mb-4">{card.title}</h3>
                                            <p className="text-slate-100 leading-relaxed font-bold text-lg">{card.desc}</p>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 border-2 transition-colors pointer-events-none rounded-[32px] z-30 border-emerald-500/0 group-hover:border-emerald-500/40" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Features ── */}
                <section className="py-32 px-6 relative overflow-hidden z-20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-emerald-500/10 rounded-full blur-[150px] -z-10" />
                    <div className="max-w-7xl mx-auto relative z-30">
                        <div className="text-center mb-16">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Core Advantages</div>
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                                老闆最愛的 <span className="text-emerald-400">AI 智能店長</span>
                            </h2>
                            <p className="text-slate-200 max-w-2xl mx-auto text-xl font-bold leading-relaxed tracking-wide">
                                不只是客服，更是您的 24 小時金牌店長。一鍵串接，讓您的 LINE 官方帳號瞬間升級。
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                            {features.map(f => (
                                <div key={f.title} className="p-10 rounded-[48px] bg-white/50 backdrop-blur-lg border-[3px] border-white/40 shadow-[0_25px_50px_rgba(0,0,0,0.3)] transition-all group overflow-hidden relative">
                                    <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                                    <div className={`${f.color} shadow-lg w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 ring-4 ring-white/30`}>
                                        <f.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-[26px] font-black text-slate-900 mb-5 tracking-tight group-hover:text-emerald-700 transition-colors">{f.title}</h3>
                                    <p className="text-slate-700 leading-relaxed font-black text-base">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Scenarios ── */}
                <section id="scenarios" className="py-24 px-6 relative overflow-hidden bg-[#020617] border-t border-white/5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1)_0%,transparent_60%)]" />
                    <div className="max-w-4xl mx-auto relative z-10">
                        <div className="text-center mb-16">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                                <span className="text-emerald-400 text-[10px] font-black tracking-[0.4em] uppercase">解決老闆的障礙時刻</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                                AI店長如何幫您 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">處理大小事？</span>
                            </h2>
                        </div>
                        <div className="relative flex items-center justify-center min-h-[720px] mt-[-30px]">
                            <button onClick={prevScenario} className="absolute left-4 md:-left-12 z-30 p-5 rounded-full bg-emerald-500/20 backdrop-blur-xl border border-white/20 text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:bg-emerald-500/40 hover:scale-110 transition-all cursor-pointer">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button onClick={nextScenario} className="absolute right-4 md:-right-12 z-30 p-5 rounded-full bg-emerald-500/20 backdrop-blur-xl border border-white/20 text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:bg-emerald-500/40 hover:scale-110 transition-all cursor-pointer">
                                <ChevronRight className="w-6 h-6" />
                            </button>
                            <div className="w-full flex items-center justify-center p-4">
                                <div className="w-full flex justify-center">
                                    <div className="relative w-full max-w-[340px] aspect-[9/19] mx-auto rounded-[48px] overflow-hidden border-[2px] border-white/20 bg-slate-950"
                                        style={{ boxShadow: `0 0 70px ${s.shadow}, 0 0 140px ${s.shadow.replace('0.6', '0.2')}` }}>
                                        {/* Phone header */}
                                        <div className={`w-full h-20 bg-gradient-to-r ${s.color} flex flex-col items-center justify-center gap-1 relative`}>
                                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-black/30 rounded-full" />
                                            <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-3">{s.label}</span>
                                            <span className="text-sm text-white font-black">{s.title}</span>
                                        </div>
                                        {/* Chat */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0a0a] h-[calc(100%-80px)]">
                                            <div className="text-center text-[10px] text-slate-500 font-medium mb-4">{s.subtitle}</div>
                                            {s.messages.map((msg, i) => (
                                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs font-medium leading-relaxed ${msg.role === 'user'
                                                        ? 'bg-[#06C755] text-white rounded-br-sm'
                                                        : 'bg-slate-800 text-slate-200 rounded-bl-sm'}`}>
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Dots */}
                        <div className="flex justify-center gap-3 mt-8">
                            {scenarios.map((_, i) => (
                                <button key={i} onClick={() => setScenarioIdx(i)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${i === scenarioIdx ? 'bg-emerald-400 scale-125' : 'bg-slate-600 hover:bg-slate-400'}`} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FAQ ── */}
                <section className="py-24 px-6 relative overflow-hidden bg-slate-950/50 border-t border-white/5">
                    <div className="max-w-3xl mx-auto relative z-10">
                        <div className="text-center mb-16">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6">FAQ</div>
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">老闆最常問的問題</h2>
                        </div>
                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <div key={i} className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden">
                                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between p-6 text-left gap-4 hover:bg-white/5 transition-colors">
                                        <span className="text-white font-bold text-base">{faq.q}</span>
                                        <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                                    </button>
                                    {openFaq === i && (
                                        <div className="px-6 pb-6 text-slate-300 font-medium leading-relaxed">{faq.a}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA Footer ── */}
                <section className="py-24 px-6 relative overflow-hidden border-t border-white/5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.08)_0%,transparent_70%)]" />
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] mb-8">立即開始</div>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
                            3 分鐘，讓您的 LINE<br />從此不再漏接訊息
                        </h2>
                        <p className="text-slate-300 text-xl font-bold mb-12 max-w-2xl mx-auto leading-relaxed">
                            加入數百位已在使用 AI 智能店長的老闆，現在開始讓 AI 幫您接客。
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 justify-center">
                            <Link href="/saas-partnership" className="flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white py-5 px-10 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(16,185,129,0.4)]">
                                <Zap className="w-6 h-6" />免費試用 14 天
                            </Link>
                            <a href="https://line.me/R/ti/p/@788hryuq" target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 bg-white/10 border border-white/20 text-white py-5 px-10 rounded-2xl font-black text-xl transition-all hover:bg-white/20 active:scale-95">
                                <ExternalLink className="w-6 h-6" />加 LINE 諮詢
                            </a>
                        </div>
                        <p className="text-slate-500 text-sm font-medium mt-8">無需信用卡 ‧ 3 分鐘快速開通 ‧ 隨時可取消</p>
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer className="py-10 px-6 border-t border-white/5">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <img src="/lai_logo.svg" className="w-8 h-8" alt="logo" />
                            <span className="text-slate-400 text-sm font-bold">© 2025 AI 智能店長 Pro · YC Ideas</span>
                        </div>
                        <div className="flex items-center gap-6 text-slate-500 text-xs font-medium">
                            <Link href="/saas-partnership" className="hover:text-slate-300 transition-colors">SaaS 夥伴計畫</Link>
                            <a href="https://line.me/R/ti/p/@788hryuq" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">聯絡我們</a>
                        </div>
                    </div>
                </footer>

            </div>
        </main>
    );
}
