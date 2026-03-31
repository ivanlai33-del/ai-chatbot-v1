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
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden"
                    >
                        {/* ── Card header (always visible) ── */}
                        <div
                            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                            onClick={() => toggle(i)}
                        >
                            {/* Collapse indicator */}
                            <div className="shrink-0 w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                {open
                                    ? <ChevronDown className="w-3.5 h-3.5" />
                                    : <ChevronRight className="w-3.5 h-3.5" />
                                }
                            </div>

                            {/* Number badge */}
                            <span className="shrink-0 w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-white text-[11px] font-black">
                                {i + 1}
                            </span>

                            {/* Name preview */}
                            <span className={`flex-1 text-[13px] font-bold truncate ${hasName ? 'text-slate-800' : 'text-slate-400'}`}>
                                {item.name || '（新商品 / 服務）'}
                            </span>

                            {/* Price preview */}
                            {item.price && !open && (
                                <span className="text-[12px] text-slate-400 font-semibold shrink-0">
                                    NT${item.price}
                                </span>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={() => duplicate(i)}
                                    title="複製此項目"
                                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-sky-600 font-bold transition-colors hover:bg-sky-50 px-2 py-1 rounded-lg"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">複製</span>
                                </button>
                                <button
                                    onClick={() => remove(i)}
                                    title="刪除此項目"
                                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-500 font-bold transition-colors hover:bg-red-50 px-2 py-1 rounded-lg"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">刪除</span>
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
                                        <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200">
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                    setConfig((c: any) => ({ ...c, offerings: [...c.offerings, { ...EMPTY_OFFERING }] }));
                    // Auto-expand newly added item
                    setTimeout(() => setExpanded(p => ({ ...p, [config.offerings.length]: true })), 50);
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-slate-300 text-[13px] font-black text-slate-500 hover:bg-slate-50 hover:border-slate-400 transition-all"
            >
                <Plus className="w-4 h-4" /> 新增商品 / 服務
            </motion.button>
        </div>
    );
}
