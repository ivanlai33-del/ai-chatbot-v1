"use client";

import React, { useState, useEffect } from 'react';
import { 
    Gem, Settings, Users, ArrowRight,
    Star, Gift, Clock, RefreshCw,
    Plus, ChevronRight, Layout, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { usePartner } from '@/context/PartnerContext';

export default function LoyaltyPage() {
    const { activeOA } = usePartner();
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPoints: '124,500',
        activeMembers: '1,280',
        redeemedThisMonth: '420'
    });

    useEffect(() => {
        async function fetchLoyaltyConfig() {
            if (!activeOA) return;
            setLoading(true);
            try {
                const { data } = await supabase
                    .from('loyalty_config')
                    .select('*')
                    .eq('oa_id', activeOA.id)
                    .maybeSingle();
                
                if (data) setConfig(data);
            } catch (err) {
                console.error('Error fetching loyalty config:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchLoyaltyConfig();
    }, [activeOA]);

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                        <div className="p-3 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20 text-white">
                            <Gem className="w-8 h-8" />
                        </div>
                        會員忠誠度與集點卡
                    </h1>
                    <p className="mt-3 text-slate-500 font-medium">配置自動集點規則、點數兌換獎勵與會員等級體系。</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Configuration & Rules */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white/40 backdrop-blur-3xl border border-white rounded-[3rem] p-10 shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-amber-500" /> 集點與兌換規則
                            </h3>
                            <button className="text-xs font-black text-amber-600 hover:underline">編輯全域規則</button>
                        </div>

                        <div className="space-y-6">
                            <div className="p-8 bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-[2.5rem] flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-amber-100">
                                        <Sparkles className="w-8 h-8 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">基礎集點比例</p>
                                        <h4 className="text-2xl font-black text-slate-900">消費 NT$ {config?.ratio || 100} ＝ 1 點</h4>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">點數名稱</p>
                                    <p className="text-lg font-black text-slate-900">{config?.point_name || '點子點'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 bg-white/60 rounded-[2rem] border border-white shadow-sm flex items-center gap-4 group hover:border-amber-200 transition-all">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><Users className="w-5 h-5" /></div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-slate-900">註冊歡迎禮</p>
                                        <p className="text-[10px] text-slate-400 font-bold">新好友加入即贈 50 點</p>
                                    </div>
                                    <div className="w-10 h-6 bg-emerald-500 rounded-full relative p-1"><div className="w-4 h-4 bg-white rounded-full absolute right-1" /></div>
                                </div>
                                <div className="p-6 bg-white/60 rounded-[2rem] border border-white shadow-sm flex items-center gap-4 group hover:border-amber-200 transition-all">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Gift className="w-5 h-5" /></div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-slate-900">生日點數加倍</p>
                                        <p className="text-[10px] text-slate-400 font-bold">當月消費享 2 倍點數</p>
                                    </div>
                                    <div className="w-10 h-6 bg-slate-200 rounded-full relative p-1"><div className="w-4 h-4 bg-white rounded-full absolute left-1" /></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Redemption Items */}
                    <section className="bg-white/40 backdrop-blur-3xl border border-white rounded-[3rem] p-10 shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                <Gift className="w-4 h-4 text-amber-500" /> 點數兌換獎品
                            </h3>
                            <button className="px-4 py-2 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-xl text-[10px] font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20"><Plus className="w-3 h-3" /> 新增獎項</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { name: 'VIP 專屬品牌手拿包', points: 500, stock: 12 },
                                { name: '夏季特調飲品兌換券', points: 150, stock: 150 },
                            ].map((item, i) => (
                                <div key={i} className="p-6 bg-white/60 rounded-[2.5rem] border border-white flex justify-between items-center group hover:bg-white transition-all shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100">
                                            <Star className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900">{item.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold">庫存: {item.stock}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-amber-500">{item.points}</span>
                                        <span className="text-[10px] font-black text-slate-300 ml-1">pts</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right: Preview & Stats */}
                <div className="space-y-6">
                    <section className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-20 blur-[50px] group-hover:scale-150 transition-transform duration-700" />
                        <h3 className="text-lg font-black mb-8 flex items-center gap-2">
                            <Layout className="w-5 h-5" /> 會員集點卡預覽
                        </h3>
                        <div className="aspect-[1.6/1] bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 flex flex-col justify-between shadow-inner">
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-lg">
                                    <Gem className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Loyalty Card</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Current Balance</p>
                                <p className="text-4xl font-black tabular-nums tracking-tighter">8,420 <span className="text-sm font-black ml-1 opacity-60">pts</span></p>
                            </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                            <div className="text-center">
                                <p className="text-[10px] font-black opacity-60 uppercase mb-1">累積點數</p>
                                <p className="text-xl font-black">{stats.totalPoints}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black opacity-60 uppercase mb-1">活躍會員</p>
                                <p className="text-xl font-black">{stats.activeMembers}</p>
                            </div>
                        </div>
                    </section>

                    <div className="bg-white/40 backdrop-blur-xl border border-white p-8 rounded-[2.5rem] shadow-sm">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">最近兌換紀錄</h4>
                        <div className="space-y-4">
                            {[
                                { user: 'Ivan L.', time: '10 min ago', points: '-150' },
                                { user: 'Sarah W.', time: '1 hr ago', points: '-500' },
                            ].map((log, i) => (
                                <div key={i} className="flex justify-between items-center pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">{log.user.charAt(0)}</div>
                                        <div>
                                            <p className="text-xs font-black text-slate-800">{log.user}</p>
                                            <p className="text-[10px] text-slate-400 font-bold">{log.time}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-rose-500">{log.points}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest transition-all">查看全部歷史紀錄</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
