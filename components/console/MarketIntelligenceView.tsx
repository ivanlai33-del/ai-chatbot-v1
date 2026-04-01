'use client';

import React, { useEffect, useState } from 'react';
import { Map, MapPin, TrendingUp, Flame, Ghost, Users, Search, Target, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MarketIntelligenceView() {
    const [stats, setStats] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMarketData = async () => {
            const lineId = localStorage.getItem('line_user_id');
            if (!lineId) return;
            try {
                const res = await fetch(`/api/console/market?userId=${lineId}`);
                const data = await res.json();
                if (data.success) {
                    setStats(data.regions || []);
                    setSummary(data.summary);
                }
            } catch (e) {
                console.error("Market Data Fetch Error:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchMarketData();
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-32">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/5">
                        <Map className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-[0.2em]">台灣全域市場情報</h2>
                        <p className="text-[10px] text-slate-500 font-bold mt-1 tracking-widest uppercase">追蹤來訪熱區與「數位沙漠」分布圖</p>
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
                            {/* Status Icon Overlay */}
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

                                {/* Penetration Bar */}
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
                            <h3 className="text-lg font-black text-white uppercase tracking-widest">市場擴張建議系統</h3>
                            <p className="text-sm text-slate-400 leading-relaxed max-w-2xl font-medium italic">
                                「iVan 指揮官，目前 {summary?.desert_region || '部分地區'} 雖然擁有高來訪量，但店長開通數卻為 0，這顯示該區有極強的數位轉型缺口。建議針對該區域投放專屬的『開通路徑引導』廣告，以在對手進入前先行搶佔市場。」
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
