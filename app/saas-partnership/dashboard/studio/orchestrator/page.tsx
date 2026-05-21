"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Layout, Box, MousePointer2, Wand2, 
    ChevronRight, Save, Plus, ArrowRight,
    MessageSquare, Calendar, Ticket, Sparkles
} from 'lucide-react';

export default function VisualOrchestrator() {
    const [selectedTemplate, setSelectedTemplate] = useState('richmenu_6');
    const [slots, setSlots] = useState(Array(6).fill(null));

    const availableBlocks = [
        { id: 'booking', name: '預約積木', icon: Calendar, color: 'text-teal-500' },
        { id: 'coupon', name: '優惠券積木', icon: Ticket, color: 'text-orange-500' },
        { id: 'campaign', name: '活動積木', icon: Sparkles, color: 'text-pink-500' },
        { id: 'form', name: '表單積木', icon: Box, color: 'text-blue-500' },
    ];

    return (
        <div className="p-8 lg:p-12 max-w-[1600px] mx-auto space-y-12 h-[calc(100vh-100px)] overflow-hidden flex flex-col">
            <header className="flex justify-between items-end shrink-0">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">視覺編排器</h1>
                    <p className="text-slate-500 font-medium max-w-2xl">
                        將功能積木掛載至視覺槽位，由 AI 自動完成標題、Icon 與按鈕排版。
                    </p>
                </div>
                
                <div className="flex gap-4">
                    <button className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Save className="w-4 h-4" /> 儲存草稿
                    </button>
                    <button className="px-8 py-4 bg-gradient-to-r from-[#06C755] to-[#05A044] text-white rounded-2xl font-black text-sm hover:scale-[1.02] transition-all flex items-center gap-2 shadow-xl shadow-[#06C755]/20">
                        確認發布資產 <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-0">
                {/* Left: Component Library */}
                <div className="lg:col-span-3 flex flex-col gap-8 min-h-0">
                    <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 shadow-sm flex-1 flex flex-col">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">可用功能積木 (Available Blocks)</h4>
                        <div className="space-y-4 overflow-y-auto pr-2 scrollbar-hide">
                            {availableBlocks.map((block) => (
                                <div 
                                    key={block.id}
                                    draggable
                                    className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm cursor-grab active:cursor-grabbing hover:border-[#06C755] hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl bg-slate-50 ${block.color} group-hover:bg-[#06C755] group-hover:text-white transition-all`}>
                                            <block.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{block.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Modular Block</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center: The Canvas (Rich Menu Example) */}
                <div className="lg:col-span-6 flex flex-col gap-6">
                    <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[3rem] p-10 shadow-inner flex-1 flex flex-col items-center justify-center relative">
                        <div className="absolute top-8 left-10 flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">目前版型：</span>
                            <div className="px-4 py-1.5 bg-white rounded-full text-[10px] font-black text-slate-900 border border-slate-100 shadow-sm">
                                LINE 圖文選單 (六格)
                            </div>
                        </div>

                        {/* Rich Menu Grid */}
                        <div className="w-full max-w-2xl aspect-[1.5/1] bg-slate-200/50 rounded-3xl border-4 border-white shadow-2xl overflow-hidden grid grid-cols-3 grid-rows-2 gap-1 p-1">
                            {slots.map((slot, i) => (
                                <div 
                                    key={i}
                                    className={`relative group flex flex-col items-center justify-center gap-2 transition-all ${slot ? 'bg-white' : 'bg-white/40 hover:bg-white/60 border-2 border-dashed border-black/5 hover:border-[#06C755]/20'}`}
                                >
                                    {slot ? (
                                        <div className="text-center p-4">
                                            <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-2`}>
                                                <slot.icon className={`w-5 h-5 ${slot.color}`} />
                                            </div>
                                            <p className="text-[11px] font-black text-slate-900">{slot.name}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Plus className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">槽位 {i+1}</p>
                                        </div>
                                    )}
                                    
                                    {/* Slot Action: Auto Generate Button */}
                                    <button className="absolute bottom-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#06C755] text-white p-1.5 rounded-lg shadow-lg">
                                        <Wand2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <p className="mt-10 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                            提示：拖拽左側積木至槽位，AI 會自動根據品牌規範生成視覺與按鈕。
                        </p>
                    </div>
                </div>

                {/* Right: Property Inspector */}
                <div className="lg:col-span-3 space-y-8 min-h-0 overflow-y-auto scrollbar-hide">
                    <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 shadow-sm">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6">槽位細節設定 (Inspector)</h4>
                        <div className="space-y-6">
                            <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-center">
                                <p className="text-[10px] font-bold text-slate-400 italic">點擊畫面上的槽位來編輯細節</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">按鈕風格</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button className="py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black">圓角矩形</button>
                                        <button className="py-2 bg-gradient-to-r from-[#06C755] to-[#05A044] text-white rounded-xl text-[10px] font-black shadow-sm">膠囊型</button>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">背景素材</label>
                                    <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-500">使用 AI 生成背景...</span>
                                        <Wand2 className="w-3 h-3 text-[#06C755]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
