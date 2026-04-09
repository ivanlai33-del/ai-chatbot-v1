'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Plus, Trash2, Copy } from 'lucide-react';
import InputField from '@/components/ui/InputField';
import TextareaField from '@/components/ui/TextareaField';

interface OfferingsTabProps {
    config: any;
    setConfig: (fn: (c: any) => any) => void;
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

export default function OfferingsTab({ config, setConfig }: OfferingsTabProps) {
    // Track which cards are expanded
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const toggle = (i: number) => setExpanded(p => ({ ...p, [i]: !p[i] }));

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

    return (
        <div className="space-y-3">
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

            {/* ── Add button ── */}
            <motion.button
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                    setConfig((c: any) => ({ ...c, offerings: [...c.offerings, { ...EMPTY_OFFERING }] }));
                    // Auto-expand newly added item
                    setTimeout(() => setExpanded(p => ({ ...p, [config.offerings.length]: true })), 50);
                }}
                className="w-full flex items-center justify-center gap-4 py-8 rounded-[24px]  bg-gradient-to-r from-emerald-500 to-cyan-600 text-[18px] font-black text-white transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
            >
                <Plus className="w-5 h-5" /> 新增一個商品或服務
            </motion.button>
        </div>
    );
}
