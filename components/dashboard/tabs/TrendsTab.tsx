'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Globe, ArrowUpRight, MessageSquare, History, Zap, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TrendsTab({ botId }: { botId: string }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, [botId]);

    const fetchReports = async () => {
        try {
            const res = await fetch(`/api/console/intelligence/trends?botId=${botId}`);
            const json = await res.json();
            if (json.success) {
                setReports(json.data);
            }
        } catch (error) {
            console.error('Fetch trends error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setIsAnalyzing(true);
        try {
            const res = await fetch('/api/console/intelligence/trends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botId })
            });
            const json = await res.json();
            if (json.success) {
                await fetchReports();
            } else {
                alert(json.error || '生成失敗');
            }
        } catch (error) {
            console.error('Generate trends error:', error);
            alert('系統錯誤');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const latestReport = reports[0]?.analysis_json || {
        summary: '尚無分析資料',
        sentimentCurve: [0, 0, 0, 0, 0, 0, 0],
        topKeywords: [],
        recommendations: []
    };

    return (
        <div className="space-y-6">
            {/* Header / Summary Card */}
            <div className="p-8 rounded-[40px] bg-gradient-to-br from-indigo-900 to-indigo-800 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-[12px] font-black tracking-widest uppercase">
                                Weekly Analysis
                            </div>
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <h2 className="text-[32px] font-black leading-tight">產業風向週報</h2>
                        <p className="text-white/60 font-bold max-w-md">
                            AI 自動分析全球市場趨勢與在地競業情報，為您提供每週一次的經營戰略建議。
                        </p>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isAnalyzing}
                        className="shrink-0 flex items-center gap-3 px-8 py-4 rounded-[24px] bg-white text-indigo-900 font-black text-[16px] hover:scale-105 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                    >
                        {isAnalyzing ? (
                            <div className="w-5 h-5 border-2 border-indigo-900/20 border-t-indigo-900 rounded-full animate-spin" />
                        ) : (
                            <Zap className="w-5 h-5" />
                        )}
                        {isAnalyzing ? '分析中...' : '生成最新情報'}
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Visual Report Card 1 */}
                <div className="md:col-span-2 space-y-6">
                    <div className="p-8 rounded-[32px] bg-white/60 backdrop-blur-md border border-white shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-[20px] font-black text-slate-900">市場情緒曲線</h3>
                                <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sentiment Velocity</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5 text-[14px] font-black text-emerald-500">
                                    <ArrowUpRight className="w-4 h-4" /> +12.5%
                                </span>
                            </div>
                        </div>

                        {/* Simulated Chart Area */}
                        <div className="h-[240px] w-full bg-slate-50/50 rounded-[24px] border border-dashed border-slate-200 flex items-end justify-between p-6 gap-2">
                            {(latestReport.sentimentCurve || [50, 60, 40, 70, 80, 90, 85]).map((h: number, i: number) => (
                                <motion.div 
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    className={`w-full rounded-t-xl bg-gradient-to-t ${i === 6 ? 'from-indigo-600 to-indigo-400' : 'from-slate-200 to-slate-100'}`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 px-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                                <span key={i} className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{d}</span>
                            ))}
                        </div>
                    </div>

                    {/* AI Strategy Insights */}
                    <div className="p-8 rounded-[32px] bg-white shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 rounded-[16px] bg-indigo-50">
                                <Globe className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-[20px] font-black text-slate-900">本週 AI 經營建議</h3>
                        </div>

                        <div className="space-y-4">
                            {latestReport.recommendations?.map((rec: string, i: number) => (
                                <div key={i} className="p-6 rounded-[24px] bg-slate-50 group transition-all hover:bg-indigo-50 hover:-translate-y-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-black text-slate-800 group-hover:text-indigo-900">建議事項 #{i + 1}</h4>
                                        <span className={`text-[11px] font-black px-3 py-1 rounded-full bg-white border text-indigo-500 border-slate-200`}>
                                            IMPACT: HIGH
                                        </span>
                                    </div>
                                    <p className="text-[14px] text-slate-600 font-medium leading-relaxed">
                                        {rec}
                                    </p>
                                </div>
                            )) || <p className="text-slate-400 text-center font-bold">目前無建議事項</p>}
                        </div>
                    </div>
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-6">
                    <div className="p-6 rounded-[32px] bg-indigo-50 border border-indigo-100">
                        <div className="flex items-center gap-2 mb-4">
                            <MessageSquare className="w-4 h-4 text-indigo-600" />
                            <span className="text-[12px] font-black text-indigo-900 uppercase">熱門經營話題</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(latestReport.topKeywords || ['數據載入中']).map((tag: string, i: number) => (
                                <span key={i} className="px-4 py-2 bg-white rounded-full text-[13px] font-bold text-slate-700 shadow-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 rounded-[32px] bg-white border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                            <History className="w-4 h-4 text-slate-400" />
                            <span className="text-[12px] font-black text-slate-400 uppercase">歷史情報存檔</span>
                        </div>
                        <div className="space-y-3">
                            {reports.map((h, i) => (
                                <button key={i} className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                                    <div className="flex flex-col text-left">
                                        <span className="text-[11px] font-black text-slate-400">{new Date(h.created_at).toLocaleDateString()}</span>
                                        <span className="text-[14px] font-bold text-slate-700">{h.report_title}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
