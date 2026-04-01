'use client';

import React, { useEffect, useState } from 'react';
import { Users, Tag, Loader2, TrendingUp, Calendar, Zap, CheckCircle2, Power, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConsoleAnalysisPanel({ onDataUpdate }: { onDataUpdate?: (data: any) => void }) {
    const [customerStats, setCustomerStats] = useState<any[]>([]);
    const [keywords, setKeywords] = useState<any[]>([]);
    const [latestReport, setLatestReport] = useState<any>(null);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [executingTask, setExecutingTask] = useState(false);
    const [togglingCampaign, setTogglingCampaign] = useState<string | null>(null);

    const fetchAnalysis = async () => {
        const lineId = localStorage.getItem('line_user_id');
        if (!lineId) return;

        try {
            const [analysisRes, reportRes, campaignRes] = await Promise.all([
                fetch(`/api/console/analysis?userId=${lineId}`),
                fetch(`/api/console/strategist/reports?userId=${lineId}&limit=1`),
                fetch(`/api/console/campaigns?userId=${lineId}`)
            ]);
            
            const [analysis, report, campaign] = await Promise.all([
                analysisRes.json(),
                reportRes.json(),
                campaignRes.json()
            ]);
            
            if (analysis.success) {
                setCustomerStats(analysis.customers || []);
                setKeywords(analysis.keywords || []);
            }
            if (report.success && report.reports?.[0]) {
                setLatestReport(report.reports[0]);
            }
            if (campaign.success) {
                setCampaigns(campaign.campaigns || []);
            }

            // 🚀 Sync with AI Strategist 🚀
            onDataUpdate?.({
                customers: analysis.customers || [],
                topKeywords: analysis.keywords || [],
                latestReport: report.reports?.[0] || null,
                activeCampaigns: campaign.campaigns?.filter((c: any) => c.is_active) || []
            });
        } catch (e) {
            console.error("Analysis Fetch Error:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleExecuteTask = async () => {
        const lineId = localStorage.getItem('line_user_id');
        if (!lineId || executingTask) return;
        setExecutingTask(true);
        try {
            const res = await fetch(`/api/console/strategist/task?userId=${lineId}`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setLatestReport(data.report);
                fetchAnalysis();
            }
        } catch (e) {
            console.error("Strategic Task Failed", e);
        } finally {
            setExecutingTask(false);
        }
    };

    const toggleCampaign = async (id: string, currentStatus: boolean) => {
        const lineId = localStorage.getItem('line_user_id');
        if (!lineId) return;
        
        setTogglingCampaign(id);
        try {
            const res = await fetch(`/api/console/campaigns/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: lineId, campaignId: id, status: !currentStatus })
            });
            if (res.ok) {
                setCampaigns(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
            }
        } catch (e) {
            console.error("Toggle Failed", e);
        } finally {
            setTogglingCampaign(null);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Strategist Daily Digest Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pl-2">
                    <h3 className="text-sm font-black text-rose-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        戰略決策日誌
                    </h3>
                    <button 
                        onClick={handleExecuteTask}
                        disabled={executingTask}
                        className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 disabled:opacity-30 flex items-center gap-1.5 p-1 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-lg transition-all border border-indigo-500/10"
                    >
                        {executingTask ? <Loader2 className="w-3 h-3 animate-spin"/> : <Zap className="w-3 h-3" />}
                        {executingTask ? '運行中' : '手動啟動決策任務'}
                    </button>
                </div>
                
                <div className="bg-slate-900/40 rounded-2xl border border-rose-500/20 p-6 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                    
                    {latestReport ? (
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">最近一次決策總結 ({new Date(latestReport.created_at).toLocaleDateString()})</span>
                            </div>
                            <p className="text-[12px] text-slate-200 font-medium leading-relaxed italic truncate-2-lines">
                                「{latestReport.summary || '決策日誌已產出。'}」
                            </p>
                            <div className="pt-2 flex flex-wrap gap-2 border-t border-slate-700/30">
                                {latestReport.content?.top_keywords?.map((kw: string) => (
                                    <span key={kw} className="text-[8px] px-2 py-0.5 bg-slate-800 text-slate-500 rounded font-bold">{kw}</span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">尚無戰略報告</p>
                        </div>
                    )}
                </div>
            </div>

            {/* REAL Revenue Engine (Conversion Engine) */}
            <div className="p-6 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 shadow-xl overflow-hidden relative group">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        營收轉化引擎
                    </h3>
                    <div className="px-2 py-0.5 bg-emerald-500/20 rounded text-[8px] font-black text-emerald-400 uppercase">Live Optimizer</div>
                </div>
                
                <div className="space-y-4 relative z-10">
                    {campaigns.length > 0 ? (
                        campaigns.map((c) => (
                            <div key={c.id} className="p-4 bg-slate-900/60 rounded-xl border border-white/5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
                                        <p className="text-[11px] font-black text-slate-200">{c.campaign_name}</p>
                                    </div>
                                    <button 
                                        onClick={() => toggleCampaign(c.id, c.is_active)}
                                        disabled={togglingCampaign === c.id}
                                        className={`p-1.5 rounded-lg transition-all ${
                                            c.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'
                                        }`}
                                    >
                                        {togglingCampaign === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-slate-600 uppercase">關鍵字引發:</span>
                                    <span className="text-[9px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded font-black">{c.trigger_keyword}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                    「{c.promotion_script.slice(0, 50)}...」
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-[10px] text-slate-500 text-center py-4">目前尚無活動設定</p>
                    )}
                    
                    <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all border border-slate-700 flex items-center justify-center gap-2">
                        <Edit3 className="w-3 h-3" />
                        新增促銷自動成交腳本
                    </button>
                </div>
            </div>

            {/* Customer Analysis Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    客群深度分析
                </h3>
                
                <div className="bg-slate-900/40 rounded-2xl border border-slate-700/50 p-6 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {customerStats.map((cust, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center font-black text-emerald-400 text-[10px] border border-emerald-500/20">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-200">{cust.display_name || '訪客'}</p>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase">互動次數: {cust.msg_count}</p>
                                        </div>
                                    </div>
                                    <div className="h-1 w-16 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-emerald-500" 
                                            style={{ width: `${Math.min(100, (cust.msg_count / (customerStats[0]?.msg_count || 1)) * 100)}%` }} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Keyword Analysis Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
                    <Tag className="w-4 h-4 text-indigo-400" />
                    對話熱詞排行
                </h3>
                
                <div className="bg-slate-900/40 rounded-2xl border border-slate-700/50 p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {keywords.map((kw, i) => (
                                <div 
                                    key={i} 
                                    className="px-3 py-1.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex items-center gap-2 hover:bg-indigo-500/10 transition-all cursor-default"
                                >
                                    <span className="text-[10px] font-black text-indigo-300">{kw.word}</span>
                                    <span className="text-[9px] font-bold text-slate-600">{kw.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
