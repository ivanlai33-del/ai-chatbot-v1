"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, MessageCircle, Users, Clock, CalendarClock } from 'lucide-react';

interface KnowledgeReportProps {
    report: any;
    loading: boolean;
    onFetch: () => void;
}

export default function KnowledgeReport({ report, loading, onFetch }: KnowledgeReportProps) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight">月報分析</h3>
                            <p className="text-slate-500 text-xs font-bold">本月 AI 店長工作成果數據</p>
                        </div>
                    </div>
                    <button 
                        onClick={onFetch} 
                        disabled={loading} 
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-600/20"
                    >
                        <TrendingUp className="w-4 h-4" />
                        {loading ? '載入中...' : '載入本月報表'}
                    </button>
                </div>

                {report && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* Stats cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: '總對話則數', value: report.stats.total_messages, icon: MessageCircle, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                                { label: '互動用戶數', value: report.stats.unique_users, icon: Users, color: 'text-sky-400', bg: 'bg-sky-500/10' },
                                { label: 'AI 回覆次數', value: report.stats.ai_replies, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                                { label: '預約詢問', value: report.stats.reservations_captured, icon: CalendarClock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                            ].map((card, i) => (
                                <div key={i} className="bg-slate-900/40 rounded-2xl border border-slate-700/50 p-5">
                                    <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                                        <card.icon className={`w-4 h-4 ${card.color}`} />
                                    </div>
                                    <p className="text-2xl font-black text-white">{card.value ?? 0}</p>
                                    <p className="text-xs text-slate-500 font-bold mt-1">{card.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Top keywords */}
                        {report.top_keywords?.length > 0 && (
                            <div className="bg-slate-900/40 rounded-2xl border border-slate-700/50 p-6">
                                <h4 className="text-sm font-black text-slate-300 mb-4 uppercase tracking-widest">🔍 客人最常提到的關鍵字</h4>
                                <div className="flex flex-wrap gap-3">
                                    {report.top_keywords.map((kw: any, i: number) => (
                                        <div key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl border border-slate-700/50">
                                            <span className="text-sm font-black text-white">{kw.word}</span>
                                            <span className="text-xs font-black text-indigo-400">{kw.count} 次</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {!report && !loading && (
                    <div className="text-center py-12 text-slate-500">
                        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-bold text-sm">點擊「載入本月報表」查看數據</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
