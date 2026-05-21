'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, AlertTriangle, CheckCircle, Trash2, Loader2, Sparkles, ArrowRight, User, Bot, HelpCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OwnerFeedbackView() {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            const lineId = localStorage.getItem('line_user_id');
            if (!lineId) return;
            try {
                const res = await fetch(`/api/console/feedback?userId=${lineId}`);
                const data = await res.json();
                if (data.success) {
                    setFeedbacks(data.feedbacks || []);
                }
            } catch (e) {
                console.error("Failed to fetch feedback", e);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-32">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-2xl shadow-amber-500/5">
                    <ShieldAlert className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-[0.2em]">上帝視角：問題處理流</h2>
                    <p className="text-[10px] text-slate-500 font-bold mt-1 tracking-widest uppercase">追蹤從客戶提問到 AI 指揮官解決的全過程</p>
                </div>
            </div>

            {/* Timeline Feed */}
            <div className="space-y-12 relative">
                {/* Timeline vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-slate-800 to-transparent" />

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50 ml-12">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">任務對齊中...</p>
                    </div>
                ) : feedbacks.length === 0 ? (
                    <div className="ml-20 py-20 opacity-30">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">目前沒有進行中的問題處理流</p>
                    </div>
                ) : (
                    feedbacks.map((item, idx) => (
                        <div key={item.id} className="relative pl-16 space-y-6 group">
                            {/* Status Dot */}
                            <div className="absolute left-5 top-2 w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] z-10" />

                            {/* 1. Original User Problem */}
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-slate-900/40 rounded-3xl border border-white/5 p-6 space-y-3 hover:bg-slate-900/60 transition-all shadow-xl"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                                            <User className="w-3 h-3 text-slate-500" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">步驟 01：客戶原始反饋 (Raw Input)</span>
                                    </div>
                                    <span className="text-[9px] text-slate-600 font-bold">{new Date(item.created_at).toLocaleTimeString()}</span>
                                </div>
                                <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 italic text-slate-200 text-sm leading-relaxed">
                                    「{item.content}」
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-500/10 rounded-lg border border-rose-500/20">
                                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                                        <span className="text-[9px] font-black text-rose-500 uppercase">P{item.priority || 3} 優先級</span>
                                    </div>
                                    <div className="px-2 py-1 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                        <span className="text-[9px] font-black text-indigo-400 uppercase">{item.category || '一般'}</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Transition Arrow */}
                            <div className="flex justify-center py-2 opacity-30">
                                <ArrowRight className="w-4 h-4 text-indigo-500 rotate-90" />
                            </div>

                            {/* 2. Backend Manager Action */}
                            <motion.div 
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-indigo-600/5 rounded-3xl border border-indigo-500/20 p-8 space-y-6 relative overflow-hidden group/card shadow-2xl"
                            >
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover/card:scale-150 transition-transform duration-1000" />
                                
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-4 ring-indigo-500/10 animate-pulse">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">步驟 02：後台店長執行決策 (Strategic Response)</span>
                                            <span className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Automated Intelligence Protocol 0.8.2</span>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 bg-emerald-500/20 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-tighter">診斷完成</div>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="p-5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                        <p className="text-[12px] text-slate-200 font-medium leading-relaxed">
                                            {item.smart_suggestion || "正在思考針對此問題的最佳解決方案..."}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 pt-2">
                                        <button className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            核准並執行建議方案
                                        </button>
                                        <button className="px-5 py-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl font-black text-[10px] uppercase transition-all border border-slate-700">
                                            手動修正
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Divider for next ticket */}
                            {idx !== feedbacks.length - 1 && (
                                <div className="py-12 flex justify-center opacity-10">
                                    <div className="h-px w-2/3 bg-white" />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
