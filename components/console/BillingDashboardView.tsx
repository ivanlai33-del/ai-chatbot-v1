'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Users, TrendingUp, Calendar, ArrowUpRight, Loader2, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';

export default function BillingDashboardView() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBilling = async () => {
            const lineId = localStorage.getItem('line_user_id');
            if (!lineId) return;

            try {
                const res = await fetch(`/api/console/billing?userId=${lineId}`);
                const data = await res.json();
                if (data.success) {
                    setSubscribers(data.subscribers || []);
                }
            } catch (e) {
                console.error("Failed to fetch billing data", e);
            } finally {
                setLoading(false);
            }
        };

        fetchBilling();
    }, []);

    const totalRevenue = subscribers.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Billing Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: '累積總營收', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400' },
                    { label: '付費會員數', value: `${subscribers.length} 位`, icon: Users, color: 'text-indigo-400' },
                    { label: '本月續約率', value: '94.2%', icon: TrendingUp, color: 'text-amber-400' },
                    { label: '平均客單價', value: `$${subscribers.length ? Math.round(totalRevenue / subscribers.length) : 0}`, icon: CheckCircle2, color: 'text-blue-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700/50 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-black text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Subscriber List Table */}
            <div className="bg-slate-900/40 rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-700/50 bg-slate-900/60 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white tracking-[0.2em] uppercase">已訂閱客戶與收費動態</h3>
                            <p className="text-[10px] text-slate-500 font-bold mt-1">管理所有正式付費版本的老闆名單與金流紀錄</p>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-[10px] font-black hover:bg-slate-700 transition-all border border-slate-700">
                        匯出金流報表
                    </button>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">載入帳務清單中...</p>
                        </div>
                    ) : subscribers.length === 0 ? (
                        <div className="text-center py-20 text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-50">
                            目前尚無付費會員資料
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-900/20 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700/50">
                                    <th className="px-6 py-5">付費老闆 (名稱)</th>
                                    <th className="px-6 py-5">訂閱方案</th>
                                    <th className="px-6 py-5">支付金額</th>
                                    <th className="px-6 py-5">到期日</th>
                                    <th className="px-6 py-5">狀態</th>
                                    <th className="px-6 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] divide-y divide-slate-700/20">
                                {subscribers.map((sub, i) => (
                                    <tr key={sub.id} className="hover:bg-emerald-500/5 transition-all group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-slate-500">
                                                    {sub.display_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-200">{sub.display_name || '未知用戶'}</p>
                                                    <p className="text-[9px] text-slate-500 uppercase">ID: {sub.line_user_id?.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full font-black text-[10px]">
                                                {sub.plan_type} ({sub.billing_cycle})
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-emerald-400 font-black text-sm">${Number(sub.amount).toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-slate-600" />
                                                <span className="text-slate-400 font-bold">{new Date(sub.end_date).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                                                sub.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                            }`}>
                                                {sub.status === 'active' ? '執行中' : '已過期'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500 transition-all">
                                                <ArrowUpRight className="w-4 h-4" />
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
