'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageCircle, BarChart3, ShieldCheck, Zap, Globe } from 'lucide-react';

const features = [
    {
        title: '智慧語意大腦',
        desc: '搭載 GPT-4o 引擎，精準理解客戶意圖，不再出現罐核式死板回訊。',
        icon: Brain,
        color: 'text-purple-400',
        bg: 'bg-purple-400/10'
    },
    {
        title: 'RAG 深度學習',
        desc: '直接餵食 PDF 或 網頁連結，AI 秒變專業店員，對答如流。',
        icon: Zap,
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10'
    },
    {
        title: '24/7 自動導購',
        desc: '不遺漏任何午夜訂單，主動引導轉單，讓您的 LINE 變成超級業務。',
        icon: MessageCircle,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10'
    },
    {
        title: '數據分析洞察',
        desc: '完整追蹤客戶偏好與轉化率，透過數據科學精準獲取回頭客。',
        icon: BarChart3,
        color: 'text-amber-400',
        bg: 'bg-amber-400/10'
    },
    {
        title: '品牌 DNA 注入',
        desc: '自定義 AI 的講話口吻、表情符號，完美契合品牌視覺與形象。',
        icon: Globe,
        color: 'text-pink-400',
        bg: 'bg-pink-400/10'
    },
    {
        title: '企業級安全性',
        desc: '提供最高等級的資料加密，確保您的商業智庫與客戶資料滴水不漏。',
        icon: ShieldCheck,
        color: 'text-cyan-400',
        bg: 'bg-cyan-400/10'
    }
];

export default function LandingFeatures() {
    return (
        <section className="py-24 px-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-white mb-6"
                    >
                        地表最強 <span className="text-emerald-400">LINE AI</span> 解決方案
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 max-w-2xl mx-auto text-lg"
                    >
                        不只是客服，更是您的 24 小時金牌店長。一鍵串接，讓您的 LINE 官方帳號瞬間升級。
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-slate-800/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-colors group"
                        >
                            <div className={`${f.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <f.icon className={`w-7 h-7 ${f.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                {f.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />
        </section>
    );
}
