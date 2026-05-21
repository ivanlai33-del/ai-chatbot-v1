"use client";

import React from 'react';
import { 
    Ticket, Zap, Image as ImageIcon, 
    BarChart3, Users, ExternalLink, 
    MousePointer2, Sparkles 
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * AGI 投影協議：
 * 當 AGI 說出特定的召喚關鍵字時，對話視窗會將此組件投影出來。
 */

interface ProjectionProps {
    type: 'coupon' | 'analytics' | 'crm' | 'studio';
    data?: any;
}

export const AGIProjection = ({ type, data }: ProjectionProps) => {
    switch (type) {
        case 'coupon':
            return (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="w-full max-w-sm bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full -mr-12 -mt-12" />
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                            <Ticket className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-black tracking-tight">優惠券草稿已備妥</h4>
                            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">ID: CP_PREVIEW_2024</p>
                        </div>
                    </div>
                    <div className="space-y-3 bg-black/10 rounded-2xl p-4 border border-white/10 mb-6">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="opacity-60">折扣額度</span>
                            <span className="text-amber-300">85折 (15% OFF)</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold">
                            <span className="opacity-60">適用對象</span>
                            <span className="text-emerald-300">本月新加入會員</span>
                        </div>
                    </div>
                    <button className="w-full py-3 bg-white text-rose-500 rounded-xl text-xs font-black hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                        <MousePointer2 className="w-3 h-3" /> 點擊確認並發布
                    </button>
                </motion.div>
            );

        case 'analytics':
            return (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl space-y-6"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-black text-slate-800">即時轉換洞察</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">CTR</p>
                            <p className="text-xl font-black text-slate-900">12.8%</p>
                            <div className="w-full h-1 bg-emerald-100 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[60%]" />
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">ROAS</p>
                            <p className="text-xl font-black text-slate-900">4.2x</p>
                            <div className="w-full h-1 bg-indigo-100 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[75%]" />
                            </div>
                        </div>
                    </div>
                    <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2">
                        <ExternalLink className="w-3 h-3" /> 查看完整報表
                    </button>
                </motion.div>
            );

        case 'studio':
            return (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="w-full max-w-md bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-2xl space-y-4"
                >
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-slate-50 group">
                        {data?.imageUrl ? (
                            <img src={data.imageUrl} alt="AI Generated" className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                                <Sparkles className="w-12 h-12 mb-4 animate-pulse" />
                                <p className="text-xs font-black uppercase tracking-widest">正在解析視覺神經... (DALL-E 3)</p>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                            <p className="text-white text-xs font-medium leading-relaxed italic line-clamp-2">"{data?.prompt || '正在構思高品質素材...'}"</p>
                        </div>
                    </div>
                    <div className="px-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <ImageIcon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black text-slate-700">AI 素材生成完畢</span>
                        </div>
                        <button className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black hover:bg-[#06C755] hover:text-white transition-all">
                            儲存至資產庫
                        </button>
                    </div>
                </motion.div>
            );

        default:
            return (
                <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 italic text-xs font-bold text-center">
                    [ AGI 投影失敗：模組連結尚未完全串接 ]
                </div>
            );
    }
};
