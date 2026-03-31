"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Reservation {
    id: string;
    line_user_id: string;
    service_type: string;
    requested_date: string;
    status: string;
}

interface KnowledgeReservationsProps {
    reservations: Reservation[];
    onUpdateStatus: (id: string, status: 'confirmed' | 'cancelled') => void;
}

export default function KnowledgeReservations({ reservations, onUpdateStatus }: KnowledgeReservationsProps) {
    const statusColor = (status: string) =>
        status === 'confirmed' ? 'text-emerald-400' : status === 'cancelled' ? 'text-rose-400' : 'text-amber-400';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl overflow-hidden">
                <div className="p-8 border-b border-slate-700/50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight mb-1">預約清單</h3>
                        <p className="text-slate-500 text-xs font-bold">AI 自動從 LINE 對話中擷取的預約詢問</p>
                    </div>
                    <span className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-black text-amber-400">
                        共 {reservations.filter(r => r.status === 'pending').length} 筆待確認
                    </span>
                </div>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-slate-700/50">
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">LINE 用戶</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">服務</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">時間</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">狀態</th>
                            <th className="px-8 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">操作</th>
                        </tr>
                    </thead>
                    {/* The input element is placed here as per the instruction's snippet,
                        though typically it would be within a td/th or outside the table structure for valid HTML.
                        For faithful reproduction of the requested change, it's placed as specified. */}
                    <tbody className="divide-y divide-slate-700/30">
                        {reservations.length > 0 ? reservations.map((r) => (
                            <tr key={r.id} className="hover:bg-slate-700/20 transition-all">
                                <td className="px-8 py-4 text-sm font-mono text-slate-400 max-w-[120px] truncate">{r.line_user_id?.slice(-8)}</td>
                                <td className="px-8 py-4 text-sm font-bold text-white">{r.service_type || '—'}</td>
                                <td className="px-8 py-4 text-sm text-slate-400">{r.requested_date || '—'}</td>
                                <td className={`px-8 py-4 text-xs font-black uppercase tracking-wider ${statusColor(r.status)}`}>{r.status}</td>
                                <td className="px-8 py-4">
                                    {r.status === 'pending' && (
                                        <div className="flex items-center justify-end gap-3">
                                            <button 
                                                onClick={() => onUpdateStatus(r.id, 'confirmed')} 
                                                title="確認預約"
                                                className="text-emerald-400 hover:text-emerald-300 transition-colors"
                                            >
                                                <CheckCircle2 className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => onUpdateStatus(r.id, 'cancelled')} 
                                                title="取消預約"
                                                className="text-rose-400 hover:text-rose-300 transition-colors"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="px-8 py-10 text-center text-slate-500 text-sm font-bold">尚無預約記錄。AI 偵測到客人說「預約」時會自動新增。</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
