'use client';

import React, { useEffect, useState } from 'react';
import { 
    Receipt, 
    User, 
    Building2, 
    Mail, 
    Search, 
    CheckCircle2, 
    Clock, 
    Filter,
    Download,
    CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function BillingInvoicesView() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalActive, setTotalActive] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 25;

    useEffect(() => {
        fetchUsers();
    }, [currentPage]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const offset = (currentPage - 1) * PAGE_SIZE;
            const res = await fetch(`/api/console/billing-users?limit=${PAGE_SIZE}&offset=${offset}`);
            const data = await res.json();
            if (data.success) {
                setUsers(data.users || []);
                setTotalActive(data.total || 0);
            }
        } catch (e) {
            console.error("Failed to fetch billing users", e);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => 
        (user.line_user_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.tax_id || '').includes(searchTerm)
    );

    const totalPages = Math.ceil(totalActive / PAGE_SIZE);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <Receipt className="w-8 h-8 text-indigo-500" />
                        財務與發票管理
                    </h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1 ml-11">
                        Scalable SaaS Subscription Engine v4.0
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="搜尋客或或統編..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-3 rounded-2xl bg-slate-900/50 border border-slate-800 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-[32px] bg-slate-900/30 border border-white/5 backdrop-blur-xl">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">付費會員總數</p>
                    <p className="text-3xl font-black text-white">{totalActive} <span className="text-sm font-bold text-slate-500 ml-1">活躍中</span></p>
                </div>
                <div className="p-6 rounded-[32px] bg-slate-900/30 border border-white/5 backdrop-blur-xl">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">本頁發票需求</p>
                    <p className="text-3xl font-black text-white">{filteredUsers.filter(u => u.invoice_type === 'company').length} <span className="text-sm font-bold text-slate-500 ml-1">筆</span></p>
                </div>
                <div className="p-6 rounded-[32px] bg-slate-900/30 border border-white/5 backdrop-blur-xl">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">正在查閱頁面</p>
                    <p className="text-3xl font-black text-white">{currentPage} <span className="text-sm font-bold text-slate-500 ml-1">/ {totalPages || 1}</span></p>
                </div>
            </div>

            <div className="bg-slate-950/50 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">客戶資訊</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">方案級別</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">發票類型</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">寄送資訊 / 地址</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-bold uppercase text-[10px] tracking-widest italic">
                                        無任何需開發票之客戶
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/10 group-hover:scale-110 transition-transform">
                                                    <img src={user.line_user_picture || '/lai_logo.svg'} className="w-full h-full object-cover" alt="User" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-black text-slate-200 truncate">{user.line_user_name}</p>
                                                    <p className="text-[10px] font-mono text-slate-500 truncate mt-1">ID: {user.line_user_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1.5">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                    user.plan_level === 2 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                )}>
                                                    {user.plan_level === 2 ? '公司強力店長版' : '個人店長版 Lite'}
                                                </span>
                                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
                                                    周期: {user.billing_cycle === 'yearly' ? '年費方案' : '月費方案'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {user.invoice_type === 'company' ? (
                                                <div className="space-y-1.5">
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest w-fit">
                                                        <Building2 className="w-3 h-3" /> 公司三聯式
                                                    </span>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[11px] font-black text-slate-300">抬頭: {user.invoice_title}</p>
                                                        <p className="text-[11px] font-black text-indigo-400">統編: {user.tax_id}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-slate-400 border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest w-fit">
                                                    <User className="w-3 h-3" /> 個人二聯式
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 max-w-xs">
                                            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-900/40 border border-white/5 group-hover:bg-slate-900 transition-colors">
                                                <Mail className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                                <div className="overflow-hidden">
                                                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase break-all">
                                                        {user.mailing_address || '(使用者尚未填寫地址)'}
                                                    </p>
                                                </div>
                                            </div>
                                            {user.cancel_at_period_end && (
                                                <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-2">❗ 已申請停止自動續約</p>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <button className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all active:scale-95 group/btn title='標記為已寄出'">
                                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={cn(
                                    "w-8 h-8 rounded-lg text-[10px] font-black transition-all",
                                    currentPage === i + 1 
                                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                                        : "bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300"
                                )}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest">
                        <Download className="w-3.5 h-3.5" /> 匯出開票清單
                    </button>
                </div>
            </div>
        </div>
    );
}
