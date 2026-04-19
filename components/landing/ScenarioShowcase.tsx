'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Moon, BookOpen, Tag } from 'lucide-react';
import Image from 'next/image';

const scenarios = [
    {
        title: '半夜湧入的詢問量\n(零售/餐飲)',
        desc: '模擬 AI 在凌晨 3 點自動回覆店內詳細資訊與常見問題，解決老闆休息時間漏單的痛點。確保每一位深夜訪客都能得到即時回饋。',
        image: '/sv-001.jpg'
    },
    {
        title: '專業知識秒讀\n(美業/各種專業)',
        desc: '透過 PDF 教材、價目表或官網資料學習，精準回答顧客關於療程細節、成分或專業注意事項，化身無所不知的數位店長。',
        image: '/sv-002.jpg'
    },
    {
        title: '客戶意圖自動標籤\n(CRM)',
        desc: '在對話中自動辨識客戶意圖（如：詢價中、預約需求、售後諮詢），並自動更新標籤於 CRM 系統，大幅減少後續人工整理時間。',
        image: '/sv-003.jpg'
    }
];

export default function ScenarioShowcase() {
    return (
        <section className="py-24 px-6 relative overflow-hidden bg-slate-950/40 border-t border-white/5">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black text-white mb-6"
                    >
                        情境模擬：<span className="text-emerald-400">AI 智能店改進化的日常</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 text-lg font-bold max-w-2xl mx-auto"
                    >
                        基於實際可提供之 AI 智庫與 CRM 技術進行場景設計
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {scenarios.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex flex-col rounded-[32px] bg-slate-900/60 border border-white/10 overflow-hidden backdrop-blur-xl group hover:border-emerald-500/30 transition-all shadow-2xl"
                        >
                            {/* Image Container (3:4 Ratio) */}
                            <div className="relative aspect-[3/4] overflow-hidden">
                                <Image
                                    src={s.image}
                                    alt={`AI 智能店長應用情境：${s.title.replace('\n', ' ')}`}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                            </div>

                            {/* Content Container */}
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-xl font-black text-white mb-4 leading-tight whitespace-pre-line group-hover:text-emerald-400 transition-colors">
                                    {s.title}
                                </h3>
                                <p className="text-slate-300 text-sm leading-relaxed font-medium">
                                    {s.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
