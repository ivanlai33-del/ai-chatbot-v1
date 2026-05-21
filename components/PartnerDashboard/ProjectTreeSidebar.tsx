"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
    Sparkles, Box, Bot, ChevronLeft, ChevronRight, Menu, ArrowLeft, 
    Database, Users, Zap, Image as ImageIcon, Layout, Globe, 
    Megaphone, Ticket, Gem, MessageSquare, BarChart3, ClipboardList,
    Cloud, Terminal, ShieldCheck, Hammer, Link as LinkIcon, Cpu,
    ChevronDown, ChevronUp
} from 'lucide-react';
import { usePartner } from '@/context/PartnerContext';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
}

export default function ProjectTreeSidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
    const pathname = usePathname();
    const { partner } = usePartner();
    
    // 預設全部關閉：expandedGroups 為空物件
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const toggleGroup = (title: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const navGroups = [
        {
            title: "", // 移除 AGI 協作標題
            isOpenByDefault: true,
            items: [
                { icon: Sparkles, label: "返回指揮中心", href: "/saas-partnership/dashboard", isButton: true },
            ]
        },
        {
            title: "指揮模組",
            items: [
                { icon: Cloud, label: "發布中心", href: "/saas-partnership/dashboard/publish", color: "text-blue-600" },
                { icon: Terminal, label: "執行日誌", href: "/saas-partnership/dashboard/logs", color: "text-slate-900" },
                { icon: Zap, label: "智慧腳本", href: "/saas-partnership/dashboard/scripts", color: "text-orange-500" },
            ]
        },
        {
            title: "連結模組",
            items: [
                { icon: Globe, label: "頻道連線", href: "/saas-partnership/dashboard/provision", color: "text-blue-500" },
                { icon: Users, label: "聯絡人 CRM", href: "/saas-partnership/dashboard/crm", color: "text-indigo-500" },
            ]
        },
        {
            title: "創意模組",
            items: [
                { icon: Megaphone, label: "活動與推播", href: "/saas-partnership/dashboard/campaigns", color: "text-[#06C755]" },
                { icon: ImageIcon, label: "素材工廠", href: "/saas-partnership/dashboard/studio/factory", color: "text-pink-500" },
                { icon: Layout, label: "圖文選單", href: "/saas-partnership/dashboard/menu", color: "text-amber-500" },
            ]
        },
        {
            title: "營運模組",
            items: [
                { icon: Zap, label: "行銷旅程", href: "/saas-partnership/dashboard/journey", color: "text-orange-500" },
                { icon: Bot, label: "智庫設定", href: "/saas-partnership/dashboard/knowledge", color: "text-purple-500" },
                { icon: Ticket, label: "優惠券中心", href: "/saas-partnership/dashboard/coupons", color: "text-rose-500" },
                { icon: Gem, label: "集點卡系統", href: "/saas-partnership/dashboard/loyalty", color: "text-amber-600" },
                { icon: ClipboardList, label: "問卷數據", href: "/saas-partnership/dashboard/surveys", color: "text-violet-600" },
                { icon: MessageSquare, label: "客服工作台", href: "/saas-partnership/dashboard/support", color: "text-emerald-600" },
                { icon: BarChart3, label: "報表中心", href: "/saas-partnership/dashboard/reports", color: "text-indigo-600" },
            ]
        },
        {
            title: "串接模組",
            items: [
                { icon: LinkIcon, label: "API 串接", href: "/saas-partnership/dashboard/integrations/api", color: "text-slate-400" },
                { icon: Cpu, label: "Webhooks", href: "/saas-partnership/dashboard/integrations/webhooks", color: "text-slate-400" },
            ]
        }
    ];

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-[280px]'} h-full bg-transparent flex flex-col border-r border-white/20 shrink-0 transition-all duration-300 relative`}>
            
            {/* Collapse Toggle Button */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-24 w-6 h-6 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all z-50 text-slate-400 hover:text-[#06C755]"
            >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

            {/* Navigation Groups */}
            <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-4'} space-y-4 scrollbar-hide py-8 pb-24`}>
                {navGroups.map((group, idx) => {
                    const isExpanded = expandedGroups[group.title] || group.isOpenByDefault;
                    
                    return (
                        <div key={idx} className="space-y-1">
                            {!isCollapsed && group.title && (
                                <button 
                                    onClick={() => toggleGroup(group.title)}
                                    className="w-full flex items-center justify-between px-6 py-4 group hover:bg-white/20 rounded-xl transition-all"
                                >
                                    <p className="text-[18px] font-black text-emerald-700 tracking-tight group-hover:text-[#06C755]">{group.title}</p>
                                    <div className="text-emerald-600/40 group-hover:text-[#06C755] transition-colors">
                                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                    </div>
                                </button>
                            )}

                            <AnimatePresence>
                                {(isExpanded || isCollapsed) && (
                                    <motion.div 
                                        initial={isCollapsed ? { opacity: 1 } : { height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden space-y-2"
                                    >
                                        {group.items.map((item) => {
                                            const isActive = pathname === item.href;
                                            
                                            if ((item as any).isButton) {
                                                return (
                                                    <Link 
                                                        key={item.href}
                                                        href={item.href} 
                                                        className={`flex items-center gap-4 ${isCollapsed ? 'justify-center px-0' : 'px-6'} py-5 rounded-2xl text-[18px] font-black transition-all mb-4 bg-[#06C755] text-white shadow-lg shadow-[#06C755]/20 hover:scale-[1.02] hover:bg-[#05A044] active:scale-95`}
                                                    >
                                                        <Sparkles className="w-6 h-6 shrink-0 text-white" />
                                                        {!isCollapsed && <span className="overflow-hidden whitespace-nowrap">{item.label}</span>}
                                                    </Link>
                                                );
                                            }

                                            return (
                                                <Link 
                                                    key={item.href}
                                                    href={item.href} 
                                                    className={`flex items-center gap-4 ${isCollapsed ? 'justify-center px-0' : 'px-6'} py-4 rounded-2xl text-[17px] font-black transition-all ${isActive ? 'bg-white border border-white text-slate-900 shadow-xl' : 'text-slate-600 hover:bg-white/30 hover:text-slate-900'}`}
                                                >
                                                    <item.icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-slate-900' : (item as any).color}`} />
                                                    {!isCollapsed && <span className="overflow-hidden whitespace-nowrap">{item.label}</span>}
                                                </Link>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Identity & Subscription Status */}
            <div className={`p-6 border-t border-white/20 ${isCollapsed ? 'flex justify-center' : ''} bg-white/10`}>
                <div className={`bg-white/40 backdrop-blur-md rounded-2xl border border-white p-4 shadow-sm ${isCollapsed ? 'w-12 h-12 flex items-center justify-center p-0 overflow-hidden' : ''}`}>
                    {isCollapsed ? (
                        <ShieldCheck className="w-6 h-6 text-indigo-500" />
                    ) : (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {partner?.current_plan ? '方案狀態' : '職位身份'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-slate-900">
                                    {partner?.current_plan ? `${partner.current_plan.toUpperCase()} PLAN` : '管理小編'}
                                </span>
                                <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black rounded uppercase">
                                    Active
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
}
