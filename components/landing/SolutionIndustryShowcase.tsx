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
                        className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter"
                    >
                        針對不同產業<br />
                        打造 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">專屬 AI 店長</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-xl font-medium max-w-2xl mx-auto"
                    >
                        我們深入研究各行業痛點，預置專業知識庫模板，讓您的 AI 機器人一上線就具備行業專家水準。
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
                            className="group relative h-[600px] rounded-[48px] overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all duration-500 shadow-2xl"
                        >
                            {/* Background Image */}
                            <Image
                                src={sol.image}
                                alt={sol.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.4] group-hover:brightness-[0.6]"
                            />
                            
                            {/* Glass Content Overlay */}
                            <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${sol.color} flex items-center justify-center backdrop-blur-xl border border-white/10 group-hover:scale-110 transition-transform`}>
                                            <sol.icon className="w-7 h-7 text-white" />
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-black text-white/70">
                                            {sol.tag}
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <div className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-2">{sol.subtitle}</div>
                                        <h3 className="text-3xl font-black text-white mb-4 group-hover:text-emerald-400 transition-colors">{sol.title}</h3>
                                        <p className="text-slate-300 font-medium leading-relaxed">
                                            {sol.desc}
                                        </p>
                                    </div>

                                    <Link 
                                        href={sol.link}
                                        className="inline-flex items-center gap-3 bg-white/10 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black transition-all group/btn w-full justify-center backdrop-blur-xl border border-white/10 hover:border-transparent"
                                    >
                                        查看解決方案 
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
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
