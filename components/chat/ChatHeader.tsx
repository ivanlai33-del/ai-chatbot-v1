"use client";

import React, { useState } from 'react';
import { User, RotateCcw, LogOut, ChevronDown, CreditCard, Sparkles, Rocket, Zap, Crown, LayoutDashboard, Store, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatHeaderProps {
    lineUserId: string | null;
    lineUserName: string | null;
    lineUserPicture: string | null;
    planLevel: number;
    billingCycle?: 'monthly' | 'yearly';
    initiateLineLogin: () => void;
    onLogout: () => void;
    onUpgrade: (level: number) => void;
    onReset: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
    lineUserId, 
    lineUserName, 
    lineUserPicture, 
    planLevel,
    billingCycle = 'monthly',
    initiateLineLogin, 
    onLogout,
    onUpgrade,
    onReset 
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUpgradeView, setIsUpgradeView] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const getPlanLabel = (level: number) => {
        if (level === 2) return { name: "公司強力店長版", color: "bg-amber-100 text-amber-700" };
        if (level === 1) return { name: "個人店長版 Lite", color: "bg-indigo-100 text-indigo-700" };
        return { name: "普通會員", color: "bg-emerald-50 text-emerald-600" };
    };

    const currentPlan = getPlanLabel(planLevel);

    const copyId = () => {
        if (lineUserId) {
            navigator.clipboard.writeText(lineUserId);
            alert('已複製 ID！');
        }
    };

    return (
        <header className="z-[100] bg-white/80 backdrop-blur-md border-b border-zinc-200">
            <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#06C755] rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                        <img src="/Lai Logo.svg" className="w-7 h-7" alt="Logo" />
                    </div>
                    <div>
                        <h1 className="font-black text-zinc-900 text-[17px] leading-tight text-nowrap">官方品牌專屬智能店長</h1>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-[#06C755] rounded-full animate-pulse" />
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-nowrap">24/7 Smart Business Growth</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="group relative flex items-center">
                            <button
                                onClick={onReset}
                                title="重置對話"
                                className="p-2.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-all active:scale-95"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                        </div>

                        {isMounted && (
                            lineUserId ? (
                                <div className="relative">
                                    <button
                                        onClick={() => { setIsMenuOpen(!isMenuOpen); setIsUpgradeView(false); }}
                                        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white border border-zinc-200 hover:border-zinc-300 transition-all shadow-sm active:scale-95 group"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-zinc-100 overflow-hidden border border-zinc-200">
                                            {lineUserPicture ? (
                                                <img src={lineUserPicture} className="w-full h-full object-cover" alt="User" />
                                            ) : (
                                                <User className="w-4 h-4 text-zinc-400" />
                                            )}
                                        </div>
                                        <span className="text-[13px] font-bold text-zinc-700">{lineUserName}</span>
                                        <ChevronDown className={cn("w-3 h-3 text-zinc-400 transition-transform", isMenuOpen && "rotate-180")} />
                                    </button>

                                    <AnimatePresence>
                                        {isMenuOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute right-0 mt-2 w-72 bg-white rounded-[32px] shadow-2xl border border-zinc-100 overflow-hidden z-50 origin-top-right"
                                                >
                                                    {!isUpgradeView ? (
                                                        <div className="flex flex-col">
                                                            {/* Member Card Header */}
                                                            <div className="p-6 bg-gradient-to-br from-zinc-50 to-white border-b border-zinc-100">
                                                                <div className="flex items-center gap-4 mb-4">
                                                                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 overflow-hidden border-2 border-white shadow-md">
                                                                        {lineUserPicture ? (
                                                                            <img src={lineUserPicture} className="w-full h-full object-cover" alt="User" />
                                                                        ) : (
                                                                            <User className="w-6 h-6 text-zinc-400" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 overflow-hidden">
                                                                        <p className="font-black text-zinc-800 text-base leading-tight truncate">{lineUserName}</p>
                                                                        <div className="flex items-center gap-1.5 mt-1 mb-2">
                                                                            <span className={cn("px-3 py-1 rounded-lg text-[13px] font-black uppercase tracking-widest leading-none", currentPlan.color)}>
                                                                                {currentPlan.name}
                                                                            </span>
                                                                        </div>
                                                                        <button 
                                                                            onClick={copyId}
                                                                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-indigo-600 transition-all text-[10px] font-mono group max-w-full"
                                                                        >
                                                                            <span className="truncate">{lineUserId}</span>
                                                                            <Copy className="w-3 h-3 shrink-0" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Menu Items */}
                                                            <div className="p-3">
                                                                {planLevel > 0 && billingCycle === 'monthly' && (
                                                                    <button 
                                                                        onClick={() => window.location.href = '/dashboard/billing'}
                                                                        className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 mb-3 hover:bg-amber-100 transition-all group"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <Crown className="w-4 h-4 text-amber-500" />
                                                                            <span className="font-bold text-[13px]">升級年費 (省 2 個月)</span>
                                                                        </div>
                                                                        <ChevronDown className="w-4 h-4 -rotate-90 text-amber-400" />
                                                                    </button>
                                                                )}

                                                                {planLevel < 2 && (
                                                                    <button 
                                                                        onClick={() => setIsUpgradeView(true)}
                                                                        className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 mb-3 hover:brightness-110 transition-all group"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <Sparkles className="w-4 h-4 text-indigo-200" />
                                                                            <span className="font-black text-sm uppercase tracking-wider">{planLevel === 1 ? '升級領取旗艦版' : '查看升級方案'}</span>
                                                                        </div>
                                                                        <ChevronDown className="w-4 h-4 -rotate-90 text-indigo-200" />
                                                                    </button>
                                                                )}
                                                                
                                                                <button 
                                                                    onClick={() => window.location.href = '/dashboard/billing'}
                                                                    className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-zinc-600 hover:bg-zinc-50 transition-all text-sm font-bold group mb-2 shadow-sm border border-zinc-100 hover:border-indigo-100"
                                                                >
                                                                    <CreditCard className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500" />
                                                                    帳單與訂閱管理
                                                                </button>
                                                                
                                                                <div className="h-px bg-zinc-100 my-2 mx-3" />
                                                                
                                                                <button 
                                                                    onClick={() => window.location.href = '/dashboard'}
                                                                    className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-zinc-600 hover:bg-zinc-50 hover:text-indigo-600 transition-all text-sm font-bold group"
                                                                >
                                                                    <LayoutDashboard className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500" />
                                                                    進入店長智庫
                                                                </button>

                                                                <button 
                                                                    onClick={onLogout}
                                                                    className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all text-sm font-black group"
                                                                >
                                                                    <LogOut className="w-4 h-4" />
                                                                    登出 Line 帳號
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        /* ⚡ Upgrade Selection View */
                                                        <div className="p-6">
                                                            <div className="flex items-center justify-between mb-5">
                                                                <h3 className="font-black text-zinc-800 text-lg">選擇升級方案</h3>
                                                                <button onClick={() => setIsUpgradeView(false)} className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600 uppercase tracking-widest">返回</button>
                                                            </div>
                                                            
                                                            <div className="space-y-3">
                                                                {planLevel === 0 && (
                                                                    <button 
                                                                        onClick={() => { onUpgrade(1); setIsMenuOpen(false); }}
                                                                        className="w-full p-4 rounded-2xl border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all text-left flex items-start gap-4 group"
                                                                    >
                                                                        <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                                            <Zap className="w-5 h-5" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-black text-zinc-800 text-sm">個人店長版 Lite</p>
                                                                            <p className="text-[10px] text-zinc-400 mt-0.5">$499 / 月 ・ 啟動 AI 行銷</p>
                                                                            <div className="mt-2 text-[11px] font-black text-indigo-600">立刻訂閱 →</div>
                                                                        </div>
                                                                    </button>
                                                                )}

                                                                <button 
                                                                    onClick={() => { onUpgrade(2); setIsMenuOpen(false); }}
                                                                    className="w-full p-4 rounded-2xl border-2 border-amber-100 hover:border-amber-500 hover:bg-amber-50/30 transition-all text-left flex items-start gap-4 group"
                                                                >
                                                                    <div className="p-2 rounded-xl bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                                                        <Sparkles className="w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-black text-zinc-800 text-sm">公司強力店長版</p>
                                                                        <p className="text-[10px] text-zinc-400 mt-0.5">$1199 / 月 ・ RAG 知識庫完全解鎖</p>
                                                                        <div className="mt-2 text-[11px] font-black text-amber-600 uppercase tracking-widest">{planLevel === 1 ? '補差價升級 →' : '立刻訂閱 →'}</div>
                                                                    </div>
                                                                </button>
                                                            </div>
                                                            
                                                            <p className="text-[10px] text-center text-zinc-400 mt-6 leading-relaxed">
                                                                付款將由 LINE Pay 或 信用卡 處理<br/>訂閱後立即開通後台權限
                                                            </p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <button
                                    onClick={initiateLineLogin}
                                    className="flex flex-col items-center justify-center px-6 py-2 rounded-full bg-[#06C755] text-white font-black text-[13px] hover:brightness-105 shadow-[0_4px_15px_rgba(6,199,85,0.35)] transition-all active:scale-95 group leading-tight"
                                >
                                    <span className="whitespace-nowrap">Line</span>
                                    <span className="whitespace-nowrap">帳號登入</span>
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
