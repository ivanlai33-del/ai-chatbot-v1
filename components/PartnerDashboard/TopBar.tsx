"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, LayoutDashboard, Settings, User, Bot, 
    ChevronDown, LogOut, Plus, ShieldCheck, Hammer, Play 
} from 'lucide-react';
import { usePartner } from '@/context/PartnerContext';

const AVATAR_PRESETS = [
    { id: 'emerald', class: 'bg-gradient-to-br from-[#06C755] to-[#05A044]' },
    { id: 'indigo', class: 'bg-gradient-to-br from-indigo-500 to-blue-600' },
    { id: 'purple', class: 'bg-gradient-to-br from-purple-500 to-pink-600' },
    { id: 'amber', class: 'bg-gradient-to-br from-amber-400 to-orange-500' },
    { id: 'teal', class: 'bg-gradient-to-br from-teal-400 to-emerald-500' },
];

export default function DashboardTopBar() {
    const { partner, officialAccounts, activeOA, setActiveOA, setTriggerCommand, signOut } = usePartner();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showOAMenu, setShowOAMenu] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const activePreset = AVATAR_PRESETS.find(p => p.id === partner.avatarUrl) || AVATAR_PRESETS[0];

    return (
        <header className="h-20 w-full bg-white/40 backdrop-blur-md border-b border-white/20 px-8 flex items-center justify-between sticky top-0 z-[60]">
            
            {/* 左側：品牌標誌區 (佔據 1/3) */}
            <div className="flex-1 flex justify-start items-center">
                <div className="flex flex-col">
                    <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none mb-1.5">智能建構中心</h1>
                    <p className="text-[8px] font-black text-[#06C755] uppercase tracking-[0.2em] opacity-80 leading-none">AIGC Orchestration OS</p>
                </div>
            </div>

            {/* 中間：官方帳號核心控制 (居中) */}
            <div className="flex-1 flex justify-center relative">
                {activeOA ? (
                    <div className="relative">
                        <button 
                            onClick={() => setShowOAMenu(!showOAMenu)}
                            className="flex flex-col items-center group cursor-pointer"
                        >
                            <div className="flex items-center gap-2 mb-0.5">
                                <div className="px-1.5 py-0.5 bg-emerald-50 text-[#06C755] text-[7px] font-black rounded uppercase tracking-widest">Active Context</div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">目前代營運帳號</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white/60 hover:bg-white px-4 py-1.5 rounded-2xl border border-white/50 transition-all">
                                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden relative">
                                    <Image src="/lai_logo_8.svg" alt="OA Logo" fill className="object-cover" priority />
                                </div>
                                <h2 className="text-sm font-black text-slate-900 tracking-tight">{activeOA.name}</h2>
                                {officialAccounts.length > 1 && (
                                    <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-[#06C755] transition-transform ${showOAMenu ? 'rotate-180' : ''}`} />
                                )}
                            </div>
                        </button>

                        <AnimatePresence>
                            {showOAMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-2 overflow-hidden"
                                >
                                    {officialAccounts.map((oa) => (
                                        <button 
                                            key={oa.id}
                                            onClick={() => {
                                                setActiveOA(oa);
                                                setShowOAMenu(false);
                                            }}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                                                activeOA.id === oa.id ? 'bg-slate-50' : 'hover:bg-[#06C755]/5'
                                            }`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-100 overflow-hidden relative shrink-0">
                                                <Image src="/lai_logo_8.svg" alt="OA Logo" fill className="object-cover" />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className="text-xs font-black text-slate-800">{oa.name}</span>
                                                <span className="text-[9px] text-slate-400 font-bold">{oa.line_oa_id}</span>
                                            </div>
                                        </button>
                                    ))}
                                    <div className="h-px bg-slate-100 my-2 mx-2" />
                                    <button 
                                        onClick={() => {
                                            setTriggerCommand("增加官方帳號串接");
                                            setShowOAMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#06C755]/5 text-[#06C755] transition-all"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span className="text-xs font-black">+ 新增官方帳號</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <button 
                        onClick={() => {
                            setTriggerCommand("增加官方帳號串接");
                            router.push('/saas-partnership/dashboard');
                        }}
                        className="flex items-center gap-4 px-5 py-2.5 border-2 border-dashed border-white/40 rounded-[2rem] hover:border-[#06C755] hover:bg-white/60 transition-all group relative overflow-hidden"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm group-hover:shadow-[#06C755]/10 transition-all">
                            <Bot className="w-6 h-6 text-slate-300 group-hover:text-[#06C755] transition-colors" />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="text-xs font-black text-slate-600 group-hover:text-slate-900 transition-colors">尚未串接帳號</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Connect your first OA</span>
                        </div>
                        <div className="flex items-center justify-center ml-2">
                            <motion.div 
                                animate={{ scale: [1, 1.15, 1], boxShadow: ["0 0 0px rgba(6, 199, 85, 0)", "0 0 20px rgba(6, 199, 85, 0.4)", "0 0 0px rgba(6, 199, 85, 0)"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="w-8 h-8 rounded-full bg-[#06C755] flex items-center justify-center text-white shadow-lg"
                            >
                                <Plus className="w-5 h-5 font-black" />
                            </motion.div>
                        </div>
                    </button>
                )}
            </div>

            {/* 右側：個人資料與智庫入口 (佔據 1/3) */}
            <div className="flex-1 flex justify-end">
                <div className="flex flex-col items-center gap-2">
                    {/* 個人資料按鈕 */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 bg-white/60 hover:bg-white px-5 py-2 rounded-full border border-white/50 transition-all group shadow-sm"
                        >
                            <div className="flex flex-col items-center hidden sm:flex">
                                <div className="flex items-center gap-1.5">
                                    <ShieldCheck className="w-3 h-3 text-[#06C755]" />
                                    <span className="text-sm font-black text-slate-900">{partner.userName}</span>
                                </div>
                            </div>
                            <div className={`w-10 h-10 rounded-full ${activePreset.class} text-white flex items-center justify-center font-black text-xs shadow-lg transition-transform group-hover:scale-105`}>
                                {partner.userName.substring(0, 2).toUpperCase()}
                            </div>
                        </button>

                        <AnimatePresence>
                            {showUserMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute right-1/2 translate-x-1/2 mt-2 w-56 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-2 z-[70]"
                                >
                                    <Link 
                                        href="/saas-partnership/dashboard/settings"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                            <Settings className="w-4 h-4 text-indigo-500" />
                                        </div>
                                        <span className="text-xs font-black text-slate-700">帳戶設定</span>
                                    </Link>
                                    <button 
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            signOut();
                                        }}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-all text-red-500"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                            <LogOut className="w-4 h-4 text-red-500" />
                                        </div>
                                        <span className="text-xs font-black">登出系統</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 獨立的智庫工具連結 (白字 + 居中) */}
                    {pathname === '/saas-partnership/dashboard' && (
                        <div className="absolute top-[95px]">
                            <Link 
                                href="/saas-partnership/dashboard/modules"
                                className="text-[16.5px] font-black text-white/80 hover:text-white transition-colors flex items-center gap-1 group py-2 drop-shadow-sm whitespace-nowrap"
                            >
                                進入 AGI 智庫中心 <Play className="w-2 h-2 fill-current ml-1" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
