"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, Palette, History, Wand2, 
    CheckCircle2, XCircle, RotateCcw, 
    Layout, Filter, ShieldCheck, Download
} from 'lucide-react';

import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { usePartner } from '@/context/PartnerContext';

const ORG_ID = '77777777-7777-7777-7777-777777777777';

function VisualAssetFactoryContent() {
    const searchParams = useSearchParams();
    const { activeOA } = usePartner();
    const [activeTab, setActiveTab] = useState<'history' | 'profile'>('history');
    const [isLoading, setIsLoading] = useState(true);
    const [brandColors, setBrandColors] = useState(['#06C755', '#0f172a']);
    const [aiPromptPrefix, setAiPromptPrefix] = useState('使用萊特科技官方配色, 極簡現代風格, 背景乾淨且高品質, ');
    const [assets, setAssets] = useState<any[]>([]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'profile' || tab === 'history') {
            setActiveTab(tab as any);
        }
    }, [searchParams]);

    // Fetch Brand DNA and Assets
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch DNA
                const { data: dnaData } = await supabase
                    .from('brand_dna')
                    .select('*')
                    .eq('organization_id', ORG_ID)
                    .maybeSingle();
                
                if (dnaData) {
                    setBrandColors(dnaData.colors || ['#06C755', '#0f172a']);
                    setAiPromptPrefix(dnaData.ai_prompt_prefix || '');
                }

                // Fetch Assets
                const { data: assetData } = await supabase
                    .from('visual_assets')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (assetData) {
                    setAssets(assetData.map(a => ({
                        id: a.id,
                        url: a.url,
                        prompt: a.prompt_metadata?.prompt || 'AI Generated Asset',
                        status: 'approved', // Defaulting for demo
                        date: new Date(a.created_at).toLocaleString()
                    })));
                }
            } catch (err) {
                console.error('Error fetching factory data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const saveBrandDNA = async (colors: string[], prefix: string) => {
        try {
            const { error } = await supabase
                .from('brand_dna')
                .upsert({
                    organization_id: ORG_ID,
                    colors: colors,
                    ai_prompt_prefix: prefix,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'organization_id' });
            
            if (error) throw error;
        } catch (err) {
            console.error('Error saving DNA:', err);
        }
    };

    // Helper to convert hex to RGB
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    return (
        <div className="p-8 lg:p-12 max-w-[1600px] mx-auto space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">視覺素材工廠</h1>
                    <p className="text-slate-500 font-medium max-w-2xl">
                        集中管理企業品牌視覺規範，審核與優化 AI 生成的所有行銷素材。
                    </p>
                </div>
                
                <div className="flex bg-white/60 p-1.5 rounded-2xl border border-white shadow-sm">
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'history' ? 'bg-gradient-to-r from-[#06C755] to-[#05A044] text-white shadow-lg shadow-[#06C755]/20' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        生成紀錄
                    </button>
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'profile' ? 'bg-gradient-to-r from-[#06C755] to-[#05A044] text-white shadow-lg shadow-[#06C755]/20' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        品牌規範
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Content Area */}
                <div className="lg:col-span-9 space-y-8">
                    {activeTab === 'history' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {assets.length > 0 ? assets.map((asset) => (
                                <motion.div 
                                    key={asset.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all"
                                >
                                    <div className="aspect-[4/5] relative overflow-hidden">
                                        <img src={asset.url} alt="AI Generated" className="object-cover w-full h-full group-hover:scale-110 transition-duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                                            <div className="flex gap-2">
                                                <button className="flex-1 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] hover:bg-slate-50 transition-colors">下載原圖</button>
                                                <button className="flex-1 py-3 bg-[#06C755] text-white rounded-xl font-black text-[10px] hover:bg-[#05A044] transition-colors">套用至編排器</button>
                                            </div>
                                        </div>
                                        <div className="absolute top-6 left-6">
                                            <span className={`px-4 py-2 rounded-full text-[10px] font-black backdrop-blur-md border ${
                                                asset.status === 'approved' ? 'bg-emerald-500/80 text-white border-emerald-400' : 'bg-amber-500/80 text-white border-amber-400'
                                            }`}>
                                                {asset.status === 'approved' ? '已核准' : '待審核'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{asset.date}</p>
                                            <p className="text-sm font-bold text-slate-700 line-clamp-2 leading-relaxed italic">"{asset.prompt}"</p>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                            {asset.status === 'pending' && (
                                                <>
                                                    <button className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><CheckCircle2 className="w-5 h-5" /></button>
                                                    <button className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><XCircle className="w-5 h-5" /></button>
                                                    <button className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-600 hover:text-white transition-all"><RotateCcw className="w-5 h-5" /></button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="col-span-full h-96 flex flex-col items-center justify-center bg-white/20 rounded-[2.5rem] border border-dashed border-white/40">
                                    <div className="w-16 h-16 bg-white/40 rounded-full flex items-center justify-center mb-4">
                                        <History className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 font-bold">目前尚無生成紀錄</p>
                                </div>
                            )}
                            
                            <button className="aspect-[4/5] border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:bg-white/40 hover:border-[#06C755]/20 transition-all group">
                                <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <Wand2 className="w-8 h-8 text-[#06C755]" />
                                </div>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">啟動 AI 生成</span>
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[3rem] p-12 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                                            <Palette className="w-5 h-5 text-[#06C755]" /> 品牌視覺基因
                                        </h3>
                                        <button 
                                            onClick={() => saveBrandDNA(brandColors, aiPromptPrefix)}
                                            className="px-4 py-2 bg-gradient-to-r from-[#06C755] to-[#05A044] text-white text-[10px] font-black rounded-lg shadow-md hover:scale-105 transition-all"
                                        >
                                            儲存變更
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">品牌主色 (點擊色塊編輯)</label>
                                            <div className="flex flex-wrap gap-4">
                                                {brandColors.map((color, idx) => (
                                                    <div key={idx} className="space-y-3">
                                                        <div className="relative group">
                                                            <input 
                                                                type="color" 
                                                                value={color}
                                                                onChange={(e) => {
                                                                    const newColors = [...brandColors];
                                                                    newColors[idx] = e.target.value.toUpperCase();
                                                                    setBrandColors(newColors);
                                                                }}
                                                                className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                                                            />
                                                            <div 
                                                                className="w-14 h-14 rounded-2xl border-4 border-white shadow-xl transition-transform group-hover:scale-105"
                                                                style={{ backgroundColor: color }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-lg px-2 py-1 shadow-sm">
                                                                <span className="text-[9px] font-black text-slate-400">HEX</span>
                                                                <input 
                                                                    type="text" 
                                                                    value={color}
                                                                    onChange={(e) => {
                                                                        const newColors = [...brandColors];
                                                                        newColors[idx] = e.target.value;
                                                                        setBrandColors(newColors);
                                                                    }}
                                                                    className="w-14 bg-transparent text-[9px] font-black text-slate-900 outline-none"
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-1 bg-white/50 border border-slate-100 rounded-lg px-2 py-1">
                                                                <span className="text-[8px] font-black text-slate-300">RGB</span>
                                                                <span className="text-[8px] font-black text-slate-500">
                                                                    {hexToRgb(color)?.r}, {hexToRgb(color)?.g}, {hexToRgb(color)?.b}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button 
                                                    onClick={() => setBrandColors([...brandColors, '#FFFFFF'])}
                                                    className="w-14 h-14 rounded-2xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center hover:border-[#06C755] transition-colors group"
                                                >
                                                    <PlusCircle className="w-5 h-5 text-slate-300 group-hover:text-[#06C755]" />
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">AI Prompt 前綴 (強制品牌一致性)</label>
                                            <textarea 
                                                className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-[#06C755]/20 outline-none transition-all"
                                                rows={3}
                                                value={aiPromptPrefix}
                                                onChange={(e) => setAiPromptPrefix(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-8">
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5 text-blue-500" /> 審核工作流
                                    </h3>
                                    <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-[2.5rem] space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-700">自動發布核准資產</span>
                                            <div className="w-12 h-6 bg-[#06C755] rounded-full relative">
                                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                            開啟後，所有經由人工標記為「核准」的資產將自動同步至所有輸出的預覽器中。
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Sidebar Area */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 shadow-sm">
                        <h4 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
                            <Filter className="w-4 h-4" /> 資產篩選
                        </h4>
                        <div className="space-y-4">
                            {['全部素材', '待審核', '已核准', '已駁回'].map((f) => (
                                <button key={f} className="w-full flex items-center justify-between px-4 py-3 bg-white/50 hover:bg-white rounded-xl text-xs font-bold text-slate-600 transition-all">
                                    {f}
                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px]">0</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-8 bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] text-slate-900 space-y-6 shadow-sm">
                        <h4 className="text-sm font-black flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> 產線效能
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>今日生成額度</span>
                                <span className="text-slate-900">42 / 100</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#06C755] to-[#05A044] w-[42%] shadow-[0_0_8px_rgba(6,199,85,0.4)]" />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">
                            您的企業方案目前支援每日 100 張高品質 AI 素材生成，剩餘 58 張。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Custom icons to ensure no missing dependencies
function PlusCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>
        </svg>
    )
}

function Zap({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
    )
}

export default function VisualAssetFactory() {
    return (
        <Suspense fallback={<div className="p-8 lg:p-12">載入中...</div>}>
            <VisualAssetFactoryContent />
        </Suspense>
    );
}
