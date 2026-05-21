'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronDown, 
    ChevronRight, 
    Plus, 
    Trash2, 
    Copy, 
    Lock, 
    ShoppingBag, 
    Globe, 
    RefreshCcw, 
    Wand2 
} from 'lucide-react';
import InputField from '@/components/ui/InputField';
import TextareaField from '@/components/ui/TextareaField';
import { 
    getFeatureAccess, 
    getPlanName, 
    getRequiredPlanName, 
    isAtLimit, 
    formatLimit 
} from '@/lib/feature-access';

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

const BASIC_FIELDS = [
    { key: 'name',      label: '名稱 *',         placeholder: '商品或服務名稱' },
    { key: 'category',  label: '分類標籤',        placeholder: '例：主食、甜點' },
    { key: 'price',     label: '售價 (NT$)',      placeholder: '0' },
    { key: 'duration',  label: '服務時長',        placeholder: '例：60 分鐘' },
];

const DETAIL_FIELDS = [
    { key: 'size',                 label: '規格 / 尺寸',  placeholder: '款式、大小' },
    { key: 'target_audience_item', label: '適合對象',    placeholder: '例：上班族' },
    { key: 'url',                  label: '商品網址',    placeholder: 'https://...' },
    { key: 'booking_url',          label: '預約連結',    placeholder: 'https://...' },
];

export default function OfferingsTab({ config, setConfig, planLevel = 0, botId }: OfferingsTabProps) {
    const fa = getFeatureAccess(planLevel);
    const productLimit = fa.products;
    const currentCount = config.offerings?.length ?? 0;
    const atLimit = isAtLimit(currentCount, productLimit);
    const isLocked = productLimit === 0;
    
    const [syncUrl, setSyncUrl] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    const toggle = (i: number) => setExpanded(p => ({ ...p, [i]: !p[i] }));
    const isOpen = (i: number) => expanded[i] === true;

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
                const newItems = json.data.map((item: any) => ({ ...EMPTY_OFFERING, ...item }));
                setConfig((c: any) => ({ ...c, offerings: [...c.offerings, ...newItems] }));
                setSyncUrl('');
            } else {
                alert(json.error || '同步失敗');
            }
        } catch (err) {
            console.error('Sync error:', err);
            alert('系統錯誤');
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
    };

    if (isLocked) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-center px-10 bg-white/10 backdrop-blur-md rounded-[24px]">
                <ShoppingBag className="w-10 h-10 text-emerald-500 mb-8" />
                <h3 className="text-[28px] font-black text-slate-900 mb-4">商品智庫尚未開通</h3>
                <p className="mb-8 font-bold text-slate-600">此功能需升級至 {getRequiredPlanName('products', 1)} 以上。</p>
                <button 
                   onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'billing' }))}
                   className="px-10 py-4 rounded-[16px] bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black"
                >
                   立即升級 →
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="p-5 rounded-[24px] bg-white border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <Wand2 className="w-5 h-5 text-emerald-500" />
                    <div>
                        <h4 className="text-[15px] font-black text-slate-900">官網內容自動同步</h4>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider text-left">Auto-Sync</p>
                    </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-[16px] flex gap-3">
                    <input 
                        type="text" 
                        placeholder="貼上網址..." 
                        className="flex-1 bg-transparent px-4 py-2 text-slate-900 text-sm outline-none" 
                        value={syncUrl} 
                        onChange={e => setSyncUrl(e.target.value)} 
                    />
                    <button onClick={handleSync} disabled={isSyncing} className="px-6 py-2 rounded-[12px] bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-sm font-black shadow-md shadow-emerald-500/20 active:scale-95 transition-all">
                        {isSyncing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : '同步'}
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest text-left">清單</p>
                    <div className={`px-4 py-1.5 rounded-full text-[12px] font-black ${atLimit ? 'text-red-600 bg-red-100' : 'text-emerald-700 bg-emerald-50'}`}>
                        {currentCount} / {formatLimit(productLimit)}
                    </div>
                </div>

                {config.offerings.map((item: any, i: number) => (
                    <div key={i} className="bg-white rounded-[24px] overflow-hidden">
                        <div className="flex items-center gap-4 px-8 py-5 cursor-pointer" onClick={() => toggle(i)}>
                            {isOpen(i) ? <ChevronDown /> : <ChevronRight />}
                            <span className="flex-1 font-black text-slate-900 text-left">{item.name || '未命名'}</span>
                            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                <button onClick={() => duplicate(i)} className="p-2"><Copy className="w-4 h-4" /></button>
                                <button onClick={() => remove(i)} className="p-2 text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <AnimatePresence>
                            {isOpen(i) && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-8 pb-6 space-y-4 border-t border-slate-50">
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        {BASIC_FIELDS.map(f => (
                                            <InputField key={f.key} label={f.label} placeholder={f.placeholder} value={item[f.key]} onChange={v => update(i, f.key, v)} />
                                        ))}
                                    </div>
                                    <TextareaField label="說明" placeholder="詳細介紹您的產品或服務特色..." value={item.description} onChange={v => update(i, 'description', v)} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {atLimit ? (
                <div className="p-6 text-center bg-amber-50 text-amber-600 rounded-[24px] font-black border-2 border-dashed border-amber-200 text-sm">
                    已達上限
                </div>
            ) : (
                <button 
                  onClick={() => setConfig((c: any) => ({ ...c, offerings: [...c.offerings, { ...EMPTY_OFFERING }] }))}
                  className="w-full py-4 rounded-[20px] bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-black text-[16px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                    + 新增商品
                </button>
            )}
        </div>
    );
}
