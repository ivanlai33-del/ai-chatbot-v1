"use client";

import React, { useState } from 'react';
import { CONSOLE_NAV_ITEMS } from '@/config/console_config';
import ConsoleSidebar from './console/ConsoleSidebar';
import ConsoleHeader from './console/ConsoleHeader';
import ConsoleStats from './console/ConsoleStats';
import ConsoleLiveFeed from './console/ConsoleLiveFeed';
import ConsoleQuickActions from './console/ConsoleQuickActions';

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
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {activeTab === 'dashboard' ? (
                        <>
                            <ConsoleStats />
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <ConsoleLiveFeed />
                                <ConsoleQuickActions />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-40">
                            <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-600 mb-4" />
                            <p className="text-sm font-bold uppercase tracking-[0.2em]">{activeTabLabel} 模組開發中</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
