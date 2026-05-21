"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, ShieldCheck, Lock, MoreHorizontal, Key, CheckCircle2, XCircle } from 'lucide-react';

const ROLES = [
    { id: 'admin', name: '超級管理者', desc: '擁有全系統最高權限，可管理財務與 API', color: 'text-rose-500', bg: 'bg-rose-50' },
    { id: 'manager', name: '營運經理', desc: '可操作所有業務積木，無法修改系統設定', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'staff', name: '第一線專員', desc: '僅限內容產出與查詢，無調動權限', color: 'text-[#06C755]', bg: 'bg-emerald-50' },
    { id: 'dev', name: '外部開發者', desc: '僅限 API 存取特定積木數據', color: 'text-amber-500', bg: 'bg-amber-50' },
];

const TEAM_MEMBERS = [
    { id: 1, name: 'Ivan Lai', email: 'ivan@ycideas.com', role: 'admin', status: 'Active', avatar: 'IL' },
    { id: 2, name: 'Marketing Sarah', email: 'sarah@ycideas.com', role: 'manager', status: 'Active', avatar: 'MS' },
    { id: 3, name: 'Support Mike', email: 'mike@ycideas.com', role: 'staff', status: 'Active', avatar: 'SM' },
];

export default function TeamManagementPage() {
    return (
        <div className="p-8 lg:p-12 max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">團隊與權限管理</h1>
                    <p className="text-slate-500 font-medium">定義團隊成員角色，並為不同任務核發限定權限的 API 金鑰。</p>
                </div>
                <button className="flex items-center gap-2 bg-[#06C755] text-white px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-[#06C755]/20">
                    <UserPlus className="w-4 h-4" />
                    邀請新成員
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Role Definitions */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="w-5 h-5 text-slate-900" />
                        <h2 className="text-lg font-black text-slate-900">角色權限定義</h2>
                    </div>
                    {ROLES.map((role) => (
                        <div key={role.id} className="bg-white/40 border border-white rounded-3xl p-6 shadow-sm group hover:border-[#06C755]/30 transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`px-3 py-1 rounded-full ${role.bg} ${role.color} text-[10px] font-black uppercase tracking-widest`}>
                                    {role.name}
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 font-bold leading-relaxed">{role.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Right Column: Member List & Scoped Keys */}
                <div className="lg:col-span-2 space-y-10">
                    
                    {/* Member List Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="w-5 h-5 text-slate-900" />
                            <h2 className="text-lg font-black text-slate-900">現有成員</h2>
                        </div>
                        <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 border-b border-white">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">成員</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">角色</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">狀態</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">管理</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/40">
                                    {TEAM_MEMBERS.map((member) => (
                                        <tr key={member.id} className="hover:bg-white/20 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-slate-400 shadow-sm text-xs">
                                                        {member.avatar}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-900">{member.name}</div>
                                                        <div className="text-xs text-slate-400 font-bold">{member.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-xs font-black text-slate-700">
                                                {ROLES.find(r => r.id === member.role)?.name}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-[#06C755] uppercase tracking-widest">
                                                    <CheckCircle2 className="w-3 h-3" /> {member.status}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Scoped Keys Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Key className="w-5 h-5 text-slate-900" />
                                <h2 className="text-lg font-black text-slate-900">成員專屬金鑰 (Individual Keys)</h2>
                            </div>
                            <button className="text-xs font-black text-[#06C755] hover:underline">+ 核發新金鑰</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-white/40 border border-white rounded-[2rem] shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2">
                                    <div className="px-2 py-1 bg-emerald-50 text-[#06C755] text-[7px] font-black rounded-lg">LIVE / TRACKING</div>
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">MS</div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900">Sarah 專屬 - 視覺產線</h4>
                                        <p className="text-[10px] font-bold text-slate-400">核發於 2026-04-25</p>
                                    </div>
                                </div>
                                <code className="block w-full bg-slate-50/80 p-3 rounded-xl text-[10px] font-mono text-slate-900 truncate border border-slate-100 mb-3">
                                    sk_user_sarah_v_9a12b...
                                </code>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">最後使用：10 分鐘前</span>
                                    <button className="text-[9px] font-black text-rose-500 uppercase hover:underline">停用</button>
                                </div>
                            </div>
                            <div className="p-6 bg-white/40 border border-white rounded-[2rem] shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2">
                                    <div className="px-2 py-1 bg-emerald-50 text-[#06C755] text-[7px] font-black rounded-lg">LIVE / TRACKING</div>
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">SM</div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900">Mike 專屬 - CRM 調動</h4>
                                        <p className="text-[10px] font-bold text-slate-400">核發於 2026-04-26</p>
                                    </div>
                                </div>
                                <code className="block w-full bg-slate-50/80 p-3 rounded-xl text-[10px] font-mono text-slate-900 truncate border border-slate-100 mb-3">
                                    sk_user_mike_c_88c02b...
                                </code>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">最後使用：2 小時前</span>
                                    <button className="text-[9px] font-black text-rose-500 uppercase hover:underline">停用</button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Audit Logs Section - Removed Black Color Block */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck className="w-5 h-5 text-slate-900" />
                            <h2 className="text-lg font-black text-slate-900">AI 協作審計日誌 (Orchestration Logs)</h2>
                        </div>
                        <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-4">
                            {[
                                { user: 'Sarah', action: '調動視覺產線', target: '生成母親節活動 Banner', time: '10:24 AM', key: 'sk_user_sarah_v...' },
                                { user: 'Ivan Lai', action: '修改 API 權限', target: '核發分權碼給 Mike', time: '09:15 AM', key: 'Master Key' },
                                { user: 'Mike', action: '查詢 CRM 資料', target: '讀取 VIP 客戶清單', time: 'Yesterday', key: 'sk_user_mike_c...' },
                            ].map((log, idx) => (
                                <div key={idx} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 group">
                                    <div className="flex items-center gap-4">
                                        <div className="text-[10px] font-mono text-slate-400 w-16">{log.time}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-[#06C755]">{log.user}</span>
                                            <span className="text-xs font-bold text-slate-500">{log.action}</span>
                                            <span className="text-xs font-black text-slate-900 group-hover:text-[#06C755] transition-colors">{log.target}</span>
                                        </div>
                                    </div>
                                    <div className="text-[9px] font-mono text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                        {log.key}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
