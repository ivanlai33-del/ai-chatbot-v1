'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageCircle, BarChart3, ShieldCheck, Zap, Globe } from 'lucide-react';

const features = [
    {
        title: '智慧語意大腦',
        desc: '搭載最新 GPT-4o 引擎，精準拆解客戶語法中的隱含意圖。無論諮詢多複雜，AI 都能以極其自然且富有溫度的人類語感回覆，徹底擺脫傳統機器人的僵硬感。',
        icon: Brain,
        color: 'text-white',
        bg: 'bg-purple-500 shadow-lg shadow-purple-500/30'
    },
    {
        title: 'RAG 深度學習',
        desc: '支持一鍵匯入 PDF 文件、官網連結或 CRM 資料。系統會將龐雜的產品手冊自動轉化為結構化的 AI 記憶庫，讓店長在 10 秒內掌握所有細節，化身無所不知的銷售專家。',
        icon: Zap,
        color: 'text-white',
        bg: 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
    },
    {
        title: '24/7 自動導購',
        desc: '透過智慧引導腳本與個性化互動，在深夜時分也能精覽捕獲潛在訂單。系統會主動發起購物邀約並追蹤轉換進度，將您的 LINE 官方帳號轉型為一台 365 天永不待機的自動成交機器。',
        icon: MessageCircle,
        color: 'text-white',
        bg: 'bg-blue-500 shadow-lg shadow-blue-500/30'
    },
    {
        title: '數據分析洞察',
        desc: '深入追蹤每一場對話後的轉換細節。透過 AI 對用戶標籤的自動分類，您可以清晰看見客戶群像與熱門諮詢痛點，用最科學的數據導向佈讀行銷策略，穩健推升品牌營收。',
        icon: BarChart3,
        color: 'text-white',
        bg: 'bg-amber-500 shadow-lg shadow-amber-500/30'
    },
    {
        title: '品牌 DNA 注入',
        desc: '從親切問候到專業回覆，皆可由您親自調教 AI 的語言風格與特殊表情符號。讓機器人的對談內容完美咬合您的品牌調性，與客戶建立起難以取代的品牌忠誠度與深度連結。',
        icon: Globe,
        color: 'text-white',
        bg: 'bg-pink-500 shadow-lg shadow-pink-500/30'
    },
    {
        title: '企業級安全性',
        desc: '採用銀行等級的 SSL 傳輸加密與多重防火牆隔離機制，嚴密護衛您的專業知識庫與顧客敏感個資。我們承諾數據定期銷毀，讓您在數位轉型的路上毫無後顧之憂，穩步經營每一筆生意。',
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
