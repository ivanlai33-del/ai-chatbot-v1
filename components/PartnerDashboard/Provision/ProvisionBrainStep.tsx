"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface Template {
    id: string;
    name: string;
    desc: string;
    prompt: string;
}

interface ProvisionBrainStepProps {
    templates: Template[];
    industry: string;
    systemPrompt: string;
    onTemplateSelect: (id: string, prompt: string) => void;
    onPromptChange: (prompt: string) => void;
    onNext: () => void;
    onBack: () => void;
    onFocus?: (field: string) => void;
    onBlur?: () => void;
}

export default function ProvisionBrainStep({
    templates,
    industry,
    systemPrompt,
    onTemplateSelect,
    onPromptChange,
    onNext,
    onBack,
    onFocus,
    onBlur
}: ProvisionBrainStepProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">套用產業範本 (Master Prompt)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {templates.map(t => (
                        <div
                            key={t.id}
                            onClick={() => onTemplateSelect(t.id, t.prompt)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${industry === t.id ? 'bg-indigo-500/20 border-indigo-500' : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-500'}`}
                        >
                            <h4 className={`font-bold mb-1 ${industry === t.id ? 'text-indigo-400' : 'text-slate-300'}`}>{t.name}</h4>
                            <p className="text-xs text-slate-500">{t.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">微調機器人核心指令 (System Prompt)</label>
                <textarea
                    rows={5}
                    value={systemPrompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    onFocus={() => onFocus?.('systemPrompt')}
                    onBlur={onBlur}
                    className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors custom-scrollbar"
                    placeholder="請選擇範本或自行輸入指令..."
                />
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm transition-all"
                >
                    上一步
                </button>
                <button
                    onClick={onNext}
                    disabled={!industry || !systemPrompt}
                    className="flex-1 md:flex-none px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                    下一步：佈署上線 <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
