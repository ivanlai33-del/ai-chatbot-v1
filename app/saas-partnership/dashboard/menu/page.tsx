"use client";

import React, { useState, useEffect } from 'react';
import { 
    Layout, Sparkles, MousePointer2, 
    Smartphone, Image as ImageIcon,
    ChevronDown, Save, Wand2,
    Grid3X3, Grid2X2, Maximize2,
    CheckCircle2, Box, Link2, 
    Calendar, ClipboardList, Gift, 
    MessageSquare, TrendingUp, Info,
    Type, Palette, Rocket, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { usePartner } from '@/context/PartnerContext';

export default function MenuFactoryPage() {
    const { activeOA } = usePartner();
    const [selectedLayout, setSelectedLayout] = useState('6-grid');
    const [buttonActions, setButtonActions] = useState<Record<number, string>>({});
    const [buttonTexts, setButtonTexts] = useState<Record<number, string>>({});
    const [buttonConfigs, setButtonConfigs] = useState<Record<number, any>>({});
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeStep, setActiveStep] = useState(1);

    // Fetch existing menu
    useEffect(() => {
        async function fetchMenu() {
            if (!activeOA) return;
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('rich_menus')
                    .select('*')
                    .eq('oa_id', activeOA.id)
                    .maybeSingle();
                
                if (data) {
                    setSelectedLayout(data.layout_config?.layout || '6-grid');
                    setButtonActions(data.layout_config?.actions || {});
                    setButtonTexts(data.layout_config?.texts || {});
                    setButtonConfigs(data.layout_config?.configs || {});
                }
            } catch (err) {
                console.error('Error fetching rich menu:', err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchMenu();
    }, [activeOA]);

    const handleSaveMenu = async () => {
        if (!activeOA) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('rich_menus')
                .upsert({
                    oa_id: activeOA.id,
                    layout_config: {
                        layout: selectedLayout,
                        actions: buttonActions,
                        texts: buttonTexts,
                        configs: buttonConfigs
                    },
                    updated_at: new Date().toISOString()
                }, { onConflict: 'oa_id' });
            
            if (error) throw error;
            // Success animation or toast here
        } catch (err) {
            console.error('Error saving rich menu:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const functionOptions = [
        { name: "預約服務", icon: Calendar, desc: "串接 AGI 預約模組" },
        { name: "問卷調查", icon: ClipboardList, desc: "搜集用戶回饋數據" },
        { name: "抽獎活動", icon: Gift, desc: "提高粉絲互動留存" },
        { name: "電子票券", icon: ImageIcon, desc: "發放門市折扣券" },
        { name: "AI 客服導引", icon: MessageSquare, desc: "啟動 AI 智能對話" },
        { name: "自定義連結", icon: Link2, desc: "導向官方網站或商城" },
        { name: "市場洞察", icon: TrendingUp, desc: "展示品牌成長數據" }
    ];

    const layoutConfigs: Record<string, { 
        buttons: number, 
        gridTemplate: string, 
        height: string,
    }> = {
        '6-grid': { buttons: 6, gridTemplate: 'grid-cols-3 grid-rows-2', height: 'h-[200px]' },
        '4-grid': { buttons: 4, gridTemplate: 'grid-cols-2 grid-rows-2', height: 'h-[200px]' },
        'layout-1': { buttons: 4, gridTemplate: 'grid-cols-3 grid-rows-2', height: 'h-[200px]' },
        'layout-2': { buttons: 3, gridTemplate: 'grid-cols-2 grid-rows-2', height: 'h-[200px]' },
        'layout-3': { buttons: 3, gridTemplate: 'grid-cols-3 grid-rows-1', height: 'h-[100px]' }
    };

    const currentLayout = layoutConfigs[selectedLayout] || layoutConfigs['6-grid'];

    const getGridSpan = (index: number) => {
        if (selectedLayout === 'layout-1' && index === 0) return "col-span-3";
        if (selectedLayout === 'layout-2' && index === 0) return "row-span-2 h-full";
        return "";
    };

    return (
        <div className="p-8 lg:p-12 max-w-[1600px] mx-auto min-h-screen">
            <header className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-[#06C755] to-[#05A044] rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
                        <Box className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900">選單互動工廠 (Interactive Menu Factory)</h1>
                        <p className="text-slate-500 font-medium">配置 LINE 圖文選單佈局、功能與 AI 自動化視覺設計</p>
                    </div>
                </div>

                {/* Workflow Steps */}
                <div className="flex items-center gap-2 max-w-2xl">
                    {[
                        { id: 1, label: '佈局設定', icon: Grid3X3 },
                        { id: 2, label: '視覺創意', icon: Palette },
                        { id: 3, label: '行為映射', icon: MousePointer2 },
                    ].map((step) => (
                        <React.Fragment key={step.id}>
                            <button 
                                onClick={() => setActiveStep(step.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeStep === step.id ? 'bg-[#06C755] text-white shadow-lg shadow-[#06C755]/20' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'}`}
                            >
                                <step.icon className="w-4 h-4" /> {step.label}
                            </button>
                            {step.id < 3 && <div className="w-4 h-px bg-slate-200" />}
                        </React.Fragment>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Panel: Configuration (4 cols) */}
                <div className="lg:col-span-4 space-y-8">
                    <AnimatePresence mode="wait">
                        {activeStep === 1 && (
                            <motion.section 
                                initial={{ opacity: 0, x: -20 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20"
                            >
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">1. 選擇佈局版型</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: '6-grid', label: '標準 6 格', desc: '3x2 均衡分佈', icon: Grid3X3 },
                                        { id: '4-grid', label: '經典 4 格', desc: '2x2 清晰指引', icon: Grid2X2 },
                                        { id: 'layout-1', label: '旗艦焦點', desc: '1大 + 3小', icon: Maximize2 },
                                        { id: 'layout-2', label: '側邊導引', desc: '1左 + 2右', icon: Smartphone },
                                        { id: 'layout-3', label: '精簡橫幅', desc: '3x1 低干擾', icon: Layout },
                                    ].map((l) => (
                                        <button 
                                            key={l.id}
                                            onClick={() => setSelectedLayout(l.id)}
                                            className={`p-5 rounded-3xl border-2 text-left transition-all group ${selectedLayout === l.id ? 'border-[#06C755] bg-emerald-50/30' : 'border-slate-50 hover:border-slate-100 bg-slate-50/50'}`}
                                        >
                                            <l.icon className={`w-6 h-6 mb-3 ${selectedLayout === l.id ? 'text-[#06C755]' : 'text-slate-400'}`} />
                                            <p className="text-xs font-black text-slate-900">{l.label}</p>
                                            <p className="text-[9px] text-slate-400 font-bold mt-1">{l.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {activeStep === 2 && (
                            <motion.section 
                                initial={{ opacity: 0, x: -20 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20"
                            >
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">2. 視覺創意工廠</h3>
                                <div className="space-y-6">
                                    <div className="p-6 bg-emerald-950 rounded-3xl text-white relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#06C755]/20 blur-3xl rounded-full" />
                                        <div className="relative z-10">
                                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Neural Visual Engine</p>
                                            <h4 className="text-lg font-black mb-4">AI 背景自動生成</h4>
                                            <p className="text-xs text-white/60 mb-6 leading-relaxed">AGI 將根據您的按鈕功能，自動設計一套和諧且美觀的選單背景圖。</p>
                                            <button className="w-full py-4 bg-gradient-to-br from-[#06C755] to-[#05A044] rounded-2xl flex items-center justify-center gap-2 text-xs font-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all">
                                                <Wand2 className="w-4 h-4" /> 啟動 AI 創意生成
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button className="p-6 rounded-3xl border border-slate-100 bg-slate-50 flex flex-col items-center gap-3">
                                            <ImageIcon className="w-6 h-6 text-slate-400" />
                                            <span className="text-[10px] font-black uppercase">上傳素材</span>
                                        </button>
                                        <button className="p-6 rounded-3xl border border-slate-100 bg-slate-50 flex flex-col items-center gap-3">
                                            <Palette className="w-6 h-6 text-slate-400" />
                                            <span className="text-[10px] font-black uppercase">顏色庫</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {activeStep === 3 && (
                            <motion.section 
                                initial={{ opacity: 0, x: -20 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">3. 行為映射設定</h3>
                                    <span className="px-3 py-1 bg-emerald-50 text-[#06C755] rounded-full text-[10px] font-black">正在編輯按鈕 #{selectedIndex! + 1}</span>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">按鈕顯示文字</label>
                                        <div className="relative group">
                                            <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#06C755] transition-colors" />
                                            <input 
                                                type="text" 
                                                value={buttonTexts[selectedIndex!] || ""}
                                                onChange={(e) => setButtonTexts({...buttonTexts, [selectedIndex!]: e.target.value})}
                                                placeholder="輸入顯示名稱..."
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#06C755]/10 focus:bg-white transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">分配功能 (AGI Action)</label>
                                        <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                                            {functionOptions.map((opt) => (
                                                <button 
                                                    key={opt.name}
                                                    onClick={() => setButtonActions({...buttonActions, [selectedIndex!]: opt.name})}
                                                    className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${buttonActions[selectedIndex!] === opt.name ? 'border-[#06C755] bg-emerald-50/50 shadow-sm' : 'border-slate-50 hover:bg-slate-50'}`}
                                                >
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${buttonActions[selectedIndex!] === opt.name ? 'bg-[#06C755] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                        <opt.icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900">{opt.name}</p>
                                                        <p className="text-[9px] text-slate-400 font-bold">{opt.desc}</p>
                                                    </div>
                                                    {buttonActions[selectedIndex!] === opt.name && <CheckCircle2 className="ml-auto w-4 h-4 text-[#06C755]" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>
                </div>

                {/* Middle Panel: Visual Mapper (5 cols) */}
                <div className="lg:col-span-5 flex flex-col items-center">
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl w-full relative overflow-hidden flex flex-col items-center gap-12">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#06C755]/10 to-transparent" />
                        
                        <div className="text-center">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">互動式映射畫布</h3>
                            <p className="text-xs text-slate-400 font-medium italic">點擊下方區塊，直接為您的 LINE 選單進行功能分配</p>
                        </div>

                        <div className="w-full max-w-md relative group">
                            <div className={`grid ${currentLayout.gridTemplate} ${currentLayout.height} gap-2 bg-slate-100 p-2 rounded-[2rem] shadow-inner relative z-10 transition-all duration-500`}>
                                {Array.from({ length: currentLayout.buttons }).map((_, i) => (
                                    <button 
                                        key={`canvas-btn-${i}`}
                                        onMouseEnter={() => setHoveredIndex(i)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        onClick={() => {
                                            setSelectedIndex(i);
                                            setActiveStep(3);
                                        }}
                                        className={`bg-white rounded-2xl flex items-center justify-center p-4 relative transition-all duration-300 group/btn ${getGridSpan(i)} ${selectedIndex === i ? 'ring-4 ring-[#06C755] scale-[1.02] shadow-2xl z-20' : 'hover:scale-[1.01] hover:bg-emerald-50'}`}
                                    >
                                        <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white transition-all ${selectedIndex === i ? 'bg-[#06C755] text-white scale-110' : 'bg-slate-200 text-slate-500 group-hover/btn:bg-[#06C755]/20 group-hover/btn:text-[#06C755]'}`}>
                                            {i + 1}
                                        </div>
                                        
                                        <div className="flex flex-col items-center gap-2">
                                            {buttonActions[i] ? (
                                                <>
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#06C755] flex items-center justify-center">
                                                        {functionOptions.find(o => o.name === buttonActions[i])?.icon ? 
                                                            React.createElement(functionOptions.find(o => o.name === buttonActions[i])!.icon, { className: "w-5 h-5" }) 
                                                            : <Zap className="w-5 h-5" />}
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-900 tracking-tighter">{buttonTexts[i] || buttonActions[i]}</span>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1 opacity-20">
                                                    <Plus className="w-4 h-4 text-slate-400" />
                                                    <span className="text-[8px] font-black text-slate-400 uppercase">未分配</span>
                                                </div>
                                            )}
                                        </div>

                                        {selectedIndex === i && (
                                            <motion.div layoutId="selection-glow" className="absolute inset-0 bg-[#06C755]/5 rounded-2xl pointer-events-none" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Visual Feedback Lines */}
                            <div className="absolute inset-0 -m-8 border-2 border-dashed border-emerald-100 rounded-[3rem] pointer-events-none" />
                        </div>

                        <div className="flex gap-4 w-full">
                            <button 
                                onClick={handleSaveMenu}
                                disabled={isSaving}
                                className="flex-1 py-5 bg-gradient-to-br from-emerald-950 to-emerald-900 text-white rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-950/20"
                            >
                                {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 text-emerald-400" />}
                                將配置同步至 AGI 雲端
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Smartphone Preview (3 cols) */}
                <div className="lg:col-span-3">
                    <div className="relative sticky top-8">
                        <div className="w-[300px] h-[600px] bg-slate-950 rounded-[3.5rem] border-[8px] border-slate-800 shadow-2xl relative overflow-hidden p-3 mx-auto">
                            <div className="absolute top-0 inset-x-0 h-10 bg-slate-800/80 rounded-b-3xl flex items-center justify-center z-50">
                                <div className="w-16 h-4 bg-slate-900 rounded-full"></div>
                            </div>
                            
                            <div className="bg-white w-full h-full rounded-[2.5rem] overflow-hidden flex flex-col">
                                <div className="h-14 bg-white border-b border-slate-100 flex items-center gap-3 px-4 pt-4">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06C755] to-[#05A044]" />
                                    <div className="h-2 w-24 bg-slate-100 rounded-full" />
                                </div>
                                <div className="flex-1 bg-slate-50 p-4 space-y-4">
                                    <div className="w-3/4 h-10 bg-white rounded-2xl rounded-tl-none shadow-sm" />
                                    <div className="w-1/2 h-10 bg-white rounded-2xl rounded-tl-none shadow-sm" />
                                </div>
                                
                                <div className="mt-auto">
                                    <div className="h-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
                                        <div className="w-10 h-1 bg-slate-200 rounded-full" />
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">選單切換</span>
                                    </div>
                                    <div className={`grid ${currentLayout.gridTemplate} h-[160px] gap-0.5 bg-slate-200`}>
                                        {Array.from({ length: currentLayout.buttons }).map((_, i) => (
                                            <div 
                                                key={`preview-btn-${i}`}
                                                className={`bg-white flex items-center justify-center p-2 relative transition-all duration-300 ${getGridSpan(i)} ${hoveredIndex === i || selectedIndex === i ? 'bg-emerald-50' : ''}`}
                                            >
                                                <div className={`w-full h-full rounded-lg bg-slate-50 border border-dashed flex flex-col items-center justify-center gap-1 ${hoveredIndex === i || selectedIndex === i ? 'border-[#06C755]' : 'border-slate-100'}`}>
                                                    <span className={`text-[8px] font-black text-center px-1 break-all ${buttonTexts[i] ? 'text-slate-900' : 'text-slate-300'}`}>
                                                        {buttonTexts[i] || (buttonActions[i] ? buttonActions[i] : `BTN ${i+1}`)}
                                                    </span>
                                                    {buttonActions[i] && <CheckCircle2 className="w-2 h-2 text-[#06C755]" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-8 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-full shadow-sm text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Smartphone className="w-3 h-3" /> Real-time Simulation
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Simple Icon for missing imports helper
function Plus({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
    );
}

function RefreshCw({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
    );
}
