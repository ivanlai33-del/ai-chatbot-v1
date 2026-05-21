"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, LayoutDashboard } from 'lucide-react';

interface ProvisionSuccessStepProps {
    botName: string;
    onReturnToDashboard: () => void;
}

export default function ProvisionSuccessStep({
    botName,
    onReturnToDashboard
}: ProvisionSuccessStepProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
        >
            <div className="p-10 rounded-[2.5rem] border border-emerald-500/30 bg-emerald-500/5 text-center relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 outline-none" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2 relative z-10">佈署完畢！大腦已啟動</h2>
                <p className="text-slate-400 text-sm font-medium mb-8 relative z-10">
                    右側的對話視窗已經直接連線到 **{botName}**。<br />
                    現在，您可以扮演顧客，直接在右邊測試聊天了！
                </p>

                <button
                    onClick={onReturnToDashboard}
                    className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 mx-auto relative z-10"
                >
                    <LayoutDashboard className="w-4 h-4" /> 返回合作夥伴儀表板
                </button>
            </div>
        </motion.div>
    );
}
