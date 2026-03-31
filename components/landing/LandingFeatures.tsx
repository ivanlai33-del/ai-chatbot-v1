'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageCircle, BarChart3, ShieldCheck, Zap, Globe } from 'lucide-react';

const features = [
    {
        title: '智慧語意大腦',
        desc: '搭載 GPT-4o 引擎，精準理解客戶意圖，不再出現罐核式死板回訊。',
        icon: Brain,
        color: 'text-white',
        bg: 'bg-purple-500 shadow-lg shadow-purple-500/30'
    },
    {
        title: 'RAG 深度學習',
        desc: '直接餵食 PDF 或 網頁連結，AI 秒變專業店員，對答如流。',
        icon: Zap,
        color: 'text-white',
        bg: 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
    },
    {
        title: '24/7 自動導購',
        desc: '不遺漏任何午夜訂單，主動引導轉單，讓您的 LINE 變成超級業務。',
        icon: MessageCircle,
        color: 'text-white',
        bg: 'bg-blue-500 shadow-lg shadow-blue-500/30'
    },
    {
        title: '數據分析洞察',
        desc: '完整追蹤客戶偏好與轉化率，透過數據科學精準獲取回頭客。',
        icon: BarChart3,
        color: 'text-white',
        bg: 'bg-amber-500 shadow-lg shadow-amber-500/30'
    },
    {
        title: '品牌 DNA 注入',
        desc: '自定義 AI 的講話口吻、表情符號，完美契合品牌視覺與形象。',
        icon: Globe,
        color: 'text-white',
        bg: 'bg-pink-500 shadow-lg shadow-pink-500/30'
    },
    {
        title: '企業級安全性',
        desc: '提供最高等級的資料加密，確保您的商業智庫與客戶資料滴水不漏。',
        icon: ShieldCheck,
        color: 'text-white',
        bg: 'bg-cyan-500 shadow-lg shadow-cyan-500/30'
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
                        className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
                    >
                        老闆最愛的 <span className="text-emerald-400">AI 智能店長</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-white max-w-2xl mx-auto text-xl font-bold drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] leading-relaxed tracking-wide"
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
                            className="bg-white/60 backdrop-blur-xl p-8 rounded-[24px] border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_15px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all group"
                        >
                            <div className={`${f.bg} w-16 h-16 rounded-[16px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <f.icon className={`w-8 h-8 ${f.color}`} />
                            </div>
                            <h3 className="text-[24px] font-black text-slate-800 mb-4 tracking-tight">{f.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">
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
