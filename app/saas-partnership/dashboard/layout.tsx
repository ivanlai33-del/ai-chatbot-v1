"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/PartnerDashboard/Sidebar';
import ProjectTreeSidebar from '@/components/PartnerDashboard/ProjectTreeSidebar';
import TopBar from '@/components/PartnerDashboard/TopBar';
import { PartnerProvider } from '@/context/PartnerContext';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAGICenter = pathname === '/saas-partnership/dashboard';
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <PartnerProvider>
            <div className="flex flex-col h-screen overflow-hidden">
                <TopBar />
                
                <div className="flex flex-1 overflow-hidden relative">
                    {/* 指揮中心模式不顯示側欄 */}
                    {!isAGICenter && (
                        <ProjectTreeSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                    )}
                    
                    <main className={`flex-1 overflow-y-auto saas-main relative transition-all duration-300 ${isAGICenter ? 'w-full' : ''}`}>
                        <div className="min-h-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </PartnerProvider>
    );
}
