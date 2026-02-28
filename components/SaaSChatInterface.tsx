"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, RotateCcw } from 'lucide-react';

type Message = {
    id: string;
    role: 'ai' | 'user';
    content: string;
};

interface SaaSChatInterfaceProps {
    storeName?: string;
    isMaster?: boolean;
    isSaaS?: boolean;
    focusedField?: string | null;
    currentStep?: number;
    isActivation?: boolean;
    isProvisioning?: boolean;
    botKnowledge?: any;
    pageContext?: 'landing' | 'subscribe' | 'dashboard' | 'knowledge' | 'provision';
}

export default function SaaSChatInterface({ storeName, isMaster, isSaaS = true, focusedField, currentStep, isActivation = false, isProvisioning = false, botKnowledge, pageContext }: SaaSChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const resetChat = () => {
        setMessages([]);
        setInputValue('');
        setIsTyping(false);
    };

    // Watch for step 3 change (Live Preview) to push a system status message
    useEffect(() => {
        if (isProvisioning && currentStep === 3) {
            setMessages(prev => [
                ...prev,
                { id: Date.now().toString(), role: 'ai', content: `🎉 **[系統切換]** 對話已連線至 **${botKnowledge?.name || storeName}** 的大腦。您可以開始測試了！\n\n您可試著說：「請問有菜單嗎？」或是「我想預約課程」。` }
            ]);
        }
    }, [currentStep, isProvisioning, botKnowledge, storeName]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
                    storeName,
                    isMaster,
                    isSaaS,
                    focusedField,
                    currentStep,
                    isActivation,
                    isProvisioning,
                    botKnowledge,
                    pageContext
                })
            });

            const data = await res.json();
            if (data.message) {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'ai',
                    content: data.message
                }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e293b]/30 backdrop-blur-sm border-l border-slate-700/50">
            {/* Header */}
            <div className="pt-8 pb-6 px-6 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white tracking-tight">AI Store Manager Expert</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Implementation Support</p>
                    </div>
                </div>
                <button
                    onClick={resetChat}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-[10px] transition-all border bg-slate-800/50 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700 hover:border-slate-500"
                    title="重置對話至初始狀態"
                >
                    <RotateCcw className="w-3 h-3" />
                    <span className="uppercase tracking-wider">Reset</span>
                </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                <AnimatePresence initial={false}>
                    {messages.map((m) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                        >
                            <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${m.role === 'ai'
                                ? 'bg-slate-800/60 border border-slate-700/50 text-slate-300'
                                : 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-200'
                                }`}>
                                {m.content.replace(/\*\*(.*?)\*\*/g, '$1')}
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
                                <span className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-300"></span>
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-6 pb-12 bg-slate-800/20 border-t border-slate-700/50 mt-auto">
                <div className="relative group">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                handleSend();
                            }
                        }}
                        placeholder="詢問技術細節或導入流程..."
                        className="w-full p-4 pr-12 bg-slate-900/50 border border-slate-700/50 rounded-2xl text-sm text-slate-200 outline-none focus:border-indigo-500/50 transition-all"
                    />
                    <button
                        onClick={handleSend}
                        title="傳送訊息"
                        aria-label="傳送訊息"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-[10px] text-slate-600 text-center mt-6 font-bold uppercase tracking-[0.3em] opacity-40">
                    B2B Technical AI Assistant
                </p>
            </div>
        </div>
    );
}
