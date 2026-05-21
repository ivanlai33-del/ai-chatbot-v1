'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface ConnectLayoutProps {
    onBack: () => void;
    title: string | React.ReactNode;
    subtitle?: string;
    children: React.ReactNode;
    rightContent?: React.ReactNode;
    hideHeaderBack?: boolean;
}

export default function ConnectLayout({ onBack, title, subtitle, children, rightContent, hideHeaderBack }: ConnectLayoutProps) {
    return (
        <main className="min-h-screen text-slate-800 font-sans relative overflow-hidden bg-[#E2E8F0]">
            {/* 🎨 Background Accents for Depth */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-200/30 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-cyan-200/30 rounded-full blur-[100px] pointer-events-none" />

            <header className="sticky top-0 z-50 bg-white/40 backdrop-blur-3xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-white/40 ring-1 ring-black/5">
                <div className="px-6 md:px-[75px] py-6 flex items-center justify-between max-w-[1900px] mx-auto w-full">
                    {!hideHeaderBack ? (
                        <button 
                            onClick={onBack} 
                            className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-all font-black text-[13px] bg-white/60 hover:bg-white px-5 py-2.5 rounded-2xl border border-white shadow-sm ring-1 ring-black/[0.03]"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            返回智庫
                        </button>
                    ) : (
                        <div className="w-20 md:block hidden" />
                    )}
                    
                    <div className="flex items-center gap-4 text-slate-900">
                        <div className="w-[40px] h-[40px] relative drop-shadow-sm">
                            <Image src="/lai_logo_4.svg" alt="Logo" fill sizes="100px" priority />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="font-black text-[22px] tracking-tight leading-none">{title}</h1>
                            {subtitle && <p className="text-[11px] text-slate-400 font-black tracking-widest uppercase mt-1.5 opacity-80">{subtitle}</p>}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        {rightContent}
                        <div className="w-24 md:block hidden" />
                    </div>
                </div>
            </header>

            <div className="px-6 md:px-[75px] py-10 max-w-[1700px] mx-auto min-h-[calc(100vh-120px)] relative z-10 transition-all duration-700">
                {children}
            </div>
        </main>
    );
}
