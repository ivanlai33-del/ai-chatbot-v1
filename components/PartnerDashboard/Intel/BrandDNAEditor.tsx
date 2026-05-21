"use client";

import React, { useState } from 'react';
import { Sparkles, Palette, MessageCircle, Shield, Info, Save, RotateCcw, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BrandDNAEditor({ botId }: { botId?: string }) {
    const [dna, setDna] = useState({
        tone: '專業且具親和力',
        colors: ['#06C755', '#FFFFFF'],
        negativeKeywords: '過於口語、不專業、冷漠',
        personality: '一位精明幹練但富有溫度的官方智庫店長助理',
    });

    const textMain = 'rgba(0, 0, 0, 0.85)';
    const textSub = 'rgba(0, 0, 0, 0.7)';

    return (
        <section className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[3rem] p-12 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#06C755]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
                <div>
                    <h2 className="text-3xl font-black flex items-center gap-4" style={{ color: textMain }}>
                        <Sparkles className="w-8 h-8 text-[#06C755]" />
                        品牌 DNA 規範設定
                    </h2>
                    <p className="mt-2 font-medium" style={{ color: textSub }}>定義您的 AI 店長靈魂，確保全渠道回覆與視覺的一致性</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white/60 hover:bg-white text-slate-500 rounded-2xl font-bold flex items-center gap-2 border border-white shadow-sm transition-all">
                        <RotateCcw className="w-4 h-4" /> 重設
                    </button>
                    <button className="px-8 py-3 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-[#06C755]/20 transition-all hover:scale-[1.02]">
                        <Save className="w-4 h-4" /> 儲存規範
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                {/* Left: Personality & Tone */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: 'rgba(0,0,0,0.4)' }}>
                            <MessageCircle className="w-3 h-3 text-[#06C755]" /> AI 溝通語氣 (Tone of Voice)
                        </label>
                        <textarea 
                            value={dna.personality}
                            onChange={(e) => setDna({...dna, personality: e.target.value})}
                            className="w-full h-32 bg-white/60 border border-white rounded-[2rem] p-6 text-sm focus:outline-none focus:ring-1 focus:ring-[#06C755] shadow-sm transition-all"
                            placeholder="描述您的 AI 店長應該如何說話..."
                            style={{ color: textMain }}
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: 'rgba(0,0,0,0.4)' }}>
                            <Shield className="w-3 h-3 text-[#06C755]" /> 負面關鍵字 (Negative Constraints)
                        </label>
                        <input 
                            type="text"
                            value={dna.negativeKeywords}
                            className="w-full bg-white/60 border border-white rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#06C755] shadow-sm transition-all"
                            style={{ color: textMain }}
                        />
                    </div>
                </div>

                {/* Right: Visual DNA */}
                <div className="space-y-8">
                    <div className="bg-white/50 border border-white rounded-[2.5rem] p-8 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2" style={{ color: textMain }}>
                            <Palette className="w-4 h-4 text-[#06C755]" /> 視覺 DNA 設定 (Visual Identity)
                        </h3>
                        
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold" style={{ color: textSub }}>品牌色權重</span>
                                    <span className="text-[10px] font-black" style={{ color: '#06C755' }}>75%</span>
                                </div>
                                <div className="h-2 bg-black/5 rounded-full overflow-hidden border border-white">
                                    <div className="h-full bg-gradient-to-r from-[#06C755] to-[#05A044] opacity-50" style={{ width: '75%' }}></div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold" style={{ color: textSub }}>玻璃擬態質感 (Glassmorphism)</span>
                                    <span className="text-[10px] font-black" style={{ color: '#06C755' }}>50%</span>
                                </div>
                                <div className="h-2 bg-black/5 rounded-full overflow-hidden border border-white">
                                    <div className="h-full bg-gradient-to-r from-[#06C755] to-[#05A044] opacity-50" style={{ width: '50%' }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex gap-4">
                            {dna.colors.map((c, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-2xl border-2 border-white shadow-md" style={{ background: c }}></div>
                                    <span className="text-[9px] font-bold text-slate-400">{c}</span>
                                </div>
                            ))}
                            <button className="w-12 h-12 rounded-2xl border-2 border-dashed border-black/10 flex items-center justify-center text-slate-300 hover:text-[#06C755] transition-all">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-[#06C755]/5 border border-[#06C755]/10 rounded-2xl flex items-start gap-4">
                        <Info className="w-5 h-5 text-[#06C755] shrink-0 mt-0.5" />
                        <p className="text-[10px] font-medium leading-relaxed" style={{ color: textSub }}>
                            提示：品牌 DNA 會直接影響 **選單中心**、**表單中心** 與 **預約中心** 的視覺生成邏輯。修改後將會即時同步至 AI 產線。
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
