'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Phone, Building2, MessageCircle, CheckCircle2, Star, Filter, ArrowUpRight, Loader2 } from 'lucide-react';

export default function SaaSSalesLeadsView({ onDataUpdate }: { onDataUpdate?: (data: any) => void }) {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            const lineId = localStorage.getItem('line_user_id');
            if (!lineId) return;

            try {
                const res = await fetch(`/api/console/leads?userId=${lineId}`);
                const data = await res.json();
                if (data.success) {
                    setLeads(data.leads || []);
                    // 🚀 Sync with AI Strategist 🚀
                    onDataUpdate?.({
                        totalLeads: data.leads?.length || 0,
                        hotLeads: data.leads?.filter((l: any) => l.lead_category === 'Hot').length || 0,
                        recentLeads: data.leads?.slice(0, 3) || []
                    });
                }
            } catch (e) {
                console.error("Failed to fetch leads", e);
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'high intent': return 'text-amber-500';
            case 'new': return 'text-emerald-400';
            default: return 'text-indigo-400';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* SaaS Lead Conversion Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: '本月開通詢問', value: `${leads.length} 筆`, icon: Users, color: 'text-indigo-400' },
                    { label: '成功收集 Line', value: `${leads.filter(l => l.contact_info).length} 組`, icon: MessageCircle, color: 'text-emerald-400' },
                    { label: '大型合作意向', value: `${leads.filter(l => l.intent?.includes('合作')).length} 筆`, icon: Star, color: 'text-amber-400' },
                    { label: '平均回覆率', value: '100%', icon: CheckCircle2, color: 'text-blue-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700/50 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            <span className="text-[10px] text-slate-600 font-bold">LIVE</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-black text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Lead Management Table */}
            <div className="bg-slate-900/40 rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-700/50 bg-slate-900/60 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <Star className="w-6 h-6 text-indigo-400 fill-indigo-400/20" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white tracking-[0.2em] uppercase">SaaS 開通與合作名單 (主理人專屬)</h3>
                            <p className="text-[10px] text-slate-500 font-bold mt-1">針對 https://bot.ycideas.com/chat 的潛在開通者與合作商</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-[10px] font-black hover:bg-slate-700 transition-all border border-slate-700">
                           <Filter className="w-3 h-3 inline-block mr-2" /> 篩選今日留資
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[300px] flex items-center justify-center">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4 py-16">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">數據加載中...</p>
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 py-16">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-50">尚無潛在客戶留資</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-900/20 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700/50">
                                    <th className="px-6 py-5">潛在客戶 (店名)</th>
                                    <th className="px-6 py-5">行業別</th>
                                    <th className="px-6 py-5">關鍵留資 (LINE/聯絡方式)</th>
                                    <th className="px-6 py-5">需求摘要</th>
                                    <th className="px-6 py-5">來源日</th>
                                    <th className="px-6 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] divide-y divide-slate-700/20">
                                {leads.map((lead, i) => (
                                    <tr key={lead.id} className="hover:bg-indigo-500/5 transition-all group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-slate-500">
                                                    {lead.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-200">{lead.name || '未知'}</p>
                                                    <p className="text-[9px] text-slate-500">{lead.industry || '未註明'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full font-black text-[10px]">
                                                {lead.industry || '待分析'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-emerald-400 font-black">
                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                    {lead.contact_info || '尚未留資'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-slate-500 max-w-xs leading-relaxed italic truncate">「{lead.details || '尚未收集詳細需求'}」</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-slate-500 font-bold">{new Date(lead.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-xl text-[10px] font-black group-hover:bg-indigo-500 group-hover:text-white transition-all ml-auto">
                                                查看詳情 <ArrowUpRight className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
