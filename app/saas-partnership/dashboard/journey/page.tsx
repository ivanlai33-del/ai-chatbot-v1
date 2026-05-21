"use client";

import React, { useEffect, useState } from 'react';
import PermissionGuard from '@/components/os/PermissionGuard';
import { 
    Route, Plus, Zap, 
    ArrowRight, Play, Pause, 
    Settings2, Calendar, 
    MoreVertical, Info, RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function JourneyPage() {
    const [journeys, setJourneys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const textMain = '#0f172a'; // Deep slate instead of pure black
    const textSub = '#64748b'; // Slate 500

    useEffect(() => {
        async function fetchJourneys() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('workflows')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) {
                    console.error('Database Error:', error);
                    // Silently fail or show empty state if table doesn't exist yet
                    setJourneys([]);
                } else {
                    setJourneys(data || []);
                }
            } catch (err) {
                console.error('Error fetching workflows:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchJourneys();
    }, []);

    const toggleJourneyStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('workflows')
                .update({ is_active: !currentStatus })
                .eq('id', id);
            
            if (error) throw error;
            setJourneys(journeys.map(j => j.id === id ? { ...j, is_active: !currentStatus } : j));
        } catch (err) {
            console.error('Error toggling workflow:', err);
        }
    };

    return (
        <div className="p-8 lg:p-12 min-h-screen">
            <PermissionGuard minTier={4}>
                <div className="max-w-6xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <h1 className="text-4xl font-black flex items-center gap-4" style={{ color: textMain }}>
                                <div className="p-3 bg-gradient-to-br from-[#06C755] to-[#05A044] rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
                                    <Route className="w-8 h-8" />
                                </div>
                                旅程與自動化引擎
                            </h1>
                            <p className="mt-3 font-medium text-slate-500">配置「觸發器 → 條件 → 動作」數位流程，讓您的機器人 24/7 自動運轉。</p>
                        </div>
                        <button className="px-8 py-4 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all">
                            <Plus className="w-5 h-5" /> 建立新自動化旅程
                        </button>
                    </div>

                    {/* Journey List */}
                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-32 bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white space-y-4">
                                <RefreshCw className="w-10 h-10 text-[#06C755] animate-spin" />
                                <p className="text-slate-400 font-black tracking-widest text-xs uppercase">正在調閱自動化部署狀態...</p>
                            </div>
                        ) : journeys.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {journeys.map((j) => (
                                    <motion.div 
                                        key={j.id} 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group flex flex-col md:flex-row items-center gap-8 p-8 bg-white/60 backdrop-blur-3xl border border-white rounded-[2.5rem] hover:border-[#06C755]/40 hover:bg-white transition-all shadow-sm"
                                    >
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-sm transition-all duration-500 ${
                                            j.is_active ? 'bg-emerald-50 border-emerald-100 text-[#06C755] scale-110 shadow-emerald-100' : 'bg-slate-50 border-slate-100 text-slate-300'
                                        }`}>
                                            <Zap className={`w-8 h-8 ${j.is_active ? 'animate-pulse' : ''}`} />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-xl font-black text-slate-900">{j.name || '未命名旅程'}</h3>
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${
                                                    j.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                                }`}>{j.is_active ? 'Active' : 'Paused'}</span>
                                            </div>
                                            <div className="flex items-center gap-6 text-xs">
                                                <span className="flex items-center gap-1.5 font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                                                    <Calendar className="w-3.5 h-3.5" /> {j.trigger_event || '手動觸發'}
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-slate-300" />
                                                <span className="flex items-center gap-1.5 font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl">
                                                    <Settings2 className="w-3.5 h-3.5" /> {j.nodes?.length || 0} 個對話節點
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => toggleJourneyStatus(j.id, j.is_active)}
                                                className={`p-4 rounded-2xl transition-all shadow-lg flex items-center gap-2 font-black text-xs ${
                                                    j.is_active 
                                                    ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 shadow-amber-100' 
                                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-emerald-100'
                                                }`}
                                            >
                                                {j.is_active ? <><Pause className="w-4 h-4" /> 暫停運行</> : <><Play className="w-4 h-4" /> 啟動流程</>}
                                            </button>
                                            <button className="p-4 bg-white hover:bg-slate-50 text-slate-400 rounded-2xl transition-all shadow-sm border border-slate-100">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-32 bg-white/20 rounded-[3.5rem] border border-dashed border-white/40 text-center space-y-6">
                                <div className="w-20 h-20 bg-white/40 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                    <Info className="w-10 h-10 text-slate-300" />
                                </div>
                                <div>
                                    <p className="text-slate-400 font-black text-lg">目前尚未配置自動化旅程流程</p>
                                    <p className="text-slate-300 text-sm font-medium">點擊上方按鈕，開始建立您的第一個 AGI 流程。</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </PermissionGuard>
        </div>
    );
}
