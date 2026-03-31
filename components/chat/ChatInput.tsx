"use client";

import React from 'react';
import { Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LINE_GREEN } from '@/lib/chat-constants';

interface ChatInputProps {
    value: string;
    onChange: (val: string) => void;
    onSend: () => void;
    isTyping: boolean;
    placeholder: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, isTyping, placeholder }) => (
    <div className="z-20 bg-white/80 backdrop-blur-xl border-t border-zinc-200 p-6">
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#06C755] to-emerald-400 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-focus-within:opacity-40"></div>
            <div className="relative flex items-center gap-3 bg-white p-2 rounded-[28px] border border-zinc-200 shadow-xl focus-within:border-[#06C755] transition-all">
                <div className="flex-1 relative flex items-center">
                    <Sparkles className="absolute left-4 w-5 h-5 text-zinc-300 pointer-events-none" />
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && onSend()}
                        placeholder={placeholder}
                        className="w-full pl-12 pr-4 py-4 bg-transparent text-[18.5px] text-zinc-800 placeholder:text-zinc-300 font-bold focus:outline-none"
                    />
                </div>
                <button
                    onClick={onSend}
                    disabled={isTyping || !value.trim()}
                    aria-label="傳送訊息"
                    className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90",
                        !value.trim() ? "bg-zinc-100 text-zinc-300" : "bg-[#06C755] text-white shadow-green-200 hover:brightness-110"
                    )}
                >
                    <Send className={cn("w-6 h-6", value.trim() && "translate-x-0.5 -translate-y-0.5")} />
                </button>
            </div>
        </div>
    </div>
);
