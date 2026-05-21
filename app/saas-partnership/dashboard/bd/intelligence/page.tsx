"use client";

import React, { useState, useEffect } from 'react';
import { 
    Target, Zap, TrendingUp, 
    Globe, Search, Filter, 
    ArrowUpRight, AlertCircle, 
    BarChart3, Share2, Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePartner } from '@/context/PartnerContext';

export default function MarketIntelligencePage() {
    const { activeOA } = usePartner();
    const [activeView, setActiveView] = useState<'competitors' | 'trends'>('competitors');
    const [industryInfo, setIndustryInfo] = useState({ name: '一般零售', competitors: [] });

    useEffect(() => {
        // 模擬根據 activeOA 的產業屬性切換神經流
        if (activeOA?.name?.includes('美學')) {
            setIndustryInfo({
                name: '美業預約',
                competitors: [
                    { name: '美業預約大師', status: 'High Activity', share: '25%', latest: '發布母親節五折券', color: 'bg-pink-500' },
                    { name: '玩美管家', status: 'Stable', share: '12%', latest: '新增 LINE Pay 支付', color: 'bg-emerald-500' }
                ] as any
            });
        } else if (activeOA?.name?.includes('Fashion') || activeOA?.name?.includes('服飾')) {
            setIndustryInfo({
                name: '服飾電商',
                competitors: [
                    { name: '時尚快配', status: 'High Activity', share: '32%', latest: '夏季新品 7 折推播', color: 'bg-blue-500' },
                    { name: '衣櫥助理', status: 'Stable', share: '15%', latest: 'AI 穿搭建議模組更新', color: 'bg-indigo-500' }
                ] as any
            });
        } else {
            setIndustryInfo({
                name: '跨產業通用',
                competitors: [
                    { name: '全能 AI 助理', status: 'Stable', share: '10%', latest: '市場通用模組發布', color: 'bg-slate-500' }
                ] as any
            });
        }
    }, [activeOA]);

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto">
            {/* Header with Industry Badge */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100 uppercase tracking-widest">
                            {industryInfo.name} 專屬神經流
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">Context: {activeOA?.name}</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 text-white">
                            <Globe className="w-8 h-8" />
                        </div>
                        市場情報監控中心
                    </h1>
                </div>
                <div className="flex bg-white/60 p-1.5 rounded-2xl border border-white shadow-sm">
                    <button 
                        onClick={() => setActiveView('competitors')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeView === 'competitors' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        競品監測
                    </button>
                    <button 
                        onClick={() => setActiveView('trends')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeView === 'trends' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        產業趨勢
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white/40 backdrop-blur-3xl border border-white rounded-[3rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-white/60 bg-white/40 flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                <Target className="w-4 h-4 text-indigo-600" /> {industryInfo.name} 同業監控
                            </h3>
                        </div>
                        <div className="divide-y divide-black/5">
                            {industryInfo.competitors.length > 0 ? (
                                industryInfo.competitors.map((comp: any, i: number) => (
                                    <div key={i} className="p-8 flex items-center gap-8 hover:bg-white/60 transition-all group">
                                        <div className={`w-14 h-14 rounded-2xl ${comp.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                            <Share2 className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-black text-slate-900">{comp.name}</h4>
                                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${comp.status === 'High Activity' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'}`}>{comp.status}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-bold italic">最新動向：{comp.latest}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">市佔預估</p>
                                            <p className="text-xl font-black text-slate-900">{comp.share}</p>
                                        </div>
                                        <button className="p-3 hover:bg-white rounded-xl text-slate-300 hover:text-indigo-600 transition-all border border-transparent hover:border-white">
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center text-slate-300 italic text-xs">正在分析該產業之競爭對手數據...</div>
                            )}
                        </div>
                    </section>

                    <section className="bg-white/40 backdrop-blur-3xl border border-white rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
                         <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-8 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-indigo-600" /> {industryInfo.name} 市場需求趨勢
                        </h3>
                        <div className="h-64 flex items-end gap-2 px-4">
                            {[40, 60, 45, 90, 65, 85, 100, 75, 50, 80, 95, 110].map((h, i) => (
                                <div key={i} className="flex-1 group relative">
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ delay: i * 0.05 }}
                                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg opacity-40 group-hover:opacity-100 transition-all"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Side: AI Market Insights */}
                <div className="space-y-6">
                    <section className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <h3 className="text-lg font-black flex items-center gap-2 mb-6">
                            <Zap className="w-5 h-5 text-amber-400" /> AI {industryInfo.name} 競爭力分析
                        </h3>
                        <p className="text-xs text-indigo-100 leading-relaxed font-medium mb-8">
                            當前 **{industryInfo.name}** 市場需求正處於上升期。建議指揮官善用 AGI 調度積木以保持領先。
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
