'use client';

import React from 'react';
import { Clock, User } from 'lucide-react';
import { LIVE_FEED_MOCK } from '@/config/console_config';

export default function ConsoleLiveFeed() {
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
                {LIVE_FEED_MOCK.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl border border-slate-700/30 bg-slate-800/20 hover:bg-slate-800/40 transition-all flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-slate-300">{item.visitor}</span>
                                <span className="text-[10px] text-slate-500 font-medium">{item.time}</span>
                            </div>
                            <p className="text-sm text-slate-400 italic">{item.content}</p>
                            <div className="mt-3 py-2 px-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                <p className="text-sm text-indigo-300">
                                    <span className="font-bold mr-2">AI 回覆:</span>
                                    {item.aiResponse}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
