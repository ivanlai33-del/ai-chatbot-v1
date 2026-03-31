'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
}

interface ConsoleSidebarProps {
    isSidebarOpen: boolean;
    activeTab: string;
    setActiveTab: (id: string) => void;
    navItems: NavItem[];
    lineUserName?: string;
}

export default function ConsoleSidebar({ 
    isSidebarOpen, 
    activeTab, 
    setActiveTab, 
    navItems, 
    lineUserName 
}: ConsoleSidebarProps) {
    return (
        <motion.aside 
            initial={false}
            animate={{ width: isSidebarOpen ? 260 : 80 }}
            className="bg-[#1e293b]/50 backdrop-blur-xl border-r border-slate-700/50 flex flex-col relative z-20 h-full"
        >
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Cpu className="w-6 h-6 text-white" />
                </div>
                {isSidebarOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h1 className="font-black text-lg tracking-tight text-white leading-none">AI Command</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Retail Edition</p>
                    </motion.div>
                )}
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                            "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                            activeTab === item.id 
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                        )}
                    >
                        <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-white" : "text-slate-500 group-hover:text-indigo-400")} />
                        {isSidebarOpen && <span className="font-bold text-sm">{item.label}</span>}
                    </button>
                ))}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-slate-700/50">
                <div className={cn("flex items-center gap-3 p-3 rounded-xl bg-slate-800/40", !isSidebarOpen && "justify-center")}>
                    <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden">
                        <span className="text-xs font-bold">{lineUserName?.[0] || '管'}</span>
                    </div>
                    {isSidebarOpen && (
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{lineUserName || '管理員'}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Owner</p>
                        </div>
                    )}
                    {isSidebarOpen && <LogOut className="w-4 h-4 text-slate-500 hover:text-red-400 cursor-pointer" />}
                </div>
            </div>
        </motion.aside>
    );
}
