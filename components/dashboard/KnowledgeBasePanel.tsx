'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, CheckCircle2, Star, ChevronRight, AlertTriangle,
    Tag, Package, HelpCircle, GitBranch, Phone, BookOpen, Settings
} from 'lucide-react';
import { useState, useCallback } from 'react';
import type { StoreConfig } from '@/lib/chat-types';
import BotSelector from './BotSelector';

interface KnowledgeBasePanelProps {
    config: StoreConfig;
    planLevel: number;
    bots: any[];
    selectedBotId: string | null;
    setSelectedBotId: (id: string | null) => void;
    handleSave: () => void;
    onOpenSettings?: () => void;
    isSaving: boolean;
    saveSuccess: boolean;
    tabs: readonly { id: string; label: string; emoji: string }[];
    activeTab: string;
    setActiveTab: (tab: any) => void;
    isDirty?: boolean;
    children: React.ReactNode;
}

/* ─── Tab icon + label map ─────────────────────────────────── */
const TAB_META: Record<string, { Icon: React.ElementType; desc: string }> = {
    brand:     { Icon: Tag,       desc: '品牌形象 · 語調' },
    offerings: { Icon: Package,   desc: '商品 · 服務定價' },
    faq:       { Icon: HelpCircle,desc: 'Q&A · 快速問答' },
    logic:     { Icon: GitBranch, desc: '行為 · 引導策略' },
    contact:   { Icon: Phone,     desc: '地址 · 社群 · 平台' },
    rag:       { Icon: BookOpen,  desc: '文件 · 網頁學習' },
};

export default function KnowledgeBasePanel({
    config, planLevel, bots, selectedBotId, setSelectedBotId,
    handleSave, isSaving, saveSuccess, tabs, activeTab, setActiveTab,
    onOpenSettings,
    isDirty = false, children
}: KnowledgeBasePanelProps) {
    const [pendingTab, setPendingTab] = useState<string | null>(null);
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

    const pct = config.completion_pct;
    const pctColor = pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-500' : 'text-rose-500';
    const barColor = pct >= 70 ? 'bg-emerald-400' : pct >= 40 ? 'bg-amber-400' : 'bg-rose-400';

    // Derive current store name
    const currentBot = bots.find(b => b.id === selectedBotId);
    const storeName = currentBot?.channelName || currentBot?.channel_name || currentBot?.displayName || '';

    const handleTabClick = useCallback((tabId: string) => {
        if (tabId === activeTab) return;
        if (isDirty) {
            setPendingTab(tabId);
            setShowUnsavedWarning(true);
        } else {
            setActiveTab(tabId);
        }
    }, [isDirty, activeTab, setActiveTab]);

    const confirmDiscard = () => { if (pendingTab) setActiveTab(pendingTab); setPendingTab(null); setShowUnsavedWarning(false); };
    const confirmSaveFirst = async () => { await handleSave(); if (pendingTab) setActiveTab(pendingTab); setPendingTab(null); setShowUnsavedWarning(false); };
    const cancelSwitch = () => { setPendingTab(null); setShowUnsavedWarning(false); };

    return (
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-slate-200 bg-white relative">

            {/* ── Unsaved Warning Modal ── */}
            <AnimatePresence>
                {showUnsavedWarning && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm rounded-3xl">
                        <motion.div initial={{ scale: 0.92, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                            className="bg-white rounded-3xl shadow-2xl p-7 mx-6 max-w-sm w-full border border-slate-100">
                            <div className="flex items-start gap-3 mb-5">
                                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                                <div>
                                    <h3 className="text-[16px] font-black text-slate-800 mb-1">尚未儲存修改</h3>
                                    <p className="text-[13px] text-slate-500 leading-relaxed">有未儲存的變更，切換後將會遺失。</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={confirmSaveFirst} className="w-full py-3 rounded-2xl bg-slate-900 text-white font-black text-[13px] hover:bg-slate-700 transition-all">先儲存，再切換</button>
                                <button onClick={confirmDiscard} className="w-full py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-all">放棄修改，直接切換</button>
                                <button onClick={cancelSwitch} className="w-full py-2 text-slate-400 font-medium text-[12px] hover:text-slate-600 transition-all">取消</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ════════ HEADER ════════ */}
            <div className="px-6 pt-5 pb-4 border-b border-slate-100">

                {/* Store name + save button row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0">
                        <AnimatePresence mode="wait">
                            {storeName ? (
                                <motion.div key={storeName} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                                    {/* Store name — large black text, no badge */}
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-[26px] font-black text-slate-900 leading-tight tracking-tight truncate max-w-[340px]">
                                            {storeName}
                                        </h2>
                                        {selectedBotId && !selectedBotId.startsWith('empty-') && (
                                            <button 
                                                onClick={onOpenSettings}
                                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all shrink-0"
                                                title="管理 API 金鑰"
                                            >
                                                <Settings className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">AI 店長智庫</p>
                                </motion.div>
                            ) : (
                                <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <h2 className="text-[22px] font-black text-slate-800 leading-tight">AI 店長智庫</h2>
                                    <p className="text-[11px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Knowledge Base</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Save button */}
                    <div className="relative shrink-0">
                        <motion.button onClick={handleSave} disabled={isSaving}
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all disabled:opacity-50 ${
                                isDirty
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {isSaving ? <span className="animate-spin text-sm">◌</span> : <Save className="w-3.5 h-3.5" />}
                            {isSaving ? '儲存中...' : isDirty ? '儲存變更' : '儲存'}
                        </motion.button>
                        <AnimatePresence>
                            {saveSuccess && (
                                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-emerald-600 text-[10px] font-black whitespace-nowrap flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> 已儲存
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Bot Selector */}
                <BotSelector bots={bots} selectedBotId={selectedBotId} setSelectedBotId={setSelectedBotId} />

                {/* Pending warning */}
                {bots.find(b => b.id === selectedBotId)?.status === 'pending' && (
                    <div className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-[12px] font-bold">
                        <span>尚未完成 LINE 金鑰串接</span>
                        <button onClick={() => window.location.href = `/dashboard/connect?action=new&botId=${selectedBotId}`}
                            className="ml-auto bg-amber-500 text-white px-3 py-1 rounded-lg hover:bg-amber-600 transition-all text-[11px]">
                            立即補齊
                        </button>
                    </div>
                )}

                {/* Progress bar */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">知識庫完成度</span>
                        <span className={`text-[12px] font-black ${pctColor}`}>{pct}%</span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div className={`h-full rounded-full ${barColor}`}
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} />
                    </div>
                </div>
            </div>

            {/* ════════ TAB NAV — 2×3 monochrome grid ════════ */}
            <div className="px-6 pt-4 pb-0 border-b border-slate-100 bg-white">
                <div className="grid grid-cols-3 gap-2 pb-4">
                    {tabs.map(tab => {
                        const meta = TAB_META[tab.id] || { Icon: Tag, desc: '' };
                        const { Icon } = meta;
                        const isActive = activeTab === tab.id;
                        return (
                            <motion.button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id as any)}
                                whileHover={!isActive ? { scale: 1.02 } : {}}
                                whileTap={{ scale: 0.97 }}
                                style={isActive ? { background: 'linear-gradient(145deg, #2d3a4a 0%, #1e2b38 100%)' } : {}}
                                className={`flex flex-col items-center justify-center gap-2 py-3.5 px-2 rounded-2xl transition-all duration-150 border ${
                                    isActive
                                        ? 'border-[#2d3a4a] shadow-lg shadow-slate-900/20'
                                        : 'bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                                }`}
                            >
                                <Icon className={`w-5 h-5 transition-all ${isActive ? 'text-white' : 'text-slate-400'}`} strokeWidth={1.5} />
                                <span className={`text-[14.5px] font-black leading-tight text-center ${isActive ? 'text-white' : 'text-slate-700'}`}>
                                    {tab.label}
                                </span>
                                <span className={`text-[10.5px] font-medium text-center leading-tight hidden sm:block ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                                    {meta.desc}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* ════════ CONTENT ════════ */}
            {selectedBotId?.startsWith('empty-') ? (
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                    <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center mb-6">
                        <ChevronRight className="w-6 h-6 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-2">此專屬店長空缺中</h3>
                    <p className="text-slate-400 mb-7 max-w-sm text-[13px] leading-relaxed">
                        請將您的 LINE 官方帳號與系統串聯，分配給這位店長。
                    </p>
                    <button onClick={() => window.location.href = '/dashboard/connect?action=new'}
                        className="bg-slate-900 hover:bg-slate-700 text-white px-7 py-3 rounded-xl font-black transition-all text-[13px]">
                        立即前往串接
                    </button>
                    <button onClick={() => window.location.href = '/dashboard/connect?action=new&mode=batch'}
                        className="mt-3 text-slate-400 font-medium text-[12px] hover:text-slate-600 flex items-center gap-1.5">
                        <Star className="w-3 h-3" />
                        超過 3 個店家？批次同步
                    </button>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                    {children}
                </div>
            )}
        </div>
    );
}
