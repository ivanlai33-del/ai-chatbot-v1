"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, 
    MessageSquare, 
    Brain, 
    Users, 
    User,
    Calendar, 
    BarChart3, 
    Settings, 
    LogOut, 
    Bell,
    TrendingUp,
    CheckCircle2,
    Clock,
    ChevronRight,
    Search,
    Plus,
    Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AICommandConsoleProps {
    botId?: string;
    lineUserName?: string;
    lineUserId?: string;
}

export default function AICommandConsole({ botId, lineUserName, lineUserId }: AICommandConsoleProps) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navItems = [
        { id: 'dashboard', label: '戰情儀表板', icon: LayoutDashboard },
        { id: 'chat', label: '即時對話流', icon: MessageSquare },
        { id: 'brain', label: '店長智庫', icon: Brain },
        { id: 'crm', label: '客戶與預約', icon: Calendar },
        { id: 'analytics', label: '數據報表', icon: BarChart3 },
        { id: 'settings', label: '系統設定', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden font-sans">
            {/* Sidebar */}
            <motion.aside 
                initial={false}
                animate={{ width: isSidebarOpen ? 260 : 80 }}
                className="bg-[#1e293b]/50 backdrop-blur-xl border-r border-slate-700/50 flex flex-col relative z-20"
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

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Top Header */}
                <header className="h-16 border-b border-slate-700/50 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-between px-8 z-10">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            {navItems.find(n => n.id === activeTab)?.label}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                系統連線正常
                            </div>
                        </div>
                        <div className="relative">
                            <Bell className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 border-2 border-[#0f172a] rounded-full" />
                        </div>
                    </div>
                </header>

                {/* Dashboard View */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: '今日總對話', value: '128', icon: MessageSquare, trend: '+12%', color: 'from-blue-500 to-indigo-600' },
                            { label: '新增加好友', value: '34', icon: Users, trend: '+5%', color: 'from-emerald-500 to-teal-600' },
                            { label: '預約攔截', value: '12', icon: Calendar, trend: '穩定', color: 'from-amber-500 to-orange-600' },
                            { label: 'AI 回覆率', value: '98.5%', icon: CheckCircle2, trend: '+1.2%', color: 'from-purple-500 to-pink-600' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-all group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", stat.color)}>
                                        <stat.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{stat.trend}</span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* activity Stream */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black text-white flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-indigo-400" />
                                    即時動態流 (Live Feed)
                                </h3>
                                <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300">查看所有紀錄</button>
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="p-4 rounded-xl border border-slate-700/30 bg-slate-800/20 hover:bg-slate-800/40 transition-all flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center shrink-0">
                                            <User className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-bold text-slate-300">訪客 #3829</span>
                                                <span className="text-[10px] text-slate-500 font-medium">2分鐘前</span>
                                            </div>
                                            <p className="text-sm text-slate-400 italic">「請問這組沙發還有現貨嗎？運費怎麼算？」</p>
                                            <div className="mt-3 py-2 px-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                                <p className="text-sm text-indigo-300">
                                                    <span className="font-bold mr-2">AI 回覆:</span>
                                                    目前還有 3 組現貨喔！北部免運費，其他地區約 500-800 元...
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions / Insights */}
                        <div className="space-y-8">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600/80 to-purple-700/80 border border-white/10 shadow-xl overflow-hidden relative group">
                                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                                <h3 className="text-lg font-black text-white relative z-10 mb-2">AI 戰略洞察</h3>
                                <p className="text-sm text-indigo-100/80 relative z-10 leading-relaxed mb-6">
                                    這週「美甲款式」的詢問度上升了 40%，建議可以針對新款式發送專屬優惠活動。
                                </p>
                                <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-lg hover:shadow-white/20 transition-all relative z-10">
                                    一鍵發送活動廣播
                                </button>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest pl-2">智庫熱門 FAQ</h3>
                                <div className="space-y-2">
                                    {['店內營業時間', '退換貨規則', '分店導覽'].map((faq) => (
                                        <div key={faq} className="flex iems-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-all cursor-pointer">
                                            <span className="text-xs font-bold text-slate-300">{faq}</span>
                                            <ChevronRight className="w-4 h-4 text-slate-500" />
                                        </div>
                                    ))}
                                    <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-600 text-slate-400 hover:border-indigo-400 hover:text-indigo-400 transition-all mt-4">
                                        <Plus className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">新增知識庫</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
