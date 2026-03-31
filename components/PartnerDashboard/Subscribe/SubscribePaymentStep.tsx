"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, CreditCard } from 'lucide-react';

interface SubscribePaymentStepProps {
    planTitle: string;
    planPrice: string;
    onCheckout: () => void;
    isSubmitting: boolean;
}

export default function SubscribePaymentStep({
    planTitle,
    planPrice,
    onCheckout,
    isSubmitting
}: SubscribePaymentStepProps) {
    return (
        <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
        >
            <div className="flex items-center gap-4 text-sm font-bold border-b border-slate-700/50 pb-6">
                <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                    品牌基本資料
                </div>
                <div className="w-12 h-px bg-slate-700"></div>
                <div className="flex items-center gap-2 text-indigo-400">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">2</span>
                    支付與開通
                </div>
            </div>

            <div className="p-8 rounded-[2rem] border border-indigo-500/30 bg-indigo-500/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">已選擇：{planTitle}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-white">{planPrice}</h3>
                            <span className="text-sm text-slate-500">/ mo</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onCheckout}
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            處理中...
                        </>
                    ) : '立即付款開通'}
                </button>
            </div>
        </motion.div>
    );
}
