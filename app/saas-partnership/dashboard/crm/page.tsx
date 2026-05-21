"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
    Users, Search, Filter, ExternalLink, 
    MoreHorizontal, ArrowUpRight, UserPlus,
    UserCheck, UserMinus, Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ContactListPage() {
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ total: 0, today: 0 });

    useEffect(() => {
        async function fetchContacts() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('members')
                    .select('*')
                    .order('last_seen', { ascending: false });
                
                if (error) throw error;
                
                setContacts(data || []);
                
                // Calculate stats
                const today = new Date();
                today.setHours(0,0,0,0);
                const todayNew = data?.filter(c => new Date(c.created_at) >= today).length || 0;
                
                setStats({
                    total: data?.length || 0,
                    today: todayNew
                });
            } catch (err) {
                console.error('Error fetching members:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchContacts();
    }, []);

    const filteredContacts = contacts.filter(c => 
        (c.display_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.line_user_id?.includes(searchTerm))
    );

    const textMain = 'rgba(0, 0, 0, 0.85)';
    const textSub = 'rgba(0, 0, 0, 0.7)';

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-black flex items-center gap-4" style={{ color: textMain }}>
                            <Users className="w-10 h-10 text-[#06C755]" />
                            聯絡人中心
                        </h1>
                        <p className="mt-2 font-medium" style={{ color: textSub }}>管理您的所有客戶主檔、標籤與互動軌跡</p>
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#06C755]/20 transition-all active:scale-95">
                        <UserPlus className="w-4 h-4" /> 新增聯絡人
                    </button>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-slate-50 rounded-lg"><Users className="w-4 h-4 text-slate-400" /></div>
                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>總聯絡人數</p>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-[#06C755]/10 rounded-lg"><UserPlus className="w-4 h-4 text-[#06C755]" /></div>
                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>今日新增</p>
                        </div>
                        <p className="text-3xl font-black text-[#06C755]">{stats.today}</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-50 rounded-lg"><UserCheck className="w-4 h-4 text-emerald-500" /></div>
                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>已綁定比例</p>
                        </div>
                        <p className="text-3xl font-black text-slate-900">-- %</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-50 rounded-lg"><Clock className="w-4 h-4 text-amber-500" /></div>
                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>平均活躍度</p>
                        </div>
                        <p className="text-3xl font-black text-slate-900">High</p>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white/60 backdrop-blur-3xl border border-white/60 p-4 rounded-3xl mb-6 flex flex-col md:flex-row gap-4 items-center shadow-sm">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="搜尋姓名、Email 或 LINE ID..."
                            className="w-full bg-white/50 border border-white rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#06C755] transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="px-5 py-3 bg-white/50 hover:bg-white text-slate-600 rounded-2xl flex items-center gap-2 text-sm font-bold border border-white shadow-sm transition-all">
                        <Filter className="w-4 h-4" /> 篩選條件
                    </button>
                </div>

                {/* Contact Table */}
                <div className="bg-white/60 backdrop-blur-3xl border border-white/60 rounded-[2.5rem] overflow-hidden shadow-xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-black/5 bg-black/5">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">客戶名稱</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">聯繫方式 / UID</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">標籤</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">最後互動</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right text-slate-400">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white/40">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center animate-pulse text-slate-400 font-bold">正在從 AGI 智庫讀取資料實體...</td>
                                </tr>
                            ) : filteredContacts.length > 0 ? (
                                filteredContacts.map((c) => (
                                    <tr key={c.id} className="hover:bg-white transition-all group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {c.avatar_url ? (
                                                    <img src={c.avatar_url} className="w-10 h-10 rounded-xl object-cover shadow-sm border border-white" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#06C755] font-bold border border-slate-100 shadow-sm group-hover:border-[#06C755]/50 transition-all">
                                                        {c.display_name?.charAt(0) || 'U'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-sm text-slate-900">{c.display_name || '未命名'}</div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 uppercase tracking-tighter">LINE Friend</span>
                                                        <span className="text-[9px] font-bold text-slate-300">{c.source || 'Organic'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex flex-col gap-1 text-slate-600">
                                                <span className="font-mono text-[10px] text-slate-400">{c.line_user_id}</span>
                                                <span className="font-medium text-xs">{c.email || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {c.tags && c.tags.length > 0 ? c.tags.slice(0, 3).map((tag: string) => (
                                                    <span key={tag} className="px-2 py-0.5 bg-white border border-slate-100 rounded-md text-[10px] font-bold text-slate-500 shadow-sm group-hover:border-[#06C755]/30 transition-colors">
                                                        {tag}
                                                    </span>
                                                )) : (
                                                    <span className="text-[10px] text-slate-300 italic">無標籤</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-500">{c.last_seen ? new Date(c.last_seen).toLocaleDateString() : '尚未記錄'}</span>
                                                <span className="text-[9px] uppercase tracking-widest">{c.last_seen ? new Date(c.last_seen).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link 
                                                href={`/saas-partnership/dashboard/crm/${c.id}`}
                                                className="inline-flex items-center gap-1 px-4 py-2 bg-white hover:bg-gradient-to-br from-[#06C755] to-[#05A044] hover:text-white rounded-xl text-xs font-bold text-slate-600 transition-all shadow-sm border border-slate-100"
                                            >
                                                查看詳情 <ArrowUpRight className="w-3 h-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center flex flex-col items-center justify-center gap-4">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                            <Users className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <p className="italic text-slate-300 font-bold">目前資料庫中尚未有任何好友實體</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
