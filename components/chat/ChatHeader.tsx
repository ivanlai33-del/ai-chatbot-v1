"use client";

import React from 'react';
import { User, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LINE_GREEN } from '@/lib/chat-constants';

interface ChatHeaderProps {
    lineUserId: string | null;
    lineUserName: string | null;
    lineUserPicture: string | null;
    initiateLineLogin: () => void;
    onReset: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ lineUserId, lineUserName, lineUserPicture, initiateLineLogin, onReset }) => (
    <header className="z-20 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#06C755] rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                    <img src="/Lai Logo.svg" className="w-7 h-7" alt="Logo" />
                </div>
                <div>
                    <h1 className="font-black text-zinc-900 text-[17px] leading-tight">AI 店長小專員</h1>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-[#06C755] rounded-full animate-pulse" />
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">24/7 Automated Sales</span>
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
                        <span className="absolute right-full mr-3 px-2.5 py-1.5 bg-zinc-800 text-white text-[11px] font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none translate-x-2 group-hover:translate-x-0 shadow-xl">
                            重置對話
                            <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-zinc-800 rotate-45" />
                        </span>
                    </div>

                    {lineUserId ? (
                        <button
                            onClick={() => {}}
                            className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-white border border-zinc-200 hover:border-zinc-300 transition-all shadow-sm active:scale-95 group"
                        >
                            <div className="w-7 h-7 rounded-full bg-zinc-100 overflow-hidden border border-zinc-200">
                                {lineUserPicture ? (
                                    <img src={lineUserPicture} className="w-full h-full object-cover" alt="User" />
                                ) : (
                                    <User className="w-4 h-4 text-zinc-400" />
                                )}
                            </div>
                            <span className="text-[13px] font-bold text-zinc-700">{lineUserName}</span>
                        </button>
                    ) : (
                        <button
                            onClick={initiateLineLogin}
                            className="flex flex-col items-center justify-center px-6 py-2 rounded-full bg-[#06C755] text-white font-black text-[13px] hover:brightness-105 shadow-[0_4px_15px_rgba(6,199,85,0.35)] transition-all active:scale-95 group leading-tight"
                        >
                            <span className="whitespace-nowrap">Line</span>
                            <span className="whitespace-nowrap">帳號登入</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    </header>
);
