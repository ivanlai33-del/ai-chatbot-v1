'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lock, Star, Settings, Trash2, Link2, ChevronDown, Check, AlertTriangle } from 'lucide-react';
import ChatBotAvatar from '@/components/chat/ChatBotAvatar';
import { useChatSandbox } from '@/hooks/useChatSandbox';
import { getStoreLimit } from '@/lib/config/pricing';
import { getPlanName, getRequiredPlanName } from '@/lib/feature-access';

interface AISandboxChatProps {
    bots: any[];
    selectedBotId: string | null;
    setSelectedBotId: (id: string | null) => void;
    planLevel: number;
    config: any; // StoreConfig
    onOpenSettings?: () => void;
    onDeleteBot?: () => void;
}

export default function AISandboxChat({ 
    bots, 
    selectedBotId, 
    setSelectedBotId,
    planLevel, 
    config,
    onOpenSettings,
    onDeleteBot
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
    const expertKeywords = ["分析師", "律師", "顧問", "管家", "護理", "教師", "專家", "醫生", "教練", "導航", "助手"];
    const isExpert = expertKeywords.some(k => rawName.includes(k));
    const assistantTitle = isExpert ? "" : "助手";

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

    return (
        <div className="flex-1 flex flex-col rounded-[40px] bg-transparent backdrop-blur-3xl relative h-full">

            {/* Glass Header (Matte White) */}
            <div className="flex items-center gap-5 px-8 py-[25px] border-b border-white/20 bg-white/50 backdrop-blur-md relative z-50 group/header">
                


                <div className="relative shrink-0 scale-90">
                    <ChatBotAvatar bot={currentBot} size="w-20 h-20" />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-2 border-white rounded-full shadow-sm ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col items-start relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsSelectingBot(!isSelectingBot)}
                        className="group/name flex items-center gap-2 text-left hover:bg-black/[0.03] px-2 -ml-2 py-1 rounded-xl transition-all"
                    >
                        <h3 className="text-[22px] font-black text-slate-900 tracking-tight leading-tight truncate">
                            {rawName}{assistantTitle}
                        </h3>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isSelectingBot ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <p className="text-[10px] text-slate-500 font-bold mt-1.5 flex items-center gap-2 opacity-70 px-2 -ml-2">
                        {isConnected ? (
                            <>LINE 同步運作中</>
                        ) : (
                            <>智庫預覽模式</>
                        )}
                    </p>

                    {/* Manager List Dropdown */}
                    <AnimatePresence>
                        {isSelectingBot && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-12 left-0 w-[240px] bg-white/90 backdrop-blur-2xl rounded-[28px] border border-white shadow-2xl z-[100] py-4 overflow-hidden ring-1 ring-black/[0.05]"
                            >
                                <div className="px-5 mb-2 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">切換 AI 店長</span>
                                    <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full ${bots.length >= getStoreLimit(planLevel) ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-500'}`}>
                                        {bots.length} / {getStoreLimit(planLevel)}
                                    </span>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar px-2">
                                    {bots.map((bot) => {
                                        const isSelected = bot.id === selectedBotId;
                                        const botStatus = bot.status === 'active';
                                        return (
                                            <button
                                                key={bot.id}
                                                onClick={() => {
                                                    setSelectedBotId(bot.id);
                                                    setIsSelectingBot(false);
                                                }}
                                                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all mb-1 ${
                                                    isSelected 
                                                        ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20' 
                                                        : 'hover:bg-black/[0.03] border border-transparent'
                                                }`}
                                            >
                                                <div className="relative shrink-0">
                                                    <ChatBotAvatar bot={bot} size="w-10 h-10" />
                                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${botStatus ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <p className={`text-[14px] font-black truncate ${isSelected ? 'text-emerald-700' : 'text-slate-800'}`}>
                                                        {bot.channelName || bot.channel_name || '未命名店長'}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-bold truncate">
                                                        {botStatus ? 'Connected' : 'Preview Mode'}
                                                    </p>
                                                </div>
                                                {isSelected && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-2 pt-2 border-t border-slate-100 px-2">
                                    {bots.length >= getStoreLimit(planLevel) ? (
                                        <button 
                                            onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'billing' }))}
                                            className="w-full py-3 px-4 rounded-xl flex items-center gap-3 text-amber-600 bg-amber-50/50 hover:bg-amber-50 transition-all font-black text-[13px] border border-dashed border-amber-200"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                <Lock className="w-4 h-4 text-amber-500" />
                                            </div>
                                            席位已達上限 (升級解鎖)
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => window.location.href = '/dashboard/connect?action=new'}
                                            className="w-full py-3 px-4 rounded-xl flex items-center gap-3 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-bold text-[13px]"
                                        >
                                            <div className="w-8 h-8 rounded-full border border-dashed border-slate-300 flex items-center justify-center">
                                                <span className="text-[18px] leading-none">+</span>
                                            </div>
                                            建立新店長席位
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Message Area — Clean & Spatial */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {chatMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center px-6">
                        <div className="w-16 h-16 rounded-3xl bg-white/50 flex items-center justify-center mb-6 shadow-sm border border-white">
                            <Star className="w-8 h-8 text-emerald-500/30" />
                        </div>
                        <p className="text-[14px] text-slate-400 font-medium leading-relaxed">
                            你好！我是您的 AI 店長。<br/>請在左側填寫智庫內容，<br/>然後在這裡測試我的回應！
                        </p>
                    </div>
                )}

                {chatMessages.map((msg, i) => (
                    <motion.div key={i}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-5 py-3.5 rounded-[24px] text-[13px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                            msg.role === 'user'
                                ? 'bg-gradient-to-br from-emerald-500 to-cyan-600 text-white rounded-tr-sm shadow-emerald-500/20'
                                : 'bg-white/80 backdrop-blur-md text-slate-700 rounded-tl-sm border border-white ring-1 ring-black/[0.03]'
                        }`}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}
                {isChatting && (
                    <div className="flex justify-start">
                        <div className="bg-white/60 backdrop-blur-md border border-white shadow-sm px-6 py-4 rounded-[24px] rounded-tl-sm">
                            <span className="flex gap-2 items-center">
                                {[0, 1, 2].map(i => (
                                    <span key={i} className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                                        style={{ animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </span>
                        </div>
                    </div>
                )}
                <div ref={chatBottomRef} />
            </div>

            {/* Cinematic Input bar */}
            <div className="px-6 py-6 bg-white/30 backdrop-blur-xl border-t border-white/20">
                <div className="flex gap-3 bg-white/60 backdrop-blur-md rounded-[28px] p-2 pr-2.5 border border-white shadow-xl shadow-black/[0.02]">
                    <input
                        type="text" value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleChat()}
                        placeholder="想問店長什麼..."
                        className="flex-1 bg-transparent border-0 px-4 py-3.5 text-[13.5px] text-slate-800 placeholder-slate-400 outline-none font-medium"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleChat()} disabled={isChatting || !chatInput.trim()}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/40 disabled:opacity-40 transition-all shrink-0"
                    >
                        <Send className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
