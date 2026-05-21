"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { User, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LINE_GREEN } from '@/lib/chat-constants';
import { Message } from '@/lib/chat-types';

interface MessageBubbleProps {
    message: Message;
    lineUserPicture: string | null | undefined;
    initiateLineLogin: () => void;
    setInputValue: (val: string) => void;
    setActiveWebViewUrl: (url: string | null) => void;
    setViewMode: (mode: 'chat' | 'webview') => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    lineUserPicture,
    initiateLineLogin,
    setInputValue,
    setActiveWebViewUrl,
    setViewMode
}) => {
    const isAi = message.role === 'ai';

    const renderContent = (content: string) => {
        return content.split(/\n/).map((line, lineIdx) => {
            if (!line.trim()) return <div key={lineIdx} className="h-2" />;
            if (line.trim() === '---') return <hr key={lineIdx} className="my-4 border-zinc-100" />;

            const headerMatch = line.match(/^(#{1,3})\s+(.*)/);
            if (headerMatch) {
                return (
                    <div key={lineIdx} className="mt-4 mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: LINE_GREEN }} />
                            <span className="font-extrabold text-[15px] text-zinc-900 tracking-tight">{headerMatch[2]}</span>
                        </div>
                    </div>
                );
            }

            const parts = line.split(/(!\[.*?\]\(.*?\))|(\*\*.*?\*\*)|(https?:\/\/[^\s]+)|(\[.*?\])/g);
            return (
                <div key={lineIdx} className="leading-relaxed">
                    {parts.map((part, i) => {
                        if (!part) return null;

                        if (part.startsWith('[') && part.endsWith(']')) {
                            const btnText = part.slice(1, -1);
                            return (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (btnText.includes('LINE') || btnText.includes('登入')) {
                                            initiateLineLogin();
                                        } else {
                                            setInputValue(btnText);
                                            setTimeout(() => {
                                                const sendBtn = document.querySelector('[aria-label="傳送訊息"]') as HTMLButtonElement;
                                                sendBtn?.click();
                                            }, 100);
                                        }
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 transition-all font-bold m-1 shadow-sm active:scale-95"
                                >
                                    {btnText}
                                    <ChevronRight className="w-3 h-3 text-zinc-400" />
                                </button>
                            );
                        }

                        const imgMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
                        if (imgMatch) return (
                            <div key={i} className="my-4 rounded-2xl overflow-hidden border border-zinc-100 shadow-sm max-w-xs">
                                <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full h-auto" />
                            </div>
                        );

                        const boldMatch = part.match(/\*\*(.*?)\*\*/);
                        if (boldMatch) return <span key={i} className="font-bold">{boldMatch[1]}</span>;

                        if (part.match(/^https?:\/\//)) {
                            const cleanUrl = part.replace(/[.。!！?？,，」)）]+$/, '');
                            return (
                                <button
                                    key={i}
                                    onClick={() => { setActiveWebViewUrl(cleanUrl); setViewMode('webview'); }}
                                    className="text-[#06C755] underline break-all hover:text-green-700 decoration-dotted underline-offset-4 font-bold"
                                >
                                    {cleanUrl}
                                </button>
                            );
                        }
                        return <span key={i}>{part}</span>;
                    })}
                </div>
            );
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
                "flex items-start gap-4",
                message.role === 'user' ? "flex-row-reverse" : ""
            )}
        >
            <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 mt-1 shadow-md bg-white border border-zinc-100 overflow-hidden",
                isAi ? "" : "bg-zinc-200"
            )}>
                {isAi ? (
                    <img src="/lai_logo.svg" className="w-[50px] h-[50px] object-contain" alt="Lai Logo" />
                ) : (
                    lineUserPicture ? (
                        <img src={lineUserPicture} className="w-full h-full object-cover" alt="User" />
                    ) : (
                        <User className="w-8 h-8 text-zinc-500" />
                    )
                )}
            </div>
            <div className={cn(
                "relative p-5 shadow-sm text-[19.5px] leading-relaxed max-w-[85%] transition-all font-bold whitespace-pre-wrap",
                isAi
                    ? "bg-white border border-zinc-200 rounded-2xl rounded-tl-none text-zinc-800"
                    : "bg-[#06C755] text-white rounded-2xl rounded-tr-none ml-auto shadow-[#06C755]"
            )}>
                {isAi ? (
                    <div className="space-y-3">
                        {renderContent(message.content)}
                    </div>
                ) : (
                    <div className="text-white font-bold">{message.content}</div>
                )}
            </div>
        </motion.div>
    );
};
