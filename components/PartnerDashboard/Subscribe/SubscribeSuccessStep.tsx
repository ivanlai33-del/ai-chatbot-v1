"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, ArrowRight } from 'lucide-react';

interface SubscribeSuccessStepProps {
    token: string;
    onReturnToDashboard: () => void;
}

export default function SubscribeSuccessStep({
    token,
    onReturnToDashboard
}: SubscribeSuccessStepProps) {
    return (
        <motion.div
            key="step-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
        >
            <div className="p-10 rounded-[2.5rem] border border-emerald-500/30 bg-emerald-500/5 text-center">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 outline-none" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">開通成功！歡迎加入生態系</h2>
                <p className="text-slate-400 text-sm font-medium mb-8">
                    系統已為您核發專屬的 Partner Token，請交由您的工程團隊進行 API 串接。
                </p>

                <div className="max-w-md mx-auto relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 rounded-2xl blur-xl transition-all group-hover:blur-2xl" />
                    <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
                        <code className="text-sm font-mono text-emerald-300 truncate pr-4">
                            {token}
                        </code>
                        <button 
                            title="複製憑證"
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                            onClick={() => {
                                navigator.clipboard.writeText(token);
                                alert("已複製到剪貼簿！");
                            }}
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-3 text-center mb-6">Your High-Privilege Partner Token</p>

                    <button
                        onClick={onReturnToDashboard}
                        className="w-full mt-4 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 group"
                    >
                        進入總部管理後台
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
