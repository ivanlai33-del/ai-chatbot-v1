'use client';

import { ChevronDown, ChevronRight, Plus, Trash2, Copy, Lock, ShoppingBag, Globe, RefreshCcw, Wand2 } from 'lucide-react';
import InputField from '@/components/ui/InputField';
import TextareaField from '@/components/ui/TextareaField';
import { getFeatureAccess, getPlanName, getRequiredPlanName, isAtLimit, formatLimit } from '@/lib/feature-access';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OfferingsTabProps {
    config: any;
    setConfig: (fn: (c: any) => any) => void;
    planLevel?: number;
    botId: string;
}

const EMPTY_OFFERING = {
    name: '', price: '', description: '', size: '', url: '', ai_context: '',
    category: '', duration: '', target_audience_item: '', customization_note: '',
    caution_note: '', booking_url: '',
};

/* Fields grouped into logical sections for clarity */
const BASIC_FIELDS = [
    { key: 'name',      label: '名稱 *',         placeholder: '商品或服務名稱',       cols: 1 },
    { key: 'category',  label: '分類標籤',        placeholder: '例：主食、甜點',       cols: 1 },
    { key: 'price',     label: '售價 (NT$)',      placeholder: '0',                   cols: 1 },
    { key: 'duration',  label: '服務時長',        placeholder: '例：60 分鐘、半天',    cols: 1 },
];
const DETAIL_FIELDS = [
    { key: 'size',                 label: '規格 / 尺寸',  placeholder: '款式、大小、顏色' },
    { key: 'target_audience_item', label: '適合對象',    placeholder: '例：7-12 歲、女性' },
    { key: 'customization_note',   label: '客製化選項',  placeholder: '例：辣度：微/中/大辣' },
    { key: 'caution_note',         label: '注意事項',    placeholder: '例：含堅果、術後休息' },
    { key: 'url',                  label: '商品網址',    placeholder: 'https://...' },
    { key: 'booking_url',          label: '預約連結',    placeholder: 'https://forms.google.com/...' },
];

export default function OfferingsTab({ config, setConfig, planLevel = 0, botId }: OfferingsTabProps) {
    const fa = getFeatureAccess(planLevel);
    const productLimit = fa.products; // 0 = 關閉, -1 = 無限
    const currentCount = config.offerings?.length ?? 0;
    const atLimit = isAtLimit(currentCount, productLimit);
    const isLocked = productLimit === 0;
    
    const [syncUrl, setSyncUrl] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    // Track which cards are expanded
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const toggle = (i: number) => setExpanded(p => ({ ...p, [i]: !p[i] }));

    const handleSync = async () => {
        if (!syncUrl) return;
        setIsSyncing(true);
        try {
            const res = await fetch('/api/console/intelligence/sync-offerings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: syncUrl, botId })
            });
            const json = await res.json();
            if (json.success && json.data) {
                const newOfferings = json.data.map((item: any) => ({
                    ...EMPTY_OFFERING,
                    ...item
                }));
                setConfig((c: any) => ({ ...c, offerings: [...c.offerings, ...newOfferings] }));
                setSyncUrl('');
            } else {
                alert(json.error || '同步失敗');
            }
        } catch (err) {
            console.error('Sync Error:', err);
            alert('系統錯誤，請稍後再試');
        } finally {
            setIsSyncing(false);
        }
    };

    const update = (i: number, field: string, value: string) => {
        const o = [...config.offerings];
        o[i] = { ...o[i], [field]: value };
        setConfig((c: any) => ({ ...c, offerings: o }));
    };

    const remove = (i: number) => {
        const o = [...config.offerings];
        o.splice(i, 1);
        setConfig((c: any) => ({ ...c, offerings: o }));
    };

    const duplicate = (i: number) => {
        const o = [...config.offerings];
        o.splice(i + 1, 0, { ...o[i] });
        setConfig((c: any) => ({ ...c, offerings: o }));
        // Auto-expand the new copy
        setExpanded(p => {
            const next: Record<number, boolean> = {};
            Object.keys(p).forEach(k => {
                const n = Number(k);
                next[n < i + 1 ? n : n + 1] = p[n];
            });
            next[i + 1] = true;
            return next;
        });
    };

    const isOpen = (i: number) => expanded[i] === true;

    // 免費方案或 starter ($199) 都看不到此功能
    if (isLocked) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-center px-10 bg-white/10 backdrop-blur-md rounded-[24px] shadow-sm">
                <div className="w-24 h-24 rounded-[24px] bg-white/60 flex items-center justify-center mb-8 shadow-2xl">
                    <ShoppingBag className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
                </div>
                <h3 className="text-[28px] font-black text-slate-900 mb-4">商品 / 服務智庫尚未開通</h3>
                <p className="text-[16px] text-slate-600 max-w-lg mb-8 font-bold leading-relaxed">
                    此功能需升級至 <span className="text-emerald-600">{getRequiredPlanName('products', 1)}</span> 以上，
                    即可建立商品與服務清單，讓 AI 精準為客人介紹與推薦。
                </p>
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'billing' }))}
                    className="px-10 py-4 rounded-[16px] bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black text-[15px] shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                    立即升級解鎖 →
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 智能同步區塊 */}
            <div className="p-6 rounded-[32px] bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-200/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-[12px] bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Wand2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="text-[16px] font-black">官網內容自動同步</h4>
                        <p className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">Auto-Sync via Crawler</p>
                    </div>
                </div>
                
                <div className="bg-white/5 p-4 rounded-[20px] backdrop-blur-md border border-white/10 flex gap-3">
                    <div className="flex-1 relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                        <input
                            type="text"
                            placeholder="貼上官網商品網址，AI 自動抓取資料..."
                            className="w-full bg-transparent pl-11 pr-4 py-3 text-[14px] font-bold focus:outline-none placeholder:text-slate-500"
                            value={syncUrl}
                            onChange={(e) => setSyncUrl(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleSync}
                        disabled={!syncUrl || isSyncing}
                        className="px-6 py-2 rounded-[14px] bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 transition-all font-black text-[14px] flex items-center gap-2"
                    >
                        {isSyncing ? (
                            <RefreshCcw className="w-4 h-4 animate-spin" />
                        ) : (
                            <>同步</>
                        )}
                    </button>
                </div>
            </div>

            <div className="space-y-3">
            {/* 額度指示列 */}
            <div className="flex items-center justify-between px-2 mb-1">
                <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">商品 / 服務清單</p>
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-black transition-colors
                    ${atLimit ? 'bg-red-100 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                    <div className={`w-2 h-2 rounded-full ${atLimit ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    {currentCount} / {formatLimit(productLimit)} 項
                    {atLimit && <span className="ml-1">(已達上限)</span>}
                </div>
            </div>
            {config.offerings.map((item: any, i: number) => {
                const open = isOpen(i);
                const hasName = !!item.name;
                return (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[24px]    overflow-hidden group/card transition-all hover:bg-white/80"
                    >
                        {/* ── Card header (always visible) ── */}
                        <div
                            className="flex items-center gap-6 px-10 py-6 cursor-pointer hover:bg-white/40 transition-colors select-none"
                            onClick={() => toggle(i)}
                        >
                            {/* Collapse indicator */}
                            <div className="shrink-0 w-8 h-8 rounded-[24px] bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-50">
                                {open
                                    ? <ChevronDown className="w-4 h-4" />
                                    : <ChevronRight className="w-4 h-4" />
                                }
                            </div>

                            {/* Name preview */}
                            <div className="flex-1 flex flex-col min-w-0">
                                <span className={`text-[18px] font-black tracking-tight truncate ${hasName ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {item.name || '新增商品 / 服務項目'}
                                </span>
                                {item.category && (
                                    <span className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-1">{item.category}</span>
                                )}
                            </div>

                            {/* Price preview */}
                            {item.price && !open && (
                                <div className="hidden sm:flex flex-col items-end mr-6">
                                    <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest mb-1">PRICE</span>
                                    <span className="text-[17px] text-slate-900 font-black">NT$ {item.price}</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={() => duplicate(i)}
                                    className="p-3 rounded-[24px] bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-90 shadow-sm"
                                    title="複製項目"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => remove(i)}
                                    className="p-3 rounded-[24px] bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all active:scale-90 shadow-sm"
                                    title="刪除項目"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* ── Card body (collapsible) ── */}
                        <AnimatePresence initial={false}>
                            {open && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-5 pb-5 pt-2 space-y-4 border-t border-slate-100">

                                        {/* ── BASIC: name, category, price, duration in 2×2 ── */}
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2">基本資訊</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {BASIC_FIELDS.map(f => (
                                                    <InputField
                                                        key={f.key}
                                                        label={f.label}
                                                        placeholder={f.placeholder}
                                                        value={item[f.key] || ''}
                                                        onChange={v => update(i, f.key, v)}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* ── DESCRIPTION ── */}
                                        <TextareaField
                                            label="商品說明（對外顯示）"
                                            placeholder="詳細介紹您的產品或服務特色..."
                                            value={item.description}
                                            onChange={v => update(i, 'description', v)}
                                        />

                                        {/* ── DETAIL: 3×2 grid ── */}
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2">進階設定（選填）</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {DETAIL_FIELDS.map(f => (
                                                    <InputField
                                                        key={f.key}
                                                        label={f.label}
                                                        placeholder={f.placeholder}
                                                        value={item[f.key] || ''}
                                                        onChange={v => update(i, f.key, v)}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* ── AI CONTEXT ── */}
                                        <div className="p-3 rounded-[24px] bg-slate-50 border border-dashed border-slate-200">
                                            <TextareaField
                                                label="AI 備註（僅供 AI 學習，不對外顯示）"
                                                placeholder="額外補充資訊，讓 AI 更了解此商品..."
                                                value={item.ai_context}
                                                onChange={v => update(i, 'ai_context', v)}
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
            </div>
            </div>

            {/* ── Add button ── */}
            {atLimit ? (
                <div className="w-full flex flex-col items-center justify-center gap-3 py-8 rounded-[24px] border-2 border-dashed border-amber-200 bg-amber-50">
                    <div className="flex items-center gap-2 text-amber-600">
                        <Lock className="w-5 h-5" />
                        <span className="text-[15px] font-black">已達 {formatLimit(productLimit)} 項上限（{getPlanName(planLevel)}）</span>
                    </div>
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'billing' }))}
                        className="px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-[13px] font-black shadow-md hover:scale-105 transition-all"
                    >
                        升級方案以新增更多 →
                    </button>
                </div>
            ) : (
                <motion.button
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                        setConfig((c: any) => ({ ...c, offerings: [...c.offerings, { ...EMPTY_OFFERING }] }));
                        setTimeout(() => setExpanded(p => ({ ...p, [config.offerings.length]: true })), 50);
                    }}
                    className="w-full flex items-center justify-center gap-4 py-8 rounded-[24px] bg-gradient-to-r from-emerald-500 to-cyan-600 text-[18px] font-black text-white transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" /> 新增一個商品或服務
                </motion.button>
            )}
        </div>
    );
}
