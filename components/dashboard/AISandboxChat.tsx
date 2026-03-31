'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Lock } from 'lucide-react';
import ChatBotAvatar from '@/components/chat/ChatBotAvatar';
import { useChatSandbox } from '@/hooks/useChatSandbox';

interface AISandboxChatProps {
    bots: any[];
    selectedBotId: string | null;
    planLevel: number;
    config: any; // StoreConfig
}

export default function AISandboxChat({ bots, selectedBotId, planLevel, config }: AISandboxChatProps) {
    const chatBottomRef = useRef<HTMLDivElement>(null);
    const { 
        chatInput, 
        setChatInput, 
        chatMessages, 
        isChatting, 
        handleChat 
    } = useChatSandbox({ planLevel, config });

    const currentBot = bots.find(b => b.id === selectedBotId);

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    return (
        <div className="flex-1 flex flex-col overflow-hidden rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-slate-200"
            style={{ background: 'white' }}>

            <div className="flex items-center gap-3 px-6 py-5 rounded-t-3xl"
                style={{ background: 'linear-gradient(135deg, #06C755 0%, #05b34c 60%, #04903d 100%)' }}>
                <ChatBotAvatar bot={currentBot} />
                <div className="flex-1">
                    <h3 className="text-[15px] font-black text-white tracking-tight">
                        {currentBot?.channelName || 'AI 店長預覽'}
                    </h3>
                    <p className="text-[11px] text-emerald-100/80 font-medium">根據您的設定即時回覆</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/dashboard/connect?action=new'}
                    className="text-[15px] bg-white/20 border border-white/40 text-white px-7 py-2.5 rounded-full font-black transition-all shadow-sm shrink-0"
                >
                    串接 AI 店長
                </motion.button>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ background: 'white' }}>
                {chatMessages.map((msg, i) => (
                    <motion.div key={i}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                            msg.role === 'user'
                                ? 'text-white rounded-br-sm'
                                : 'bg-slate-100 text-slate-700 rounded-bl-sm border border-slate-200'
                        }`}
                            style={msg.role === 'user' ? {
                                background: 'linear-gradient(135deg, #06C755 0%, #04903d 100%)',
                            } : {}}
                        >
                            {msg.content}
                        </div>
                    </motion.div>
                ))}
                {isChatting && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                            <span className="flex gap-1.5 items-center">
                                {[0, 1, 2].map(i => (
                                    <span key={i} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                        style={{ animationDelay: `${i * 0.18}s` }} />
                                ))}
                            </span>
                        </div>
                    </div>
                )}
                <div ref={chatBottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white flex gap-2 rounded-b-3xl border-t border-slate-100">
                <input
                    type="text" value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleChat()}
                    placeholder="輸入訊息測試 AI 店長..."
                    className="flex-1 bg-slate-100 border-0 rounded-2xl px-4 py-2.5 text-[13.5px] text-slate-700 placeholder-slate-400 outline-none transition-all focus:bg-slate-50 focus:ring-2 focus:ring-emerald-300"
                />
                <motion.button
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                    onClick={() => handleChat()} disabled={isChatting || !chatInput.trim()}
                    className="w-10 h-10 flex items-center justify-center rounded-2xl disabled:opacity-40 transition-all shrink-0"
                    style={{ background: 'linear-gradient(135deg, #06C755 0%, #04903d 100%)', boxShadow: '0 4px 12px rgba(6,199,85,0.3)' }}
                >
                    <Send className="w-4 h-4 text-white" />
                </motion.button>
            </div>
        </div>
    );
}
