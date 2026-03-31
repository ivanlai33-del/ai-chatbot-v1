"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowRight } from 'lucide-react';

interface ProvisionIdentityStepProps {
    name: string;
    onNameChange: (name: string) => void;
    onNext: () => void;
    onFocus?: (field: string) => void;
    onBlur?: () => void;
}

export default function ProvisionIdentityStep({
    name,
    onNameChange,
    onNext,
    onFocus,
    onBlur
}: ProvisionIdentityStepProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">實體分店 / 品牌名稱</label>
                <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="例如：Oasis Yoga 忠孝旗艦店"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        onFocus={() => onFocus?.('botName')}
                        onBlur={onBlur}
                        className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                </div>
                <p className="text-xs text-slate-500 mt-2">這將會是顯示在終端消費者面前的 LINE 官方帳號名稱。</p>
            </div>

            <button
                onClick={onNext}
                disabled={!name}
                className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
                下一步：大腦設定 <ArrowRight className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
