"use client";

import React, { useEffect, useState } from 'react';
import { 
    Zap, Plus, Megaphone, 
    Target, BarChart3, Clock,
    Search, Filter, Send, Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePartner } from '@/context/PartnerContext';

export default function CampaignsPage() {
    const { activeOA } = usePartner();
    const [jobs, setJobs] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalSent: 0,
        avgClick: '0%',
        conversion: '0',
        blockRate: '0%'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCampaignData() {
            if (!activeOA) return;
            setLoading(true);
            try {
                // 1. Fetch Broadcast Jobs
                const { data: jobData, error: jobError } = await supabase
                    .from('broadcast_jobs')
                    .select('*')
                    .eq('oa_id', activeOA.id)
                    .order('scheduled_at', { ascending: false });
                
                if (jobData) setJobs(jobData);

                // 2. Fetch Stats (In real app, these come from analytics_events)
                // For now, we calculate from the jobs summary
                const sentCount = jobData?.reduce((sum, j) => sum + (j.reach_count || 0), 0) || 0;
                setStats({
                    totalSent: sentCount,
                    avgClick: '12.5%', // Calculated from real event logs later
                    conversion: 'NT$ 42,800',
                    blockRate: '0.5%'
                });
            } catch (err) {
                console.error('Error fetching campaigns:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchCampaignData();
    }, [activeOA]);

    return (
        <div className="p-8 min-h-full">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                            <Megaphone className="w-10 h-10 text-[#06C755]" />
                            活動與行銷中心
                        </h1>
                        <p className="mt-2 font-medium text-slate-500">建立推播任務、配置自動化觸發行銷與成效追蹤</p>
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#06C755]/20 transition-all active:scale-95">
                        <Plus className="w-4 h-4" /> 建立新活動
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: '累積推播次數', value: stats.totalSent.toLocaleString(), trend: '+5%', color: 'text-emerald-500' },
                        { label: '平均點擊率', value: stats.avgClick, trend: '+0.2%', color: 'text-emerald-500' },
                        { label: '轉換金額', value: stats.conversion, trend: '+15%', color: 'text-emerald-500' },
                        { label: '封鎖率', value: stats.blockRate, trend: '-0.01%', color: 'text-emerald-500' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white/50 border border-slate-100 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-black/[0.01] rounded-full -mr-12 -mt-12 group-hover:bg-[#06C755]/5 transition-all"></div>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">{s.label}</p>
                            <div className="flex items-baseline gap-2 relative z-10">
                                <span className="text-2xl font-black text-slate-900">{s.value}</span>
                                <span className={`text-[10px] font-bold ${s.color}`}>{s.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Active Campaigns */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2.5rem] overflow-hidden shadow-xl">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/60">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">推播與活動任務</h3>
                                <div className="flex gap-2">
                                    <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-all shadow-sm"><Search className="w-4 h-4" /></button>
                                </div>
                            </div>
                            
                            <div className="divide-y divide-slate-100">
                                {loading ? (
                                    <div className="p-20 text-center animate-pulse text-slate-300 font-bold">正在讀取推播任務...</div>
                                ) : jobs.length > 0 ? (
                                    jobs.map((j) => (
                                        <div key={j.id} className="p-6 flex items-center gap-6 hover:bg-white transition-all group">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                                                <Send className="w-5 h-5 text-[#06C755]" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-slate-900">{j.title || '未命名推播'}</h4>
                                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                                    <Target className="w-3 h-3" /> {j.status === 'Completed' ? `已送達 ${j.reach_count} 人` : '等待發送'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border mb-1 inline-block ${
                                                    j.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                                }`}>
                                                    {j.status}
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium">{new Date(j.scheduled_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-20 text-center text-slate-300 italic">尚未發動過行銷推播任務</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Quick Tools */}
                    <div className="space-y-6">
                        <section className="bg-white/50 border border-emerald-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#06C755]"></div>
                            <h3 className="text-[#06C755] font-black text-lg mb-4">AI 智慧建議</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-bold italic mb-6">
                                根據本週客戶互動數據，建議您可以針對 **「30天內未互動的高價值客戶」** 進行 **「回娘家專屬點數」** 推播，預估可帶動 15% 轉換。
                            </p>
                            <button className="w-full py-3 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-[#06C755]/20">
                                立即採用建議
                            </button>
                        </section>

                        <div className="bg-white/60 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-sm">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">行銷積木捷徑</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: Zap, label: '閃電促銷' },
                                    { icon: Target, label: '精準分眾' },
                                    { icon: BarChart3, label: '成效報表' },
                                    { icon: Clock, label: '定時推播' },
                                ].map((t, i) => (
                                    <button key={i} className="flex flex-col items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group shadow-sm">
                                        <t.icon className="w-5 h-5 text-slate-400 group-hover:text-[#06C755] transition-all" />
                                        <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-900">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
