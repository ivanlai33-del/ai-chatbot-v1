'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, Search, ArrowUpRight, TrendingUp, Info } from 'lucide-react';

export default function ConsoleStrategicAdvisor() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    AI 營運策略分析室 (Beta)
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 🎯 SEO & Ads Planning */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className="p-6 rounded-[32px] bg-indigo-500/5 border border-indigo-500/20 shadow-xl"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                            <Target className="w-5 h-5 text-indigo-400" />
                        </div>
                        <p className="font-black text-slate-100 tracking-wider">SEO & 廣告投放指南</p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-700/50">
                            <p className="text-[10px] uppercase font-black text-indigo-400 mb-1 tracking-widest">推薦受眾層級 (Top Audience)</p>
                            <p className="text-sm font-bold text-slate-100 italic">「台北市美容工作室 & 個人瑜伽老師」</p>
                            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">分析：這週該區塊轉化率最高（12%），且詢問回覆量最大，建議增加投放預算。</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-700/50">
                            <p className="text-[10px] uppercase font-black text-amber-400 mb-1 tracking-widest">高價值關鍵字 (Golden Keywords)</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {['預約機器人', '24小時客服', 'LINE 自動導購'].map(kw => (
                                    <span key={kw} className="px-2 py-1 rounded-md bg-slate-800 text-[11px] font-bold text-slate-300 border border-slate-700 flex items-center gap-1">
                                        <Search className="w-3 h-3" /> {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 💡 Feature Needs & Roadmap */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="p-6 rounded-[32px] bg-emerald-500/5 border border-emerald-500/20 shadow-xl"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                        <p className="font-black text-slate-100 tracking-wider">產品開發藍圖洞察</p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-700/50">
                            <p className="text-[10px] uppercase font-black text-emerald-400 mb-1 tracking-widest">用戶急需功能 (Missing Features)</p>
                            <p className="text-sm font-bold text-slate-100 flex items-center justify-between">
                                金流分帳系統
                                <span className="text-[10px] px-2 py-0.5 rounded bg-red-400/20 text-red-400 font-black animate-pulse uppercase">HIGH PRIO</span>
                            </p>
                            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">共計 15 位潛在客戶問到該功能。若開發此模組，預計可提升旗艦版成交率約 18%。</p>
                        </div>

                        <button className="w-full py-3 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2">
                            查看更多 AI 分析數據 <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* 📢 AI Daily Morning Brief */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-gradient-to-r from-indigo-500/10 to-transparent border-l-4 border-indigo-400 bg-slate-800/20 rounded-r-2xl"
            >
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm mb-1">
                    <Info className="w-4 h-4" /> 今日營運建議摘要
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                    iVan 老闆，昨天全站整體回覆滿意度高達 98%。<span className="text-emerald-400 font-bold ml-1">建議動作：</span> 趁流量高峰期剛過，優化【愛管家】這類服務導向的 AI 模型，並考慮新增「預約排程」介面，目前該需求正在迅速竄升。
                </p>
            </motion.div>
        </div>
    );
}
