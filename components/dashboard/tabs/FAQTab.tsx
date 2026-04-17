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
    HelpCircle, 
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

interface FAQTabProps {
    config: any;
    setConfig: (fn: (c: any) => any) => void;
    planLevel?: number;
    botId: string;
}

export default function FAQTab({ config, setConfig, planLevel = 0, botId }: FAQTabProps) {
    const fa = getFeatureAccess(planLevel);
    const faqLimit = fa.faq;
    const currentCount = config.faq_base?.length ?? 0;
    const atLimit = isAtLimit(currentCount, faqLimit);
    const isLocked = faqLimit === 0;

    const [syncUrl, setSyncUrl] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    const toggle = (i: number) => setExpanded(p => ({ ...p, [i]: !p[i] }));
    const isOpen = (i: number) => expanded[i] === true;

    const handleSync = async () => {
        if (!syncUrl) return;
        setIsSyncing(true);
        try {
            const res = await fetch('/api/console/intelligence/sync-faq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: syncUrl, botId })
            });
            const json = await res.json();
            if (json.success && json.data) {
                const newFaq = json.data.map((item: any) => ({ q: item.q, a: item.a, tags: [] }));
                setConfig((c: any) => ({ ...c, faq_base: [...c.faq_base, ...newFaq] }));
                setSyncUrl('');
            } else {
                alert(json.error || '同步失敗');
            }
        } catch (err) {
            console.error('FAQ sync error:', err);
            alert('系統錯誤');
        } finally {
            setIsSyncing(false);
        }
    };

    const update = (i: number, field: string, value: any) => {
        const f = [...config.faq_base];
        f[i] = { ...f[i], [field]: value };
        setConfig((c: any) => ({ ...c, faq_base: f }));
    };

    const remove = (i: number) => {
        const f = [...config.faq_base];
        f.splice(i, 1);
        setConfig((c: any) => ({ ...c, faq_base: f }));
    };

    const duplicate = (i: number) => {
        const f = [...config.faq_base];
        f.splice(i + 1, 0, { ...f[i] });
        setConfig((c: any) => ({ ...c, faq_base: f }));
    };

    if (isLocked) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-center px-10 bg-white/10 backdrop-blur-md rounded-[24px]">
                <HelpCircle className="w-10 h-10 text-emerald-500 mb-8" />
                <h3 className="text-[28px] font-black text-slate-900 mb-2">FAQ 智庫尚未開通</h3>
                <p className="mb-8 font-bold text-slate-600">升級至 {getRequiredPlanName('faq', 1)} 以上方案開通。</p>
                <button onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'billing' }))} className="px-10 py-4 rounded-[16px] bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black">立即升級 →</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="p-6 rounded-[32px] bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-4 text-left">
                    <HelpCircle className="w-5 h-5 text-indigo-400" />
                    <div>
                        <h4 className="text-[16px] font-black">智庫內容自動同步</h4>
                        <p className="text-[12px] text-slate-400 font-bold uppercase text-left">FAQ Sync</p>
                    </div>
                </div>
                <div className="flex gap-3 bg-white/5 p-4 rounded-[20px]">
                    <input type="text" placeholder="貼上 FAQ 網址..." className="flex-1 bg-transparent px-4 py-2 text-white" value={syncUrl} onChange={e => setSyncUrl(e.target.value)} />
                    <button onClick={handleSync} disabled={isSyncing} className="px-6 py-2 rounded-[14px] bg-emerald-500 text-white font-black">
                        {isSyncing ? <RefreshCcw className="animate-spin" /> : '同步'}
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest text-left">問題清單</p>
                    <div className={`px-4 py-1.5 rounded-full text-[12px] font-black ${atLimit ? 'text-red-600 bg-red-100' : 'text-emerald-700 bg-emerald-50'}`}>
                        {currentCount} / {formatLimit(faqLimit)}
                    </div>
                </div>

                {config.faq_base.map((item: any, i: number) => (
                    <div key={i} className="bg-white rounded-[24px] overflow-hidden">
                        <div className="flex items-center gap-4 px-8 py-5 cursor-pointer" onClick={() => toggle(i)}>
                            {isOpen(i) ? <ChevronDown /> : <ChevronRight />}
                            <span className="flex-1 font-black text-slate-900 truncate text-left">{item.q || '新問題'}</span>
                            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                <button onClick={() => duplicate(i)} className="p-2"><Copy className="w-4 h-4" /></button>
                                <button onClick={() => remove(i)} className="p-2 text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <AnimatePresence>
                            {isOpen(i) && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-8 pb-6 space-y-4 border-t border-slate-50 overflow-hidden">
                                    <div className="mt-4 space-y-4">
                                        <InputField label="問題" value={item.q} onChange={v => update(i, 'q', v)} />
                                        <TextareaField label="標準回答" value={item.a} onChange={v => update(i, 'a', v)} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {atLimit ? (
                <div className="p-8 text-center bg-amber-50 text-amber-600 rounded-[24px] font-black border-2 border-dashed border-amber-200">
                    已達上限
                </div>
            ) : (
                <button 
                  onClick={() => setConfig((c: any) => ({ ...c, faq_base: [...c.faq_base, { q: '', a: '', tags: [] }] }))}
                  className="w-full py-6 rounded-[24px] bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-black text-[18px]"
                >
                    + 新增問題
                </button>
            )}
        </div>
    );
}
