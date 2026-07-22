'use client';

import React, { useState } from 'react';
import TopNav from './TopNav';
import { PLAN_CONFIG } from '@/config/dashboard_config';

interface DashboardLayoutProps {
    userName: string;
    userPicture: string;
    lineUserId: string;
    planLevel: number;
    billingCycle?: 'monthly' | 'yearly';
    onLogout: () => void;
    children: React.ReactNode;
    sidebar?: (props: { isCollapsed: boolean; onToggle: () => void }) => React.ReactNode;
}

export default function DashboardLayout({
    userName,
    userPicture,
    lineUserId,
    planLevel,
    billingCycle,
    onLogout,
    children,
    sidebar
}: DashboardLayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => setIsCollapsed(prev => !prev);

    return (
        <main className="min-h-screen text-slate-800 font-sans relative">
            {/* 🎨 Cinematic Background (Using b_01.svg) */}
            <div 
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/b_01.svg')" }}
            />

            <div className="relative z-10 min-w-[1024px] overflow-x-auto">
                <TopNav 
                    userName={userName}
                    userPicture={userPicture}
                    lineUserId={lineUserId}
                    planLevel={planLevel}
                    billingCycle={billingCycle}
                    onLogout={onLogout}
                />

                <div className="flex flex-col xl:flex-row gap-6 px-6 pt-5 pb-6 max-w-[1900px] mx-auto min-h-[calc(100vh-80px)] transition-all duration-300">
                    {/* AI Chat Sidebar (Collapsible Left Drawer) */}
                    {sidebar && (
                        <aside 
                            className={`w-full xl:shrink-0 xl:sticky xl:top-[100px] xl:h-[calc(100vh-124px)] self-start flex flex-col z-20 transition-all duration-300 ${
                                isCollapsed ? 'xl:w-[92px]' : 'xl:w-[420px]'
                            }`}
                        >
                            <div className="flex-1 glass-border-refined bg-white/25 backdrop-blur-3xl rounded-[40px] overflow-hidden flex flex-col relative group">
                                <div className="relative z-10 flex flex-col h-full">
                                    {sidebar({ isCollapsed, onToggle: toggleSidebar })}
                                </div>
                            </div>
                        </aside>
                    )}

                    {/* Main Content Area (Bento Primary - Expands automatically) */}
                    <div className="flex-1 min-w-0 xl:h-[calc(100vh-124px)] flex flex-col transition-all duration-300">
                        {children}
                    </div>
                </div>
            </div>
        </main>
    );
}
