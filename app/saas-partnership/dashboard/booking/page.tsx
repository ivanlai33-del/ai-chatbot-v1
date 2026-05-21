"use client";

import React, { useState } from 'react';
import PermissionGuard from '@/components/os/PermissionGuard';
import { 
    Calendar, Plus, Search, 
    Users, Clock, CheckCircle2,
    ArrowRight, Filter, Settings,
    Link2
} from 'lucide-react';

export default function BookingPage() {
    const textMain = 'rgba(0, 0, 0, 0.85)';
    const textSub = 'rgba(0, 0, 0, 0.7)';

    return (
        <div className="p-8">
            <PermissionGuard minTier={3}>
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h1 className="text-4xl font-black flex items-center gap-4 text-slate-900">
                                <Calendar className="w-10 h-10 text-[#06C755]" />
                                預約中心
                            </h1>
                            <p className="mt-2 font-medium text-slate-500">管理服務預約、排程與自動化通知</p>
                        </div>
                        <button className="px-6 py-3 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#06C755]/20 transition-all active:scale-95">
                            <Plus className="w-4 h-4" /> 建立預約項目
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {[
                            { label: '今日待處理預約', count: '12', icon: Clock },
                            { label: '本週總預約數', count: '84', icon: Calendar },
                            { label: '平均轉化率', count: '18%', icon: CheckCircle2 },
                        ].map((s, i) => (
                            <div key={i} className="bg-white/50 backdrop-blur-2xl border border-white/60 p-8 rounded-[2.5rem] shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-emerald-50 rounded-2xl">
                                        <s.icon className="w-6 h-6 text-[#06C755]" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Analytics</span>
                                </div>
                                <h3 className="text-3xl font-black text-slate-900">{s.count}</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Booking List Area */}
                        <div className="lg:col-span-2 bg-white/30 backdrop-blur-2xl border border-white/60 rounded-[3rem] p-10 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
                            <div className="w-full flex justify-between items-center mb-8 absolute top-10 left-10 right-10 px-10">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-[#06C755]" />
                                    <h3 className="text-lg font-black text-slate-900">最近預約紀錄</h3>
                                </div>
                                <button className="text-xs font-black text-[#06C755] flex items-center gap-1 hover:gap-2 transition-all">
                                    查看全部 <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="p-6 bg-white/20 rounded-full border border-dashed border-slate-200">
                                    <Calendar className="w-8 h-8 text-slate-200 mx-auto" />
                                </div>
                                <p className="text-sm font-bold text-slate-300 italic">尚無預約紀錄</p>
                            </div>
                        </div>

                        {/* Integration Status Sidebar */}
                        <div className="space-y-8">
                            <div className="bg-white/30 backdrop-blur-2xl border border-white/60 rounded-[3rem] p-10 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-[#06C755]" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900">OS 連動狀態</h3>
                                </div>
                                <p className="text-xs leading-relaxed font-bold text-slate-600">
                                    預約積木已與 **聯絡人中心** 串聯。每一筆新的預約都會自動更新聯絡人的「最後互動時間」，並拋出 `booking.created` 事件。
                                </p>
                                <div className="mt-8 pt-8 border-t border-slate-100/50">
                                    <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                        <span>連動模組</span>
                                        <span className="text-emerald-500">運作中</span>
                                    </div>
                                    <div className="space-y-3">
                                        {['CRM 客戶管理系統', '自動化旅程引擎', '智慧標籤系統'].map(m => (
                                            <div key={m} className="flex items-center gap-2">
                                                <Link2 className="w-3 h-3 text-slate-300" />
                                                <span className="text-[11px] font-bold text-slate-500">{m}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PermissionGuard>
        </div>
    );
}
