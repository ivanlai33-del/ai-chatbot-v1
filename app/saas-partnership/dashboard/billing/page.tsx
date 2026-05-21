"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Zap, Calendar, ArrowUpRight, Download, CheckCircle2, Activity, BrainCircuit } from 'lucide-react';

export default function PartnerBillingPage() {
    const usage = [
        { label: '每月事件量', current: 45200, limit: 150000, icon: Activity, color: 'emerald' },
        { label: '自動化流程', current: 1240, limit: 10000, icon: Zap, color: 'blue' },
        { label: 'AI 任務次數', current: 840, limit: 5000, icon: BrainCircuit, color: 'purple' },
    ];

    const history = [
        { id: 'INV-2024-04-001', date: '2024-04-20', amount: '9,000', plan: 'Pro Plan (Monthly)', status: 'paid' },
        { id: 'INV-2024-03-001', date: '2024-03-20', amount: '9,000', plan: 'Pro Plan (Monthly)', status: 'paid' },
    ];

    return (
        <div className="p-8 lg:p-12 max-w-6xl mx-auto">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-slate-900 mb-2">訂閱與帳務</h1>
                <p className="text-slate-500 font-medium">管理您的方案、用量追蹤與歷史帳單紀錄。</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-12">
                {/* Plan Overview Card */}
                <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <CreditCard className="w-40 h-40 text-slate-900" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-[#06C755] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Active</div>
                            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">目前方案</span>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <div>
                                <h2 className="text-5xl font-black text-slate-900 mb-4">Pro Plan</h2>
                                <p className="text-slate-500 font-bold flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    下次扣款日期：2024-05-20
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">每月費用</p>
                                <p className="text-4xl font-black text-slate-900">NT$ 9,000</p>
                            </div>
                        </div>

                        <div className="mt-12 pt-10 border-t border-black/5 flex flex-wrap gap-4">
                            <button className="bg-gradient-to-r from-[#06C755] to-[#05A044] text-white px-8 py-4 rounded-2xl font-black text-sm hover:scale-[1.02] transition-all shadow-xl shadow-[#06C755]/20">
                                變更訂閱方案
                            </button>
                            <button className="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all">
                                支付方式管理
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Usage Meters */}
            <div className="mb-16">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">本月即時用量</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {usage.map((item, idx) => (
                        <div key={idx} className="bg-white/60 backdrop-blur-md border border-white rounded-[2.5rem] p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div className={`p-4 rounded-2xl bg-white shadow-sm border border-black/5`}>
                                    <item.icon className="w-6 h-6 text-[#06C755]" />
                                </div>
                                <span className="text-xs font-black text-slate-400">
                                    {Math.round((item.current / item.limit) * 100)}%
                                </span>
                            </div>
                            <h4 className="text-base font-black text-slate-900 mb-2">{item.label}</h4>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-3xl font-black text-slate-900">{item.current.toLocaleString()}</span>
                                <span className="text-xs font-bold text-slate-400">/ {item.limit.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(item.current / item.limit) * 100}%` }}
                                    className="h-full bg-[#06C755] rounded-full"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Billing History Table */}
            <div className="bg-white/40 backdrop-blur-xl border border-white rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-black/5">
                    <h3 className="text-xl font-black text-slate-900">歷史帳單</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">帳單編號</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">日期</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">方案</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">金額</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {history.map((inv) => (
                                <tr key={inv.id} className="hover:bg-white/50 transition-colors">
                                    <td className="px-8 py-6 text-sm font-black text-slate-900">{inv.id}</td>
                                    <td className="px-8 py-6 text-sm font-bold text-slate-600">{inv.date}</td>
                                    <td className="px-8 py-6 text-sm font-bold text-slate-600">{inv.plan}</td>
                                    <td className="px-8 py-6 text-sm font-black text-slate-900">NT$ {inv.amount}</td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-3 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-black/5">
                                            <Download className="w-4 h-4 text-slate-400" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
