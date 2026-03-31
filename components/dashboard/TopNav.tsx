'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Zap, Crown, User, LogOut, Copy, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface TopNavProps {
    userName: string;
    userPicture: string;
    lineUserId: string;
    subscriptionStatus: string;
    nextBillingDate: string;
    planLevel: number;
    planConfig: any;
    onLogout: () => void;
}

export default function TopNav({ 
    userName, 
    userPicture, 
    lineUserId,
    subscriptionStatus,
    nextBillingDate,
    planLevel, 
    planConfig, 
    onLogout 
}: TopNavProps) {
    const [showProfile, setShowProfile] = useState(false);
    const plan = planConfig[planLevel as 0 | 1 | 2];
    const PlanIcon = plan.icon;

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
                        <span className="font-black text-[19.2px] tracking-tight text-slate-800">AI 店長後台</span>
                        <span className="ml-2 text-[14.4px] text-slate-400">Member Dashboard</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 mr-2">
                        {planLevel === 0 && (
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(245, 158, 11, 0.4)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => window.location.href = '/#pricing'}
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
                    </div>
                    <div className={cn(
                        "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border mr-2",
                        plan.badge
                    )}>
                        {PlanIcon && <PlanIcon className={`w-3.5 h-3.5 ${plan.color}`} />}
                        <span className={plan.color}>{plan.label}</span>
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
                                        className="absolute right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                                    >
                                        <div className="p-6 text-center bg-slate-50/50">
                                            <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg mx-auto mb-3 overflow-hidden relative group">
                                                <img src={userPicture} alt={userName} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-[9px] text-white font-bold">CHANGE</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                                <h4 className="text-lg font-black text-slate-800">{userName}</h4>
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="服務運行中" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-4 flex items-center justify-center gap-1">
                                                {subscriptionStatus} • {plan.label}
                                            </p>
                                            
                                            <div className="space-y-2">
                                                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-left">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Line User ID</p>
                                                    <div className="flex items-center justify-between gap-2 overflow-hidden">
                                                        <span className="text-[10px] font-mono text-slate-600 truncate">{lineUserId}</span>
                                                        <button 
                                                            onClick={() => copyToClipboard(lineUserId)}
                                                            className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all shrink-0"
                                                            title="複製 ID"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {planLevel > 0 && (
                                                    <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-left">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Next Billing Date</p>
                                                                <p className="text-sm font-black text-indigo-600 tracking-tighter">{nextBillingDate}</p>
                                                            </div>
                                                            <div className="px-2 py-1 bg-white rounded-lg border border-indigo-100 text-[9px] font-black text-indigo-500">
                                                                AUTO-RENEW
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="p-3 bg-slate-100/50 flex flex-col gap-1">
                                            <button 
                                                onClick={() => {
                                                    setShowProfile(false);
                                                    onLogout();
                                                }}
                                                className="w-full py-2.5 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2 text-xs font-bold font-sans"
                                            >
                                                <LogOut className="w-3.5 h-3.5" /> 會員登出
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={onLogout}
                        className="p-2 ml-1 rounded-xl hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-600" title="登出"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}
