'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, MessageSquare, AlertCircle, Loader2, Minimize2 } from 'lucide-react';

interface ConsoleAIAssistantProps {
    activeTab: string;
    contextData: any;
}

const DEFAULT_GREETING = { role: 'assistant', content: '您好，iVan 老闆！我是您的「上帝視角經營顧問」。我已載入當前頁面的數據，有什麼我可以幫您分析或解決的嗎？' };

export default function ConsoleAIAssistant({ activeTab, contextData }: ConsoleAIAssistantProps) {
    const [messages, setMessages] = useState<any[]>([DEFAULT_GREETING]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingHistory, setIsFetchingHistory] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // ✨ Fetch Chat History on Mount ✨
    useEffect(() => {
        const fetchHistory = async () => {
            const lineId = localStorage.getItem('line_user_id');
            if (!lineId) {
                setIsFetchingHistory(false);
                return;
            }

            try {
                const res = await fetch(`/api/console/chat?userId=${lineId}`);
                const data = await res.json();
                if (data.success && data.messages.length > 0) {
                    // Map database fields to message format
                    const history = data.messages.map((m: any) => ({
                        role: m.role,
                        content: m.content
                    }));
                    setMessages(history);
                }
            } catch (e) {
                console.error("Failed to fetch history", e);
            } finally {
                setIsFetchingHistory(false);
            }
        };

        fetchHistory();
    }, []);

    // Scroll to bottom on updates
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading, isFetchingHistory]);

    const handleSend = async (customInput?: string) => {
        const textToSend = customInput || input;
        if (!textToSend.trim() || isLoading) return;

        // Force clear input UI immediately if it's from the textarea
        if (!customInput) {
            setInput('');
        }

        const userMsg = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const res = await fetch('/api/console/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    activeTab,
                    contextData,
                    adminId: localStorage.getItem('line_user_id')
                })
            });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
            }
        } catch (e) {
            console.error("AI Assistant Error:", e);
            setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，暫時無法連接到大腦，請稍後再試。' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-[350px] border-l border-white/5 bg-slate-900/50 backdrop-blur-xl flex flex-col h-full relative">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-indigo-500/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">上帝視角顧問</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">AI Strategist Online</span>
                        </div>
                    </div>
                </div>
                <button title="縮小" className="text-slate-500 hover:text-white transition-colors">
                    <Minimize2 className="w-4 h-4" />
                </button>
            </div>

            {/* Context Awareness Badge */}
            <div className="px-4 py-2 bg-slate-800/40 border-b border-white/5 flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-indigo-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase truncate">分析環境：{activeTab}</span>
            </div>

            {/* Chat Body */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
                {isFetchingHistory ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-[12px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                                msg.role === 'assistant' 
                                    ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50' 
                                    : 'bg-indigo-600 text-white rounded-tr-none'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700/50 flex items-center gap-2">
                            <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">思考分析中...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900 border-t border-white/5">
                <div className="relative group">
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="請輸入您的問題..."
                        className="w-full bg-slate-800 border-slate-700 rounded-xl py-3 pl-4 pr-12 text-xs text-white placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all resize-none h-10 min-h-[44px]"
                        disabled={isFetchingHistory}
                    />
                    <button 
                        onClick={() => handleSend()}
                        disabled={isLoading || !input.trim() || isFetchingHistory}
                        title="傳送訊息"
                        className="absolute right-2 top-1.5 p-2 bg-indigo-500 text-white rounded-lg shadow-lg hover:bg-indigo-400 transition-all disabled:opacity-30 disabled:grayscale"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => handleSend('總結目前的營運數據')}
                        title="總結數據"
                        className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-[9px] font-bold text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
                        disabled={isFetchingHistory}
                    >
                        📊 數據總結
                    </button>
                    <button 
                        onClick={() => handleSend('分析並提取客戶痛點')}
                        title="分析痛點"
                        className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-[9px] font-bold text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
                        disabled={isFetchingHistory}
                    >
                        🔍 客戶痛點
                    </button>
                </div>
            </div>
        </div>
    );
}
