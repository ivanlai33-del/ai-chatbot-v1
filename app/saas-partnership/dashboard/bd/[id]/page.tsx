"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    ChevronLeft, ChevronRight, Star, TrendingUp, 
    MessageSquare, Clock, Calendar, 
    Save, Wand2, ShieldCheck,
    AlertCircle, Briefcase, User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function LeadDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [lead, setLead] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        async function fetchLead() {
            setLoading(true);
            const { data, error } = await supabase
                .from('saas_leads')
                .select('*')
                .eq('id', id)
                .single();
            
            if (data) {
                setLead(data);
                setNotes(data.notes || '');
            }
            setLoading(false);
        }
        fetchLead();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        await supabase
            .from('saas_leads')
            .update({ notes })
            .eq('id', id);
        setSaving(false);
        alert('開發紀錄已更新！');
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-slate-400 font-black uppercase tracking-widest">正在載入商機神經元...</div>;
    if (!lead) return <div className="p-20 text-center text-slate-400">找不到此商機</div>;

    return (
        <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-all">
                    <ChevronLeft className="w-5 h-5" /> 返回商機列表
                </button>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-[#06C755] text-white rounded-2xl font-black text-sm shadow-lg shadow-[#06C755]/20 flex items-center gap-2 hover:scale-105 transition-all"
                >
                    <Save className="w-4 h-4" /> {saving ? '儲存中...' : '儲存開發紀錄'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info & Notes */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white/40 backdrop-blur-3xl border border-white rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-[#06C755] to-[#05A044] rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-xl">
                                    {lead.name?.charAt(0)}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900">{lead.name}</h1>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="px-3 py-1 bg-emerald-50 text-[#06C755] text-[10px] font-black rounded-full border border-emerald-100 uppercase tracking-widest">{lead.status}</span>
                                        <span className="text-xs text-slate-400 font-bold flex items-center gap-1"><Briefcase className="w-3 h-3" /> {lead.industry}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">預計營收價值</p>
                                <p className="text-2xl font-black text-slate-900">NT$ {Number(lead.estimated_revenue).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 flex items-center gap-2">
                                <MessageSquare className="w-3 h-3" /> 開發備註與談判進度紀錄
                            </label>
                            <textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={10}
                                placeholder="紀錄此客戶的特殊需求、談判重點或下一步計畫..."
                                className="w-full bg-white/50 border border-white/60 rounded-[2rem] p-8 text-sm font-medium leading-relaxed outline-none focus:border-[#06C755]/30 transition-all shadow-inner"
                            />
                        </div>
                    </section>
                </div>

                {/* Right Column: AI Insights & CRM Link */}
                <div className="space-y-6">
                    <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#06C755] opacity-20 blur-[60px]" />
                        <h3 className="text-lg font-black flex items-center gap-2 mb-6">
                            <Wand2 className="w-5 h-5 text-[#06C755]" /> AI 成交策報
                        </h3>
                        <div className="space-y-6">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">成交率預測</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-black">{lead.probability}%</span>
                                    <span className="text-[10px] text-emerald-400 font-bold mb-1 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> 高於平均</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#06C755] mt-1.5 shrink-0" />
                                    <p className="text-xs text-slate-300 leading-relaxed font-medium">該客戶對 **價格敏感度高**，建議在談判中強調「年繳方案的長線節省」而非單次購買成本。</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#06C755] mt-1.5 shrink-0" />
                                    <p className="text-xs text-slate-300 leading-relaxed font-medium">產業標籤顯示其為 **美容美髮業**，可主動提供「設計師分潤功能」的實際案例。</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <button 
                        onClick={() => window.location.href = `/saas-partnership/dashboard/crm`}
                        className="w-full bg-white/60 backdrop-blur-xl border border-white p-6 rounded-[2rem] flex items-center justify-between hover:bg-white transition-all shadow-sm group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-black text-slate-900 group-hover:text-[#06C755] transition-colors">查看 CRM 原始資料</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">對話神經記憶連結</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#06C755] transition-all" />
                    </button>

                    <div className="bg-orange-50 border border-orange-100 p-6 rounded-[2rem] flex gap-4">
                        <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                        <div>
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">下一步行動建議</p>
                            <p className="text-xs text-orange-800 leading-relaxed font-bold">
                                根據系統追蹤，該客戶已連續 3 天點擊「報價單」，建議今日 14:00 進行跟進撥話。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
