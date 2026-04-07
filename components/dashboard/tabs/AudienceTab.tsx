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
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">CRM 分眾行銷功能</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    本功能包含 AI 自動貼標與分眾推播，僅限單店主力 (含) 以上方案使用。升級方案以解鎖完整的客群分析工具。
                </p>
                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transition">
                    了解升級方案
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">AI 顧客名單與分眾標籤</h3>
                    <p className="text-xs text-slate-400 mt-1">系統自動分析對話意圖並分配標籤，讓推播更精準。</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold shadow hover:bg-teal-700 transition"
                >
                    <Send className="w-4 h-4" />
                    多重篩選推播
                </button>
            </div>

            {loading ? (
                <div className="p-10 text-center text-slate-400 text-sm">載入名單中...</div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                                <tr>
                                    <th className="px-6 py-4 font-bold">顧客資訊</th>
                                    <th className="px-6 py-4 font-bold">AI 標籤</th>
                                    <th className="px-6 py-4 font-bold w-1/3">自動總結摘要</th>
                                    <th className="px-6 py-4 font-bold text-right">上次互動</th>
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
                                                        <span key={t} className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-[11px] font-bold">
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
