"use client";

import React, { useState } from 'react';
import { 
    BrainCircuit, Plus, Search, 
    FileText, Image as ImageIcon, 
    MessageSquare, ExternalLink, 
    MoreHorizontal, ArrowRight,
    Sparkles, Palette, Languages
} from 'lucide-react';
import Link from 'next/link';

export default function AssetsPage() {
    const textMain = 'rgba(0, 0, 0, 0.85)';
    const textSub = 'rgba(0, 0, 0, 0.7)';

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-black flex items-center gap-4" style={{ color: textMain }}>
                            <BrainCircuit className="w-10 h-10 text-[#06C755]" />
                            店長智庫中心
                        </h1>
                        <p className="mt-2 font-medium" style={{ color: textSub }}>管理官方品牌資產、AI 知識庫與視覺產線規範</p>
                    </div>
                    <div className="flex gap-4">
                        <Link 
                            href="/saas-partnership/dashboard/assets/brand"
                            className="px-6 py-3 bg-white/60 hover:bg-white text-[#06C755] rounded-2xl font-bold flex items-center gap-2 border border-white shadow-sm transition-all"
                        >
                            <Palette className="w-4 h-4" /> 品牌 DNA 設定
                        </Link>
                        <button className="px-6 py-3 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#06C755]/20 transition-all active:scale-95">
                            <Plus className="w-4 h-4" /> 新增智庫素材
                        </button>
                    </div>
                </div>

                {/* Quick Access Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {[
                        { title: '品牌 DNA 規範', desc: '設定語氣、色調與視覺風格', icon: Sparkles, href: '/saas-partnership/dashboard/assets/brand', color: 'text-amber-500' },
                        { title: 'AI 知識文庫', desc: '上傳 PDF 或網頁供 AI 學習', icon: FileText, href: '#', color: 'text-indigo-500' },
                        { title: '多國語系設定', desc: '管理自動翻譯與回覆語言', icon: Languages, href: '#', color: 'text-[#06C755]' },
                    ].map((item, i) => (
                        <Link key={i} href={item.href} className="group bg-white/60 backdrop-blur-3xl border border-white/60 p-8 rounded-[2.5rem] hover:border-[#06C755]/30 transition-all shadow-sm">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white border border-black/5 shadow-sm mb-6 group-hover:scale-110 transition-all ${item.color}`}>
                                <item.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-black mb-2" style={{ color: textMain }}>{item.title}</h3>
                            <p className="text-xs font-medium" style={{ color: textSub }}>{item.desc}</p>
                            <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-[#06C755] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                                立即進入 <ArrowRight className="w-3 h-3" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Assets Table */}
                <div className="bg-white/60 backdrop-blur-3xl border border-white/60 rounded-[3rem] overflow-hidden shadow-xl">
                    <div className="p-8 border-b border-black/5 flex justify-between items-center bg-white/20">
                        <h3 className="text-lg font-black" style={{ color: textMain }}>最近上傳素材</h3>
                        <div className="relative w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="搜尋素材名稱..." className="w-full bg-white/60 border border-white rounded-xl py-2 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#06C755]" />
                        </div>
                    </div>
                    <div className="p-4 space-y-2">
                        {[
                            { name: '2024 夏季新品清單.pdf', type: 'PDF Document', size: '2.4 MB', date: '2 小時前' },
                            { name: '品牌官方 LOGO 規範.png', type: 'Image Asset', size: '1.1 MB', date: '昨天' },
                            { name: '常見問題 FAQ 庫', type: 'Knowledge Base', size: '42 組', date: '3 天前' },
                        ].map((asset, i) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-white/60 rounded-2xl transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center text-[#06C755] shadow-sm">
                                        {asset.type.includes('PDF') ? <FileText className="w-5 h-5" /> : asset.type.includes('Image') ? <ImageIcon className="w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold" style={{ color: textMain }}>{asset.name}</h4>
                                        <p className="text-[10px] font-bold" style={{ color: 'rgba(0,0,0,0.3)' }}>{asset.type} • {asset.size}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-bold" style={{ color: 'rgba(0,0,0,0.4)' }}>{asset.date}</span>
                                    <button className="p-2 bg-white hover:bg-[#06C755] hover:text-white rounded-lg transition-all shadow-sm border border-black/5 opacity-0 group-hover:opacity-100">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
