'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Info, Target, ShoppingBag, Lightbulb } from 'lucide-react';
import Image from 'next/image';

const sections = [
    {
        icon: Info,
        title: '什麼是 LINE \n官方帳號 AI 客服？',
        content: 'LINE 官方帳號 AI 客服，是讓你的 LINE OA 能自動理解顧客問題、即時回覆常見詢問，並根據商品資料或 FAQ 提供更自然的回答方式。相較於傳統只靠關鍵字觸發的自動回覆，AI 客服更適合處理商品介紹、價格說明、營業時間、運費、預約與常見購買問題。\n\n對中小企業來說，最有價值的不只是「自動回訊」，而是把夜間漏訊、重複問答與第一線客服壓力降下來，讓真人專員只處理需要成交、客製溝通或例外情況的對話內容。',
        color: 'from-blue-500/20 to-indigo-500/20',
        iconColor: 'text-blue-400',
        image: '/images/seo/seo-intro.jpg'
    },
    {
        icon: Target,
        title: 'AI 智能店長 \n能解決哪些問題？',
        content: '很多店家在 LINE 官方帳號經營上，真正卡住的不是開帳號本身，而是後續每天持續湧入的重複訊息。當這些問題都要靠人工處理時，最常發生的就是半夜漏訊、白天回不完、真人客服疲於奔命。\n\nAI 智能店長的角色，就是先幫你接住這些高重複、標準化、可知識化的問題。你只要整理好官網、商品資料、PDF、FAQ 或店內說明，系統就能把這些資訊轉成 AI 可用的知識庫，讓顧客在任何時間都能快速得到回覆。\n\n對店家來說，這代表你不需要 24 小時守著 LINE，也能維持回覆速度、穩定服務品質，並把更多時間放在成交、出貨、現場服務與客戶經營。',
        color: 'from-emerald-500/20 to-teal-500/20',
        iconColor: 'text-emerald-400',
        image: '/images/seo/seo-solutions.jpg'
    },
    {
        icon: ShoppingBag,
        title: '適合哪些產業 \n使用？',
        content: 'AI 智能店長特別適合需要大量處理 LINE 詢問、預約、商品介紹或重複客服問題的中小企業。像是美容工作室會遇到療程介紹、價目表與預約時段詢問；零售品牌會遇到商品尺寸、顏色、價格、出貨與退換貨問題；餐飲業則常有菜單、營業時間、訂位與外帶外送相關詢問。\n\n如果你的商業模式本來就很依賴 LINE 官方帳號來接客、回覆或促進成交，那麼導入 AI 客服的效果通常會比一般網站型客服更直接。',
        color: 'from-purple-500/20 to-pink-500/20',
        iconColor: 'text-purple-400',
        image: '/images/seo/seo-industries.jpg'
    },
    {
        icon: Lightbulb,
        title: '為什麼不是 \n只用一般自動回覆？',
        content: '一般 LINE 自動回覆適合固定關鍵字或少量 FAQ，但當顧客問法開始變化、問題越來越接近自然語言時，單純的關鍵字回覆很容易失準。AI 客服的優勢在於它能根據上下文與知識內容回應，更適合處理「我想找適合送禮的組合」「這個療程差在哪裡」「我明天下午還能預約嗎」這類真實對話。\n\n如果你想讓 LINE 官方帳號從被動回訊工具，變成能導購、篩選需求、提高成交效率的入口，那就需要比傳統自動回覆更完整的 AI 對話能力。',
        color: 'from-amber-500/20 to-orange-500/20',
        iconColor: 'text-amber-400',
        image: '/images/seo/seo-comparison.jpg'
    }
];

export default function LandingSEOContent() {
    return (
        <section className="py-24 px-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-32">
                {sections.map((section, i) => (
                    <div
                        key={i}
                        className={`flex flex-col ${i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20 relative z-10`}
                    >
                        {/* Text Content */}
                        <div className="flex-1 space-y-8 text-left">
                            <h2 className="text-[32px] md:text-[54px] font-black text-white tracking-tight leading-[1.1] mb-2">
                                {section.title.split('\n').map((line, li) => (
                                    <React.Fragment key={li}>
                                        {line}
                                        {li < section.title.split('\n').length - 1 && <br />}
                                    </React.Fragment>
                                ))}
                            </h2>
                            <div className="space-y-6">
                                {section.content.split('\n\n').map((para, pi) => (
                                    <p key={pi} className="text-white text-[16px] md:text-[18px] leading-relaxed font-bold drop-shadow-sm opacity-90">
                                        {para}
                                    </p>
                                ))}
                            </div>
                        </div>

                        {/* Image Content with 3px Glass Border */}
                        <div className="flex-1 w-full max-w-lg aspect-square rounded-[48px] relative group">
                            {/* 3px Glass Reflective Border */}
                            <div className="absolute inset-0 rounded-[48px] border-[3px] border-white/40 z-20 pointer-events-none shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
                            
                            {/* Glow Effect Behind Image */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-20 blur-3xl -z-10`} />

                            <div className="relative w-full h-full rounded-[48px] overflow-hidden bg-slate-900 shadow-2xl">
                                <Image
                                    src={section.image}
                                    alt={section.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    sizes="(max-w-768px) 100vw, 50vw"
                                />
                                
                                {/* Overlay Gradient for "Industry Standard Solutions" */}
                                <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10 text-center">
                                    <div className="text-emerald-400 font-black text-[12px] md:text-[14px] tracking-[0.4em] uppercase drop-shadow-md">
                                        Industry Standard Solutions
                                    </div>
                                </div>
                            </div>
                            
                            {/* Hover Scan Reflection */}
                            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none z-30" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
