'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Phone, Building2, Briefcase, CheckCircle2, ChevronRight, MessageSquare, Target, Loader2 } from 'lucide-react';

const B2B_LEADS = [
    { id: '1', company: 'XX 數位行銷公司', contact: '王經理', role: '行銷總監', intent: '開發企業專屬聊天機器人', details: '希望能串接其自有的廣告追蹤系統，並建立品牌專屬語調。', phone: '02-2345-XXXX', status: '資料已收齊', time: '1小時前' },
    { id: '2', company: '晨曦連鎖咖啡', contact: '陳老闆', role: '主理人', intent: '多店連鎖管理方案', details: '詢問是否能一套後台管理 15 家分店，並進行跨店流量分發。', phone: '0912-888-XXX', status: '待回電', time: '3小時前' },
    { id: '3', company: '訪客 #8292', contact: '張先生', role: '個人創業者', intent: '合作方案洽談', details: '想了解如何成為平台代理商，協助其他商家開通 AI 服務。', phone: '0933-444-XXX', status: '資料已收齊', time: '昨日' },
];

export default function BusinessCollaborationView() {
    const [leads, setLeads] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchLeads = async () => {
        const lineId = localStorage.getItem('line_user_id');
        if (!lineId) return;
        try {
            const res = await fetch(`/api/console/leads?userId=${lineId}`);
            const data = await res.json();
            if (data.success) {
                setLeads(data.leads || []);
            }
        } catch (e) {
            console.error("Failed to fetch leads", e);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchLeads();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: '本月商業洽談', value: `${leads.length} 筆`, icon: Briefcase, color: 'text-indigo-400' },
                    { label: '資料完整率', value: '92%', icon: Target, color: 'text-emerald-400' },
                    { label: '潛在合作價值', value: `$${leads.length * 20}K+`, icon: Users, color: 'text-amber-400' },
                ].map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="bg-slate-900/40 p-6 rounded-3xl border border-slate-700/50 flex items-center gap-4 group hover:border-indigo-500/30 transition-all"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:scale-110 transition-transform">
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-xl font-black text-white">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Leads Table */}
            <div className="bg-slate-900/40 rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                        <div>
                            <h3 className="text-sm font-black text-white tracking-widest uppercase">合作方案與名單收集</h3>
                            <p className="text-[10px] text-slate-500 font-bold mt-1">AI 已自動為您標註具備商業合作潛力的訪客</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/20 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <th className="px-6 py-5 border-b border-slate-700/50">公司與聯絡人</th>
                                <th className="px-6 py-5 border-b border-slate-700/50">合作意圖</th>
                                <th className="px-6 py-5 border-b border-slate-700/50">洽談細節摘要</th>
                                <th className="px-6 py-5 border-b border-slate-700/50">狀態</th>
                                <th className="px-6 py-5 border-b border-slate-700/50"></th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-500 font-bold italic">
                                        目前尚無擷取到商務洽談名單
                                    </td>
                                </tr>
                            ) : leads.map((lead, i) => (
                                <tr key={lead.id} className="hover:bg-slate-800/30 transition-all group">
                                    <td className="px-6 py-5 border-b border-slate-700/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all">
                                                <Building2 className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-200">{lead.company_name || '未知企業'}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-slate-500">{lead.contact_name} · {lead.role || '決策者'}</span>
                                                    <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> {lead.contact_phone}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 border-b border-slate-700/20">
                                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full font-black text-[10px]">
                                            {lead.intent_category || '品牌代理'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 border-b border-slate-700/20">
                                        <p className="text-slate-400 max-w-xs leading-relaxed italic truncate">「{lead.summary_details}」</p>
                                    </td>
                                    <td className="px-6 py-5 border-b border-slate-700/20">
                                        <div className="flex items-center gap-1.5 text-emerald-400 font-black">
                                            <CheckCircle2 className="w-4 h-4" />
                                            資料已收齊
                                        </div>
                                        <p className="text-[9px] text-slate-600 mt-1">{new Date(lead.created_at).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-5 border-b border-slate-700/20">
                                        <button className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500 transition-all">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-700/50">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                         📌 目前擷取規則
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {['公司名稱', '開發需求', '合作專案', '代理洽談', '預約開通'].map(tag => (
                            <span key={tag} className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-[10px] font-bold border border-slate-700">
                                {tag}
                            </span>
                        ))}
                        <button className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-bold border border-indigo-500/20">
                            + 新增擷取關鍵字
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
