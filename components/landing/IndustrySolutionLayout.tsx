'use client';

import React from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Lightbulb, Target, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface FAQ {
    q: string;
    a: string;
}

interface IndustrySolutionProps {
    title: string;
    subtitle: string;
    description: string;
    painPoints: { title: string; desc: string }[];
    benefits: string[];
    scenarios: { title: string; desc: string }[];
    beforeAfter: { before: string; after: string };
    faqs: FAQ[];
    ctaTitle?: string;
    backgroundImage?: string;
}

export default function IndustrySolutionLayout({
    title,
    subtitle,
    description,
    painPoints,
    benefits,
    scenarios,
    beforeAfter,
    faqs,
    ctaTitle = '立即預約 AI 智能店長，提升經營效率',
    backgroundImage
}: IndustrySolutionProps) {
    // 依據 GEO 規範動態生成專屬的 JSON-LD 結構化資料
    const solutionJsonLd = [
        {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: `AI 智能店長 Pro - ${subtitle}專屬 AI 助手`,
            description: description,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web, LINE OA',
            offers: {
                '@type': 'Offer',
                price: '199',
                priceCurrency: 'TWD',
            },
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '5.0',
                reviewCount: '96',
            },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: '首頁',
                    item: 'https://bot.ycideas.com'
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: `${subtitle} AI 解決方案`,
                    item: typeof window !== 'undefined' ? window.location.href : 'https://bot.ycideas.com/solutions'
                }
            ]
        },
        {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(faq => ({
                '@type': 'Question',
                name: faq.q,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.a
                }
            }))
        }
    ];

    return (
        <div className="min-h-screen text-white font-sans selection:bg-emerald-500/30 relative overflow-x-hidden">
            {/* 動態植入 JSON-LD 結構化資料 */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(solutionJsonLd),
                }}
            />

            {/* 🌑 Solid Base Background Color */}
            <div className="fixed inset-0 bg-[#0F172A] -z-20" />

            {/* 🌌 Industry-Specific Background Overlay (Behind everything) */}
            {backgroundImage && (
                <div 
                    className="fixed inset-0 z-[-10] pointer-events-none opacity-50"
                    style={{ 
                        backgroundImage: `url('${backgroundImage}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
            )}

            <div className="relative z-10">
                <LandingHeader isLoggedIn={false} onAction={() => window.location.href = '/api/auth/line'} onOpenChat={() => window.location.href = '/chat'} />
                
                <main className="pt-32 pb-20">
                {/* Hero section */}
                <section className="px-6 mb-32">
                    <div className="max-w-5xl mx-auto text-center">
                        <motion.h1 
                            initial={{ opacity: 1, y: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-black mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
                        >
                            {title}
                        </motion.h1>
                        <p className="text-xl md:text-2xl text-slate-200 font-bold mb-12 max-w-3xl mx-auto leading-relaxed">
                            {description}
                        </p>
                        <button 
                            onClick={() => window.location.href = '/api/auth/line'}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-3xl font-black text-xl transition-all shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95"
                        >
                            免費開通 AI 店長試用
                        </button>
                    </div>
                </section>

                {/* Pain Points */}
                <section className="px-6 mb-32 bg-slate-900/50 py-24 border-y border-white/5">
                    <div className="max-w-6xl mx-auto">
                        <h2 id="pain-points" className="text-3xl md:text-4xl font-black text-center mb-16 underline decoration-emerald-500/30 underline-offset-8">
                            {subtitle} 最常見的 LINE 客服問題
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {painPoints.map((p, i) => (
                                <div key={i} className="p-8 rounded-[32px] bg-slate-800/30 border border-white/5 hover:border-white/10 transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
                                        <AlertCircle className="text-red-400 w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">{p.title}</h3>
                                    <p className="text-slate-200 font-bold">{p.desc}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-sm font-bold text-slate-400 bg-slate-800/40 py-4 rounded-2xl border border-white/5">
                            💡 **小結**：顧客詢問常集中在營業尖峰與店休時段，AI 智能店長能 24 小時無縫接軌，防止漏單與顧客流失。
                        </p>
                    </div>
                </section>

                {/* Scenarios */}
                <section className="px-6 mb-32">
                    <div className="max-w-6xl mx-auto">
                        <h2 id="scenarios" className="text-3xl md:text-4xl font-black text-center mb-16">
                            AI 可以怎麼幫你處理？
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                            {scenarios.map((s, i) => (
                                <div key={i} className="flex gap-6">
                                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                        <CheckCircle2 className="text-emerald-400 w-6 h-6" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-bold">{s.title}</h3>
                                        <p className="text-slate-200 font-bold leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-sm font-bold text-emerald-400 bg-emerald-500/10 py-4 rounded-2xl border border-emerald-500/20">
                            🚀 **小結**：透過自動遞送菜單/價目表、引導預約流程與分流複雜訂單，AI 助手大幅降低人工客服成本。
                        </p>
                    </div>
                </section>

                {/* Before After */}
                <section className="px-6 mb-32">
                    <div className="max-w-5xl mx-auto p-12 rounded-[48px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Target className="w-48 h-48" />
                        </div>
                        <h2 id="before-after" className="text-3xl font-black mb-12 flex items-center gap-4">
                            <Lightbulb className="text-amber-400 w-8 h-8" />
                            導入後的 Before / After
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-8 mb-8">
                            <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/5 space-y-4">
                                <div className="text-xs font-black uppercase tracking-widest text-slate-500">Before</div>
                                <p className="text-lg text-slate-400 font-medium leading-relaxed">{beforeAfter.before}</p>
                            </div>
                            <div className="flex justify-center">
                                <ArrowRight className="text-emerald-400 w-12 h-12 rotate-90 md:rotate-0" />
                            </div>
                            <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 space-y-4">
                                <div className="text-xs font-black uppercase tracking-widest text-emerald-400">After</div>
                                <p className="text-lg text-white font-black leading-relaxed">{beforeAfter.after}</p>
                            </div>
                        </div>
                        <p className="text-center text-sm font-bold text-indigo-300 bg-indigo-500/10 py-4 rounded-2xl border border-indigo-500/20">
                            🎯 **小結**：讓 AI 處理高重複瑣碎詢問，現場員工與老闆專注於高價值的實體服務與出餐品質。
                        </p>
                    </div>
                </section>

                {/* FAQ */}
                <section className="px-6 mb-32">
                    <div className="max-w-4xl mx-auto">
                        <h2 id="faqs" className="text-3xl font-black text-center mb-16">常見問題</h2>
                        <div className="space-y-6">
                            {faqs.map((faq, i) => (
                                <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 space-y-3">
                                    <h3 className="text-xl font-bold text-white flex gap-4">
                                        <span className="text-emerald-400 font-black">Q.</span> {faq.q}
                                    </h3>
                                    <p className="text-slate-200 font-bold pl-8 leading-relaxed">
                                        {faq.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="px-6 text-center">
                   <div className="max-w-3xl mx-auto p-12 rounded-[40px] bg-emerald-500 text-white shadow-2xl shadow-emerald-500/20">
                       <h2 className="text-3xl md:text-4xl font-black mb-8 leading-tight">{ctaTitle}</h2>
                       <button 
                            onClick={() => window.location.href = '/api/auth/line'}
                            className="bg-white text-emerald-600 px-10 py-5 rounded-3xl font-black text-xl transition-all shadow-xl hover:scale-105 active:scale-95"
                       >
                           3 分鐘快速開通
                       </button>
                    </div>
                </section>
            </main>

            <LandingFooter variant="desktop" />
            </div>
        </div>
    );
}
