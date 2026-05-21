"use client";

import React, { useState } from 'react';
import { 
    Target, Plus, Search, 
    Users, Tag, ArrowRight,
    BarChart3, Filter
} from 'lucide-react';

export default function SegmentsPage() {
    const textMain = 'rgba(0, 0, 0, 0.85)';
    const textSub = 'rgba(0, 0, 0, 0.7)';

    return (
        <div className="p-8">
            <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h1 className="text-4xl font-black flex items-center gap-4 text-slate-900">
                                <Target className="w-10 h-10 text-[#06C755]" />
                                標籤與分眾引擎
                            </h1>
                            <p className="mt-2 font-medium text-slate-500">根據標籤、行為與屬性進行精準受眾分群</p>
                        </div>
                        <button className="px-6 py-3 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#06C755]/20 transition-all active:scale-95">
                            <Plus className="w-4 h-4" /> 建立新分眾
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Segment List */}
                        <div className="lg:col-span-2 space-y-6">
                            {[
                                { name: '高價值忠實客戶', count: 1240, tags: ['VIP', '已成交', '高頻'], color: '#06C755' },
                                { name: '沈睡待喚醒客群', count: 3500, tags: ['30天未互動', '普通標籤'], color: '#fbbf24' },
                                { name: '新加入潛在商機', count: 850, tags: ['新好友', '待跟進'], color: '#38bdf8' },
                            ].map((s, i) => (
                                <div key={i} className="group bg-white/50 backdrop-blur-2xl border border-white/60 p-8 rounded-[2.5rem] hover:border-[#06C755]/30 transition-all shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-slate-100 shadow-sm">
                                                <Users className="w-6 h-6 text-[#06C755]" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900">{s.name}</h3>
                                                <p className="text-xs font-bold text-slate-400">預估受眾數：{s.count.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <button className="p-3 bg-white hover:bg-[#06C755] hover:text-white rounded-xl transition-all shadow-sm border border-slate-100">
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {s.tags.map(t => (
                                            <span key={t} className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tag Management Quick Look */}
                        <div className="space-y-8">
                            <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] p-10 shadow-sm">
                                <h3 className="text-lg font-black mb-8 flex items-center gap-2 text-slate-900">
                                    <Tag className="w-5 h-5 text-[#06C755]" /> 熱門標籤
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {['VIP', '預約成功', '諮詢過', '待跟進', 'FB來源', '實體店', '官網'].map(t => (
                                        <div key={t} className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500 shadow-sm">
                                            {t}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/40 backdrop-blur-2xl border border-white/60 p-8 rounded-[2.5rem] shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <BarChart3 className="w-5 h-5 text-[#06C755]" />
                                    <h4 className="text-[#06C755] text-xs font-black uppercase tracking-widest">分眾洞察</h4>
                                </div>
                                <p className="text-xs leading-relaxed font-bold text-slate-600">
                                    「高價值忠實客戶」模組在本週新增了 15 位受眾。建議針對此分眾推送最新的官方智庫電子報。
                                </p>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    );
}
