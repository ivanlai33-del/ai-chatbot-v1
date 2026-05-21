"use client";

import React, { useState } from 'react';
import { 
    Zap, Plus, Search, Filter, 
    ArrowRight, Play, Pause, Trash2,
    Settings, Globe, Users, Ticket,
    Bot, AlertCircle, Info, Save,
    MoreVertical, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NeuralScriptsPage() {
    const [scripts, setScripts] = useState([
        { id: 1, name: '競品反制反射', trigger: '競品發布 50% 優惠', action: '自動發送 8 折券至 VIP 客群', status: 'Active', color: 'text-rose-500' },
        { id: 2, name: 'VIP 流失保護', trigger: '14天未互動且等級為 VIP', action: '發送「好久不見」點數禮包', status: 'Active', color: 'text-amber-500' },
        { id: 3, name: '異常情緒轉真人', trigger: '對話偵測到「憤怒」或「投訴」', action: '建立高優先級客服工單並推播通知', status: 'Active', color: 'text-blue-500' },
        { id: 4, name: '深夜 AI 智庫接管', trigger: '22:00 - 08:00', action: '切換至「深度 AI 自助模式」', status: 'Paused', color: 'text-purple-500' },
    ]);

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                        <div className="p-3 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/20 text-white">
                            <Zap className="w-8 h-8" />
                        </div>
                        智慧自動化腳本中心
                    </h1>
                    <p className="mt-3 text-slate-500 font-medium">定義神經反射邏輯，讓 AI 店長在特定市場信號下自動執行應變措施。</p>
                </div>
                <button className="px-8 py-4 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-orange-500/20">
                    <Plus className="w-4 h-4" /> 建立新腳本
                </button>
            </div>

            {/* Script Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                    {scripts.map((script) => (
                        <motion.div 
                            key={script.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className={`p-3 bg-white rounded-xl shadow-sm border border-slate-100 ${script.color}`}>
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${script.status === 'Active' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                                        {script.status}
                                    </span>
                                    <button className="p-2 text-slate-300 hover:text-slate-600 transition-all"><MoreVertical className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <h3 className="text-xl font-black text-slate-900">{script.name}</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 flex flex-col items-center">
                                            <div className="w-2 h-2 rounded-full bg-slate-300" />
                                            <div className="w-0.5 h-8 bg-slate-100" />
                                            <div className="w-2 h-2 rounded-full bg-[#06C755]" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">IF TRIGGER</p>
                                                <p className="text-xs font-bold text-slate-700">{script.trigger}</p>
                                            </div>
                                            <div className="p-3 bg-emerald-50/30 rounded-xl border border-emerald-100">
                                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">THEN ACTION</p>
                                                <p className="text-xs font-black text-slate-900">{script.action}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center relative z-10">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400">AI</div>
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-indigo-400">BD</div>
                                </div>
                                <div className="flex gap-2">
                                    <button className={`p-3 rounded-xl transition-all shadow-sm ${script.status === 'Active' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                                        {script.status === 'Active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    </button>
                                    <button className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all shadow-sm">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Background Glow Decor */}
                            <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-5 blur-[40px] ${script.color.replace('text-', 'bg-')}`} />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Add New Placeholder */}
                <button className="bg-slate-100/30 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-slate-400 hover:bg-white hover:border-[#06C755]/30 hover:text-[#06C755] transition-all group min-h-[300px]">
                    <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-emerald-50 flex items-center justify-center mb-4 transition-all">
                        <Plus className="w-8 h-8" />
                    </div>
                    <p className="font-black uppercase tracking-widest text-xs">建立自定義自動化反射</p>
                </button>
            </div>
            
            {/* Pro Tip */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 blur-[80px]" />
                <div className="flex items-start gap-8 relative z-10">
                    <div className="p-4 bg-white/10 rounded-[2rem] border border-white/20">
                        <ShieldAlert className="w-10 h-10 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black mb-3 italic">「自動化反射」是規模化經營的秘訣。</h3>
                        <p className="text-sm text-indigo-100 leading-relaxed font-medium max-w-2xl">
                            當您的積木神經連通後，系統不再需要您手動介入每一項決策。透過腳本中心，您可以設定 AI 指揮官在特定情境下自動調動積木，實現真正的 **「24小時不打烊自動化營運」**。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
