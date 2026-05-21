"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Monitor, Smartphone, Layout, Box, 
    MessageSquare, Ticket, Image as ImageIcon,
    ChevronLeft, ChevronRight, Eye, Send,
    Sparkles, Palette, Wand2
} from 'lucide-react';

export default function MultiOutputPreviewer() {
    const [selectedCampaign, setSelectedCampaign] = useState('母親節感謝祭');

    const previewTargets = [
        { id: 'richmenu', name: 'Rich Menu 門戶', icon: Layout, desc: '官方帳號主選單入口' },
        { id: 'flex', name: 'Flex Message', icon: MessageSquare, desc: '推播與自動回應卡片' },
        { id: 'form', name: '表單 Header', icon: Box, desc: '資料收集頁頂部視覺' },
        { id: 'coupon', name: '優惠券卡面', icon: Ticket, desc: '數位券面與領取頁' },
    ];

    return (
        <div className="p-8 lg:p-12 max-w-[1600px] mx-auto space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">多輸出預覽器</h1>
                    <p className="text-slate-500 font-medium max-w-2xl">
                        同一份行銷積木內容，一次預覽所有輸出格式。確保跨載體的品牌一致性。
                    </p>
                </div>
                
                <div className="flex gap-4">
                    <div className="bg-white/60 p-2 rounded-2xl border border-white shadow-sm flex items-center gap-3 pr-4">
                        <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">當前行銷專案</p>
                            <p className="text-sm font-black text-slate-900">{selectedCampaign}</p>
                        </div>
                    </div>
                    <button className="px-8 py-4 bg-gradient-to-r from-[#06C755] to-[#05A044] text-white rounded-2xl font-black text-sm hover:scale-[1.02] transition-all flex items-center gap-2 shadow-xl shadow-[#06C755]/20">
                        <Send className="w-4 h-4" /> 同步發布至 LINE
                    </button>
                </div>
            </header>

            {/* Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {previewTargets.map((target) => (
                    <div key={target.id} className="flex flex-col gap-6">
                        <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-black/5 text-[#06C755]">
                                    <target.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-900">{target.name}</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">{target.id}</p>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-white rounded-lg transition-all text-slate-300 hover:text-slate-900">
                                <Eye className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Device Mockup */}
                        <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[3rem] p-6 shadow-sm min-h-[500px] flex flex-col relative overflow-hidden group">
                            {/* Mockup Top Decor */}
                            <div className="w-20 h-1 bg-black/5 rounded-full mx-auto mb-6" />
                            
                            {/* Content Preview (Simplified representation) */}
                            <div className="flex-1 rounded-[1.5rem] bg-slate-50 border border-black/5 p-4 flex flex-col gap-4 overflow-hidden">
                                {target.id === 'richmenu' && (
                                    <div className="mt-auto grid grid-cols-3 gap-1 h-1/2">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="bg-white border border-black/5 rounded-lg flex items-center justify-center">
                                                <div className="w-4 h-4 rounded bg-[#06C755]/10 animate-pulse" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {target.id === 'flex' && (
                                    <div className="mx-auto w-full max-w-[200px] mt-20 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-black/5">
                                        <div className="aspect-square bg-slate-100" />
                                        <div className="p-4 space-y-2">
                                            <div className="h-3 w-3/4 bg-slate-200 rounded-full" />
                                            <div className="h-2 w-1/2 bg-slate-100 rounded-full" />
                                            <div className="h-8 w-full bg-[#06C755] rounded-xl mt-2" />
                                        </div>
                                    </div>
                                )}

                                {target.id === 'form' && (
                                    <div className="h-full flex flex-col">
                                        <div className="h-24 bg-slate-200 rounded-xl mb-6 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-emerald-100 opacity-50" />
                                        </div>
                                        <div className="space-y-4">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="h-10 bg-white rounded-xl border border-black/5" />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {target.id === 'coupon' && (
                                    <div className="flex-1 flex flex-col items-center justify-center">
                                        <div className="w-full aspect-[2/1] bg-white border-2 border-dashed border-pink-200 rounded-2xl p-6 relative">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 absolute -left-4 top-1/2 -translate-y-1/2 border border-slate-100" />
                                            <div className="w-8 h-8 rounded-full bg-slate-50 absolute -right-4 top-1/2 -translate-y-1/2 border border-slate-100" />
                                            <div className="h-full flex flex-col justify-between">
                                                <div className="h-3 w-1/3 bg-pink-100 rounded-full" />
                                                <div className="h-8 w-full bg-gradient-to-r from-[#06C755] to-[#05A044] rounded-xl shadow-sm" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand DNA Sync</span>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 rounded-full bg-[#06C755]" />
                                    <div className="w-3 h-3 rounded-full bg-slate-900" />
                                </div>
                            </div>
                            
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button className="p-3 bg-white rounded-2xl shadow-xl text-slate-900 hover:scale-110 transition-transform">
                                    <Palette className="w-5 h-5" />
                                </button>
                                <button className="p-3 bg-white rounded-2xl shadow-xl text-[#06C755] hover:scale-110 transition-transform">
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* AI Consistency Report */}
            <div className="bg-[#06C755] text-white rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between shadow-xl shadow-[#06C755]/20 gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center">
                        <Wand2 className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black mb-1">AI 視覺一致性報告：OPTIMAL</h3>
                        <p className="text-[#EFFFF5] text-sm font-medium leading-relaxed max-w-xl">
                            當前專案的所有輸出格式均已通過品牌基因校驗。顏色偏差值低於 2%，排版風格符合「極簡現代」規範。
                        </p>
                    </div>
                </div>
                <button className="whitespace-nowrap bg-white text-[#06C755] px-10 py-5 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-xl">
                    查看完整分析報告
                </button>
            </div>
        </div>
    );
}
