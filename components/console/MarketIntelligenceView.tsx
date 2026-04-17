'use client';

import React, { useEffect, useState } from 'react';
import { Map, MapPin, TrendingUp, Flame, Ghost, Users, Search, Target, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MarketIntelligenceView() {
    const [stats, setStats] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [monitors, setMonitors] = useState<any[]>([]);
    const [loadingMonitors, setLoadingMonitors] = useState(false);

    const ADMIN_ID = "Ud8b8dd79162387a80b2b5a4aba20f604";

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/console/market?userId=${ADMIN_ID}`);
                const data = await res.json();
                if (data.success) {
                    setStats(data.regions || []);
                    setSummary(data.summary || null);
                }
            } catch (e) {
                console.error("Market Pulse Fetch Error:", e);
            } finally {
                setLoading(false);
            }
        };

        const fetchMonitors = async () => {
            const botId = localStorage.getItem('last_selected_bot_id');
            if (!botId) return;
            setLoadingMonitors(true);
            try {
                const res = await fetch(`/api/console/market/sync-competitor?botId=${botId}`);
                const data = await res.json();
                if (data.success) {
                    setMonitors(data.reports || []);
                }
            } catch (e) {
                console.error("Monitors Fetch Error:", e);
            } finally {
                setLoadingMonitors(false);
            }
        };

        fetchData();
        fetchMonitors();
    }, []);

    const handleAddMonitor = async () => {
        const input = document.getElementById('competitor-url-input') as HTMLInputElement;
        const url = input.value;
        if(!url) return;
        const lineId = localStorage.getItem('line_user_id');
        const botId = localStorage.getItem('last_selected_bot_id');
        if(!botId) return alert('請先選擇 Bot');
        
        const btn = document.getElementById('sync-btn') as HTMLButtonElement;
        if(btn) {
            btn.disabled = true;
            btn.innerText = '分析中...';
        }
        
        try {
            const res = await fetch('/api/console/market/sync-competitor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botId, userId: lineId, competitorUrl: url })
            });
            const data = await res.json();
            if(data.success) {
                alert('成功！AI 已產生分析報告');
                // 重新獲取列表
                const refreshRes = await fetch(`/api/console/market/sync-competitor?botId=${botId}`);
                const refreshData = await refreshRes.json();
                if (refreshData.success) setMonitors(refreshData.reports);
                input.value = '';
            } else {
                alert('分析失敗: ' + data.error);
            }
        } catch (e) {
            alert('系統錯誤');
        } finally {
            if(btn) {
                btn.disabled = false;
                btn.innerText = '開始監控';
            }
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-32">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/5">
                        <Map className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-[0.2em] text-left">台灣全域市場情報</h2>
                        <p className="text-[10px] text-slate-500 font-bold mt-1 tracking-widest uppercase text-left">追蹤來訪熱區與「數位沙漠」分布圖</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                        <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest">目前最火熱地區</p>
                        <p className="text-sm font-black text-slate-200">{summary?.hot_zone || '對齊中'}</p>
                    </div>
                    <div className="px-4 py-2 bg-slate-800/40 rounded-xl border border-white/5">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">市場滲透率</p>
                        <p className="text-sm font-black text-indigo-400">{summary?.penetration || '0'}%</p>
                    </div>
                </div>
            </div>

            {/* Region Intelligence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-40 gap-4 opacity-50">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">正在載入地理座標數據庫...</p>
                    </div>
                ) : (
                    stats.map((region, i) => (
                        <motion.div 
                            key={region.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`p-6 rounded-3xl border transition-all relative overflow-hidden group ${
                                region.status === 'Hot' 
                                    ? 'bg-rose-500/5 border-rose-500/20 shadow-lg shadow-rose-500/5' 
                                    : region.status === 'Desert' 
                                    ? 'bg-slate-900/60 border-white/5 grayscale opacity-80'
                                    : 'bg-slate-900/40 border-slate-700/50'
                            }`}
                        >
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                {region.status === 'Hot' ? <Flame className="w-full h-full text-rose-500" /> : <Ghost className="w-full h-full text-slate-400" />}
                            </div>

                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MapPin className={`w-4 h-4 ${region.status === 'Hot' ? 'text-rose-500' : 'text-slate-500'}`} />
                                        <h3 className="text-sm font-black text-slate-100">{region.name}</h3>
                                    </div>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                                        region.status === 'Hot' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-500'
                                    }`}>
                                        {region.status === 'Hot' ? '戰區 (Hot)' : '沙漠 (Desert)'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-2 border-t border-white/5">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-600 uppercase">來訪人數</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Users className="w-3 h-3 text-slate-500" />
                                            <span className="text-lg font-black text-slate-200 tracking-tighter">{region.inquiries}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-600 uppercase">店長開通數</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Target className="w-3 h-3 text-indigo-400" />
                                            <span className="text-lg font-black text-slate-200 tracking-tighter">{region.activations}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[9px] font-black uppercase italic">
                                        <span className="text-slate-500">滲透率 (Penetration)</span>
                                        <span className={region.penetration > 50 ? 'text-emerald-400' : 'text-slate-400'}>{region.penetration}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${region.penetration}%` }}
                                            className={`h-full ${region.status === 'Hot' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-indigo-500'}`} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* 🕵️ 競品監控與情報分析系統 */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-2xl">
                            <Ghost className="w-6 h-6 text-rose-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white uppercase tracking-[0.2em] text-left">競品情報監控系統</h2>
                            <p className="text-[10px] text-slate-500 font-bold mt-1 tracking-widest uppercase text-left">自動追蹤對手動態並產生戰略報告</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 p-8 rounded-[32px] bg-slate-900/60 border border-white/5 space-y-6 self-start">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">新增監控對象</label>
                            <div className="flex gap-2">
                                <input 
                                    type="url" 
                                    placeholder="輸入競爭對手官網..."
                                    className="flex-1 bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-medium"
                                    id="competitor-url-input"
                                />
                                <button 
                                    onClick={handleAddMonitor}
                                    id="sync-btn"
                                    className="px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 rounded-xl text-white font-black text-xs shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    開始監控
                                </button>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-3">
                            <p className="text-[11px] font-black text-rose-400 flex items-center gap-2">
                                <Flame className="w-3.5 h-3.5" /> 爬蟲積木運作中
                            </p>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-medium text-left">
                                系統將會使用 Crawlee 自動巡視目標網頁，並由 GPT-4o 進行語意對比分析，產生決策建議。
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-4">
                        {loadingMonitors ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin opacity-20" />
                            </div>
                        ) : monitors.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {monitors.map((m) => {
                                    const latest = m.competitor_analysis?.[0]?.analysis_report;
                                    const date = m.competitor_analysis?.[0]?.created_at;
                                    
                                    return (
                                        <div key={m.id} className="p-6 rounded-[32px] bg-slate-900/40 border border-white/5 space-y-4 group hover:border-emerald-500/30 transition-all">
                                            <div className="flex justify-between items-start">
                                                <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                                    <p className="text-[9px] font-black text-emerald-500 italic">ANALYSIS REPORT</p>
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-bold tracking-tight">
                                                    {date ? new Date(date).toLocaleString('zh-TW', { hour12: false }) : '尚未分析'}
                                                </p>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-100 truncate text-left">{m.brand_name || m.url}</h4>
                                                <p className="text-[10px] text-slate-600 truncate text-left">{m.url}</p>
                                            </div>
                                            {latest ? (
                                                <>
                                                    <div className="space-y-3 py-3 border-y border-white/5">
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black text-slate-500 uppercase text-left">新產品/服務</p>
                                                            <p className="text-xs text-slate-300 font-medium line-clamp-2 text-left">{latest.newProducts}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black text-slate-500 uppercase text-left">價格/促銷</p>
                                                            <p className="text-xs text-rose-400 font-black line-clamp-2 text-left">{latest.pricingUpdates}</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
                                                        <p className="text-[11px] font-black text-indigo-400 mb-1 text-left">💡 指揮官建議：</p>
                                                        <p className="text-xs text-slate-200 leading-relaxed italic text-left">{latest.recommendation}</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="py-10 text-center">
                                                    <p className="text-[10px] text-slate-600 font-black">等待首次同步中...</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-full min-h-[300px] border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center opacity-30">
                                <Search className="w-12 h-12 text-slate-500 mb-4" />
                                <p className="text-xs font-black text-slate-500 tracking-widest uppercase italic">目前尚無監控中的競品</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Strategic Analysis Overlay */}
            {!loading && (
                <div className="p-8 rounded-[40px] bg-indigo-600/10 border border-indigo-500/20 shadow-2xl relative group overflow-hidden">
                    <div className="absolute right-0 bottom-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-32 h-32 text-indigo-500" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-20 h-20 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-2xl shrink-0">
                            <TrendingUp className="w-10 h-10 text-white" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-black text-white uppercase tracking-widest text-left">市場擴張建議系統</h3>
                            <p className="text-sm text-slate-400 leading-relaxed max-w-2xl font-medium italic text-left">
                                「iVan 指揮官，目前 {summary?.desert_region || '部分地區'} 雖然擁有高來訪量，但店長開通數卻為 0，這顯示該區有極強的數位轉型缺口。建議針對該區域投放專屬的『開通路徑引導』廣告，以在對手進入前先行搶佔市場。」
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
