'use client';

import React, { useState } from 'react';
import { Tag, MessageSquare, BrainCircuit, Layers, Wand2, Lock, Unlock, Loader2, Sparkles, ChevronDown, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Shared: compact input field ── */
function Field({ label, placeholder, value, onChange, hint, isLocked, onToggleLock, onGenerate, isGenerating }: {
    label: string; placeholder?: string; value: string;
    onChange: (v: string) => void; hint?: string;
    isLocked?: boolean; onToggleLock?: () => void;
    onGenerate?: () => void; isGenerating?: boolean;
}) {
    return (
        <div className="relative group/field">
            <div className="flex items-center justify-between mb-3 px-2">
                <label className="block text-[14px] font-black text-slate-800 tracking-[0.15em] uppercase opacity-80">{label}</label>
                <div className="flex items-center gap-2 opacity-0 group-hover/field:opacity-100 transition-all duration-300 translate-x-1 group-hover/field:translate-x-0">
                    {onGenerate && (
                        <button 
                            onClick={onGenerate}
                            disabled={isGenerating || isLocked}
                            className="p-1.5 rounded-[24px] text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 disabled:opacity-30 transition-all"
                            title="AI 重新生成此項"
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        </button>
                    )}
                    {onToggleLock && (
                        <button 
                            onClick={onToggleLock}
                            className={`p-1.5 rounded-[24px] transition-all ${isLocked ? 'text-amber-500 bg-amber-50 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                            title={isLocked ? '已鎖定，不參與一鍵生成' : '點擊鎖定此項內容'}
                        >
                            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </div>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full p-5 rounded-[24px] border-0 bg-white/70 backdrop-blur-md text-[16px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-[6px] transition-all shadow-sm ring-1 ring-black/[0.04] ${
                        isLocked 
                            ? 'bg-amber-50/50 focus:ring-amber-100/50' 
                            : 'focus:bg-white focus:ring-emerald-100/30'
                    }`}
                />
            </div>
            {hint && <p className="text-[11px] text-slate-500 mt-2 pl-2 font-bold italic opacity-70 tracking-tight">{hint}</p>}
        </div>
    );
}

function Textarea({ label, placeholder, value, onChange, rows = 3, hint, isLocked, onToggleLock, onGenerate, isGenerating }: {
    label: string; placeholder?: string; value: string;
    onChange: (v: string) => void; rows?: number; hint?: string;
    isLocked?: boolean; onToggleLock?: () => void;
    onGenerate?: () => void; isGenerating?: boolean;
}) {
    return (
        <div className="relative group/field">
            {label && (
                <div className="flex items-center justify-between mb-3 px-2">
                    <label className="block text-[14px] font-black text-slate-800 tracking-[0.15em] uppercase opacity-80">{label}</label>
                    <div className="flex items-center gap-2 opacity-0 group-hover/field:opacity-100 transition-all duration-300">
                        {onGenerate && (
                            <button 
                                onClick={onGenerate}
                                disabled={isGenerating || isLocked}
                                className="p-1.5 rounded-[24px] text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 disabled:opacity-30 transition-all"
                            >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                            </button>
                        )}
                        {onToggleLock && (
                            <button 
                                onClick={onToggleLock}
                                className={`p-1.5 rounded-[24px] transition-all ${isLocked ? 'text-amber-500 bg-amber-50 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                            >
                                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                </div>
            )}
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className={`w-full p-5 rounded-[24px] border-0 bg-white/70 backdrop-blur-md text-[16px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-[6px] transition-all resize-none shadow-sm ring-1 ring-black/[0.04] ${
                    isLocked 
                        ? 'bg-amber-50/50 focus:ring-amber-100/50' 
                        : 'focus:bg-white focus:ring-emerald-100/30'
                }`}
            />
            {hint && <p className="text-[11px] text-slate-500 mt-2 pl-2 font-bold italic opacity-70 tracking-tight">{hint}</p>}
        </div>
    );
}

/* ── Section divider with icon + title ── */
function Section({ Icon, title, subtitle, action }: { Icon: React.ElementType; title: string; subtitle?: string; action?: React.ReactNode }) {
    return (
        <div className="flex items-center gap-5 pt-8 pb-4">
            <div className="flex-1">
                {title && <p className="text-[24px] font-black text-slate-900 leading-none tracking-tight mb-2">{title}</p>}
                {subtitle && <p className="text-[14px] text-slate-500 font-black uppercase tracking-[0.2em]">{subtitle}</p>}
            </div>
            {action && (
                <div className="shrink-0 flex items-center gap-4">
                    {action}
                </div>
            )}
        </div>
    );
}

const TONE_PROMPTS: Record<string, string> = {
    '親切專業': '您是一位親切且專業的店長，請用溫暖且有耐心的語氣回答客人的問題，並在適當的時候提供專業建議。',
    '熱情活潑': '您是一位充滿活力的店長，語氣非常熱情，多用感嘆號和表情符號，讓客人感受到歡迎！',
    '沉穩知性': '您是一位睿智且冷靜的店長，語音沉穩有條理，傾向提供深入見解和精確資訊。',
    '幽默有趣': '您是一位幽默風趣的店長，回話要有梗、有創意，讓客人感到放鬆且愉快。',
    '簡潔俐落': '您是一位效率至上的店長，回話直接切入重點，不拖泥帶水，提供最精確的答案。',
};

const INDUSTRY_TONES: Record<string, string> = {
    '餐飲業': '您是一位熱情好客的餐飲店長，熟悉菜單、口味與用餐體驗，回話溫暖親切。',
    '零售通路': '您是一位專業的零售業店長，熟悉商品規格、庫存與優惠，引導客人找到最合適的商品。',
    '電商網購': '您是一位效率高且親切的電商客服，熟悉退換貨與配送流程，善於協助排解訂單問題。',
    '醫療美容': '您是一位親切專業的醫美接待，熟悉療程與注意事項，善於解答疑慮並引導諮詢預約。',
    '教育補習': '您是一位熱忱的教育機構接待，熟悉課程與招生流程，善於為不同年齡層學員推薦合適課程。',
    '旅遊住宿': '您是一位充滿熱情的旅遊顧問與旅宿管家，熟悉行程與設施，善於激發客人的旅遊興趣。',
    '不動產': '您是一位房仲接待，熟悉物件資訊與交易流程，回話有條理且具說服力。',
    '金融保險': '您是一位專業的金融服務接待，回話準確且附有免責提示，善於引導進一步諮詢。',
    '寵物服務': '您是一位溫暖有愛的寵物服務接待，熟悉寵物照護知識，回話親切充滿關懷。',
    '專業顧問': '您是一位知性專業的服務接待，熟悉業務範疇與諮詢流程，回話清晰有條理。',
    '健身運動': '您是一位活力且專業的健身顧問，熟悉會籍與課程，用語積極正向，鼓勵客人行動。',
    '居家服務': '您是一位值的信賴的居家服務管家，回話令人安心，善於引導客人提供報價所需資訊。',
    '汽車服務': '您是一位專業有效率的汽車保修廠長/顧問，熟悉車輛狀況，回話具備專業感且令人安心。',
    '婚慶攝影': '您是一位極具美感與耐心的婚慶攝影顧問，善於傾聽新人需求並提供客製化建議。',
    '3C維修': '您是一位邏輯清晰的 3C 專業維修技師，善於引導客人描述故障狀況並提供初步排除建議。',
    '其他': '您是一位親切且專業的店長，請用溫暖且有耐心的語氣回答客人的問題，並在適當的時候提供專業建議。',
};

const INDUSTRIES = [
    '餐飲業', '零售通路', '電商網購', '醫療美容', '教育補習', 
    '旅遊住宿', '不動產', '金融保險', '寵物服務', '專業顧問', 
    '健身運動', '居家服務', '汽車服務', '婚慶攝影', '3C維修', '其他'
];

interface BrandDNATabProps {
    config: any;
    setConfig: (fn: (c: any) => any) => void;
    planLevel: number;
}

export default function BrandDNATab({ config, setConfig, planLevel }: BrandDNATabProps) {
    const [isGenerating, setIsGenerating] = useState<string | boolean>(false);
    const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const [locks, setLocks] = useState<Record<string, boolean>>(config?.brand_dna?.locks || {});

    // Close dropdown on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsIndustryDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const update = (field: string, value: string) => {
        setConfig((c: any) => ({ ...c, brand_dna: { ...c.brand_dna, [field]: value } }));
        // Auto-lock when user manually edits
        if (!locks[field]) {
            handleToggleLock(field);
        }
    };

    const handleToggleLock = (field: string) => {
        const newLocks = { ...locks, [field]: !locks[field] };
        setLocks(newLocks);
        setConfig((c: any) => ({ ...c, brand_dna: { ...c.brand_dna, locks: newLocks } }));
    };

    const handleIndustrySelect = (industry: string) => {
        setConfig((c: any) => ({
            ...c,
            brand_dna: {
                ...c.brand_dna,
                industry,
                tone_prompt: locks.tone_prompt ? c.brand_dna.tone_prompt : (INDUSTRY_TONES[industry] || INDUSTRY_TONES['其他']),
            },
        }));
    };

    const handleAIGenerate = async (targetField?: string) => {
        const brandName = config.brand_dna.name;
        const industry = config.brand_dna.industry;

        if (!brandName || !industry) {
            alert('請先輸入品牌名稱並選擇行業類別');
            return;
        }

        setIsGenerating(targetField || true);
        
        try {
            const response = await fetch('/api/generate-branding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brandName,
                    industry,
                    targetField,
                    currentData: config.brand_dna,
                    locks
                })
            });

            if (!response.ok) throw new Error('Generation failed');
            
            const data = await response.json();
            
            if (targetField) {
                update(targetField, data[targetField]);
            } else {
                // Update all fields that aren't locked
                setConfig((c: any) => {
                    const newDna = { ...c.brand_dna };
                    Object.keys(data).forEach(key => {
                        if (!locks[key]) {
                            newDna[key] = data[key];
                        }
                    });
                    return { ...c, brand_dna: newDna };
                });
            }
        } catch (err) {
            console.error('AI Generation Error:', err);
            alert('AI 生成失敗，請稍後再試');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            


            {/* ── 行業類別 (僅顯示控制項) ── */}
            {/* ── 行業類別 (左對齊且放大 20%) ── */}
            <div className="flex items-center justify-start gap-4 pt-8 pb-10">
                {/* Industry Dropdown Selection */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsIndustryDropdownOpen(!isIndustryDropdownOpen)}
                        className={`h-[90px] px-10 rounded-[24px] bg-white/60 backdrop-blur-md  ring-1 ring-black/[0.03] shadow-md flex items-center gap-8 transition-all hover:bg-white/80 ${isIndustryDropdownOpen ? 'ring-emerald-500/20 shadow-emerald-500/10' : ''}`}
                    >
                        <div className="text-left">
                            <p className="text-[14px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">目前選擇行業</p>
                            <p className="text-[22px] font-black text-slate-900 leading-none">
                                {config.brand_dna.industry || '請選擇您的行業'}
                            </p>
                        </div>
                        <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${isIndustryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isIndustryDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full mt-3 left-0 w-[350px] bg-white/90 backdrop-blur-2xl rounded-[24px]  shadow-2xl z-[100] py-4 overflow-hidden ring-1 ring-black/[0.05]"
                            >
                                <div className="px-6 mb-3 flex items-center justify-between">
                                    <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">行業類別清單</span>
                                    <span className="text-[12px] font-bold text-emerald-500 py-0.5 px-3 bg-emerald-50 rounded-full">{INDUSTRIES.length} 組預設</span>
                                </div>
                                <div className="max-h-[350px] overflow-y-auto custom-scrollbar px-3 space-y-1">
                                    {INDUSTRIES.map((ind) => {
                                        const isSelected = config.brand_dna.industry === ind;
                                        return (
                                            <button
                                                key={ind}
                                                onClick={() => {
                                                    handleIndustrySelect(ind);
                                                    setIsIndustryDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between p-4 rounded-[24px] transition-all ${
                                                    isSelected 
                                                        ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20' 
                                                        : 'hover:bg-black/[0.03] border border-transparent'
                                                }`}
                                            >
                                                <span className={`text-[17px] font-black ${isSelected ? 'text-emerald-700' : 'text-slate-800'}`}>
                                                    {ind}
                                                </span>
                                                {isSelected && <Check className="w-5 h-5 text-emerald-500 shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* AI Assistant Button */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/60 backdrop-blur-md rounded-[24px] pl-10 pr-4 py-3  flex items-center gap-10 ring-1 ring-black/[0.03] shadow-md h-[90px]"
                >
                    <div className="hidden lg:block text-right">
                        <p className="text-[20px] font-black text-slate-800 leading-tight">AI 智庫助手</p>
                        <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-1">Auto-Magic</p>
                    </div>
                    <button
                        onClick={() => handleAIGenerate()}
                        disabled={!!isGenerating}
                        className="h-[62px] px-10 rounded-[24px] bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-black text-[18px] transition-all flex items-center justify-center gap-3 disabled:opacity-50 hover:from-emerald-600 hover:to-cyan-700 active:scale-95 group shadow-lg shadow-emerald-500/20"
                    >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-6 h-6 text-emerald-400 group-hover:rotate-12 transition-transform" />}
                        {isGenerating ? 'AI 繪製中...' : '一鍵注入 DNA'}
                    </button>
                </motion.div>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="品牌正式名稱 *" placeholder="您的品牌或店家名稱" value={config.brand_dna.name} onChange={v => update('name', v)} hint="這會成為 AI 介紹自己的名稱" />
                <Field 
                    label="品牌精神 SLOGAN" placeholder="例：連結靈魂的每一杯咖啡" value={config.brand_dna.tagline} onChange={v => update('tagline', v)} 
                    isLocked={locks.tagline} onToggleLock={() => handleToggleLock('tagline')}
                    onGenerate={() => handleAIGenerate('tagline')} isGenerating={isGenerating === 'tagline'}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field 
                    label="主要的目標客群" placeholder="例：對生活品質有要求的粉領族" value={config.brand_dna.target_audience} onChange={v => update('target_audience', v)} hint="AI 將以此調整說話的成熟度" 
                    isLocked={locks.target_audience} onToggleLock={() => handleToggleLock('target_audience')}
                    onGenerate={() => handleAIGenerate('target_audience')} isGenerating={isGenerating === 'target_audience'}
                />
                <Field 
                    label="對話中絕對禁止的話題" placeholder="例：競品比較、政治敏感內容" value={config.brand_dna.forbidden_topics} onChange={v => update('forbidden_topics', v)} 
                    isLocked={locks.forbidden_topics} onToggleLock={() => handleToggleLock('forbidden_topics')}
                    onGenerate={() => handleAIGenerate('forbidden_topics')} isGenerating={isGenerating === 'forbidden_topics'}
                />
            </div>

            <Textarea 
                label="品牌完整故事與背景理念" placeholder="描述品牌的初衷、堅持與背後的故事..." value={config.brand_dna.introduction} onChange={v => update('introduction', v)} rows={4} 
                isLocked={locks.introduction} onToggleLock={() => handleToggleLock('introduction')}
                onGenerate={() => handleAIGenerate('introduction')} isGenerating={isGenerating === 'introduction'}
            />
            <Textarea 
                label="核心服務與產品內容清單" placeholder="描述您提供的具體服務，每行一項優點..." value={config.brand_dna.services} onChange={v => update('services', v)} rows={4} 
                isLocked={locks.services} onToggleLock={() => handleToggleLock('services')}
                onGenerate={() => handleAIGenerate('services')} isGenerating={isGenerating === 'services'}
            />

            {/* ── AI 語調 ── */}
            <Section Icon={BrainCircuit} title="擬人化語調參數" subtitle="Tone & Persona" />

            <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.keys(TONE_PROMPTS).map(tone => (
                    <motion.button key={tone} whileTap={{ scale: 0.98 }}
                        onClick={() => setConfig((c: any) => ({ ...c, brand_dna: { ...c.brand_dna, tone, tone_prompt: TONE_PROMPTS[tone] } }))}
                        className={`px-6 py-[35px] rounded-[24px] font-black border transition-all duration-300 ${
                            config.brand_dna.tone === tone
                                ? 'bg-gradient-to-br from-emerald-500 to-cyan-600 border-transparent text-white shadow-lg text-[16.5px]'
                                : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300 text-[13px]'
                        }`}
                    >
                        {tone}
                    </motion.button>
                ))}
            </div>

            <Textarea 
                label="語調提示詞（可自訂）" placeholder="描述 AI 的回話風格..." value={config.brand_dna.tone_prompt} onChange={v => update('tone_prompt', v)} rows={3} 
                isLocked={locks.tone_prompt} onToggleLock={() => handleToggleLock('tone_prompt')}
                onGenerate={() => handleAIGenerate('tone_prompt')} isGenerating={isGenerating === 'tone_prompt'}
            />

            {/* ── 接待設定 ── */}
            <Section Icon={MessageSquare} title="接待行為設定" subtitle="AI 對話的開場與收尾" />

            <Textarea 
                label="歡迎語" placeholder="例：您好！歡迎來到 [品牌名]，我是您的 AI 助理..." value={config.brand_dna.welcome_message} onChange={v => update('welcome_message', v)} rows={2} 
                isLocked={locks.welcome_message} onToggleLock={() => handleToggleLock('welcome_message')}
                onGenerate={() => handleAIGenerate('welcome_message')} isGenerating={isGenerating === 'welcome_message'}
            />

            <div className="grid grid-cols-1 gap-3">
                <Field label="結尾慣用語" placeholder="例：歡迎再來" value={config.brand_dna.closing_phrase} onChange={v => update('closing_phrase', v)} hint="AI 回話的固定結語" 
                    isLocked={locks.closing_phrase} onToggleLock={() => handleToggleLock('closing_phrase')}
                    onGenerate={() => handleAIGenerate('closing_phrase')} isGenerating={isGenerating === 'closing_phrase'}
                />
            </div>

        </div>
    );
}
