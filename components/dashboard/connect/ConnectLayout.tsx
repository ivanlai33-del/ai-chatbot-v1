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
        <main className="min-h-screen text-slate-800 font-sans pb-2 bg-[#F8FAFC]">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/60">
                <div className="px-6 md:px-[100px] py-4 flex items-center justify-between max-w-[1600px] mx-auto w-full">
                    {!hideHeaderBack ? (
                        <button 
                            onClick={onBack} 
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all font-bold text-sm bg-slate-100/50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            返回
                        </button>
                    ) : (
                        <div className="w-20 md:block hidden" />
                    )}
                    
                    <div className="flex items-center gap-3 text-slate-800">
                        <div className="w-[32px] h-[32px] relative">
                            <Image src="/Lai Logo_4.svg" alt="Logo" fill />
                        </div>
                        <h1 className="font-black text-lg tracking-tight">{title}</h1>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        {rightContent}
                        <div className="w-24 md:block hidden" />
                    </div>
                </div>
            </header>

            <div className="px-6 md:px-[100px] py-4 max-w-[1400px] mx-auto min-h-[calc(100vh-100px)]">
                {children}
            </div>
        </main>
    );
}
