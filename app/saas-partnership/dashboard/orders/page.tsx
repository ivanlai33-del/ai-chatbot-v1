"use client";

import React, { useState } from 'react';
import { 
    CreditCard, Search, Filter, 
    Download, CheckCircle2, Clock, 
    XCircle, ArrowRight, User, 
    ExternalLink, ShoppingBag, DollarSign
} from 'lucide-react';

export default function OrdersPage() {
    const [orders] = useState([
        { id: 'ORD20240426A1', user: '林大文', amount: 3200, status: 'Paid', method: 'NewebPay', date: '2024-04-26 14:30' },
        { id: 'ORD20240426B5', user: '陳小美', amount: 1500, status: 'Pending', method: 'NewebPay', date: '2024-04-26 15:12' },
        { id: 'ORD20240425C9', user: '張志豪', amount: 8900, status: 'Refunded', method: 'NewebPay', date: '2024-04-25 09:45' },
    ]);

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-black flex items-center gap-4 text-slate-900">
                            <ShoppingBag className="w-10 h-10 text-[#06C755]" />
                            訂單管理中心
                        </h1>
                        <p className="mt-2 font-medium text-slate-500">即時追蹤全渠道交易記錄、付款狀態與退款申請</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 py-3 bg-white/50 hover:bg-white text-slate-600 rounded-2xl font-bold flex items-center gap-2 border border-slate-100 shadow-sm transition-all">
                            <Download className="w-4 h-4" /> 匯出 CSV
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-8 bg-slate-100/50 p-1.5 rounded-2xl w-fit border border-slate-200/40">
                    {['全部訂單', '待付款', '已完成', '已退款'].map((tab) => (
                        <button 
                            key={tab} 
                            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${tab === '全部訂單' ? 'bg-white text-[#06C755] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {[
                        { label: '待處理訂單', value: '8', trend: '需注意', color: 'text-amber-500' },
                        { label: '退款率 (30天)', value: '1.2%', trend: '優於平均', color: 'text-emerald-500' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white/50 border border-slate-100 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-black/[0.01] rounded-full -mr-12 -mt-12 group-hover:bg-[#06C755]/5 transition-all"></div>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">{s.label}</p>
                            <div className="flex items-baseline gap-2 relative z-10">
                                <span className="text-2xl font-black text-slate-900">{s.value}</span>
                                <span className={`text-xs font-bold ${s.color}`}>{s.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order List Table */}
                <div className="bg-white/60 backdrop-blur-3xl border border-white/60 rounded-[3rem] overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/40">
                        <div className="relative flex-1 w-full max-w-sm">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" className="w-full bg-white/50 border border-slate-100 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#06C755] shadow-sm" placeholder="搜尋訂單號、客戶姓名..." />
                        </div>
                        <div className="flex gap-4">
                            <button className="px-4 py-3 bg-white/50 hover:bg-white rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-100 transition-all text-slate-600 shadow-sm">
                                <Filter className="w-4 h-4" /> 篩選狀態
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <tr>
                                    <th className="px-8 py-6">訂單資訊</th>
                                    <th className="px-8 py-6">客戶</th>
                                    <th className="px-8 py-6">金額</th>
                                    <th className="px-8 py-6">支付方式</th>
                                    <th className="px-8 py-6">狀態</th>
                                    <th className="px-8 py-6 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white/30">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-white transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold group-hover:text-[#06C755] transition-all text-slate-900">{order.id}</span>
                                                <span className="text-[10px] mt-1 text-slate-400">{order.date}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[10px] font-bold border border-slate-100 shadow-sm">{order.user.charAt(0)}</div>
                                                <span className="text-sm font-bold text-slate-700">{order.user}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-slate-900">${order.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-lg w-fit shadow-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#06C755]"></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{order.method}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border inline-flex items-center gap-2 ${
                                                order.status === 'Paid' ? 'bg-[#06C755]/10 text-[#06C755] border-[#06C755]/20' : 
                                                order.status === 'Refunded' ? 'bg-pink-500/10 text-pink-500 border-pink-500/20' :
                                                'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                            }`}>
                                                {order.status === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : order.status === 'Refunded' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {order.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 bg-white hover:bg-gradient-to-br from-[#06C755] to-[#05A044] hover:text-white rounded-lg text-slate-400 transition-all shadow-sm border border-slate-100">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
