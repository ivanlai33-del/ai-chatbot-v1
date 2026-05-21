'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageCircle, BarChart3, ShieldCheck, Zap, Globe } from 'lucide-react';

const features = [
    {
        title: '智慧語意大腦',
        desc: '搭載 GPT-4o 引擎，精準理解顧客意圖。平均縮短 60% 客服回覆時間，讓您告別僵硬的關鍵字回覆。',
        icon: Brain,
        color: 'text-white',
        bg: 'bg-purple-500 shadow-lg shadow-purple-500/30'
    },
    {
        title: '商家知識庫學習',
        desc: 'AI 讀透您的官網與 PDF (RAG 技術)。10 秒掌握所有產品細節，化身 24 小時不休息的專業銷售。',
        icon: Zap,
        color: 'text-white',
        bg: 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
    },
    {
        title: '24/7 自動導購',
        desc: '夜間詢問回覆率 100%。AI 主動引導下單與追蹤，將 LINE 變成 365 天永不收攤的自動成交機器。',
        icon: MessageCircle,
        color: 'text-white',
        bg: 'bg-blue-500 shadow-lg shadow-blue-500/30'
    },
    {
        title: '數據分析洞察',
        desc: '自動將客戶打標籤與分類。清晰看見顧客熱門痛點，用科學數據優化行銷策略，穩健提升營收。',
        icon: BarChart3,
        color: 'text-white',
        bg: 'bg-amber-500 shadow-lg shadow-amber-500/30'
    },
    {
        title: '品牌 DNA 注入',
        desc: '親自調教 AI 的說話語氣與表情符號。完美呈現品牌獨特調性，讓機器人對談也像真人般溫暖。',
        icon: Globe,
        color: 'text-white',
        bg: 'bg-pink-500 shadow-lg shadow-pink-500/30'
    },
    {
        title: '企業級安全性',
        desc: '銀行級 SSL 加密機制，嚴密護衛知識庫與顧客個資。讓您在數位轉型路上毫無後顧之憂。',
        icon: ShieldCheck,
        color: 'text-white',
        bg: 'bg-cyan-500 shadow-lg shadow-cyan-500/30'
    }
];

export default function LandingFeatures() {
    return (
        <section className="py-32 px-6 relative overflow-hidden z-20">
            {/* 🌌 Background Atmosphere for the dark theme */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-emerald-500/10 rounded-full blur-[150px] -z-10" />
            
            <div className="max-w-7xl mx-auto relative z-30">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6"
                    >
                        Core Advantages
                    </motion.div>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter"
                    >
                        老闆最愛的 <span className="text-emerald-400">AI 智能店長</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-200 max-w-2xl mx-auto text-xl font-bold leading-relaxed tracking-wide"
                    >
                        不只是客服，更是您的 24 小時金牌店長。一鍵串接，讓您的 LINE 官方帳號瞬間升級。
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ 
                                duration: 0.8, 
                                delay: i * 0.15, 
                                ease: [0.16, 1, 0.3, 1] 
                            }}
                            whileHover={{ y: -12, scale: 1.02, transition: { duration: 0.3 } }}
                            className="p-10 rounded-[48px] bg-white/50 backdrop-blur-lg border-[3px] border-white/40 shadow-[0_25px_50px_rgba(0,0,0,0.3)] transition-all group overflow-hidden relative"
                        >
                            {/* ✨ Hover Light Reflection Effect */}
                            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                            
                            <div className={`${f.bg} w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 shadow-lg ring-4 ring-white/30`}>
                                <f.icon className={`w-8 h-8 ${f.color}`} />
                            </div>
                            
                            <h3 className="text-[26px] font-black text-slate-900 mb-5 tracking-tight group-hover:text-emerald-700 transition-colors">
                                {f.title}
                            </h3>
                            <p className="text-slate-700 leading-relaxed font-black text-base">
                                {f.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
