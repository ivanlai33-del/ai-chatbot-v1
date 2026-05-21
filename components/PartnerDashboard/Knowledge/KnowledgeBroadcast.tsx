"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Send } from 'lucide-react';

interface KnowledgeBroadcastProps {
    message: string;
    onChange: (msg: string) => void;
    onSend: () => void;
    isBroadcasting: boolean;
    status: null | { sent: number; failed: number; message: string };
}

export default function KnowledgeBroadcast({
    message,
    onChange,
    onSend,
    isBroadcasting,
    status
}: KnowledgeBroadcastProps) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Radio className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">主動廣播</h3>
                        <p className="text-slate-500 text-xs font-bold">推播訊息給所有曾互動的 LINE 用戶 · 每小時最多 5 次</p>
                    </div>
                </div>
                <textarea
                    value={message}
                    onChange={e => onChange(e.target.value)}
                    placeholder={`輸入廣播內容，例如：\n\n親愛的客人您好！🎉\n本週末我們有限時優惠...\n\n歡迎預約：請直接回覆此訊息`}
                    maxLength={1000}
                    rows={8}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-3xl p-6 text-sm text-slate-300 leading-relaxed focus:outline-none focus:border-amber-500/50 transition-all resize-none mb-4"
                />
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">{message.length} / 1000 字</span>
                    <button
                        onClick={onSend}
                        disabled={isBroadcasting || !message.trim()}
                        className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-black font-black text-sm rounded-2xl transition-all shadow-lg shadow-amber-500/20"
                    >
                        <Send className="w-4 h-4" />
                        {isBroadcasting ? '發送中...' : '立即廣播'}
                    </button>
                </div>
                {status && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-2xl bg-slate-700/40 border border-slate-600/50 text-sm">
                        <span className="text-emerald-400 font-black">✓ {status.message || '廣播完成'}</span>
                        {status.sent !== undefined && (
                            <span className="ml-3 text-slate-400">成功 {status.sent} 人 · 失敗 {status.failed} 人</span>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
