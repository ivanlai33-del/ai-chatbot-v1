'use client';

import React from 'react';
import TopNav from './TopNav';
import { PLAN_CONFIG } from '@/config/dashboard_config';

interface DashboardLayoutProps {
    userName: string;
    userPicture: string;
    lineUserId: string;
    planLevel: number;
    onLogout: () => void;
    children: React.ReactNode;
    sidebar?: React.ReactNode;
}

export default function DashboardLayout({
    userName,
    userPicture,
    lineUserId,
    planLevel,
    onLogout,
    children,
    sidebar
}: DashboardLayoutProps) {
    return (
        <main className="min-h-screen text-slate-800 font-sans bg-[#F8FAFC]">
            <TopNav 
                userName={userName}
                userPicture={userPicture}
                lineUserId={lineUserId}
                planLevel={planLevel}
                onLogout={onLogout}
            />

            <div className="flex flex-col xl:flex-row gap-6 px-4 md:px-8 lg:px-[100px] pt-6 pb-12 max-w-[1600px] mx-auto">
                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    {children}
                </div>

                {/* Optional Sidebar (e.g. Sandbox Chat) */}
                {sidebar && (
                    <aside className="w-full xl:w-[400px] xl:shrink-0 xl:sticky xl:top-[80px] xl:h-[calc(100vh-90px)] flex flex-col overflow-hidden">
                        {sidebar}
                    </aside>
                )}
            </div>
        </main>
    );
}
