'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
    Save, CheckCircle2, Star, ChevronRight, AlertTriangle,
    Tag, Package, HelpCircle, GitBranch, Phone, BookOpen, Settings,
    Trash2, X, Brain, Link2, Lock, TrendingUp, ShieldAlert
} from 'lucide-react';
import { useState, useCallback } from 'react';
import type { StoreConfig } from '@/lib/chat-types';
import BotSelector from './BotSelector';
import { getFeatureAccess } from '@/lib/feature-access';

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
    showDeleteConfirm?: boolean;
    setShowDeleteConfirm?: (show: boolean) => void;
    children: React.ReactNode;
}

const TAB_META: Record<string, { Icon: React.ElementType; desc: string }> = {
    brand:     { Icon: Tag,       desc: '品牌形象 · 語調' },
    dojo:      { Icon: Brain,     desc: '戰略指令 · 指令積木' },
    offerings: { Icon: Package,   desc: '商品 · 服務定價' },
    faq:       { Icon: HelpCircle,desc: 'Q&A · 快速問答' },
    logic:     { Icon: GitBranch, desc: '行為 · 引導策略' },
    contact:   { Icon: Phone,     desc: '地址 · 社群 · 平台' },
    rag:       { Icon: BookOpen,  desc: '文件 · 網頁學習' },
    audience:  { Icon: Tag,       desc: '標籤 · 自動化分群' },
    trends:    { Icon: TrendingUp, desc: '產業趨勢 · 市場週報' },
    guardian:  { Icon: ShieldAlert, desc: '品牌防護 · 情緒警報' },
    billing:   { Icon: Settings,  desc: '訂閱 · 額度查閱' },
};

export default function KnowledgeBasePanel({
    config, planLevel, bots, selectedBotId, setSelectedBotId,
    handleSave, isSaving, saveSuccess, tabs, activeTab, setActiveTab,
    onOpenSettings,
    isDirty = false, 
    showDeleteConfirm = false,
    setShowDeleteConfirm,
    children 
}: KnowledgeBasePanelProps) {
    const [pendingTab, setPendingTab] = useState<string | null>(null);
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

    const handleTabClick = useCallback((tabId: string) => {
        if (tabId === activeTab) return;
        if (isDirty) {
            setPendingTab(tabId);
            setShowUnsavedWarning(true);
        } else {
            setActiveTab(tabId);
        }
    }, [activeTab, isDirty, setActiveTab]);

    const confirmTabSwitch = () => {
        if (pendingTab) {
            setActiveTab(pendingTab);
            setPendingTab(null);
        }
        setShowUnsavedWarning(false);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-white/25 backdrop-blur-3xl  rounded-[40px] overflow-hidden">
            {/* Header Area */}
            <div className="bg-white/40 backdrop-blur-md border-b px-4 md:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4 md:gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-[18px] md:text-[20px] font-black text-slate-900 leading-none">智庫中心面板</h2>
                            <div className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-[10px] font-black text-emerald-600 uppercase tracking-wider">Live</div>
                        </div>
                        <p className="text-[10px] md:text-[12px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                             System Configuration <ChevronRight className="w-3 h-3" /> <span className="text-slate-900">{activeTab}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={onOpenSettings}
                            className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-emerald-600 transition-all font-black text-[14px]"
                        >
                            <Settings className="w-4 h-4" />
                            API金鑰設定
                        </button>
                        <button 
                            onClick={() => setShowDeleteConfirm && setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-rose-500 transition-all font-black text-[14px]"
                        >
                            <Trash2 className="w-4 h-4" />
                            刪除店長
                        </button>
                        <button 
                            onClick={() => window.location.href = '/dashboard/connect'}
                            className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-indigo-600 transition-all font-black text-[14px]"
                        >
                            <Link2 className="w-4 h-4" />
                            串接店長
                        </button>
                    </div>
                    
                    <button
                        onClick={handleSave}
                        disabled={!isDirty || isSaving}
                        className={`
                            relative h-12 px-6 rounded-[24px] flex items-center gap-3 font-black text-[14px] transition-all
                            ${isSaving ? 'bg-slate-100 text-slate-400' : 
                              isDirty ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0' : 
                              'bg-white/50 text-slate-400 '}
                        `}
                    >
                        {isSaving ? <LoaderSpinner /> : <Save className="w-4 h-4" />}
                        {isSaving ? '同步中...' : '儲存變更'}
                        {isDirty && !isSaving && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white rounded-full" />
                        )}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 min-h-0">
                {/* Fixed Side Navigation */}
                <div className="w-[250px] border-r bg-white/10 backdrop-blur-xl p-5 overflow-y-auto shrink-0 glass-scrollbar">
                    <div className="space-y-1.5 pt-2">
                        {tabs.map((tab) => {
                            const meta = TAB_META[tab.id] || TAB_META.brand;
                            const isActive = activeTab === tab.id;
                            const fa = getFeatureAccess(planLevel);
                            
                            // Check lock status for sidebar indicator
                            let isTabLocked = false;
                            if (tab.id === 'dojo') isTabLocked = fa.instantCommands === 0;
                            if (tab.id === 'offerings') isTabLocked = fa.products === 0;
                            if (tab.id === 'faq') isTabLocked = fa.faq === 0;
                            if (tab.id === 'logic') isTabLocked = fa.guidanceRules === 0;
                            if (tab.id === 'contact') isTabLocked = !fa.contactPortal;
                            if (tab.id === 'rag') isTabLocked = fa.pdfLearning === 0 && fa.webLearning === 0;
                            if (tab.id === 'audience') isTabLocked = !fa.crmTagging;
                            if (tab.id === 'brand') isTabLocked = !fa.brandDNA;
                            
                            return (
                                <motion.button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id as string)}
                                    animate={{ scale: isActive ? 1.12 : 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className={`
                                        w-full group flex items-center gap-4 p-4 rounded-[24px] transition-all
                                        ${isActive ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/20 z-10' : 'text-slate-500 hover:bg-white'}
                                    `}
                                >
                                    <div className={`
                                        p-2 rounded-[24px] transition-colors
                                        ${isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white shadow-sm'}
                                    `}>
                                        <meta.Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-600'}`} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-[15px] font-black leading-none">{tab.label}</p>
                                            {isTabLocked && (
                                                <Lock className={`w-3 h-3 ${isActive ? 'text-white/60' : 'text-amber-400'}`} />
                                            )}
                                        </div>
                                        <p className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-emerald-50/70' : 'text-slate-400'}`}>
                                            {meta.desc}
                                        </p>
                                    </div>
                                    {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
                    <div className="flex-1 overflow-y-auto px-10 pt-6 pb-12 glass-scrollbar">
                        {saveSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 rounded-[24px] bg-emerald-500 text-white flex items-center gap-3 shadow-lg shadow-emerald-500/20"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-black text-[14px]">變更已同步完成！你的 AI 店長變得更聰明了。</span>
                            </motion.div>
                        )}
                        <div className="max-w-6xl">
                            {children}
                        </div>
                    </div>
                </div>
            </div>

            {/* Unsaved Warning Modal */}
            <AnimatePresence>
                {showUnsavedWarning && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="w-16 h-16 rounded-[24px] bg-amber-50 flex items-center justify-center mb-6">
                                <AlertTriangle className="w-8 h-8 text-amber-500" />
                            </div>
                            <h4 className="text-[24px] font-black text-slate-900 mb-2">尚未儲存變更！</h4>
                            <p className="text-slate-500 font-bold mb-8 leading-relaxed">
                                您有一些變更尚未儲存。如果現在離開，這些變更將會遺失。確定要切換分頁嗎？
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowUnsavedWarning(false)}
                                    className="flex-1 h-12 rounded-[24px] bg-slate-100 text-slate-600 font-black text-[14px]"
                                >
                                    留在原處
                                </button>
                                <button
                                    onClick={confirmTabSwitch}
                                    className="flex-1 h-12 rounded-[24px] bg-slate-900 text-white font-black text-[14px]"
                                >
                                    放棄並離開
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function LoaderSpinner() {
    return (
        <div className="w-4 h-4 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
    );
}
