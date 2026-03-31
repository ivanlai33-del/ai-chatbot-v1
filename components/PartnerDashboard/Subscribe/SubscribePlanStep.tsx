"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface Plan {
    id: string;
    name: string;
    title: string;
    price: string;
    description: string;
    slots: number;
    recommended?: boolean;
}

interface SubscribePlanStepProps {
    plans: Plan[];
    onPlanSelect: (plan: Plan) => void;
}

export default function SubscribePlanStep({
    plans,
    onPlanSelect
}: SubscribePlanStepProps) {
    return (
        <motion.div
            key="step-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-slate-300">選擇定價計畫</h2>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                    年付九折優惠
                </span>
            </div>
            <div className="grid grid-cols-1 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        onClick={() => onPlanSelect(plan)}
                        className={`relative p-8 rounded-[2rem] border ${plan.recommended ? 'border-indigo-500' : 'border-slate-700/50'} bg-slate-800/20 hover:bg-slate-800/40 transition-all cursor-pointer group`}
                    >
                        {plan.recommended && (
                            <div className="absolute -top-3 right-8 px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-500/30">
                                最受歡迎
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-black text-white mb-1 group-hover:text-indigo-400 transition-colors">{plan.title}</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{plan.name}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-white">{plan.price}</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">/ 月</div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 font-medium">{plan.description}</p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
