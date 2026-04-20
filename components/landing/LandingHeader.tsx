'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Layout, LogIn } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LandingHeaderProps {
    isLoggedIn: boolean;
    onAction: () => void;
    onOpenChat: () => void;
}

export default function LandingHeader({ isLoggedIn, onAction, onOpenChat }: LandingHeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 min-w-[1024px]">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                    <img 
                        src="/lai_logo_3.svg" 
                        alt="Lai Logo" 
                        className="w-10 h-10 object-contain group-hover:scale-110 transition-transform drop-shadow-md"
                    />
                    <div className="flex flex-col justify-center">
                        <span className="text-xl font-bold text-white tracking-tight leading-none mb-1">
                            LINE <span className="text-emerald-400">AI</span> Assistant
                        </span>
                        <span className="text-[11px] text-slate-300 font-medium tracking-widest leading-none">
                            您的專屬AI店長
                        </span>
                    </div>
                </Link>

                {/* Nav & Action */}
                <nav className="flex items-center gap-6">
                    <button 
                        onClick={onOpenChat}
                        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
                    >
                        <MessageSquare className="w-4 h-4" />
                        來和 AI 店長聊聊您的需求
                    </button>
                    
                    <button
                        onClick={onAction}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all transform hover:scale-105 active:scale-95",
                            isLoggedIn 
                                ? "bg-slate-800 text-white border border-slate-700 hover:bg-slate-700"
                                : "bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        )}
                    >
                        {isLoggedIn ? (
                            <>
                                管理後台
                                <Layout className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                <LogIn className="w-4 h-4" />
                                立即啟動
                            </>
                        )}
                    </button>
                </nav>
            </div>
            
            {/* Glassmorphism background blur */}
            <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md -z-10 border-b border-white/5" />
        </header>
    );
}
