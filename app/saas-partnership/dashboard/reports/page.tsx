"use client";

import React, { useState, useEffect } from 'react';
import { 
    BarChart3, TrendingUp, Users, 
    MousePointer2, Clock, Calendar,
    ChevronDown, Download, Sparkles,
    DollarSign, MessageSquare, Zap,
    ArrowUpRight, ArrowDownRight, Info,
    Cloud, Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { usePartner } from '@/context/PartnerContext';

export default function ReportsPage() {
    const { activeOA } = usePartner();
    const [period, setPeriod] = useState('This Month');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, we would fetch aggregated stats here
        setTimeout(() => setLoading(false), 800);
    }, [activeOA]);

    const stats = [
        { label: '預估總營收', value: 'NT$ 1,248,000', trend: '+18.2%', up: true, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: '新進好友數', value: '2,842', trend: '+12.5%', up: true, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: '訊息轉換率', value: '14.8%', trend: '-2.1%', up: false, icon: MousePointer2, color: 'text-rose-500', bg: 'bg-rose-50' },
        { label: 'AI 節省工時', value: '328 hr', trend: '+42%', up: true, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12 pb-40">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-[#06C755] to-[#05A044] rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
                            <Cloud className="w-8 h-8" />
                        </div>
                        營運數據報表中心
                    </h1>
                    <p className="mt-3 text-slate-500 font-medium">全方位洞察 AGI 指揮官的執行成效、獲客轉換與營收趨勢。</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <button className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-black text-slate-600 flex items-center gap-3 shadow-sm hover:bg-slate-50 transition-all">
                            <Calendar className="w-4 h-4" />
                            {period}
                            <ChevronDown className="w-4 h-4 text-slate-300" />
                        </button>
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-2xl text-xs font-black flex items-center gap-3 shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all">
                        <Plus className="w-4 h-4" /> 產生自定義報表
                    </button>
                </div>
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 shadow-sm group hover:scale-[1.02] transition-all"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 ${s.bg} ${s.color} rounded-2xl shadow-sm group-hover:rotate-12 transition-transform`}>
                                <s.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black ${s.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {s.trend}
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <h4 className="text-2xl font-black text-slate-900">{s.value}</h4>
                    </motion.div>
                ))}
            </div>

            {/* Main Charts Simulation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue & Growth Trend */}
                <section className="lg:col-span-2 bg-white/40 backdrop-blur-3xl border border-white rounded-[3rem] p-10 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-600" /> 營收與轉換成長曲線
                            </h3>
                            <p className="text-xs text-slate-400 font-bold mt-1 tracking-tight">自動彙整所有行銷任務與優惠券核銷金額。</p>
                        </div>
                    </div>
                    
                    {/* Visual Chart Placeholder */}
                    <div className="h-80 flex items-end gap-3 px-2">
                        {[40, 55, 30, 85, 60, 95, 80, 110, 90, 120, 140, 160].map((h, i) => (
                            <div key={i} className="flex-1 group relative">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(h/160)*100}%` }}
                                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl opacity-20 group-hover:opacity-100 transition-all cursor-pointer"
                                />
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl">
                                    NT$ {h*10}k
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                        <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
                    </div>
                </section>

                {/* Interaction Quality Radar */}
                <section className="bg-emerald-950 rounded-[3rem] p-10 text-white shadow-2xl shadow-emerald-950/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600 opacity-20 blur-[60px]" />
                    <h3 className="text-lg font-black flex items-center gap-2 mb-8 relative z-10">
                        <Sparkles className="w-5 h-5 text-amber-400" /> AI 店長執行效能
                    </h3>
                    
                    <div className="space-y-8 relative z-10">
                        {[
                            { label: '語意理解準確度', value: 96 },
                            { label: '平均響應速度 (s)', value: 1.2, max: 5, inverse: true },
                            { label: '自動化解決率', value: 84 },
                        ].map((metric, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                                    <span>{metric.label}</span>
                                    <span>{metric.value}{metric.max ? '' : '%'}</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${metric.max ? (metric.value/metric.max)*100 : metric.value}%` }}
                                        className="h-full bg-indigo-500 rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                        
                        <div className="pt-8 mt-8 border-t border-white/10">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-[#06C755]/10 text-[#06C755] rounded-xl">
                                    <Info className="w-4 h-4" />
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed font-bold italic">
                                    「本週 AI 已成功攔截並解決了 **842** 件重複性問題，為您的真人客服省下了近 **120 小時** 的回覆成本。」
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
