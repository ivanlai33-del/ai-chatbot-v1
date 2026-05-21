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
    onProposedConfig?: (config: any) => void;
    onProposedConnection?: (config: any) => void;
    isLargePortal?: boolean;
}

export default function SaaSChatInterface({ storeName, isMaster, isSaaS = true, focusedField, currentStep, isActivation = false, isProvisioning = false, botKnowledge, pageContext, onProposedConfig, onProposedConnection, isLargePortal = false }: SaaSChatInterfaceProps) {
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

            if (data.metadata?.proposedConfig && onProposedConfig) {
                onProposedConfig(data.metadata.proposedConfig);
            }

            if (data.metadata?.action === 'CONNECT_LINE' && data.metadata?.connectionConfig && onProposedConnection) {
                onProposedConnection(data.metadata.connectionConfig);
            }
        } catch (error) {
            console.error("Chat error:", error);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className={`flex flex-col h-full ${isLargePortal ? 'bg-transparent' : 'bg-transparent backdrop-blur-sm border-l border-white/20'}`}>
            {/* Header */}
            <div className={`pt-8 pb-6 px-6 ${isLargePortal ? '' : 'border-b border-white/20'} flex items-center justify-between ${isLargePortal ? '' : 'bg-transparent'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#06C755] flex items-center justify-center shadow-lg shadow-[#06C755]/20">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight">SaaS AGI 顧問</h3>
                        <p className="text-[10px] text-[#06C755] font-bold uppercase tracking-[0.3em]">Direct Orchestration</p>
                    </div>
                </div>
                {!isLargePortal && (
                    <button
                        onClick={resetChat}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-[10px] transition-all border bg-white/40 text-slate-500 border-white/60 hover:text-[#06C755] hover:bg-white"
                        title="重置對話至初始狀態"
                    >
                        <RotateCcw className="w-3 h-3" />
                        <span className="uppercase tracking-wider">Reset</span>
                    </button>
                )}
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
                            <div className={`${isLargePortal ? 'max-w-[70%]' : 'max-w-[85%]'} rounded-3xl p-6 text-xl leading-relaxed ${m.role === 'ai'
                                ? `${isLargePortal ? 'bg-white shadow-xl shadow-slate-200/50 border border-white' : 'bg-white shadow-md border border-slate-100'} text-slate-800`
                                : 'bg-[#06C755] text-white shadow-xl shadow-[#06C755]/20'
                                }`}>
                                {m.content.replace(/\*\*(.*?)\*\*/g, '$1')}
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-4 shadow-sm">
                                <span className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-[#06C755] rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-[#06C755] rounded-full animate-bounce delay-150"></span>
                                    <span className="w-1.5 h-1.5 bg-[#06C755] rounded-full animate-bounce delay-300"></span>
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className={`${isLargePortal ? 'max-w-4xl mx-auto w-full' : 'p-6 pb-12'} bg-transparent mt-auto`}>
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
                        placeholder="下達指令來建立或優化機器人..."
                        className={`w-full ${isLargePortal ? 'p-8 text-2xl shadow-2xl' : 'p-4 text-xl'} bg-white border border-white rounded-[2.5rem] text-slate-800 outline-none focus:border-[#06C755] transition-all shadow-xl shadow-slate-200/50 placeholder:text-slate-400`}
                    />
                    <button
                        onClick={handleSend}
                        title="傳送訊息"
                        aria-label="傳送訊息"
                        className={`absolute ${isLargePortal ? 'right-5' : 'right-3'} top-1/2 -translate-y-1/2 ${isLargePortal ? 'w-14 h-14 rounded-full' : 'w-10 h-10 rounded-full'} bg-[#06C755] text-white flex items-center justify-center hover:bg-[#05A044] transition-all shadow-lg shadow-[#06C755]/30`}
                    >
                        <Send className={isLargePortal ? "w-6 h-6" : "w-4 h-4"} />
                    </button>
                </div>
                <p className="text-[10px] text-slate-600 text-center mt-6 font-bold uppercase tracking-[0.3em] opacity-40">
                    {isLargePortal ? "" : "B2B Technical AI Assistant"}
                </p>
            </div>
        </div>
    );
}
