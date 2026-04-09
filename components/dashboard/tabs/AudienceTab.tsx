'use client';

import { useState, useEffect } from 'react';
import { Users, Send } from 'lucide-react';
import BroadcastModal from './BroadcastModal';

interface AudienceTabProps {
    botId: string | null;
    planLevel: number;
}

export default function AudienceTab({ botId, planLevel }: AudienceTabProps) {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Get unique available tags
    const availableTags = Array.from(new Set(customers.flatMap(c => c.tags || []))).filter(Boolean);

    useEffect(() => {
        if (!botId) return;
        fetchCustomers();
    }, [botId]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/customers/${botId}`);
            const data = await res.json();
            if (data.customers) setCustomers(data.customers);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    if (planLevel < 2) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-center px-10  rounded-[24px]  ">
                <div className="w-24 h-24 rounded-[24px] bg-white flex items-center justify-center mb-8 shadow-2xl border border-emerald-50">
                    <Users className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
                </div>
                <h3 className="text-[32px] font-black text-slate-900 mb-4">CRM 分眾行銷尚未開通</h3>
                <p className="text-[18px] text-slate-600 max-w-lg mb-10 font-bold leading-relaxed">
                    本功能包含 <span className="text-emerald-600">AI 自動貼標與分眾推播</span>，僅限單店主力方案以上使用。升級以解鎖完整的客群分析工具。
                </p>
                <button 
                    onClick={() => window.location.href = '/dashboard/upgrade'}
                    className="px-12 py-5 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-[24px] text-[17px] font-black shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all active:scale-95"
                >
                    了解及解鎖方案 →
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-10 pt-4 px-2">


                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-[24px] text-[15px] font-black shadow-xl shadow-emerald-500/20 transition-all active:scale-95 hover:from-emerald-600 hover:to-cyan-700"
                    >
                        <Send className="w-5 h-5 text-emerald-400" />
                        多重篩選推播
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="p-10 text-center text-slate-400 text-sm">載入名單中...</div>
            ) : (
                <div className=" rounded-[24px]  overflow-hidden ">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-white/60 border-b  text-slate-500">
                                <tr>
                                    <th className="px-8 py-6 text-[15px] font-black uppercase tracking-widest">顧客資訊</th>
                                    <th className="px-8 py-6 text-[15px] font-black uppercase tracking-widest">AI 標籤</th>
                                    <th className="px-8 py-6 text-[15px] font-black uppercase tracking-widest w-1/3">自動總結摘要</th>
                                    <th className="px-8 py-6 text-[15px] font-black uppercase tracking-widest text-right">上次互動</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                                            尚未有顧客資料，當客人開始傳訊後，AI 將自動為您建檔分類。
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((c) => (
                                        <tr key={c.id} className="hover:bg-slate-50/50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                                                        {c.profile_url ? (
                                                            <img src={c.profile_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Users className="w-5 h-5 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800">{c.display_name || c.line_user_id.slice(0, 8) + '...'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {c.tags?.map((t: string) => (
                                                        <span key={t} className="px-3 py-1 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-[24px] text-[12px] font-black">
                                                            #{t}
                                                        </span>
                                                    ))}
                                                    {(!c.tags || c.tags.length === 0) && <span className="text-slate-300 text-xs">-</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-slate-600 text-[13px] truncate max-w-[250px]" title={c.ai_summary}>
                                                    {c.ai_summary || <span className="text-slate-300">資料收集分析中...</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-slate-400 text-[12px]">
                                                    {new Date(c.last_interacted_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <BroadcastModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                botId={botId || ''}
                availableTags={availableTags}
                onSendSuccess={fetchCustomers}
            />
        </div>
    );
}
