"use client";

import React, { useState, useEffect } from 'react';
import { 
    ClipboardList, Search, Filter, 
    BarChart3, Users, Clock, 
    ChevronRight, Download, PieChart,
    CheckCircle2, AlertCircle, MoreVertical,
    FileText, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { usePartner } from '@/context/PartnerContext';

export default function SurveysPage() {
    const { activeOA } = usePartner();
    const [surveys, setSurveys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSurveys() {
            if (!activeOA) return;
            setLoading(true);
            try {
                const { data } = await supabase
                    .from('liff_apps')
                    .select('*')
                    .eq('oa_id', activeOA.id);
                
                if (data) setSurveys(data);
            } catch (err) {
                console.error('Error fetching surveys:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchSurveys();
    }, [activeOA]);

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                        <div className="p-3 bg-violet-600 rounded-2xl shadow-lg shadow-violet-600/20 text-white">
                            <ClipboardList className="w-8 h-8" />
                        </div>
                        問卷與數據收集中心
                    </h1>
                    <p className="mt-3 text-slate-500 font-medium">追蹤問卷填寫進度、查看統計分析結果與匯出客戶名單。</p>
                </div>
                <button 
                    onClick={() => window.location.href = '/saas-partnership/dashboard/forms'}
                    className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 flex items-center gap-3 shadow-sm hover:bg-slate-50 transition-all"
                >
                    <FileText className="w-4 h-4 text-violet-600" /> 前往表單設計工廠
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">累積填寫總人次</p>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-slate-900">4,120</span>
                        <span className="px-2 py-1 bg-violet-50 text-violet-600 text-[8px] font-black rounded uppercase">All Time</span>
                    </div>
                </div>
                <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">平均完成率</p>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-slate-900">68%</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: '68%' }} />
                        </div>
                    </div>
                </div>
                <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">本週新增數據點</p>
                        <span className="text-3xl font-black text-slate-900">+428</span>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
                        <Zap className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Survey List */}
            <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[3rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-white/60 bg-white/40 flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-violet-600" /> 現有問卷活動清單
                    </h3>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input type="text" placeholder="搜尋問卷..." className="bg-white/60 border border-slate-100 rounded-xl py-1.5 pl-9 pr-3 text-[10px] font-bold outline-none focus:ring-2 ring-violet-600/10" />
                        </div>
                    </div>
                </div>
                
                <div className="divide-y divide-slate-100">
                    {loading ? (
                        <div className="p-20 text-center animate-pulse text-slate-300 font-black tracking-widest text-[10px]">正在彙整數據脈絡...</div>
                    ) : surveys.length > 0 ? (
                        surveys.map((s, i) => (
                            <div key={s.id} className="p-8 flex items-center gap-8 hover:bg-white/60 transition-all group">
                                <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 shadow-sm border border-violet-100 group-hover:scale-110 transition-transform">
                                    <ClipboardList className="w-7 h-7" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-black text-slate-900">{s.config?.name || s.name}</h4>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> 建立於 {new Date(s.created_at).toLocaleDateString()}</span>
                                        <span className="text-[10px] font-bold text-violet-600 flex items-center gap-1"><Users className="w-3 h-3" /> {s.response_count || 0} 人填寫</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button className="px-5 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                                        <BarChart3 className="w-3.5 h-3.5" /> 統計分析
                                    </button>
                                    <button className="p-2.5 hover:bg-white rounded-xl text-slate-300 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100">
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-24 text-center text-slate-300 italic text-xs">尚未發布問卷活動</div>
                    )}
                </div>
            </div>
        </div>
    );
}
