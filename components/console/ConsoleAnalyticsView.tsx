'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, MapPin, Tag, Smartphone, Laptop, Loader2, RefreshCw } from 'lucide-react';

interface VisitorIntelligenceData {
    totalVisitors: number;
    utmData: { name: string; value: number }[];
    contentTags: { name: string; value: number }[];
    deviceMap: Record<string, number>;
    cities: { name: string; value: number }[];
    latestLogs: any[];
}

export default function ConsoleAnalyticsView() {
    const [data, setData] = useState<VisitorIntelligenceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        const lineId = localStorage.getItem('line_user_id');
        if (!lineId) return;

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
        const interval = setInterval(() => fetchAnalytics(false), 300000); // 5 分鐘自動更新
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin opacity-50" />
            </div>
        );
    }

    if (!data) return null;

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

    const UTMPieChart = () => {
        // Simple SVG Pie Chart for UTM sources
        const total = data.utmData.reduce((acc, curr) => acc + curr.value, 0) || 1;
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
                {data.utmData.length > 0 ? (
                    <div className="flex flex-col md:flex-row items-center gap-8 flex-1 justify-center">
                        <div className="relative w-32 h-32 shrink-0">
                            <svg viewBox="-1 -1 2 2" className="w-full h-full -rotate-90">
                                {data.utmData.map((slice, i) => {
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
                            {data.utmData.map((item, i) => (
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

    const ContentHotspots = () => (
        <div className="bg-slate-900/40 rounded-3xl border border-slate-700/50 p-6 h-full flex flex-col">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">內容閱讀熱度 (Content Tags)</h4>
            {data.contentTags.length > 0 ? (
                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {data.contentTags.slice(0, 6).map((tag, i) => {
                        const maxVal = data.contentTags[0].value;
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

    const RawAuditTable = () => (
        <div className="bg-slate-900/40 rounded-3xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">即時訪客審計 (Live Traffic)</h4>
                <div className="text-[10px] font-bold text-slate-500 px-2 py-1 bg-slate-800 rounded">顯示最近 10 筆</div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                    <thead>
                        <tr className="border-b border-slate-700/30">
                            <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Time</th>
                            <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">IP / Location</th>
                            <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Source</th>
                            <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Current Page</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/20">
                        {data.latestLogs.length > 0 ? data.latestLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-800/20 transition-all">
                                <td className="px-6 py-4 text-slate-400 font-mono whitespace-nowrap">
                                    {new Date(log.created_at).toLocaleTimeString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-mono text-slate-300">
                                            {/* 隱藏 IP 最後一段保護隱私 */}
                                            {log.ip ? log.ip.replace(/\.\d+$/, '.xxx') : 'Unknown'}
                                        </span>
                                        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                            <MapPin className="w-3 h-3" /> {log.city || 'Unknown'}, {log.district || ''}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded font-bold text-[9px] uppercase">
                                        {log.utm_source || 'Direct'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400 max-w-[200px] truncate">
                                    {log.page_title || log.page_url || 'Unknown'}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-bold">無紀錄</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20">
            {/* Header Controls */}
            <div className="flex justify-end">
                <button 
                    onClick={() => fetchAnalytics(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all text-xs font-bold"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    即時更新
                </button>
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                    title="總訪次 (Total Visitors)" 
                    value={data.totalVisitors} 
                    icon={Eye} 
                    colorClass="text-emerald-500" 
                />
                <MetricCard 
                    title="台北客源佔比" 
                    value={`${data.cities.length > 0 ? Math.round((data.cities.find(c => c.name.includes('台北'))?.value || 0) / data.totalVisitors * 100) : 0}%`} 
                    icon={MapPin} 
                    colorClass="text-sky-500" 
                />
                <MetricCard 
                    title="手機用戶" 
                    value={`${data.deviceMap['Mobile'] || 0}`} 
                    icon={Smartphone} 
                    colorClass="text-rose-500" 
                />
                <MetricCard 
                    title="桌機用戶" 
                    value={`${Math.max(data.totalVisitors - (data.deviceMap['Mobile'] || 0), 0)}`} 
                    icon={Laptop} 
                    colorClass="text-indigo-500" 
                />
            </div>

            {/* Middle Grid: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[250px] lg:h-[300px]">
                <UTMPieChart />
                <ContentHotspots />
            </div>

            {/* Bottom: Logs */}
            <div className="pt-4">
                <RawAuditTable />
            </div>
        </div>
    );
}
