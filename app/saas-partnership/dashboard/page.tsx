"use client";

import React, { useState, useEffect } from 'react';
import { 
    Send, Sparkles, Bot, User, 
    Zap, Hammer, ShieldCheck, 
    MessageSquare, Plus, Mic,
    Layout, ArrowRight, Box, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePartner } from '@/context/PartnerContext';
import Link from 'next/link';
import { AGIProjection } from '@/components/PartnerDashboard/AGIProjection';

export default function AGICommandCenter() {
    const { partner, activeOA } = usePartner();
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            role: 'agi', 
            content: '您好！我是您的 AGI 數位店長。目前 GPT-4o 核心與 DALL-E 3 視覺神經已點火完成，我已準備好為您執行任何營運調度或素材生成。請問今天我們要進行什麼任務？' 
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const userMsg = { id: Date.now(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // --- 呼叫真實 GPT-4o API (動態金鑰版) ---
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    partnerId: partner.id,
                    oaId: activeOA?.id,
                    messages: messages.map(m => ({
                        role: m.role === 'agi' ? 'assistant' : 'user',
                        content: m.content
                    })).concat({ role: 'user', content: input })
                })
            });

            const data = await response.json();

            if (data.error) {
                setMessages(prev => [...prev, { 
                    id: Date.now() + 1, 
                    role: 'agi', 
                    content: `⚠️ 系統提示：${data.error} (請確認 .env 檔案中已設定 OPENAI_API_KEY)`,
                }]);
            } else {
                setMessages(prev => [...prev, { 
                    id: Date.now() + 1, 
                    role: 'agi', 
                    content: data.content,
                    projectionType: data.projectionType,
                    projectionData: data.projectionData
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                role: 'agi', 
                content: '❌ 連線中斷。請檢查網路環境或後端伺服器狀態。',
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col bg-slate-50/20">
            {/* Chat Space */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 scrollbar-hide flex flex-col pt-12">
                {messages.map((msg) => (
                    <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-6 max-w-5xl ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                    >
                        {/* Avatar */}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                            msg.role === 'agi' 
                                ? 'bg-gradient-to-br from-[#06C755] to-[#05A044] text-white' 
                                : 'bg-white text-[#06C755] border border-emerald-50'
                        }`}>
                            {msg.role === 'agi' ? <Bot className="w-7 h-7" /> : <User className="w-7 h-7" />}
                        </div>

                        {/* Content & Projections */}
                        <div className={`flex flex-col gap-6 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`p-8 rounded-[2.5rem] text-lg leading-relaxed shadow-sm border ${
                                msg.role === 'agi' 
                                    ? 'bg-white text-slate-800 border-white rounded-tl-none font-medium' 
                                    : 'bg-gradient-to-br from-[#06C755] to-[#05A044] text-white border-[#06C755] rounded-tr-none font-bold shadow-emerald-500/10'
                            }`}>
                                {msg.content}
                            </div>
                            
                            {/* 實體投影顯示 */}
                            {(msg as any).projectionType && (
                                <div className="mt-2">
                                    <AGIProjection 
                                        type={(msg as any).projectionType} 
                                        data={(msg as any).projectionData} 
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {/* Loading State */}
                {isLoading && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-6 items-center"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#06C755] to-[#05A044] text-white flex items-center justify-center shadow-lg">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                        <p className="text-sm font-black text-emerald-600 animate-pulse uppercase tracking-[0.2em]">AGI 數位店長正在運算中...</p>
                    </motion.div>
                )}
            </div>

            {/* Input Bar */}
            <footer className="p-8 lg:p-12 pt-0">
                <div className="max-w-5xl mx-auto relative group">
                    <div className="absolute inset-0 bg-emerald-500 blur-[30px] opacity-0 group-focus-within:opacity-10 transition-opacity" />
                    <div className="relative bg-white/80 backdrop-blur-3xl border border-slate-100 rounded-[3rem] p-5 flex items-center gap-4 shadow-2xl">
                        <button className="p-4 text-slate-300 hover:text-emerald-500 transition-colors">
                            <Plus className="w-7 h-7" />
                        </button>
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isLoading ? "正在接收靈感..." : "輸入指令來調度您的功能積木 (例如: 出一張海報, 查看報表)..."}
                            disabled={isLoading}
                            className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-slate-800 placeholder:text-slate-300 px-2"
                        />
                        <div className="flex items-center gap-3">
                            <button className="p-4 text-slate-300 hover:text-emerald-500 transition-colors">
                                <Mic className="w-7 h-7" />
                            </button>
                            <button 
                                onClick={handleSend}
                                disabled={isLoading}
                                className="w-16 h-16 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-[2rem] flex items-center justify-center hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Send className="w-8 h-8" />}
                            </button>
                        </div>
                    </div>
                </div>
                <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-8 opacity-60">Powered by AGI Orchestration Engine 4.0</p>
            </footer>
        </div>
    );
}
