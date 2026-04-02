'use client';

import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, Store, ChevronDown, MessageSquare, UserPlus, AlertCircle, Loader2, LogOut, CreditCard, Crown, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConsoleHeaderProps {
    activeTabLabel?: string;
    viewMode: 'platform' | 'personal';
    setViewMode: (mode: 'platform' | 'personal') => void;
    lineUserName?: string;
    planLevel: number;
    billingCycle?: 'monthly' | 'yearly';
    onLogout: () => void;
}

export default function ConsoleHeader({ 
    activeTabLabel, 
    viewMode, 
    setViewMode,
    lineUserName,
    planLevel,
    billingCycle = 'monthly',
    onLogout
}: ConsoleHeaderProps) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const getPlanLabel = (level: number) => {
        if (level === 2) return { name: "公司強力店長版", color: "bg-amber-100 text-amber-700" };
        if (level === 1) return { name: "個人店長版 Lite", color: "bg-indigo-100 text-indigo-700" };
        return { name: "普通會員", color: "bg-emerald-50 text-emerald-600" };
    };

    const currentPlan = getPlanLabel(planLevel);

    const copyToClipboard = (text: string) => {
        if (text) {
            navigator.clipboard.writeText(text);
            alert('已複製 ID！');
        }
    };

    const fetchNotifications = async () => {
        const lineId = localStorage.getItem('line_user_id');
        if (!lineId) return;

        try {
            const res = await fetch(`/api/console/notifications?userId=${lineId}`);
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications || []);
            }
        } catch (e) {
            console.error("Failed to fetch notifications", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="h-16 border-b border-slate-700/50 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-between px-8 z-50 shrink-0">
            <div className="flex items-center gap-6">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">
                    {activeTabLabel}
                </h2>
                
                {/* Admin-only View Switcher */}
                <div className="flex items-center gap-1 p-1 bg-slate-900/60 rounded-xl border border-slate-700/40 scale-90 origin-left">
                    <button 
                        onClick={() => setViewMode('platform')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            viewMode === 'platform' ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <ShieldCheck className="w-3 h-3" /> 平台營運
                    </button>
                    <button 
                        onClick={() => setViewMode('personal')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            viewMode === 'personal' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <Store className="w-3 h-3" /> 五位店長
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        System: Stable
                    </div>
                </div>

                {/* Real Notification Bell */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button 
                            onClick={() => setIsOpen(!isOpen)}
                            className="relative p-2 rounded-xl bg-slate-900/50 hover:bg-slate-800 transition-all border border-slate-700/50 group"
                        >
                            <Bell className={`w-5 h-5 transition-colors ${notifications.length > 0 ? 'text-indigo-400 animate-[wiggle_1s_infinite]' : 'text-slate-500 group-hover:text-white'}`} />
                            {notifications.length > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border-2 border-[#0f172a] rounded-full shadow-lg shadow-rose-500/50" />
                            )}
                        </button>

                        <AnimatePresence>
                            {isOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 w-[320px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-[100]"
                                >
                                    <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">即時營運通知</span>
                                        <span className="text-[8px] font-bold text-slate-500 uppercase">{notifications.length} 則未讀</span>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {loading ? (
                                            <div className="flex items-center justify-center py-10">
                                                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div className="py-12 text-center">
                                                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">目前沒有新消息</p>
                                            </div>
                                        ) : (
                                            notifications.map((n, i) => (
                                                <div key={i} className="p-4 border-b border-slate-800/50 hover:bg-white/5 transition-all cursor-pointer group">
                                                    <div className="flex gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                            n.type === 'lead' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'
                                                        }`}>
                                                            {n.type === 'lead' ? <UserPlus className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[11px] font-black text-slate-200 group-hover:text-indigo-400 transition-colors">{n.title}</p>
                                                            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{n.message}</p>
                                                            <p className="text-[8px] text-slate-600 font-bold uppercase">{n.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Integrated Member Card for Console */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2.5 p-1.5 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-all active:scale-95 group"
                        >
                            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center overflow-hidden">
                                {localStorage.getItem('line_user_picture') ? (
                                    <img src={localStorage.getItem('line_user_picture')!} className="w-full h-full object-cover" alt="User" />
                                ) : (
                                    <span className="text-[10px] font-black text-indigo-400">{lineUserName?.[0]}</span>
                                )}
                            </div>
                            <span className="text-xs font-black text-slate-300 group-hover:text-white transition-colors">{lineUserName}</span>
                            <ChevronDown className={cn("w-3 h-3 text-slate-500 transition-transform", isProfileOpen && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-72 bg-[#0f172a] border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden z-[100]"
                                    >
                                        <div className="p-6 bg-gradient-to-br from-slate-900 to-[#0f172a] border-b border-slate-800">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center overflow-hidden">
                                                    <img src={localStorage.getItem('line_user_picture')!} className="w-full h-full object-cover" alt="User" />
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="font-black text-white text-base leading-tight truncate">{lineUserName}</p>
                                                    <div className="flex items-center gap-1.5 mt-1 mb-2">
                                                        <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest", currentPlan.color)}>
                                                            {currentPlan.name}
                                                        </span>
                                                    </div>
                                                    <button 
                                                        onClick={() => copyToClipboard(localStorage.getItem('line_user_id') || '')}
                                                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 text-slate-500 hover:bg-white/10 hover:text-indigo-400 transition-all text-[10px] font-mono group max-w-full"
                                                    >
                                                        <span className="truncate">{localStorage.getItem('line_user_id')}</span>
                                                        <Copy className="w-3 h-3 shrink-0" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            {planLevel > 0 && billingCycle === 'monthly' && (
                                                <button 
                                                    onClick={() => window.location.href = '/dashboard/billing'}
                                                    className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-3 hover:bg-amber-500/20 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Crown className="w-4 h-4 text-amber-500" />
                                                        <span className="font-bold text-[12px]">升級年費 (省 2 個月)</span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 -rotate-90 text-amber-500/60" />
                                                </button>
                                            )}

                                            <button 
                                                onClick={() => window.location.href = '/dashboard/billing'}
                                                className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-slate-300 hover:bg-slate-800 transition-all text-sm font-bold group mb-2 border border-slate-800 hover:border-slate-700"
                                            >
                                                <CreditCard className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                                                帳單與訂閱管理
                                            </button>

                                            <div className="h-px bg-white/5 my-2 mx-3" />

                                            <button 
                                                onClick={() => window.location.href = '/dashboard'}
                                                className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm font-bold group mb-1"
                                            >
                                                <Store className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                                                進入店長後台
                                            </button>

                                            <button 
                                                onClick={onLogout}
                                                className="w-full py-3.5 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all flex items-center justify-center gap-2 text-sm font-black"
                                            >
                                                <LogOut className="w-4 h-4" /> 安全終止工作
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
