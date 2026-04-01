'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { 
    LayoutDashboard, 
    BarChart3, 
    ChevronRight, 
    Sparkles, 
    AlertCircle,
    Loader2,
    PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Modular Registry & UI Components
import { WIDGET_REGISTRY, ConsoleWidget } from '@/lib/console/widgetRegistry';
import ConsoleHeader from './console/ConsoleHeader';
import ConsoleAIAssistant from './console/ConsoleAIAssistant';

export default function AICommandConsole() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [viewMode, setViewMode] = useState<'platform' | 'personal'>('platform');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [widgetData, setWidgetData] = useState<any>(null); // 📊 Bridge for real data

    // Get Active Widget Data
    const activeWidget = WIDGET_REGISTRY.find(w => w.id === activeTab) || WIDGET_REGISTRY[0];

    // Clear data on tab change
    useEffect(() => {
        setWidgetData(null);
    }, [activeTab]);

    return (
        <div className="flex h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden">
            {/* 🏰 Modular Sidebar (Lego-based) */}
            <aside className={`bg-slate-950/50 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-500 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="p-6 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20 ring-4 ring-indigo-500/5">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        {isSidebarOpen && (
                            <motion.h1 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }}
                                className="text-sm font-black tracking-[.25em] uppercase text-white"
                            >
                                iVan HQ
                            </motion.h1>
                        )}
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {/* Iterate over registry to build menu */}
                    {WIDGET_REGISTRY.map((widget) => {
                        const Icon = widget.icon;
                        const isActive = activeTab === widget.id;

                        return (
                            <button
                                key={widget.id}
                                onClick={() => setActiveTab(widget.id)}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                                    isActive 
                                        ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' 
                                        : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
                                }`}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`} />
                                {isSidebarOpen && (
                                    <span className="text-[11px] font-black uppercase tracking-widest">{widget.label}</span>
                                )}
                                {widget.status === 'new' && isSidebarOpen && (
                                    <span className="absolute right-4 px-1.5 py-0.5 bg-rose-500 text-[8px] font-black rounded italic">NEW</span>
                                )}
                                {isActive && (
                                    <motion.div layoutId="activeInd" className="absolute left-0 w-1 h-6 bg-white rounded-full" />
                                )}
                            </button>
                        );
                    })}

                    {/* Placeholder for Adding New Widgets */}
                    {isSidebarOpen && (
                        <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-600 hover:text-slate-400 border border-dashed border-slate-800 transition-all mt-8 group">
                            <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">開發新功能積木</span>
                        </button>
                    )}
                </nav>
            </aside>

            {/* 🛰️ Main Content Orbit */}
            <div className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/50 via-[#020617] to-[#020617]">
                <ConsoleHeader 
                    activeTabLabel={activeWidget.label} 
                    viewMode={viewMode} 
                    setViewMode={setViewMode} 
                />

                <main className="flex-1 overflow-y-auto p-10 custom-scrollbar scroll-smooth">
                    <div className="max-w-6xl mx-auto h-full">
                        <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full"
                                >
                                    {/* Render Widget Component with Data Bridge */}
                                    <activeWidget.component onDataUpdate={setWidgetData} />
                                </motion.div>
                            </AnimatePresence>
                        </Suspense>
                    </div>
                </main>
            </div>

            {/* 🤖 Persistent Strategist Sidekick (The God View Assistant) */}
            <ConsoleAIAssistant 
                activeTab={activeWidget.label}
                contextData={{
                    currentFeature: activeWidget.id,
                    featureStatus: activeWidget.status,
                    realTimeData: widgetData, // 🚀 Authentic Data from Widget
                    systemStable: true
                }}
            />
        </div>
    );
}
