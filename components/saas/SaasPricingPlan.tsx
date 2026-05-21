'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { SAAS_PLANS, SaaSPlan } from '@/config/saas_config';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
} as const;

interface SaasPricingPlanProps {
    onPurchase: (plan: SaaSPlan) => void;
}

export default function SaasPricingPlan({ onPurchase }: SaasPricingPlanProps) {
    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="pt-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white">選擇授權規模</h2>
                    <p className="text-sm text-slate-400 mt-2 font-medium">專為開發者準備的定價級距。年付全方案享九折優惠，企業客製化請透過顧問安排。</p>
                </div>
                <div className="inline-flex items-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-black uppercase tracking-widest shrink-0">
                    ✨ 已含工程顧問支援
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SAAS_PLANS.map((p) => (
                    <motion.div
                        key={p.name}
                        variants={itemVariants}
                        className={`relative p-8 rounded-[2.5rem] border flex flex-col h-full overflow-hidden transition-all duration-300 ${p.popular ? 'bg-slate-800/80 border-emerald-500/50 shadow-[0_20px_60px_rgba(16,185,129,0.15)] scale-100 hover:scale-[1.02]' : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600'}`}
                    >
                        {p.popular && (
                            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 to-emerald-400"></div>
                        )}
                        <div className="mb-6">
                            {p.popular && <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">推廣主力</span>}
                            <h3 className="text-xl font-black text-white mb-2">{p.name}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">{p.desc}</p>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-baseline gap-2">
                                {p.price !== '專案報價' && <span className="text-[13px] font-black text-slate-500 uppercase">NT$</span>}
                                <span className="text-4xl font-black text-white tracking-tight">{p.price}</span>
                                {p.price !== '專案報價' && <span className="text-sm font-medium text-slate-500">/ mo</span>}
                            </div>
                        </div>

                        <ul className="space-y-4 mb-10 flex-1">
                            {p.features.map((f, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-300 leading-relaxed">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    </div>
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => onPurchase(p)}
                            className={`w-full py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${p.popular ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-700/50 hover:bg-slate-700 text-slate-200'}`}
                        >
                            立即登入並開通授權
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
