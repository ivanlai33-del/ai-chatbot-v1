'use client';

import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, Store, ChevronDown, MessageSquare, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConsoleHeaderProps {
    activeTabLabel?: string;
    viewMode: 'platform' | 'personal';
    setViewMode: (mode: 'platform' | 'personal') => void;
}

export default function ConsoleHeader({ activeTabLabel, viewMode, setViewMode }: ConsoleHeaderProps) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

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
        // Refresh every 60s
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
                                <div className="p-3 bg-slate-950/50 border-t border-slate-800 text-center">
                                    <button className="text-[9px] font-black text-indigo-500 uppercase hover:text-indigo-400 transition-all">
                                        查看所有通知歷史
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
