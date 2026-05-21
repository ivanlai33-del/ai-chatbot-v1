import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, Star, Zap, MessageCircle, Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: '美容店 LINE 官方帳號 AI 客服｜自動回覆預約、療程與價格問題',
    description: '專為美容工作室、美甲、美睫、護膚與個人品牌設計的 LINE 官方帳號 AI 客服。可自動回覆療程介紹、價目表、預約方式與常見問題，減少重複客服並提高非營業時間預約機會。',
    keywords: ['美容店AI客服', 'LINE官方帳號美容', '美容工作室自動回覆', '美睫預約機器人', '美甲LINE客服', 'AI智能店長美容'],
    openGraph: {
        title: '美容店 LINE 官方帳號 AI 客服｜自動回覆預約、療程與價格問題',
        description: '讓 AI 幫您自動處理療程詢問與預約，老師專心服務現場客人。',
        url: 'https://bot.ycideas.com/solutions/beauty-line-ai-customer-service',
        images: [{ url: '/images/seo/seo-intro.jpg', width: 1200, height: 630 }],
    },
};

const features = [
    { icon: MessageCircle, title: '自動回覆療程差異', desc: '顧客問「蜜蠟跟熱蠟有什麼不同？」AI 馬上給出清楚說明，老師不必分心。' },
    { icon: Clock, title: '非營業時間仍接單', desc: '凌晨 2 點的詢問也能立即回覆，讓潛在顧客不因等待而流失。' },
    { icon: Zap, title: '引導預約時段', desc: 'AI 可呈現目前空檔，直接引導顧客選擇適合時段，減少來回確認。' },
    { icon: Star, title: '個人品牌語氣設定', desc: '依照您的品牌風格設定親切語氣，讓顧客覺得和真人老師在聊天。' },
    { icon: CheckCircle, title: '價目表即時查詢', desc: '顧客問多少錢、有沒有優惠，AI 直接回應，不再讓您深夜還得逐一回訊息。' },
    { icon: ArrowRight, title: 'FAQ 標準化回覆', desc: '常見問題統一格式，避免不同時間回覆不一致，提升專業感。' },
];

const useCases = [
    { q: '美甲老師問：我下午有客人，不在的時候訊息怎麼辦？', a: 'AI 會在您忙碌時自動接待詢問、介紹服務、確認時段，讓您服務完客人再處理細節。' },
    { q: '美睫工作室問：每天都要回「什麼是嫁接？需要補幾根？」很累怎麼辦？', a: '把這些說明放入知識庫，AI 就能完整、一致地回覆，您只需要處理真正需要人工的對話。' },
    { q: '護膚工作室問：顧客問很多種療程差異，很難一一解釋？', a: 'AI 可依問題引導顧客先了解各療程特性，再建議適合的項目，類似線上的美容顧問。' },
];

export default function BeautySolutionPage() {
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.1)_0%,transparent_60%)]" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-black uppercase tracking-[0.3em] mb-6">
                        Beauty &amp; Wellness
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">
                        美容店專用<br /><span className="text-emerald-400">LINE 官方帳號 AI 客服</span>
                    </h1>
                    <p className="text-slate-300 text-xl font-bold max-w-2xl mb-10 leading-relaxed">
                        專為美容工作室、美甲、美睫、護膚與個人品牌設計。自動回覆療程介紹、價目表、預約方式與常見問題，讓老師可以專心服務現場客人。
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
                        <Image src="/sv-01.jpg" alt="美容店 LINE AI 客服" fill className="object-cover" sizes="(max-width: 768px) 100vw, 80vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6 bg-slate-950/50 border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-center mb-4">美容業專屬功能</h2>
                    <p className="text-slate-400 text-center mb-16 font-medium">從詢問到預約，全程自動化</p>
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
                    <h2 className="text-3xl font-black text-center mb-16">美容老闆最常問的問題</h2>
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
                    <h2 className="text-3xl md:text-4xl font-black mb-4">讓 AI 店長幫您處理重複詢問</h2>
                    <p className="text-slate-300 font-bold mb-10">3 分鐘開通，立即減少您的客服壓力。</p>
                    <Link href="/saas-partnership" className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white py-4 px-10 rounded-2xl font-black text-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                        免費開始使用 <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
