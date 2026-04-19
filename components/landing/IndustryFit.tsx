'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShoppingBag, UtensilsCrossed, User } from 'lucide-react';

const industries = [
    {
        title: '美容工作室',
        desc: '療程介紹、價目表查詢、自動引導預約時段，讓老師專心服務現場客人。',
        icon: Sparkles,
        color: 'from-pink-500/20 to-rose-500/20',
        iconColor: 'text-pink-400'
    },
    {
        title: '零售品牌',
        desc: '尺寸建議、庫存查詢、出貨進度與退換貨說明，24 小時導購不漏單。',
        icon: ShoppingBag,
        color: 'from-blue-500/20 to-indigo-500/20',
        iconColor: 'text-blue-400'
    },
    {
        title: '餐飲／預約服務',
        desc: '營業時間、菜單內容、訂位方式引導，尖峰時段不再擔心漏接 LINE 詢問。',
        icon: UtensilsCrossed,
        color: 'from-orange-500/20 to-amber-500/20',
        iconColor: 'text-amber-400'
    },
    {
        title: '個人商家／課程',
        desc: '常見 FAQ 自動回答、引導報名流程，一個人也能維持超高回覆效率。',
        icon: User,
        color: 'from-emerald-500/20 to-teal-500/20',
        iconColor: 'text-emerald-400'
    }
];

export default function IndustryFit() {
    return (
        <section className="py-24 px-6 relative overflow-hidden bg-slate-900/40 backdrop-blur-xl border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <motion.div 
                    initial={{ opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div
                        className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-4"
                    >
                        Target Audience
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                        AI 智能店長，適不適合我的店家？
                    </h2>
                    <p className="text-slate-200 text-lg font-bold max-w-2xl mx-auto drop-shadow-sm">
                        不論您的產業規模，只要您 在 LINE 官方帳號經營上遇到重複問答的痛點，這就是為您設計的解決方案。
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {industries.map((ind, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 1, y: 0 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 rounded-[32px] bg-slate-900/90 border border-white/20 backdrop-blur-xl group hover:border-emerald-500/30 transition-all flex flex-col items-center text-center shadow-lg relative z-10"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${ind.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform backdrop-blur-md`}>
                                <ind.icon className={`w-8 h-8 ${ind.iconColor}`} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">{ind.title}</h3>
                            <p className="text-slate-200 leading-relaxed font-black text-sm">
                                {ind.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
