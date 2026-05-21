'use client';

import React, { useEffect, useState } from 'react';
import { Clock, User, Loader2, MessageSquare } from 'lucide-react';

export default function ConsoleLiveFeed() {
    const [feed, setFeed] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLiveFeed = async () => {
        const lineId = localStorage.getItem('line_user_id');
        if (!lineId) return;

        try {
            const res = await fetch(`/api/console/live-feed?userId=${lineId}`);
            const data = await res.json();
            if (data.success) {
                setFeed(data.feed);
            }
        } catch (e) {
            console.error("Failed to fetch live feed", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLiveFeed();
        const interval = setInterval(fetchLiveFeed, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const getTimeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    即時動態流 (Live Feed)
                </h3>
                <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300">查看所有紀錄</button>
            </div>

            <div className="space-y-4">
                {loading && feed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-slate-800/10 rounded-3xl border border-dashed border-slate-700/50">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">同步實時對話中...</p>
                    </div>
                ) : feed.length === 0 ? (
                    <div className="text-center py-20 text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-50 bg-slate-800/10 rounded-3xl">
                        目前尚無對話記錄
                    </div>
                ) : (
                    feed.map((item) => (
                        <div key={item.id} className="p-4 rounded-xl border border-slate-700/30 bg-slate-800/20 hover:bg-slate-800/40 transition-all flex items-start gap-4 group">
                            <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center shrink-0 border border-slate-600 group-hover:border-indigo-500/50 transition-colors">
                                <User className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-black text-slate-200 truncate pr-4">{item.user_name || `訪客 #${item.user_id.slice(-4)}`}</span>
                                    <span className="text-[9px] text-slate-500 font-bold whitespace-nowrap">{getTimeAgo(item.created_at)}</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <MessageSquare className="w-3 h-3 text-slate-600 mt-1 shrink-0" />
                                        <p className="text-[12px] text-slate-400 leading-relaxed italic line-clamp-2">「{item.user_content}」</p>
                                    </div>
                                    <div className="py-2 px-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20 group-hover:bg-indigo-500/10 transition-colors">
                                        <p className="text-[12px] text-indigo-300">
                                            <span className="font-black mr-2 uppercase tracking-tighter text-[10px] text-indigo-400/70">AI:</span>
                                            {item.ai_content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
