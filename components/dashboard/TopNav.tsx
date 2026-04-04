'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Zap, Crown, User, LogOut, Copy, X, LayoutDashboard, ChevronDown, CreditCard, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

import { getPlanByTier } from '@/lib/config/pricing';

interface TopNavProps {
    userName: string;
    userPicture: string;
    lineUserId: string;
    subscriptionStatus: string;
    nextBillingDate: string;
    planLevel: number;
    billingCycle?: 'monthly' | 'yearly';
    planConfig: any;
    onLogout: () => void;
}

export default function TopNav({ 
    userName, 
    userPicture, 
    lineUserId,
    planLevel, 
    billingCycle = 'monthly',
    onLogout 
}: Omit<TopNavProps, 'subscriptionStatus' | 'nextBillingDate' | 'planConfig'>) {
    const [showProfile, setShowProfile] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const getPlanLabel = (level: number, cycle: 'monthly' | 'yearly' = 'monthly') => {
        const plan = getPlanByTier(level);
        if (!plan) return { name: "普通會員", color: "bg-slate-100 text-slate-600", badge: "bg-slate-50 border-zinc-200" };

        const suffix = level > 0 ? (cycle === 'yearly' ? '/y' : '/m') : '';
        const displayName = `${plan.name}${suffix}`;

        // Dynamic colors based on tier
        if (level >= 5) return { 
            name: displayName, 
            color: "bg-amber-100 text-amber-700 font-black", 
            badge: "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20 shadow-sm" 
        };
        if (level >= 3) return { 
            name: displayName, 
            color: "bg-indigo-100 text-indigo-700 font-bold", 
            badge: "bg-indigo-50 border-indigo-100" 
        };
        if (level >= 1) return { 
            name: displayName, 
            color: "bg-emerald-100 text-emerald-700 font-bold", 
            badge: "bg-emerald-50 border-emerald-100" 
        };
        
        return { name: "普通會員", color: "bg-slate-100 text-slate-500", badge: "bg-slate-50 border-slate-100" };
    };

    const currentPlan = getPlanLabel(planLevel, billingCycle);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('已複製 ID！');
    };

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl shadow-sm border-b border-slate-200/60">
            <div className="px-6 md:px-[100px] py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                    <div className="w-[43.2px] h-[43.2px] relative">
                        <Image src="/Lai Logo_4.svg" alt="Lai Logo" fill className="object-contain" />
                    </div>
                    <div>
                        <span className="font-black text-[19.2px] tracking-tight text-slate-800">AI 店長智庫</span>
                        <span className="ml-2 text-[14.4px] text-slate-400">Member Dashboard</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isMounted && (
                        <>
                            <div className="flex items-center gap-1.5 mr-2">
                                {planLevel === 0 && (
                                    <motion.button
                                        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(245, 158, 11, 0.4)" }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => window.location.href = '/dashboard/billing'}
                                        className="mr-3 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[11px] font-black rounded-full shadow-lg shadow-orange-500/20 flex items-center gap-1.5 animate-pulse"
                                    >
                                        <Zap className="w-3 h-3 fill-current" />
                                        立即解鎖正式版
                                    </motion.button>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => window.location.href = '/'}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-all text-[13px] font-bold border border-transparent hover:border-slate-200"
                                >
                                    <Home className="w-3.5 h-3.5" />
                                    回首頁
                                </motion.button>
                                { (planLevel > 0 || lineUserId === "Ud8b8dd79162387a80b2b5a4aba20f604") && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => window.location.href = '/console'}
                                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all text-[13px] font-black border border-indigo-100 shadow-sm shadow-indigo-500/5 group"
                                    >
                                        <LayoutDashboard className="w-3.5 h-3.5 text-indigo-500 group-hover:rotate-12 transition-transform" />
                                        營運戰情室
                                    </motion.button>
                                )}
                            </div>
                            <div className={cn(
                                "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-black uppercase tracking-wider shadow-sm border mr-2",
                                currentPlan.badge
                            )}>
                                <span className={currentPlan.color}>{currentPlan.name}</span>
                            </div>

                            <div className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowProfile(!showProfile)}
                                    className="flex items-center gap-2.5 pl-3 border-l border-slate-200 hover:bg-slate-50 px-2 py-1.5 rounded-xl transition-all"
                                >
                                    {userPicture ? (
                                        <img src={userPicture} alt={userName} className="w-8 h-8 rounded-full border-2 border-emerald-400/60" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                    <span className="text-sm text-slate-600 font-bold hidden sm:block">{userName} ▾</span>
                                </motion.button>

                                <AnimatePresence>
                                    {showProfile && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-3 w-72 bg-white rounded-[32px] shadow-2xl border border-slate-100 z-50 overflow-hidden"
                                            >
                                                <div className="p-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden border-2 border-white shadow-md">
                                                            {userPicture ? (
                                                                <img src={userPicture} className="w-full h-full object-cover" alt="User" />
                                                            ) : (
                                                                <User className="w-6 h-6 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <p className="font-black text-slate-800 text-base leading-tight truncate">{userName}</p>
                                                            <div className="flex items-center gap-1.5 mt-1 mb-2">
                                                                <span className={cn("px-3 py-1 rounded-lg text-[13px] font-black uppercase tracking-widest leading-none", currentPlan.color)}>
                                                                    {currentPlan.name}
                                                                </span>
                                                            </div>
                                                            <button 
                                                                onClick={() => copyToClipboard(lineUserId)}
                                                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-all text-[10px] font-mono group max-w-full"
                                                            >
                                                                <span className="truncate">{lineUserId}</span>
                                                                <Copy className="w-3 h-3 shrink-0" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-3">
                                                    {planLevel > 0 && billingCycle === 'monthly' && (
                                                        <button 
                                                            onClick={() => window.location.href = '/dashboard/billing'}
                                                            className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 mb-3 hover:bg-amber-100 transition-all group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Crown className="w-4 h-4 text-amber-500" />
                                                                <span className="font-bold text-[13px]">升級年費 (省 1 個月)</span>
                                                            </div>
                                                            <ChevronDown className="w-4 h-4 -rotate-90 text-amber-400" />
                                                        </button>
                                                    )}

                                                    {planLevel < 2 && (
                                                        <button 
                                                            onClick={() => window.location.href = '/dashboard/billing'}
                                                            className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 mb-3 hover:brightness-110 transition-all group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Sparkles className="w-4 h-4 text-indigo-200" />
                                                                <span className="font-black text-sm uppercase tracking-wider">{planLevel === 1 ? '補差價升級旗艦版' : '查看升級方案'}</span>
                                                            </div>
                                                            <ChevronDown className="w-4 h-4 -rotate-90 text-indigo-200" />
                                                        </button>
                                                    )}

                                                    <button 
                                                        onClick={() => window.location.href = '/dashboard'}
                                                        className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all text-sm font-bold group mb-2 shadow-sm border border-zinc-100"
                                                    >
                                                        <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                                                        進入店長智庫
                                                    </button>

                                                    <button 
                                                        onClick={() => window.location.href = '/dashboard/billing'}
                                                        className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all text-sm font-bold group mb-2 shadow-sm border border-zinc-100"
                                                    >
                                                        <CreditCard className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                                                        帳單與訂閱管理
                                                    </button>

                                                    <div className="h-px bg-slate-50 my-2 mx-3" />

                                                    <button 
                                                        onClick={() => {
                                                            setShowProfile(false);
                                                            onLogout();
                                                        }}
                                                        className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all text-sm font-black group"
                                                    >
                                                        <LogOut className="w-4 h-4" /> 登出 Line 帳號
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
