'use client';

import React, { useState } from 'react';
import { Tag, Users, MessageSquare, Hand, BrainCircuit, Layers, Wand2, Lock, Unlock, Loader2, Sparkles } from 'lucide-react';
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
            <div className="flex items-center justify-between mb-2 px-1">
                <label className="block text-[12px] font-black text-slate-800 tracking-wider uppercase">{label}</label>
                <div className="flex items-center gap-2 opacity-0 group-hover/field:opacity-100 transition-opacity">
                    {onGenerate && (
                        <button 
                            onClick={onGenerate}
                            disabled={isGenerating || isLocked}
                            className="p-1 text-slate-500 hover:text-emerald-500 disabled:opacity-30 transition-colors"
                            title="AI 重新生成此項"
                        >
                            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                        </button>
                    )}
                    {onToggleLock && (
                        <button 
                            onClick={onToggleLock}
                            className={`p-1 transition-colors ${isLocked ? 'text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            title={isLocked ? '已鎖定，不參與一鍵生成' : '點擊鎖定此項內容'}
                        >
                            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                    )}
                </div>
            </div>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full p-[35px] rounded-xl border-2 bg-white text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all hover:border-slate-400 ${
                    isLocked 
                        ? 'border-amber-400 bg-amber-50/40 focus:border-amber-500 focus:ring-amber-50' 
                        : 'border-slate-200 focus:border-slate-900 focus:ring-slate-100'
                }`}
            />
            {hint && <p className="text-[11px] text-slate-600 mt-1.5 pl-1 font-extrabold italic">{hint}</p>}
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
            <div className="flex items-center justify-between mb-2 px-1">
                <label className="block text-[12px] font-black text-slate-800 tracking-wider uppercase">{label}</label>
                <div className="flex items-center gap-2 opacity-0 group-hover/field:opacity-100 transition-opacity">
                    {onGenerate && (
                        <button 
                            onClick={onGenerate}
                            disabled={isGenerating || isLocked}
                            className="p-1 text-slate-500 hover:text-emerald-500 disabled:opacity-30 transition-colors"
                            title="AI 重新生成此項"
                        >
                            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                        </button>
                    )}
                    {onToggleLock && (
                        <button 
                            onClick={onToggleLock}
                            className={`p-1 transition-colors ${isLocked ? 'text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            title={isLocked ? '已鎖定，不參與一鍵生成' : '點擊鎖定此項內容'}
                        >
                            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                    )}
                </div>
            </div>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className={`w-full p-[35px] rounded-xl border-2 bg-white text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all resize-none hover:border-slate-400 ${
                    isLocked 
                        ? 'border-amber-400 bg-amber-50/40 focus:border-amber-500 focus:ring-amber-50' 
                        : 'border-slate-200 focus:border-slate-900 focus:ring-slate-100'
                }`}
            />
            {hint && <p className="text-[11px] text-slate-600 mt-1.5 pl-1 font-extrabold italic">{hint}</p>}
        </div>
    );
}

/* ── Section divider with icon + title ── */
function Section({ Icon, title, subtitle }: { Icon: React.ElementType; title: string; subtitle?: string }) {
    return (
        <div className="flex items-center gap-3 pt-6 pb-2">
            <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                <Icon className="w-5 h-5 text-slate-800 shrink-0" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
                <p className="text-[17px] font-black text-slate-900 leading-none tracking-tight">{title}</p>
                {subtitle && <p className="text-[11px] text-slate-700 mt-1.5 font-black uppercase tracking-widest">{subtitle}</p>}
            </div>
            <div className="w-full max-w-[300px] h-[2px] bg-slate-300" />
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
    '不動產': '您是一位沉穩專業的房仲接待，熟悉物件資訊與交易流程，回話有條理且具說服力。',
    '金融保險': '您是一位謹慎專業的金融服務接待，回話準確且附有免責提示，善於引導進一步諮詢。',
    '寵物服務': '您是一位溫暖有愛的寵物服務接待，熟悉寵物照護知識，回話親切充滿關懷。',
    '專業顧問': '您是一位知性專業的服務接待，熟悉業務範疇與諮詢流程，回話清晰有條理。',
    '健身運動': '您是一位充滿活力且專業的健身顧問，熟悉會籍與課程，用語積極正向，鼓勵客人行動。',
    '居家服務': '您是一位值得信賴的居家服務管家，回話令人安心，善於引導客人提供報價所需資訊。',
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
    const [locks, setLocks] = useState<Record<string, boolean>>(config?.brand_dna?.locks || {});

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
        <div className="space-y-5">
            
            {/* ── 即時動態記憶 (Moved to top with light green dynamic style) ── */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-[28px] bg-emerald-50/60 border border-emerald-100 relative overflow-hidden group/dojo shadow-sm shadow-emerald-100/50"
            >
                {/* Feature Gating Overlay — 練功房解鎖門檻：Tier 2 ($499) 以上 */}
                {planLevel < 2 && (
                    <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[3px] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                        <div className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center mb-3 border border-amber-100">
                            <Lock className="w-5 h-5 text-amber-500" />
                        </div>
                        <h5 className="text-[14px] font-black text-slate-800 mb-1">🔒 專屬功能：即時動態記憶</h5>
                        <p className="text-[11px] text-slate-600 mb-4 font-medium leading-relaxed">
                            想讓店長聽令於您的語音或即時指令嗎？<br/>
                            升級至 **個人店長版** 以上即可解鎖解鎖「即時動態記憶」。
                        </p>
                        <button 
                            onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'billing' }))}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-[13px] font-black shadow-lg shadow-emerald-500/20 active:scale-95 hover:brightness-110 transition-all border border-slate-100/15"
                        >
                            立即升級解鎖
                        </button>
                    </div>
                )}

                <div className="absolute top-0 right-0 p-3">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${planLevel >= 2 ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${planLevel >= 2 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        Dynamic Live
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <div className="p-2.5 rounded-2xl bg-white shadow-sm border border-emerald-50">
                        <MessageSquare className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h4 className="text-[15px] font-black text-emerald-900 leading-tight">即時動態記憶</h4>
                        <p className="text-[10px] text-emerald-600/70 font-bold tracking-tight">AI 的短期記憶區，會優先於所有設定生效。</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <Textarea 
                        label="" 
                        placeholder="例：今日 A 套餐已售罄、目前店內繁忙需等候 20 分鐘..." 
                        value={config.dynamic_context || ''} 
                        onChange={v => setConfig((c: any) => ({ ...c, dynamic_context: v }))} 
                        rows={2} 
                    />
                    
                    <div className="text-[10px] text-emerald-600/50 font-bold flex items-center justify-between px-1">
                        <span className="flex items-center gap-1.5"><BrainCircuit className="w-3.5 h-3.5" /> 最後更新：{config.last_dojo_update ? new Date(config.last_dojo_update).toLocaleString() : '尚無更新紀錄'}</span>
                        <span className="bg-emerald-100/50 px-2 py-0.5 rounded-md">指令：@店長聽令</span>
                    </div>
                </div>
            </motion.div>

            {/* ── AI Auto-Generation Action Bar (Moved below Dojo) ── */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                        <Sparkles className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                        <p className="text-[14px] font-black text-slate-800 leading-none">AI 智庫自動生成 (僅本頁欄位)</p>
                        <p className="text-[10px] text-slate-500 mt-1">根據品牌名稱與行業，自動填寫所有空缺內容</p>
                    </div>
                </div>

                <button
                    onClick={() => handleAIGenerate()}
                    disabled={!!isGenerating}
                    className="w-full md:w-auto py-4 px-10 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-black text-[15px] shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50 hover:brightness-110 active:scale-95 border border-white/20"
                >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    {isGenerating ? 'AI 正在構思中...' : '🪄 一鍵生成完整設定'}
                </button>
            </motion.div>

            {/* ── 行業 ── */}
            <Section Icon={Layers} title="行業類別" subtitle="選擇後 AI 語調自動對應" />
            <div className="grid grid-cols-4 gap-3">
                {INDUSTRIES.map(ind => (
                    <motion.button key={ind} whileTap={{ scale: 0.98 }}
                        onClick={() => handleIndustrySelect(ind)}
                        className={`p-[35px] rounded-2xl font-black border-2 transition-all duration-300 text-center flex items-center justify-center ${
                            config.brand_dna.industry === ind
                                ? 'bg-gradient-to-br from-emerald-500 to-cyan-600 border-transparent text-white shadow-xl text-[17px]'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50 text-[14px] shadow-sm'
                        }`}
                    >
                        {ind}
                    </motion.button>
                ))}
            </div>

            {/* ── 品牌基本資料 ── */}
            <Section Icon={Tag} title="品牌基本資料" subtitle="定義品牌身份" />

            <div className="grid grid-cols-2 gap-3">
                <Field label="品牌名稱 *" placeholder="商店或品牌名稱" value={config.brand_dna.name} onChange={v => update('name', v)} hint="顯示在 AI 回話中" />
                <Field 
                    label="品牌標語" placeholder="一句話描述品牌特色" value={config.brand_dna.tagline} onChange={v => update('tagline', v)} 
                    isLocked={locks.tagline} onToggleLock={() => handleToggleLock('tagline')}
                    onGenerate={() => handleAIGenerate('tagline')} isGenerating={isGenerating === 'tagline'}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Field 
                    label="目標客群" placeholder="例：25–40 歲家庭主婦" value={config.brand_dna.target_audience} onChange={v => update('target_audience', v)} hint="幫助 AI 調整溝通方式" 
                    isLocked={locks.target_audience} onToggleLock={() => handleToggleLock('target_audience')}
                    onGenerate={() => handleAIGenerate('target_audience')} isGenerating={isGenerating === 'target_audience'}
                />
                <Field 
                    label="禁止話題" placeholder="例：競品、政治（逗號分隔）" value={config.brand_dna.forbidden_topics} onChange={v => update('forbidden_topics', v)} 
                    isLocked={locks.forbidden_topics} onToggleLock={() => handleToggleLock('forbidden_topics')}
                    onGenerate={() => handleAIGenerate('forbidden_topics')} isGenerating={isGenerating === 'forbidden_topics'}
                />
            </div>

            <Textarea 
                label="品牌介紹" placeholder="品牌的故事、理念與背景..." value={config.brand_dna.introduction} onChange={v => update('introduction', v)} rows={3} 
                isLocked={locks.introduction} onToggleLock={() => handleToggleLock('introduction')}
                onGenerate={() => handleAIGenerate('introduction')} isGenerating={isGenerating === 'introduction'}
            />
            <Textarea 
                label="主要服務內容" placeholder="核心產品或服務，每行一項..." value={config.brand_dna.services} onChange={v => update('services', v)} rows={3} 
                isLocked={locks.services} onToggleLock={() => handleToggleLock('services')}
                onGenerate={() => handleAIGenerate('services')} isGenerating={isGenerating === 'services'}
            />

            {/* ── AI 語調 ── */}
            <Section Icon={BrainCircuit} title="AI 語調個性" subtitle="選擇語調，可自由微調提示詞" />

            <div className="flex flex-wrap gap-2">
                {Object.keys(TONE_PROMPTS).map(tone => (
                    <motion.button key={tone} whileTap={{ scale: 0.98 }}
                        onClick={() => setConfig((c: any) => ({ ...c, brand_dna: { ...c.brand_dna, tone, tone_prompt: TONE_PROMPTS[tone] } }))}
                        className={`px-6 py-[35px] rounded-xl font-black border transition-all duration-300 ${
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

            <div className="grid grid-cols-2 gap-3">
                <Field 
                    label="結尾慣用語" placeholder="例：歡迎再來" value={config.brand_dna.closing_phrase} onChange={v => update('closing_phrase', v)} hint="AI 回話的固定結語" 
                    isLocked={locks.closing_phrase} onToggleLock={() => handleToggleLock('closing_phrase')}
                    onGenerate={() => handleAIGenerate('closing_phrase')} isGenerating={isGenerating === 'closing_phrase'}
                />
                <Field label="轉真人客服關鍵字" placeholder="例：投訴、真人、轉接" value={config.brand_dna.human_trigger_keywords} onChange={v => update('human_trigger_keywords', v)} hint="偵測到後轉交人工" />
            </div>

        </div>
    );
}
