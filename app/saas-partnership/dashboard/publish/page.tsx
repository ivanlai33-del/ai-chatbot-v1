"use client";

import React, { useState, useEffect } from 'react';
import { 
    Send, RefreshCw, CheckCircle2, AlertCircle, 
    Zap, Layout, Users, MessageSquare, 
    Bot, Globe, Cloud, ArrowRight, ShieldCheck,
    Play, Pause, History, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { usePartner } from '@/context/PartnerContext';

export default function NeuralSyncConsole() {
    const { activeOA } = usePartner();
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);

    const modules = [
        { id: 'menu', name: '圖文選單 (Rich Menu)', status: 'In Sync', lastSync: '10 min ago', icon: Layout, color: 'text-amber-500' },
        { id: 'journey', name: '行銷旅程 (Workflows)', status: 'Outdated', lastSync: '2 days ago', icon: Zap, color: 'text-orange-500' },
        { id: 'knowledge', name: '智庫 FAQ (Knowledge)', status: 'In Sync', lastSync: 'Just now', icon: Bot, color: 'text-purple-500' },
        { id: 'forms', name: '問卷表單 (LIFF Apps)', status: 'In Sync', lastSync: '1 hr ago', icon: Globe, color: 'text-blue-500' },
        { id: 'coupons', name: '優惠券系統 (Coupons)', status: 'Pending', lastSync: 'Never', icon: Send, color: 'text-rose-500' },
    ];

    const handleFullSync = () => {
        setIsSyncing(true);
        setSyncProgress(0);
        const interval = setInterval(() => {
            setSyncProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsSyncing(false);
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
    };

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-[#06C755] to-[#05A044] rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
                            <Terminal className="w-8 h-8" />
                        </div>
                        全域發布與同步中心
                    </h1>
                    <p className="mt-3 text-slate-500 font-medium">管理積木與 LINE 端點的同步狀態，執行一鍵全站部署。</p>
                </div>
                <button 
                    onClick={handleFullSync}
                    disabled={isSyncing}
                    className="px-8 py-4 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-2xl font-black text-sm flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                >
                    {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    一鍵全站同步 (Neural Sync)
                </button>
            </div>

            {/* Sync Progress Bar (Visible when syncing) */}
            <AnimatePresence>
                {isSyncing && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-white/60 backdrop-blur-xl border border-white p-8 rounded-[2.5rem] shadow-sm"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">正在同步神經連結... {syncProgress}%</span>
                            <RefreshCw className="w-4 h-4 text-[#06C755] animate-spin" />
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-[#06C755] to-[#05A044]" 
                                style={{ width: `${syncProgress}%` }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Module Sync Status */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[3rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-white/60 bg-white/40 flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">積木同步狀態 (Block Sync Status)</h3>
                            <button className="text-[10px] font-black text-slate-400 uppercase hover:text-slate-900">刷新全部</button>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {modules.map((m) => (
                                <div key={m.id} className="p-8 flex items-center gap-8 hover:bg-white/60 transition-all group">
                                    <div className={`w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center ${m.color} shadow-sm group-hover:scale-110 transition-transform`}>
                                        <m.icon className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-slate-900">{m.name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tight ${m.status === 'In Sync' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {m.status === 'In Sync' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                {m.status}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">上次同步: {m.lastSync}</span>
                                        </div>
                                    </div>
                                    <button className="px-6 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-900 hover:bg-[#06C755] hover:text-white transition-all">同步</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Neural Activity & Health */}
                <div className="space-y-6">
                    <section className="bg-emerald-950 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-emerald-950/20 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-[#06C755] opacity-20 blur-[60px]" />
                         <h3 className="text-lg font-black flex items-center gap-2 mb-8">
                            <ShieldCheck className="w-5 h-5 text-[#06C755]" /> 神經系統監控 (Health)
                         </h3>
                         
                         <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400">Webhook 連線狀態</span>
                                <span className="text-xs font-black text-[#06C755] flex items-center gap-1"><Play className="w-3 h-3 fill-[#06C755]" /> Connected</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400">API 呼叫剩餘額度</span>
                                <span className="text-xs font-black">98.5%</span>
                            </div>
                            <div className="pt-6 border-t border-white/10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">系統資源分配</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-bold"><span>AI 推理運算</span><span>32%</span></div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#06C755] w-[32%]" />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold"><span>資料庫吞吐</span><span>14%</span></div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[14%]" />
                                    </div>
                                </div>
                            </div>
                         </div>
                    </section>

                    <div className="bg-white/40 backdrop-blur-xl border border-white p-8 rounded-[2.5rem] shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <History className="w-5 h-5 text-slate-400" />
                            <h4 className="text-sm font-black text-slate-900">同步歷史紀錄</h4>
                        </div>
                        <div className="space-y-4">
                            {[
                                { action: '圖文選單同步完成', time: '10 min ago', status: 'Success' },
                                { action: '行銷旅程部署失敗', time: '2 days ago', status: 'Error' },
                            ].map((h, i) => (
                                <div key={i} className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-black text-slate-800">{h.action}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">{h.time}</p>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase ${h.status === 'Success' ? 'text-emerald-500' : 'text-rose-500'}`}>{h.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
