'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, UtensilsCrossed, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const solutions = [
    {
        title: '美容店專用',
        subtitle: 'Beauty & Wellness',
        desc: '自動回覆療程差異、價目表與預約詢問，讓老師專心服務現場客人。',
        image: '/sv-01.jpg',
        link: '/solutions/beauty-line-ai-customer-service',
        icon: Sparkles,
        color: 'from-pink-500/20 to-rose-500/20',
        tag: '熱門推薦'
    },
    {
        title: '餐飲服務業',
        subtitle: 'Food & Beverage',
        desc: '解決訂位諮詢、菜單查詢與營業資訊，尖峰時段不再擔心漏接 LINE 訊息。',
        image: '/sv-02.jpg',
        link: '/solutions/restaurant-line-ai-assistant',
        icon: UtensilsCrossed,
        color: 'from-orange-500/20 to-amber-500/20',
        tag: '高回覆率'
    },
    {
        title: '零售品牌商',
        subtitle: 'Retail & E-commerce',
        desc: '24 小時處理庫存詢問、出貨進度與退換貨說明，打造永不關門的自動導購。',
        image: '/sv-03.jpg',
        link: '/solutions/retail-line-ai-customer-service',
        icon: ShoppingBag,
        color: 'from-blue-500/20 to-indigo-500/20',
        tag: '效率提升'
    }
];

export default function SolutionIndustryShowcase() {
    return (
        <section className="py-32 px-6 relative overflow-hidden bg-slate-950/20">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-6 backdrop-blur-md"
                    >
                        Tailored for your business
                    </motion.div>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight"
                    >
                        針對不同產業<br />
                        讓您輕鬆打造 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">專屬 AI 店長</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-300 text-xl md:text-2xl font-bold max-w-3xl mx-auto leading-relaxed"
                    >
                        八大智庫，輕鬆上手<br />
                        讓您的 AI 店長一上線就具備您想要的專家水準。
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {solutions.map((sol, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15 }}
                            className="group relative h-[620px] rounded-[48px] overflow-hidden border-4 border-white/5 hover:border-emerald-500/80 transition-all duration-500 shadow-2xl hover:shadow-[0_0_50px_rgba(16,185,129,0.25)]"
                        >
                            {/* Background Image */}
                            <Image
                                src={sol.image}
                                alt={`AI 智能店長 ${sol.title} - ${sol.desc.slice(0, 30)}...`}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover group-hover:scale-110 transition-transform duration-1000 brightness-75 group-hover:brightness-100"
                            />

                            {/* 💎 Top-Right Tag: Bright Cyan */}
                            <div className="absolute top-8 right-8 z-30">
                                <span className="px-4 py-1.5 rounded-full bg-cyan-500/20 backdrop-blur-md border border-cyan-500/30 text-xs font-black text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.25)]">
                                    {sol.tag}
                                </span>
                            </div>
                            
                            {/* Glass Content Overlay */}
                            <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                                <div className="space-y-6">
                                    
                                    <div>
                                        <div className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-2">{sol.subtitle}</div>
                                        <h3 className="text-3xl font-black text-white mb-4 group-hover:text-emerald-400 transition-colors">{sol.title}</h3>
                                        <p className="text-slate-300 font-medium leading-relaxed">
                                            {sol.desc}
                                        </p>
                                    </div>

                                    <Link 
                                        href={sol.link}
                                        className="inline-flex items-center gap-3 bg-white/10 border border-white/10 text-white/50 px-8 py-5 rounded-3xl font-black text-xl transition-all duration-500 group/btn w-full justify-center group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-emerald-500/30"
                                    >
                                        查看解決方案 
                                        <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                                    </Link>
                                </div>
                            </div>

                            {/* Hover Scan Effect */}
                            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Background Atmosphere */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-emerald-500/5 rounded-full blur-[150px] -z-10" />
        </section>
    );
}
