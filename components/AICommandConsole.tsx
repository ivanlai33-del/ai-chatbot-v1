"use client";

import React, { useState } from 'react';
import { CONSOLE_NAV_ITEMS } from '@/config/console_config';
import { BarChart3 } from 'lucide-react';
import ConsoleSidebar from './console/ConsoleSidebar';
import ConsoleHeader from './console/ConsoleHeader';
import ConsoleStats from './console/ConsoleStats';
import ConsoleLiveFeed from './console/ConsoleLiveFeed';
import ConsoleQuickActions from './console/ConsoleQuickActions';
import ConsoleStrategicAdvisor from './console/ConsoleStrategicAdvisor';

interface AICommandConsoleProps {
    botId?: string;
    lineUserName?: string;
    lineUserId?: string;
}

export default function AICommandConsole({ botId, lineUserName, lineUserId }: AICommandConsoleProps) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const activeTabLabel = CONSOLE_NAV_ITEMS.find(n => n.id === activeTab)?.label;

    return (
        <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden font-sans">
            <ConsoleSidebar 
                isSidebarOpen={isSidebarOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                navItems={CONSOLE_NAV_ITEMS}
                lineUserName={lineUserName}
            />

            <main className="flex-1 flex flex-col relative overflow-hidden">
                <ConsoleHeader activeTabLabel={activeTabLabel} />

                {/* Main View Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                    {activeTab === 'dashboard' ? (
                        <>
                            <ConsoleStats />
                            
                            {/* AI Strategic Advisor Section - The "Brain" of the business */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                <div className="xl:col-span-2">
                                    <ConsoleStrategicAdvisor />
                                </div>
                                <div className="space-y-8">
                                    <ConsoleLiveFeed />
                                    <ConsoleQuickActions />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-30">
                            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-6">
                                <BarChart3 className="w-10 h-10 text-indigo-400/50" />
                            </div>
                            <p className="text-sm font-black uppercase tracking-[0.3em] text-indigo-300">模組開發中 · 即將解鎖上帝視角</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
