'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, MapPin, Tag, Smartphone, Laptop, Loader2, RefreshCw } from 'lucide-react';

interface VisitorIntelligenceData {
    totalVisitors: number;
    siteData: { name: string; value: number }[]; // 🚀 全站點分佈數據 🚀
    utmData: { name: string; value: number }[];
    contentTags: { name: string; value: number }[];
    deviceMap: Record<string, number>;
    cities: { name: string; value: number }[];
    seoData: any[]; // 🚀 關鍵字與排名數據 🚀
    latestLogs: any[];
}

export default function ConsoleAnalyticsView() {
    const [data, setData] = useState<VisitorIntelligenceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [impersonationMode, setImpersonationMode] = useState<'admin' | 'free'>('admin');

    // 檢查目前的模擬身份狀態
    const checkImpersonationMode = async () => {
        try {
            const res = await fetch('/api/debug/toggle-identity');
            const json = await res.json();
            setImpersonationMode(json.mode || 'admin');
        } catch (e) {
            console.error("Failed to check impersonation mode:", e);
        }
    };

    const handleToggleRole = async () => {
        const nextMode = impersonationMode === 'admin' ? 'free' : 'admin';
        try {
            const res = await fetch('/api/debug/toggle-identity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: nextMode })
            });
            const json = await res.json();
            if (json.success) {
                // 強制刷新以套用新的 Cookie 權限
                window.location.reload();
            }
        } catch (e) {
            alert('切換身份失敗，請稍後再試');
        }
    };

    const handleSyncSEO = async () => {
        setRefreshing(true);
        try {
            const res = await fetch('/api/platform/seo-sync', { method: 'POST' });
            const json = await res.json();
            if (json.success) {
                await fetchAnalytics();
            } else {
                alert('SEO 同步失敗：' + json.error);
            }
        } catch (e) {
            alert('連線失敗');
        } finally {
            setRefreshing(false);
        }
    };

    const fetchAnalytics = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        const lineId = localStorage.getItem('line_user_id');
        
        if (!lineId) {
            console.warn("No line_user_id found for analytics.");
            setLoading(false);
            setRefreshing(false);
            return;
        }

        try {
            const res = await fetch(`/api/console/visitor-intelligence?userId=${lineId}`);
            const json = await res.json();
            if (json.success) {
                setData(json.summary);
            }
        } catch (e) {
            console.error("Failed to fetch visitor intelligence:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
        checkImpersonationMode();
        const interval = setInterval(() => fetchAnalytics(false), 300000); // 5 分鐘自動更新
        return () => clearInterval(interval);
    }, []);

    // ── Render Header (Always visible) ──────────────────────────
    const RenderHeader = () => (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/40 p-5 rounded-3xl border border-slate-700/50 gap-4 mb-6">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    impersonationMode === 'admin' 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                }`}>
                    {impersonationMode === 'admin' ? <Eye className="w-6 h-6" /> : <RefreshCw className="w-6 h-6 animate-pulse" />}
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">系統身份狀態</p>
                    <p className="text-base font-black text-white flex items-center gap-2">
                        {impersonationMode === 'admin' ? '🛡️ iVan 最高管理者' : '👤 模擬免費會員中'}
                    </p>
                </div>
                <button
                    onClick={handleToggleRole}
                    className={`ml-4 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                        impersonationMode === 'admin' 
                        ? 'bg-slate-800 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30' 
                        : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20'
                    }`}
                >
                    {impersonationMode === 'admin' ? '模擬一般會員' : '恢復管理模式'}
                </button>
            </div>

            <div className="flex items-center gap-3">
                <button 
                    onClick={handleSyncSEO}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-indigo-500/10 text-indigo-400 rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-indigo-500/20 active:scale-95"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    同步 SEO 數據
                </button>
                <button 
                    onClick={() => fetchAnalytics(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-slate-700 active:scale-95"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    即時更新
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <RenderHeader />
                <div className="flex items-center justify-center h-full min-h-[300px] bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin opacity-50" />
                        <span className="text-xs font-bold text-slate-600 animate-pulse uppercase tracking-[0.2em]">載入指揮中心數據中...</span>
                    </div>
                </div>
            </div>
        );
    }

    // 即使沒有數據，也初始化一個空結構讓框架能跑出來
    const defaultEmptyData = {
        totalVisitors: 0,
        cities: [],
        deviceMap: {},
        siteData: [],
        utmData: [],
        contentTags: [],
        seoData: [],
        latestLogs: []
    };

    const displayData = data || defaultEmptyData;

    // --- Components ---
    const MetricCard = ({ title, value, icon: Icon, colorClass }: any) => (
        <div className="bg-slate-900/40 rounded-3xl border border-slate-700/50 p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-24 h-24 opacity-5 group-hover:scale-110 transition-transform ${colorClass}`}>
                <Icon className="w-full h-full" />
            </div>
            <div className="relative z-10 flex items-center justify-between mb-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</span>
                <Icon className={`w-5 h-5 ${colorClass}`} />
            </div>
            <div className="relative z-10">
                <span className="text-3xl font-black text-white">{value}</span>
            </div>
        </div>
    );

    const SiteDistribution = () => {
        const maxVal = displayData.siteData.length > 0 ? displayData.siteData[0].value : 1;
        
        return (
            <div className="bg-slate-900/40 rounded-3xl border border-slate-700/50 p-6 h-full flex flex-col">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">受控站台流量分布 (Sites)</h4>
                {displayData.siteData.length > 0 ? (
                    <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {displayData.siteData.map((site) => (
                            <div key={site.name} className="space-y-2">
                                <div className="flex justify-between text-[11px] font-bold text-slate-300">
                                    <span className="truncate max-w-[180px] flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        {site.name}
                                    </span>
                                    <span className="text-white font-black">{site.value} 次</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(site.value / maxVal) * 100}%` }}
                                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500 text-sm font-bold italic">尚無跨站台數據</div>
                )}
            </div>
        );
    };

    const UTMPieChart = () => {
        // Simple SVG Pie Chart for UTM sources
        const total = displayData.utmData.reduce((acc: number, curr: any) => acc + curr.value, 0) || 1;
        let cumulativePercent = 0;

        const getCoordinatesForPercent = (percent: number) => {
            const x = Math.cos(2 * Math.PI * percent);
            const y = Math.sin(2 * Math.PI * percent);
            return [x, y];
        };

        const colors = ['#f472b6', '#38bdf8', '#fbbf24', '#a78bfa', '#34d399', '#94a3b8'];

        return (
            <div className="bg-slate-900/40 rounded-3xl border border-slate-700/50 p-6 h-full flex flex-col">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">流量來源 (UTM Source)</h4>
                {displayData.utmData.length > 0 ? (
                    <div className="flex flex-col md:flex-row items-center gap-8 flex-1 justify-center">
                        <div className="relative w-32 h-32 shrink-0">
                            <svg viewBox="-1 -1 2 2" className="w-full h-full -rotate-90">
                                {displayData.utmData.map((slice, i) => {
                                    const percent = slice.value / total;
                                    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                                    cumulativePercent += percent;
                                    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                                    const largeArcFlag = percent > 0.5 ? 1 : 0;
                                    const pathData = [
                                        `M ${startX} ${startY}`,
                                        `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                                        `L 0 0`,
                                    ].join(' ');

                                    return percent === 1 ? (
                                        <circle key={slice.name} cx="0" cy="0" r="1" fill={colors[i % colors.length]} />
                                    ) : (
                                        <path key={slice.name} d={pathData} fill={colors[i % colors.length]} />
                                    );
                                })}
                            </svg>
                        </div>
                        <div className="space-y-3 flex-1 w-full max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                            {displayData.utmData.map((item, i) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                                        <span className="text-[11px] font-bold text-slate-300 truncate max-w-[100px]">{item.name}</span>
                                    </div>
                                    <span className="text-[11px] font-black text-white ml-2">{Math.round((item.value / total) * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500 text-sm font-bold">尚無來源數據</div>
                )}
            </div>
        );
    };

    const ContentHotspots = () => {
        return (
            <div className="bg-slate-900/40 rounded-3xl border border-slate-700/50 p-6 h-full flex flex-col">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">內容閱讀熱度 (Content Tags)</h4>
                {displayData.contentTags.length > 0 ? (
                    <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {displayData.contentTags.slice(0, 6).map((tag, i) => {
                            const maxVal = displayData.contentTags[0].value;
                            const width = `${(tag.value / maxVal) * 100}%`;
                        return (
                            <div key={tag.name} className="space-y-1.5">
                                <div className="flex justify-between text-[11px] font-bold text-slate-300">
                                    <span className="truncate max-w-[150px]">{tag.name}</span>
                                    <span>{tag.value} 次</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width }}
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-sm font-bold">尚無閱讀紀錄</div>
            )}
        </div>
    );
};

    const SEOSearchIntelligence = () => {
        return (
            <div className="bg-slate-900/40 rounded-3xl border border-slate-700/50 p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">搜尋核心關鍵字 (GSC)</h4>
                    <Tag className="w-4 h-4 text-indigo-400" />
                </div>
                {displayData.seoData && displayData.seoData.length > 0 ? (
                    <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {displayData.seoData.map((item, i) => (
                            <div key={item.keyword} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                                <div className="flex flex-col gap-1 min-w-0">
                                    <span className="text-[11px] font-black text-white truncate">{item.keyword}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">排名: {Number(item.position).toFixed(1)}</span>
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">點擊: {item.clicks}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end shrink-0">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${item.position <= 10 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                        #{Math.ceil(item.position)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
                        <Loader2 className="w-5 h-5 animate-spin opacity-20" />
                        <span className="text-[11px] font-bold italic">尚無 SEO 數據，請點擊「同步」</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20">
            <RenderHeader />

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                    title="總訪次 (Total Visitors)" 
                    value={displayData.totalVisitors} 
                    icon={Eye} 
                    colorClass="text-emerald-500" 
                />
                <MetricCard 
                    title="台北客源佔比" 
                    value={`${displayData.cities.length > 0 ? Math.round((displayData.cities.find((c: any) => c.name.includes('台北'))?.value || 0) / displayData.totalVisitors * 100) : 0}%`} 
                    icon={MapPin} 
                    colorClass="text-sky-500" 
                />
                <MetricCard 
                    title="平均搜尋排名" 
                    value={displayData.seoData.length > 0 ? (displayData.seoData.reduce((acc, curr) => acc + curr.position, 0) / displayData.seoData.length).toFixed(1) : '--'} 
                    icon={Tag} 
                    colorClass="text-rose-500" 
                />
                <MetricCard 
                    title="裝置：手機" 
                    value={`${(displayData.deviceMap as Record<string, number>)['Mobile'] || 0}`} 
                    icon={Smartphone} 
                    colorClass="text-indigo-500" 
                />
            </div>

            {/* Middle Grid: Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-auto lg:h-[400px]">
                <div className="lg:col-span-1">
                    <SiteDistribution />
                </div>
                <div className="lg:col-span-1">
                    <UTMPieChart />
                </div>
                <div className="lg:col-span-1">
                    <ContentHotspots />
                </div>
                <div className="lg:col-span-1">
                    <SEOSearchIntelligence />
                </div>
            </div>

            {/* Bottom: Logs */}
            <div className="pt-4">
                <RawAuditTable />
            </div>
        </div>
    );
}
