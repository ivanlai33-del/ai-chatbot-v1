"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Save } from 'lucide-react';

interface ProvisionDeployStepProps {
    botName: string;
    onDeploy: () => void;
    onBack: () => void;
    isSubmitting: boolean;
}

export default function ProvisionDeployStep({
    botName,
    onDeploy,
    onBack,
    isSubmitting
}: ProvisionDeployStepProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <div className="p-8 rounded-[2rem] border border-indigo-500/30 bg-indigo-500/5 text-center">
                <BrainCircuit className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
                <h2 className="text-2xl font-black text-white mb-2">準備好喚醒 {botName} 了嗎？</h2>
                <p className="text-slate-400 text-sm font-medium mb-8">
                    點擊佈署後將扣除一個 Partner Slot，並即時寫入核心大腦資料至系統叢集。
                </p>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={onBack}
                        className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm transition-all"
                    >
                        返回修改
                    </button>
                    <button
                        onClick={onDeploy}
                        disabled={isSubmitting}
                        className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                佈署中...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" /> 正式上線
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
