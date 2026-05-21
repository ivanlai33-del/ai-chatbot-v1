"use client";

import React from 'react';
import { 
    Activity, TrendingUp, Users, CreditCard, 
    Zap, Sparkles, ShieldAlert, BarChart3,
    Clock, MessageSquare, Flame, CheckCircle2,
    ArrowUpRight, Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import ConsoleLiveFeed from '@/components/console/ConsoleLiveFeed';

export default function SystemMonitorPage() {
    const stats = [
        { label: '本月累計營收', value: '$124,000', trend: '+18%', icon: CreditCard, color: 'text-emerald-500' },
        { label: '累積聯絡人', value: '8,420', trend: '+5%', icon: Users, color: 'text-blue-500' },
        { label: '待處理商機', value: '156', trend: '+12', icon: Target, color: 'text-indigo-500' },
        { label: '市場品牌情緒', value: '92%', trend: 'HEALTHY', icon: Flame, color: 'text-rose-500' },
    ];

    const moduleStatus = [
        { name: 'CRM 客資', status: 'OPTIMAL', val: 95, color: 'bg-emerald-500' },
        { name: 'WORKFLOW 引擎', status: 'RUNNING', val: 100, color: 'bg-indigo-500' },
        { name: 'AI 視覺產線', status: 'OPTIMAL', val: 88, color: 'bg-emerald-500' },
        { name: '預約 & 服務', status: 'OPTIMAL', val: 92, color: 'bg-emerald-500' },
        { name: '金流對接', status: 'CONNECTED', val: 100, color: 'bg-[#06C755]' },
    ];

    return (
        <div className="p-8 lg:p-12 space-y-10 max-w-[1600px] mx-auto">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#06C755] text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                        <Activity className="w-3 h-3" /> System Operational
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">官方智庫系統中心</h1>
                </div>
                <div className="px-6 py-2 bg-white/60 border border-white rounded-full text-[#06C755] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-[#06C755] animate-pulse"></div>
                    全模組積木連線中
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-4 relative overflow-hidden group">
                        <div className="flex justify-between items-start relative z-10">
                            <div className={`p-4 rounded-2xl bg-white shadow-sm border border-black/5 ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <h4 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Live Feed */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] p-10 shadow-sm min-h-[500px] flex flex-col">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <Zap className="w-5 h-5 text-[#06C755]" />
                                實時事件總線 (Live Feed)
                            </h3>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Auto-updating</span>
                        </div>
                        
                        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-black/5 rounded-[2rem]">
                            <p className="text-xs font-bold text-slate-400 italic">Waiting for incoming events...</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem] space-y-3">
                            <h4 className="text-xs font-black text-[#06C755] uppercase tracking-widest">AI 營運建議</h4>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                「本週 **市場情緒** 略有下滑，但 **預約轉化** 保持高位，建議針對沈睡客戶發送一波活動優惠券。」
                            </p>
                        </div>
                        <div className="p-8 bg-rose-50/50 border border-rose-100 rounded-[2.5rem] space-y-3">
                            <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest">系統資源警示</h4>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                您的 AI 客服權限即將用盡。 目前的 50 個席位已使用 42 個。
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Sidebar Cards */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] p-10 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-[#06C755]" />
                            系統積木運作狀態
                        </h3>
                        <div className="space-y-6">
                            {moduleStatus.map((m, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-black text-slate-900">{m.name}</span>
                                        <span className={`text-[10px] font-black tracking-widest ${m.status === 'OPTIMAL' || m.status === 'CONNECTED' ? 'text-emerald-500' : 'text-indigo-500'}`}>
                                            {m.status}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${m.val}%` }}
                                            className={`h-full ${m.color} rounded-full`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] p-10 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <ShieldAlert className="w-5 h-5 text-rose-500" />
                            市場情報警示
                        </h3>
                        <div className="space-y-4">
                            <div className="p-5 bg-white border border-black/5 rounded-2xl shadow-sm space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">競品動態偵測</span>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                </div>
                                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                                    競品 A 剛發佈了新的「夏季折扣方案」，建議立即啟動活動中心應對。
                                </p>
                            </div>
                            <div className="p-5 bg-white border border-black/5 rounded-2xl shadow-sm space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">社群聲量警報</span>
                                    <TrendingUp className="w-3 h-3 text-indigo-500" />
                                </div>
                                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                                    您的品牌在 Thread 上的正面討論度提升了 40%，AI 已自動生成三組跟進文案。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
