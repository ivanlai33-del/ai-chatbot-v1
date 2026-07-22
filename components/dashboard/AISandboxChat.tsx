'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lock, Star, Settings, Trash2, Link2, ChevronDown, Check, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import ChatBotAvatar from '@/components/chat/ChatBotAvatar';
import { useChatSandbox } from '@/hooks/useChatSandbox';

interface AISandboxChatProps {
    bots: any[];
    selectedBotId: string | null;
    setSelectedBotId: (id: string | null) => void;
    planLevel: number;
    config: any;
    onOpenSettings?: () => void;
    onDeleteBot?: () => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export default function AISandboxChat({ 
    bots, 
    selectedBotId, 
    setSelectedBotId,
    planLevel, 
    config,
    onOpenSettings,
    onDeleteBot,
    isCollapsed = false,
    onToggleCollapse
}: AISandboxChatProps) {
    const [isSelectingBot, setIsSelectingBot] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const chatBottomRef = useRef<HTMLDivElement>(null);
    const { 
        chatInput, 
        setChatInput, 
        chatMessages, 
        isChatting, 
        handleChat 
    } = useChatSandbox({ planLevel, config });

    const currentBot = bots.find(b => b.id === selectedBotId);
    const isConnected = !!(currentBot?.status === 'active');
    
    const rawName = config?.brand_dna?.name || currentBot?.channelName || 'AI 專家預覽';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsSelectingBot(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const container = chatBottomRef.current?.parentElement;
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [chatMessages]);

    // 🔴 收合狀態視窗 (Collapsed Mini View)
    if (isCollapsed) {
        return (
            <div className="flex-1 flex flex-col items-center py-6 px-2 h-full justify-between relative group">
                <div className="flex flex-col items-center gap-4 w-full">
                    {/* 展開控制按鈕 */}
                    <button
                        onClick={onToggleCollapse}
                        className="p-2.5 rounded-2xl bg-white/60 hover:bg-emerald-500 hover:text-white text-slate-600 transition-all shadow-sm active:scale-95 flex items-center justify-center"
                        title="展開 AI 專家預覽視窗"
                    >
                        <PanelLeftOpen className="w-5 h-5" />
                    </button>

                    {/* 大頭貼 (點擊也可展開) */}
                    <button 
                        onClick={onToggleCollapse}
                        className="relative group/avatar cursor-pointer"
                        title={`展開視窗：${rawName}`}
                    >
                        <ChatBotAvatar bot={currentBot} size="w-14 h-14" />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 border-2 border-white rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                    </button>

                    {/* 直向文字縮寫 */}
                    <div className="writing-vertical font-black text-slate-800 text-xs tracking-wider opacity-80 max-h-40 overflow-hidden text-center pt-2">
                        {rawName}
                    </div>
                </div>

                {/* 底部功能圖示 */}
                <div className="flex flex-col items-center gap-3">
                    <button
                        onClick={onOpenSettings}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/50 transition-all"
                        title="API 金鑰設定"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    // 🟢 展開狀態視窗 (Full Normal View)
    return (
        <div className="flex-1 flex flex-col rounded-[40px] bg-transparent backdrop-blur-3xl relative h-full">
            {/* Glass Header (Matte White) */}
            <div className="flex items-center gap-4 px-6 py-[20px] border-b border-white/20 bg-white/50 backdrop-blur-md relative z-50 group/header justify-between">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="relative shrink-0 scale-90">
                        <ChatBotAvatar bot={currentBot} size="w-14 h-14" />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full shadow-sm ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col items-start relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setIsSelectingBot(!isSelectingBot)}
                            className="group/name flex items-center gap-1.5 text-left hover:bg-black/[0.03] px-2 -ml-2 py-0.5 rounded-xl transition-all"
                        >
                            <h3 className="text-[18px] font-black text-slate-900 tracking-tight leading-tight truncate">
                                {rawName}
                            </h3>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isSelectingBot ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <p className="text-[10px] text-slate-500 font-bold flex items-center gap-2 opacity-70 px-2 -ml-2">
                            {isConnected ? <>LINE 同步運作中</> : <>智庫預覽模式</>}
                        </p>

                        {/* Manager List Dropdown */}
                        <AnimatePresence>
                            {isSelectingBot && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl border border-slate-200/80 shadow-2xl p-2 z-50"
                                >
                                    <div className="text-[10px] font-bold text-slate-400 px-3 py-1.5 border-b border-slate-100 flex justify-between items-center">
                                        <span>切換 AI 店長</span>
                                        <span className="text-emerald-600">{bots.length}/6</span>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto space-y-1 py-1">
                                        {bots.map(b => (
                                            <button
                                                key={b.id}
                                                onClick={() => {
                                                    setSelectedBotId(b.id);
                                                    setIsSelectingBot(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedBotId === b.id ? 'bg-emerald-500/10 text-emerald-700' : 'hover:bg-slate-50 text-slate-700'}`}
                                            >
                                                <span className="truncate">{b.channelName || b.channel_name || '未命名店長'}</span>
                                                {selectedBotId === b.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Header Action Tools */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={onOpenSettings}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/50 transition-all"
                        title="API 金鑰與串接設定"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                    {onToggleCollapse && (
                        <button
                            onClick={onToggleCollapse}
                            className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                            title="收合預覽視窗，加大右側智庫"
                        >
                            <PanelLeftClose className="w-4.5 h-4.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(100vh-280px)]">
                {chatMessages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role !== 'user' && (
                            <ChatBotAvatar bot={currentBot} size="w-8 h-8 shrink-0 mt-1" />
                        )}
                        <div
                            className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed font-medium shadow-sm ${
                                msg.role === 'user'
                                    ? 'bg-emerald-600 text-white rounded-tr-none'
                                    : 'bg-white/80 text-slate-800 border border-slate-100 rounded-tl-none'
                            }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isChatting && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold p-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>AI 思考回覆中...</span>
                    </div>
                )}
                <div ref={chatBottomRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-white/20 bg-white/40 backdrop-blur-md">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleChat();
                    }}
                    className="flex items-center gap-2"
                >
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="測試對話或向 AI 發問..."
                        className="flex-1 bg-white/80 text-xs px-4 py-3 rounded-2xl border border-slate-200/80 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                    <button
                        type="submit"
                        disabled={isChatting || !chatInput.trim()}
                        className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
