"use client";

import React, { useState, useEffect } from 'react';
import { 
    Activity, Search, Filter, 
    Calendar, User, Bot, 
    FileText, CheckCircle2, AlertCircle,
    Info, ExternalLink, Download, Clock,
    Zap, Terminal, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { usePartner } from '@/context/PartnerContext';

export default function NeuralWorkLogsPage() {
    const { activeOA } = usePartner();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real system, we'd fetch from an 'audit_logs' or 'agi_actions' table
        // For demonstration, we'll simulate the recent work logs
        setTimeout(() => {
            setLogs([
                { id: 1, type: 'AI_ACTION', module: 'Campaigns', action: '自動發動「母親節早鳥」分眾推播', user: 'AI Manager', time: '10 min ago', status: 'Success' },
                { id: 2, type: 'CONFIG', module: 'Rich Menu', action: '更新圖文選單按鈕配置 (Summer Refresh)', user: 'Ivan L.', time: '2 hrs ago', status: 'Success' },
                { id: 3, type: 'SYSTEM', module: 'Journey', action: '修復「週末預約」自動化流程節點中斷', user: 'AGI Repair', time: '5 hrs ago', status: 'Fixed' },
                { id: 4, type: 'AI_ACTION', module: 'CRM', action: '識別出 5 位流失 VIP 客戶並標記高風險', user: 'AI Manager', time: '1 day ago', status: 'Success' },
                { id: 5, type: 'SYNC', module: 'Core', action: '全域神經連結一鍵同步完成', user: 'Ivan L.', time: '2 days ago', status: 'Success' },
            ]);
            setLoading(false);
        }, 800);
    }, [activeOA]);

    const getTypeIcon = (type: string) => {
        switch(type) {
            case 'AI_ACTION': return <Bot className="w-5 h-5 text-purple-500" />;
            case 'SYSTEM': return <Zap className="w-5 h-5 text-orange-500" />;
            default: return <User className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${
                            activeOA?.name?.includes('診所') || activeOA?.name?.includes('醫療') ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                            activeOA?.name?.includes('學') || activeOA?.name?.includes('補') ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                            <ShieldCheck className="w-3 h-3" />
                            Neural Mode: {
                                activeOA?.name?.includes('診所') || activeOA?.name?.includes('醫療') ? 'MED_V1 (Strict Privacy)' : 
                                activeOA?.name?.includes('學') || activeOA?.name?.includes('補') ? 'EDU_V1 (Regulated)' :
                                'OPS_V1 (Efficiency)'
                            }
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-[#06C755] to-[#05A044] rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
                            <Terminal className="w-8 h-8" />
                        </div>
                        AGI 執行日誌與工作紀錄
                    </h1>
                    <p className="mt-3 text-slate-500 font-medium">追蹤 AI 店長的所有後台決策與操作軌跡，落實營運透明化。</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-black text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download className="w-4 h-4" /> 下載 PDF 報表
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white/40 backdrop-blur-3xl border border-white p-4 rounded-3xl flex flex-wrap items-center gap-4 shadow-sm">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="搜尋關鍵字、模組或操作員..." className="w-full bg-white border border-slate-100 rounded-2xl py-2.5 pl-12 pr-4 text-xs font-bold outline-none focus:ring-2 ring-slate-900/5 transition-all" />
                </div>
                <button className="px-5 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-black text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all"><Filter className="w-4 h-4" /> 所有模組</button>
                <button className="px-5 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-black text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all"><Calendar className="w-4 h-4" /> 最近 7 天</button>
            </div>

            {/* Logs Table */}
            <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[3rem] overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">操作類型</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">目標模組</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">工作內容描述</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">執行者</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">時間/狀態</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {loading ? (
                            <tr><td colSpan={5} className="px-8 py-20 text-center animate-pulse text-slate-300 font-black tracking-widest text-xs">正在調閱全域工作日誌...</td></tr>
                        ) : logs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/60 transition-all group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                            {getTypeIcon(log.type)}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{log.type}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg uppercase tracking-widest">{log.module}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="text-sm font-bold text-slate-700 leading-relaxed">{log.action}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">{log.user.charAt(0)}</div>
                                        <span className="text-xs font-bold text-slate-600">{log.user}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="text-[10px] font-bold text-slate-400">{log.time}</div>
                                        <div className={`flex items-center gap-1 text-[9px] font-black uppercase ${log.status === 'Success' || log.status === 'Fixed' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {log.status === 'Success' || log.status === 'Fixed' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                            {log.status}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
