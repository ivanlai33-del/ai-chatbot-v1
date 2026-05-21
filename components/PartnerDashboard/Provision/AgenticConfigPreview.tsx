"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Zap, Sparkles, CheckCircle2, Box
} from 'lucide-react';

interface AgenticConfigPreviewProps {
    config: {
        name: string;
        industry: string;
        systemPrompt: string;
        features?: string[];
        initialFAQ: Array<{ q: string; a: string }>;
    } | null;
    onDeploy: () => void;
    isDeploying: boolean;
}

export default function AgenticConfigPreview({ config, onDeploy, isDeploying }: AgenticConfigPreviewProps) {
    if (!config) {
        return (
            <div className="bg-white/40 backdrop-blur-xl border border-white rounded-[2.5rem] p-10 text-center">
                <p className="text-slate-400 font-bold">請在右側輸入需求，由 AI 為您規劃配置...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="bg-white/40 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 md:p-10 shadow-sm">
                {/* Identity Block */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-[#06C755]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">身分積木 (Identity)</span>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-1">{config.name}</h4>
                    <p className="text-xs font-bold text-[#06C755] uppercase mb-3">{config.industry}</p>
                    <p className="text-xs text-slate-500 leading-relaxed italic line-clamp-2">「{config.systemPrompt}」</p>
                </div>

                {/* FAQ Preview */}
                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <Box className="w-4 h-4 text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">預計產生問答</span>
                    </div>
                    {config.initialFAQ.slice(0, 2).map((f, i) => (
                        <div key={i} className="p-4 bg-white/60 rounded-2xl border border-white text-[11px] text-slate-500">
                            <p className="font-black text-slate-700 mb-1">Q: {f.q}</p>
                            <p className="line-clamp-2 opacity-70">A: {f.a}</p>
                        </div>
                    ))}
                    {config.initialFAQ.length > 2 && (
                        <p className="text-[9px] text-slate-400 italic text-center">...以及另外 {config.initialFAQ.length - 2} 組自動生成的問答</p>
                    )}
                </div>

                {/* Deploy Button */}
                <button
                    onClick={onDeploy}
                    disabled={isDeploying}
                    className="w-full py-5 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-[#06C755]/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                >
                    {isDeploying ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            正在開通積木...
                        </>
                    ) : (
                        <>
                            <Zap className="w-5 h-5 fill-white" /> 
                            確認並一鍵開通積木
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
}
