"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';

export default function PartnerChatSimulator() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '您好！我是您的 AGI 助理。您可以直接在這裡測試與 AI 的對話效果，或查看客戶的對話紀錄。', time: '12:00 PM' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI Response
        setTimeout(() => {
            const aiMsg = { 
                role: 'assistant', 
                content: `這是一個測試回應。在正式環境中，我會根據您在「功能積木」中設定的邏輯與品牌 DNA 來回答： "${input}"`, 
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] p-6 lg:p-12">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">AI 對話模擬器</h1>
                    <p className="text-slate-500 font-medium">即時測試機器人的回應邏輯與品牌語氣。</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all">
                    <RefreshCw className="w-3 h-3" /> 清除對話
                </button>
            </header>

            <div className="flex-1 bg-white/40 backdrop-blur-3xl border border-white rounded-[3rem] shadow-sm flex flex-col overflow-hidden">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    <AnimatePresence>
                        {messages.map((msg, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} gap-4`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-emerald-100">
                                        <Bot className="w-5 h-5 text-[#06C755]" />
                                    </div>
                                )}
                                <div className={`max-w-[70%] group`}>
                                    <div className={`p-5 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${
                                        msg.role === 'assistant' 
                                        ? 'bg-white text-slate-700 rounded-tl-none border border-slate-100' 
                                        : 'bg-[#06C755] text-white rounded-tr-none shadow-[#06C755]/20'
                                    }`}>
                                        {msg.content}
                                    </div>
                                    <p className={`text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest ${msg.role === 'assistant' ? 'text-left' : 'text-right'}`}>
                                        {msg.time}
                                    </p>
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <User className="w-5 h-5 text-slate-400" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                        {isTyping && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-4">
                                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                                    <Sparkles className="w-4 h-4 text-[#06C755] animate-pulse" />
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 flex gap-1 items-center shadow-sm">
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white/60 border-t border-white">
                    <div className="max-w-4xl mx-auto relative flex items-center gap-4">
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="輸入測試對話內容..."
                                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-[#06C755] transition-all"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                                <button className="p-2 text-slate-300 hover:text-slate-400 transition-colors">
                                    <Sparkles className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <button 
                            onClick={handleSend}
                            className="bg-[#06C755] text-white p-4 rounded-2xl hover:bg-black transition-all shadow-xl shadow-[#06C755]/20 flex-shrink-0"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
