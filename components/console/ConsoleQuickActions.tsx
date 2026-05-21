'use client';

import React from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { POPULAR_FAQS } from '@/config/console_config';

export default function ConsoleQuickActions() {
    return (
        <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600/80 to-purple-700/80 border border-white/10 shadow-xl overflow-hidden relative group">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                <h3 className="text-lg font-black text-white relative z-10 mb-2">AI 戰略洞察</h3>
                <p className="text-sm text-indigo-100/80 relative z-10 leading-relaxed mb-6">
                    這週「美甲款式」的詢問度上升了 40%，建議可以針對新款式發送專屬優惠活動。
                </p>
                <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-lg hover:shadow-white/20 transition-all relative z-10">
                    一鍵發送活動廣播
                </button>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest pl-2">智庫熱門 FAQ</h3>
                <div className="space-y-2">
                    {POPULAR_FAQS.map((faq) => (
                        <div key={faq} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-all cursor-pointer">
                            <span className="text-xs font-bold text-slate-300">{faq}</span>
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                        </div>
                    ))}
                    <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-600 text-slate-400 hover:border-indigo-400 hover:text-indigo-400 transition-all mt-4">
                        <Plus className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">新增知識庫</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
