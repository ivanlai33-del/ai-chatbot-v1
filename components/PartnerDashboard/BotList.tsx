"use client";

import React from 'react';
import { Bot, ExternalLink, Calendar, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface BotData {
    id: string;
    name: string;
    is_active: boolean;
    industry: string;
    created_at: string;
}

interface BotListProps {
    bots: BotData[];
    loading?: boolean;
}

export default function BotList({ bots, loading }: BotListProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-slate-800/20 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (bots.length === 0) {
        return (
            <div className="p-12 bg-slate-800/20 rounded-[2rem] border border-slate-700/50 border-dashed text-center">
                <Bot className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">目前尚無已開通的 AI 店長</p>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-2">請向總部聯繫或購買更多席位</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-[2rem] border border-slate-700/50 bg-slate-800/20">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-800/40 border-b border-slate-700/50">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">店鋪名稱</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">方案狀態</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">開通日期</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">管理</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                    {bots.map((bot, idx) => (
                        <motion.tr
                            key={bot.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="hover:bg-indigo-500/5 transition-colors group"
                        >
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-700 group-hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-colors">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{bot.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${bot.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                                    <span className="text-xs font-bold text-slate-300">{bot.industry || '未指定'}</span>
                                </div>
                            </td>
                            <td className="px-6 py-5 text-xs text-slate-500 font-medium">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(bot.created_at).toLocaleDateString('zh-TW')}
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <button className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-500 hover:text-indigo-400 transition-all active:scale-90">
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
