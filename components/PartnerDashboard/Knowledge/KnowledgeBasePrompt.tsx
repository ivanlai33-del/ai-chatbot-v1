"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';

interface KnowledgeBasePromptProps {
    value: string;
    onChange: (val: string) => void;
    onSave: () => void;
    saving: boolean;
}

export default function KnowledgeBasePrompt({ value, onChange, onSave, saving }: KnowledgeBasePromptProps) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl p-8 xl:p-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight mb-2">Master Prompt 總編輯器</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Core Instruction & Personality</p>
                </div>
                <button 
                    onClick={onSave} 
                    disabled={saving} 
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/30"
                >
                    <Save className="w-4 h-4" />
                    {saving ? '儲存中...' : '存檔更新'}
                </button>
            </div>
            <div className="relative">
                <textarea
                    aria-label="Master Prompt 總編輯器"
                    value={value} 
                    onChange={(e) => onChange(e.target.value)} 
                    className="w-full h-[420px] bg-slate-900/50 border border-slate-700/50 rounded-3xl p-8 text-sm text-slate-300 font-mono leading-relaxed focus:outline-none focus:border-indigo-500/50 transition-all" 
                />
                <span className="absolute top-4 right-4 px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/20">Markdown 支援</span>
            </div>
        </motion.div>
    );
}
