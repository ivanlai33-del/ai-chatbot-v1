'use client';

import { ChevronDown, ChevronRight, Plus, Trash2, Copy, Lock, HelpCircle, Globe, RefreshCcw, Wand2 } from 'lucide-react';
import InputField from '@/components/ui/InputField';
import TextareaField from '@/components/ui/TextareaField';
import { getFeatureAccess, getPlanName, getRequiredPlanName, isAtLimit, formatLimit } from '@/lib/feature-access';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQTabProps {
    config: any;
    setConfig: (fn: (c: any) => any) => void;
    planLevel?: number;
    botId: string;
}

export default function FAQTab({ config, setConfig, planLevel = 0, botId }: FAQTabProps) {
    const fa = getFeatureAccess(planLevel);
    const faqLimit = fa.faq; // 0=關閉, -1=無限
    const currentCount = config.faq_base?.length ?? 0;
    const atLimit = isAtLimit(currentCount, faqLimit);
    const isLocked = faqLimit === 0;

    const [syncUrl, setSyncUrl] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

    const toggleFAQ = (i: number) => setExpandedItems(p => ({ ...p, [i]: !p[i] }));
    const isOpen = (i: number) => expandedItems[i] === true;

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
                const newFaq = json.data.map((item: any) => ({
                    q: item.q,
                    a: item.a,
                    tags: []
                }));
                setConfig((c: any) => ({ ...c, faq_base: [...c.faq_base, ...newFaq] }));
                setSyncUrl('');
            } else {
                alert(json.error || '同步失敗');
            }
        } catch (err) {
            console.error('FAQ Sync Error:', err);
            alert('系統錯誤');
        } finally {
            setIsSyncing(false);
        }
    };

    const updateFAQ = (i: number, field: string, value: any) => {
        const f = [...config.faq_base];
        f[i] = { ...f[i], [field]: value };
        setConfig((c: any) => ({ ...c, faq_base: f }));
    };

    const removeFAQ = (i: number) => {
        const f = [...config.faq_base];
        f.splice(i, 1);
        setConfig((c: any) => ({ ...c, faq_base: f }));
    };

    const duplicateFAQ = (i: number) => {
        const f = [...config.faq_base];
        f.splice(i + 1, 0, { ...f[i] });
        setConfig((c: any) => ({ ...c, faq_base: f }));
    };

    if (isLocked) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-center px-10 bg-white/10 backdrop-blur-md rounded-[24px] shadow-sm">
                <div className="w-24 h-24 rounded-[24px] bg-white/60 flex items-center justify-center mb-8 shadow-2xl">
                    <HelpCircle className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
                </div>
                <h3 className="text-[28px] font-black text-slate-900 mb-4">常見問題智庫尚未開通</h3>
                <p className="text-[16px] text-slate-600 max-w-lg mb-8 font-bold leading-relaxed text-center">
                    此功能需升級至 <span className="text-emerald-600">{getRequiredPlanName('faq', 1)}</span> 以上。
                </p>
                <button onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'billing' }))} className="px-10 py-4 rounded-[16px] bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black text-[15px] shadow-lg hover:scale-105 transition-all">立即升級 →</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest text-left">常見問答庫</p>
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-black ${atLimit ? 'bg-red-100 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                    <div className={`w-2 h-2 rounded-full ${atLimit ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                    {currentCount} / {formatLimit(faqLimit)} 組
                </div>
            </div>

            <div className="p-6 rounded-[32px] bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-200/50 mb-2">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-[12px] bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <HelpCircle className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-[16px] font-black">官網 FAQ 自動同步</h4>
                        <p className="text-[12px] text-slate-400 font-bold uppercase tracking-wider text-left">AI Questions Extraction</p>
                    </div>
                </div>
                <div className="bg-white/5 p-4 rounded-[20px] backdrop-blur-md border border-white/10 flex gap-3">
                    <div className="flex-1 relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                        <input type="text" placeholder="貼上 FAQ 網址..." className="w-full bg-transparent pl-11 pr-4 py-3 text-[14px] font-bold focus:outline-none placeholder:text-slate-500 text-white" value={syncUrl} onChange={(e) => setSyncUrl(e.target.value)} />
                    </div>
                    <button onClick={handleSync} disabled={!syncUrl || isSyncing} className="px-6 py-2 rounded-[14px] bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 transition-all font-black text-[14px] flex items-center gap-2 text-white">
                        {isSyncing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <>同步</>}
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {config.faq_base.map((item: any, i: number) => {
                    const open = isOpen(i);
                    return (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[24px] overflow-hidden group/card transition-all hover:bg-white/80">
                            <div className="flex items-center gap-6 px-8 py-5 cursor-pointer hover:bg-white/40 transition-colors" onClick={() => toggleFAQ(i)}>
                                <div className="shrink-0 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-50">
                                    {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 flex flex-col min-w-0">
                                    <span className={`text-[16px] font-black truncate text-left ${item.q ? 'text-slate-900' : 'text-slate-400'}`}>
                                        {item.q || '尚未輸入問題...'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => duplicateFAQ(i)} title="複製" className="p-2.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-all"><Copy className="w-4 h-4" /></button>
                                    <button onClick={() => removeFAQ(i)} title="刪除" className="p-2.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <AnimatePresence initial={false}>
                                {open && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                        <div className="px-8 pb-6 pt-2 space-y-4 border-t border-slate-100">
                                            <InputField label="問題" placeholder="請輸入消費者可能會問的問題" value={item.q} onChange={v => updateFAQ(i, 'q', v)} />
                                            <TextareaField label="回答" placeholder="您的標準答覆內容" value={item.a} onChange={v => updateFAQ(i, 'a', v)} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {atLimit ? (
                <div className="w-full flex flex-col items-center justify-center gap-3 py-8 rounded-[24px] border-2 border-dashed border-amber-200 bg-amber-50">
                    <div className="flex items-center gap-2 text-amber-600">
                        <Lock className="w-5 h-5" />
                        <span className="text-[15px] font-black">已達到組數上限</span>
                    </div>
                </div>
            ) : (
                <motion.button onClick={() => { setConfig((c: any) => ({ ...c, faq_base: [...c.faq_base, { q: '', a: '', tags: [] }] })); setTimeout(() => setExpandedItems(p => ({ ...p, [config.faq_base.length]: true })), 50); }} className="w-full flex items-center justify-center gap-4 py-8 rounded-[24px] bg-gradient-to-r from-emerald-500 to-cyan-600 text-[18px] font-black text-white shadow-xl active:scale-95 transition-all">
                    <Plus className="w-5 h-5" /> 新增一個 FAQ 問題
                </motion.button>
            )}
        </div>
    );
}
