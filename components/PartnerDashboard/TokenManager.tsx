"use client";

import React, { useState } from 'react';
import { Key, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface TokenManagerProps {
    apiKey: string;
    loading?: boolean;
}

export default function TokenManager({ apiKey, loading }: TokenManagerProps) {
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Key className="w-32 h-32 text-indigo-400" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                        <Key className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white tracking-tight">Partner API Token</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">用於全程式化管理您的機器人席次</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <div className="w-full p-5 bg-slate-950/50 border border-slate-800 rounded-2xl font-mono text-sm text-slate-300 pr-24 overflow-hidden text-ellipsis">
                            {loading ? 'Fetching token...' : (showKey ? apiKey : '••••••••••••••••••••••••••••••••')}
                        </div>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
                            >
                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={handleCopy}
                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <p className="text-[11px] text-amber-500/70 font-medium flex items-center gap-2">
                        <span className="w-1 h-1 bg-amber-500/70 rounded-full" />
                        請妥善保管此 Token，切勿將其洩露於客戶端代碼中。
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
