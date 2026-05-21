import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, Star, Zap, MessageCircle, Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: '餐飲業 LINE AI 客服與自動接單｜自動回覆菜單、訂位與營業資訊',
    description: '專為台灣餐廳、飲料店、咖啡廳與居酒屋打造的 LINE AI 智慧客服工具。3分鐘串接，24H 自動回覆最新菜單、營業時間、訂位規範與外帶外送優惠，解決尖峰時段漏單痛點！',
    keywords: ['餐飲LINE客服', 'LINE餐廳AI', '餐廳自動回覆', '訂位機器人', '菜單查詢AI', 'AI智能店長餐飲'],
    openGraph: {
        title: '餐飲業 LINE AI 客服與自動接單｜自動回覆菜單、訂位與營業資訊',
        description: '尖峰時段不再漏單！24H 自動回覆菜單、訂位、外帶資訊。',
        url: 'https://bot.ycideas.com/solutions/restaurant-line-ai-assistant',
        images: [{ url: '/images/seo/seo-industries.jpg', width: 1200, height: 630 }],
    },
};

const features = [
    { icon: MessageCircle, title: '菜單即時查詢', desc: '顧客問有沒有素食、今日特餐是什麼，AI 直接回覆，服務員不必中斷服務接 LINE。' },
    { icon: Clock, title: '尖峰時段零漏接', desc: '中午、晚餐最忙的時候，AI 自動接待 LINE 詢問，讓您專心出餐，不再因漏訊息流失客人。' },
    { icon: Zap, title: '訂位引導流程', desc: 'AI 說明訂位規則、可用時段，並收集姓名和人數，讓您晚上確認即可，不必即時回覆。' },
    { icon: Star, title: '外帶外送說明', desc: '自動回覆外帶等候時間、外送範圍與最低消費，減少電話進線壓力。' },
    { icon: CheckCircle, title: '營業時間公告', desc: '假日特殊營業時間、休假通知自動推播，減少顧客撲空的抱怨與詢問。' },
    { icon: ArrowRight, title: '活動與優惠推廣', desc: '搭配 LINE 廣播功能，AI 可協助說明活動詳情與優惠規則，讓促銷更有效率。' },
];

const useCases = [
    { q: '餐廳老闆問：我午餐都在忙，根本沒空回 LINE，顧客問了沒人回就跑了？', a: 'AI 會在您忙碌時自動接待，回覆菜單資訊、訂位詢問，並告知您何時會再確認，讓顧客不流失。' },
    { q: '飲料店老闆問：每天都要解釋「珍珠可以換少糖嗎」「冬天有熱飲嗎」，很煩。', a: '把這些常見問題設定進知識庫，AI 就能 24 小時一致性地回答，您不再需要重複說明。' },
    { q: '咖啡廳老闆問：IG 導流量過來問 LINE，但我一個人根本忙不過來？', a: 'AI 可以作為第一線接待，先介紹菜單、環境與訂位，讓您有時間再處理需要人工的對話。' },
];

export default function RestaurantSolutionPage() {
    return (
        <main className="min-h-screen bg-[#020617] text-white font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 px-6 py-4 border-b border-white/10 bg-[#020617]/80 backdrop-blur-md">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:border-emerald-500 transition-all">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold">返回首頁</span>
                    </Link>
                    <Link href="/saas-partnership" className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full text-sm font-black transition-all hover:scale-105">
                        立即開始使用
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.1)_0%,transparent_60%)]" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-[0.3em] mb-6">
                        Food &amp; Beverage
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">
                        餐飲業專用<br /><span className="text-emerald-400">LINE AI 客服與自動接單助手</span>
                    </h1>
                    <p className="text-slate-300 text-xl font-bold max-w-2xl mb-10 leading-relaxed">
                        專為台灣餐廳、飲料店、咖啡廳設計。24H 自動回覆菜單、訂位、外帶資訊，尖峰時段不再漏單。
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/saas-partnership" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white py-4 px-8 rounded-2xl font-black text-lg transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                            <Zap className="w-5 h-5" />免費試用 14 天
                        </Link>
                    </div>
                </div>
            </section>

            {/* Image */}
            <section className="px-6 pb-16">
                <div className="max-w-5xl mx-auto">
                    <div className="relative rounded-3xl overflow-hidden aspect-video border border-white/10">
                        <Image src="/sv-02.jpg" alt="餐飲業 LINE AI 客服" fill className="object-cover" sizes="(max-width: 768px) 100vw, 80vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6 bg-slate-950/50 border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-center mb-4">餐飲業專屬功能</h2>
                    <p className="text-slate-400 text-center mb-16 font-medium">從菜單查詢到訂位，24H 全自動</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map(f => (
                            <div key={f.title} className="p-7 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/30 transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-colors">
                                    <f.icon className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-black text-white mb-3">{f.title}</h3>
                                <p className="text-slate-400 font-medium leading-relaxed text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-black text-center mb-16">餐飲老闆最常問的問題</h2>
                    <div className="space-y-6">
                        {useCases.map((uc, i) => (
                            <div key={i} className="p-7 rounded-2xl bg-slate-900/60 border border-white/10">
                                <p className="text-emerald-400 font-black mb-3">💬 {uc.q}</p>
                                <p className="text-slate-300 font-medium leading-relaxed">{uc.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 border-t border-white/5 bg-slate-950/30">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-black mb-4">讓 AI 幫您接客，您專心出餐</h2>
                    <p className="text-slate-300 font-bold mb-10">3 分鐘開通，尖峰時段從此不漏單。</p>
                    <Link href="/saas-partnership" className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white py-4 px-10 rounded-2xl font-black text-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                        免費開始使用 <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
