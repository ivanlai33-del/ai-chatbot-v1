"use client";

import React, { useEffect, useState } from 'react';
import { 
    Briefcase, Search, Filter, Plus, Globe,
    TrendingUp, Target, Clock, AlertCircle,
    ChevronRight, DollarSign, BarChart3, Star
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePartner } from '@/context/PartnerContext';

export default function BDLeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [partnerPlan, setPartnerPlan] = useState<string | null>(null);
    const router = useRouter();
    const { activeOA } = usePartner();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            
            // 1. Fetch Partner Plan Info
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: partner } = await supabase
                    .from('partners')
                    .select('current_plan')
                    .eq('contact_email', user.email)
                    .single();
                setPartnerPlan(partner?.current_plan || 'Starter');
            }

            // 2. Fetch Leads (Strictly filtered by Active OA)
            if (activeOA) {
                const { data } = await supabase
                    .from('saas_leads')
                    .select('*')
                    .eq('oa_id', activeOA.id)
                    .order('created_at', { ascending: false });
                
                setLeads(data || []);
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleCheckout = async (planId: string, cycle: 'monthly' | 'yearly' = 'monthly') => {
        setLoadingPlan(planId);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = `/saas-partnership/login?redirect=/saas-partnership/dashboard/bd&plan=${planId}`;
                return;
            }

            const res = await fetch('/api/payment/checkout', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ planId, cycle, isPartner: true })
            });

            const { data, error } = await res.json();
            if (error) throw new Error(error);

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = data.TargetUrl;
            const fields = { MerchantID: data.MerchantID, TradeInfo: data.TradeInfo, TradeSha: data.TradeSha, Version: data.Version };
            for (const [key, value] of Object.entries(fields)) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value as string;
                form.appendChild(input);
            }
            document.body.appendChild(form);
            form.submit();
        } catch (err) {
            console.error('Checkout failed:', err);
            alert('支付初始化失敗');
        } finally {
            setLoadingPlan(null);
        }
    };

    // Feature Gate: Only Pro and Elite can access BD
    if (!loading && partnerPlan === 'Starter') {
        return (
            <div className="p-8 lg:p-12 min-h-[80vh] flex items-center justify-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white/40 backdrop-blur-3xl border border-white rounded-[3rem] p-12 text-center shadow-2xl"
                >
                    <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Star className="w-10 h-10 text-[#06C755] fill-[#06C755]" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4">解鎖 BD 商機模組</h2>
                    <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                        您目前的方案為 <span className="text-slate-900 font-black">Starter</span>。<br />
                        升級至 <span className="text-[#06C755] font-black">Pro</span> 即可使用「預計營收追蹤」與「成交機率分析」。
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">月費模式</p>
                            <p className="text-lg font-black text-slate-900">NT$ 9,000</p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 relative">
                            <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Save 10%</div>
                            <p className="text-[10px] font-black text-[#06C755] uppercase tracking-widest mb-1">年費模式</p>
                            <p className="text-lg font-black text-slate-900">NT$ 97,200</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => handleCheckout('pro', 'monthly')}
                        disabled={loadingPlan !== null}
                        className="block w-full bg-[#06C755] text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-[#06C755]/20 mb-4"
                    >
                        {loadingPlan === 'pro' ? '處理中...' : '立即升級解鎖'}
                    </button>
                    <button className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">
                        了解更多模組功能
                    </button>
                </motion.div>
            </div>
        );
    }

    const stats = {
        totalValue: leads.reduce((sum, l) => sum + (Number(l.estimated_revenue) || 0), 0),
        avgProbability: Math.round(leads.reduce((sum, l) => sum + (l.probability || 0), 0) / (leads.length || 1)),
        highPriority: leads.filter(l => l.priority === 'High').length
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'new': return 'bg-blue-100 text-blue-600';
            case 'qualified': return 'bg-emerald-100 text-emerald-600';
            case 'closed': return 'bg-slate-100 text-slate-600';
            default: return 'bg-orange-100 text-orange-600';
        }
    };

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                        <div className="p-3 bg-[#06C755] rounded-2xl shadow-lg shadow-[#06C755]/20">
                            <Briefcase className="w-8 h-8 text-white" />
                        </div>
                        BD 商機開發中心
                    </h1>
                    <p className="mt-3 text-slate-500 font-medium">追蹤高價值案源、管理成交機率與預估營收。</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => router.push('/saas-partnership/dashboard/bd/intelligence')}
                        className="px-8 py-4 bg-white/60 backdrop-blur-xl border border-white text-slate-900 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-white transition-all shadow-sm"
                    >
                        <Globe className="w-4 h-4 text-indigo-600" /> 市場情報
                    </button>
                    <button className="px-8 py-4 bg-gradient-to-r from-[#06C755] to-[#05A044] text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:scale-[1.02] transition-all shadow-xl shadow-[#06C755]/20">
                        <Plus className="w-4 h-4" /> 新增案源
                    </button>
                </div>
            </div>

            {/* BD Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">預計總商機價值</p>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-xl text-[#06C755]">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="text-3xl font-black text-slate-900">NT$ {stats.totalValue.toLocaleString()}</span>
                    </div>
                </div>
                <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">平均成交機率</p>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <span className="text-3xl font-black text-slate-900">{stats.avgProbability}%</span>
                    </div>
                </div>
                <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">高優先級商機</p>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 rounded-xl text-orange-500">
                            <Star className="w-6 h-6" />
                        </div>
                        <span className="text-3xl font-black text-slate-900">{stats.highPriority} 件</span>
                    </div>
                </div>
            </div>

            {/* List Control */}
            <div className="bg-white/40 backdrop-blur-3xl border border-white p-4 rounded-3xl mb-8 flex items-center gap-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="搜尋案源名稱、行業或負責人..."
                        className="w-full bg-white/50 border border-white/60 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-[#06C755]/30 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="px-6 py-3 bg-white/50 hover:bg-white border border-white rounded-2xl text-sm font-black text-slate-600 flex items-center gap-2 transition-all">
                    <Filter className="w-4 h-4" /> 篩選
                </button>
            </div>

            {/* Leads Table */}
            <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">商機名稱</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">狀態/優先級</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">預計營收</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">成交機率</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {loading ? (
                            <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold animate-pulse">正在同步商機資料...</td></tr>
                        ) : leads.length > 0 ? (
                            leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-white/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#06C755] font-black shadow-sm">
                                                {lead.name?.charAt(0) || 'L'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900">{lead.name || '新商機'}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{lead.industry || '未分類行業'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(lead.status)}`}>
                                                {lead.status || 'New'}
                                            </span>
                                            {lead.priority === 'High' && (
                                                <span className="flex items-center gap-1 text-[10px] font-black text-orange-500 uppercase">
                                                    <Star className="w-3 h-3 fill-orange-500" /> High
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-black text-slate-900">NT$ {Number(lead.estimated_revenue || 0).toLocaleString()}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="w-32">
                                            <div className="flex justify-between text-[10px] font-black text-slate-400 mb-1">
                                                <span>Probability</span>
                                                <span>{lead.probability || 0}%</span>
                                            </div>
                                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#06C755] rounded-full" style={{ width: `${lead.probability || 0}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button 
                                            onClick={() => router.push(`/saas-partnership/dashboard/bd/${lead.id}`)}
                                            className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-[#06C755]"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-300 italic">尚未有商機資料</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
