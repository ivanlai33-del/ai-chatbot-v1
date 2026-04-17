'use client';

import { motion } from 'framer-motion';
import { ShieldAlert, AlertCircle, Star, Bell, Settings, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function GuardianTab({ botId }: { botId: string }) {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [data, setData] = useState<any>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, [botId]);

    const fetchMetrics = async () => {
        try {
            const res = await fetch(`/api/console/intelligence/guardian?botId=${botId}`);
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            }
        } catch (error) {
            console.error('Fetch guardian metrics error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleScan = async () => {
        setIsScanning(true);
        try {
            const res = await fetch('/api/console/intelligence/guardian', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botId })
            });
            const json = await res.json();
            if (json.success) {
                await fetchMetrics();
            } else {
                alert(json.error || '掃描失敗');
            }
        } catch (error) {
            console.error('Manual scan error:', error);
            alert('系統錯誤');
        } finally {
            setIsScanning(false);
        }
    };

    const metrics = data || {
        health_score: 0,
        positive_ratio: 0,
        neutral_ratio: 0,
        negative_ratio: 0,
        mentions: [],
        keywords: []
    };

    const monitoringKeywords = metrics.keywords || [];
    const recentMentions = metrics.mentions || [];

    return (
        <div className="space-y-6">
            {/* Top Stats: Brand Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Card: Health Score */}
                <div className="lg:col-span-2 p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[20px] flex items-center justify-center bg-emerald-50 text-emerald-600">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-[20px] font-black text-slate-900">品牌健康狀態</h3>
                                <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 text-left">Real-time Sentiment Analysis</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleScan}
                            disabled={isScanning}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-[16px] bg-slate-900 text-white font-black text-[13px] hover:scale-105 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            <div className={`h-2 w-2 rounded-full bg-emerald-500 ${isScanning ? 'animate-ping' : 'animate-pulse'}`}></div>
                            {isScanning ? '掃描中...' : 'Manual Scan'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div className="text-[48px] font-black text-slate-900 leading-none mb-2 text-left">{metrics.health_score}<span className="text-[20px] text-slate-400 ml-1">/100</span></div>
                            <div className="text-[13px] font-black text-slate-500 uppercase tracking-wider mb-4 text-left">品牌健康指數</div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${metrics.health_score}%` }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2 flex flex-col justify-end gap-3">
                            {[
                                { label: '正向提及', ratio: metrics.positive_ratio, color: 'bg-emerald-500' },
                                { label: '中立回饋', ratio: metrics.neutral_ratio, color: 'bg-slate-300' },
                                { label: '負面警示', ratio: metrics.negative_ratio, color: 'bg-rose-500' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="text-[12px] font-bold text-slate-500 w-16 text-left">{item.label}</span>
                                    <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.ratio * 100}%` }}
                                            className={`h-full ${item.color}`}
                                        />
                                    </div>
                                    <span className="text-[12px] font-black text-slate-900 w-8 text-right">{Math.round(item.ratio * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Card: Alert Settings */}
                <div className="p-8 rounded-[40px] bg-indigo-900 text-white shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-[12px] bg-white/10">
                                    <Bell className="w-5 h-5 text-indigo-300" />
                                </div>
                                <h4 className="text-[18px] font-black">危機預警通知</h4>
                            </div>
                            <button 
                                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                className={`w-12 h-6 rounded-full transition-all relative ${notificationsEnabled ? 'bg-emerald-500' : 'bg-white/20'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notificationsEnabled ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                        <p className="text-white/60 text-[14px] font-bold leading-relaxed text-left">
                            開啟後，系統偵測到高風險或負面提及時，將立即透過 LINE 官方帳號推送警報給管理員。
                        </p>
                    </div>
                    <button className="w-full py-4 rounded-[20px] bg-white/10 border border-white/20 text-white font-black text-[14px] hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                        <Settings className="w-4 h-4" /> 設定警報閾值
                    </button>
                </div>

            {/* Keyword Monitoring & Recent Mentions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Keywords */}
                <div className="p-8 rounded-[32px] bg-white border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[20px] font-black text-slate-900">關鍵字監控範圍</h3>
                        <button className="text-indigo-600 font-black text-[14px] flex items-center gap-1">
                            <ArrowRight className="w-4 h-4" /> 管理關鍵字
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {monitoringKeywords.length > 0 ? monitoringKeywords.map((tag: any, i: number) => (
                            <span key={i} className={`px-4 py-2 rounded-full text-[13px] font-bold shadow-sm flex items-center gap-2 ${tag.is_negative ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                                {tag.keyword}
                                {tag.is_negative && <AlertCircle className="w-3.5 h-3.5" />}
                            </span>
                        )) : (
                            <p className="text-slate-400 font-bold">尚未設定監控關鍵字</p>
                        )}
                    </div>
                </div>

                {/* Right: Mentions */}
                <div className="p-8 rounded-[32px] bg-white border border-slate-100 max-h-[400px] overflow-hidden flex flex-col">
                    <h3 className="text-[20px] font-black text-slate-900 mb-6 shrink-0">近期重點提及</h3>
                    <div className="space-y-4 overflow-y-auto pr-2 glass-scrollbar">
                        {recentMentions.length > 0 ? recentMentions.map((alert: any, i: number) => (
                            <div key={i} className={`p-4 rounded-[24px] border transition-all hover:-translate-y-0.5 ${alert.sentiment === 'Negative' ? 'bg-rose-50/50 border-rose-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${alert.sentiment === 'Negative' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                            {alert.source_platform}
                                        </span>
                                        <span className="text-[11px] font-black text-slate-400">{new Date(alert.mentioned_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                        {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= (alert.sentiment === 'Negative' ? 2 : 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}
                                    </div>
                                </div>
                                <p className="text-[14px] font-bold text-slate-700 leading-relaxed text-left">
                                    {alert.content}
                                </p>
                            </div>
                        )) : (
                            <p className="text-slate-400 text-center font-bold">目前無提及紀錄</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
