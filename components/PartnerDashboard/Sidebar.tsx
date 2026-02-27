"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    PlusCircle,
    Settings,
    ArrowLeft,
    LogOut,
    BrainCircuit
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        {
            name: '總覽儀表板',
            href: '/saas-partnership/dashboard',
            icon: LayoutDashboard
        },
        {
            name: 'AI 練功房',
            href: '/saas-partnership/dashboard/knowledge',
            icon: BrainCircuit
        },
        {
            name: '開通新席次',
            href: '/saas-partnership/dashboard/subscribe',
            icon: PlusCircle
        },
        {
            name: '帳戶設定',
            href: '#',
            icon: Settings
        },
    ];

    return (
        <aside className="w-full md:w-64 bg-[#1e293b]/30 border-r border-slate-700/50 backdrop-blur-xl flex flex-col pt-8 h-screen shrink-0">
            <div className="px-6 mb-10 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <LayoutDashboard className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-white tracking-tight">Partner Portal</span>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${isActive
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-slate-800/50">
                <Link href="/saas-partnership" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-white transition-all text-sm font-bold">
                    <ArrowLeft className="w-4 h-4" />
                    返回合作方案
                </Link>
                <button className="flex items-center gap-3 px-4 py-3 text-red-400/60 hover:text-red-400 transition-all text-sm font-bold w-full text-left">
                    <LogOut className="w-4 h-4" />
                    登出系統
                </button>
            </div>
        </aside>
    );
}
