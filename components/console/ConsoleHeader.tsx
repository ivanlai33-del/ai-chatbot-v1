'use client';

import React from 'react';
import { Bell } from 'lucide-react';

interface ConsoleHeaderProps {
    activeTabLabel?: string;
}

export default function ConsoleHeader({ activeTabLabel }: ConsoleHeaderProps) {
    return (
        <header className="h-16 border-b border-slate-700/50 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
            <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    {activeTabLabel}
                </h2>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        系統連線正常
                    </div>
                </div>
                <div className="relative">
                    <Bell className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 border-2 border-[#0f172a] rounded-full" />
                </div>
            </div>
        </header>
    );
}
