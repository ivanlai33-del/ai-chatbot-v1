'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Moon, BookOpen, Tag, CheckCircle2 } from 'lucide-react';

const scenarios = [
    {
        icon: Moon,
        title: '場景 A：半夜湧入的詢問量 (零售/餐飲)',
        desc: '模擬 AI 在凌晨 3 點自動回覆店內詳細資訊與常見問題，解決老闆休息時間漏單的痛點。確保每一位深夜訪客都能得到即時回饋。',
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10'
    },
    {
        icon: BookOpen,
        title: '場景 B：專業知識秒讀 (美容/診所)',
        desc: '透過 PDF 教材、價目表或官網資料學習，精準回答顧客關於療程細節、成分或專業注意事項，化身無所不知的數位店長。',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10'
    },
    {
        icon: Tag,
        title: '場景 C：客戶意圖自動標籤 (CRM)',
        desc: '在對話中自動辨識客戶意圖（如：詢價中、預約需求、售後諮詢），並自動更新標籤於 CRM 系統，大幅減少後續人工整理時間。',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10'
    }
];

export default function TrustSignals() {
    return (
        <section className="py-24 px-6 relative z-20 overflow-hidden bg-slate-950/95 backdrop-blur-3xl border-y border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <div className="max-w-7xl mx-auto">
                <motion.div 
                    initial={{ opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
                        情境模擬：<span className="text-emerald-400">AI 智能店改進化的日常</span>
                    </h2>
                    <p className="text-white text-lg font-bold drop-shadow-md">基於實際可提供之 AI 智庫與 CRM 技術進行場景設計</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {scenarios.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 1, y: 0 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 rounded-[32px] bg-slate-900/90 border border-white/20 backdrop-blur-xl hover:border-emerald-500/30 transition-all group shadow-2xl relative z-10"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center mb-6 border border-white/10 backdrop-blur-md`}>
                                <s.icon className={`w-7 h-7 ${s.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4 tracking-tight group-hover:text-emerald-400 transition-colors">
                                {s.title}
                            </h3>
                            <p className="text-slate-200 leading-relaxed font-bold">
                                {s.desc}
                            </p>
                            <div className="mt-6 flex items-center gap-2 text-[11px] font-black text-emerald-500/50 uppercase tracking-widest">
                                <CheckCircle2 className="w-3 h-3" />
                                Feature Verified and Ready
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
