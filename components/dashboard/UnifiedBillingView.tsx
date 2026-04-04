'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CreditCard, 
    Zap, 
    Sparkles, 
    Clock, 
    ShieldCheck, 
    Calendar, 
    CheckCircle2, 
    ChevronRight, 
    ArrowUpCircle,
    Receipt,
    Wallet,
    Building2,
    User,
    Mail,
    Save,
    AlertTriangle,
    X,
    Info,
    AlertCircle,
    Store,
    MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
    PRICING_PLANS, 
    getPlanByTier, 
    PLAN_IDS_ORDERED,
    PlanId
} from '@/lib/config/pricing';

// 移除舊的 PLANS 陣列，改用 pricing.ts 主資料
const AVAILABLE_PLAN_IDS = PLAN_IDS_ORDERED.filter(id => id !== 'free');

export default function UnifiedBillingView() {
    const [planLevel, setPlanLevel] = useState<number>(0);
    const [dbBillingCycle, setDbBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
    const [loading, setLoading] = useState(true);
    const [savingInvoice, setSavingInvoice] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [lineUserId, setLineUserId] = useState<string | null>(null);
    const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    
    // Invoice States
    const [invoiceType, setInvoiceType] = useState<'personal' | 'company'>('personal');
    const [invoiceTitle, setInvoiceTitle] = useState('');
    const [taxId, setTaxId] = useState('');
    const [mailingAddress, setMailingAddress] = useState('');

    useEffect(() => {
        const getCookie = (name: string) => {
            const match = typeof document !== 'undefined' ? document.cookie.split('; ').find(r => r.startsWith(name + '=')) : null;
            return match ? decodeURIComponent(match.split('=')[1]) : '';
        };

        const uid = localStorage.getItem('line_user_id') || getCookie('line_user_id');
        setLineUserId(uid);
        
        if (uid) {
            fetch(`/api/platform/user?lineUserId=${uid}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.user) {
                        setPlanLevel(data.user.plan_level || 0);
                        const cycle = data.user.billing_cycle || 'monthly';
                        setDbBillingCycle(cycle);
                        setSelectedBillingCycle(cycle);
                        setCancelAtPeriodEnd(data.user.cancel_at_period_end || false);
                        
                        // Invoice sync
                        setInvoiceType(data.user.invoice_type || 'personal');
                        setInvoiceTitle(data.user.invoice_title || '');
                        setTaxId(data.user.tax_id || '');
                        setMailingAddress(data.user.mailing_address || '');
                    }
                })
                .catch(err => console.error("Sync Error:", err))
                .finally(() => setLoading(false));
        } else {
            console.warn("No lineUserId found in localStorage or cookies on Billing view");
            setLoading(false);
        }
    }, []);

    const handleUpgrade = async (level: number, cycle: 'monthly' | 'yearly') => {
        if (!lineUserId) {
            alert('請先登入 Line 帳號');
            return;
        }

        try {
            const res = await fetch('/api/platform/user/upgrade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    lineUserId, 
                    planLevel: level,
                    billingCycle: cycle 
                })
            });
            const data = await res.json();
            if (data.success) {
                setPlanLevel(level);
                setDbBillingCycle(cycle);
                setCancelAtPeriodEnd(false); // Reset cancellation on upgrade
                alert(`已成功升級 ${cycle === 'yearly' ? '年費' : '月費'}方案！`);
                window.location.reload();
            }
        } catch (e) {
            console.error("Upgrade error", e);
        }
    };

    const handleSaveInvoice = async () => {
        if (!lineUserId) return;
        setSavingInvoice(true);
        try {
            const res = await fetch('/api/platform/user/invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    lineUserId,
                    invoiceType,
                    invoiceTitle,
                    taxId,
                    mailingAddress
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('發票資訊已儲存！');
            }
        } catch (e) {
            console.error("Invoice save error", e);
        } finally {
            setSavingInvoice(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!lineUserId) return;
        try {
            const res = await fetch('/api/platform/user/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lineUserId })
            });
            const data = await res.json();
            if (data.success) {
                setCancelAtPeriodEnd(true);
                setIsCancelModalOpen(false);
                alert('已停止自動續約設定。您可以繼續使用服務直到本期結束。');
            }
        } catch (e) {
            console.error("Cancel error", e);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-40">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    const currentPlan = getPlanByTier(planLevel);
    
    const allAvailablePlans = AVAILABLE_PLAN_IDS.map(id => PRICING_PLANS[id]);

    return (
        <div className="max-w-5xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 💎 Current Subscription Status Card */}
            <section>
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">目前的收費狀態</h2>
                <div className={cn(
                    "relative overflow-hidden rounded-[40px] p-8 transition-all border-2",
                    planLevel >= 5 ? "bg-gradient-to-br from-amber-500/5 to-white border-amber-200" :
                    planLevel > 0 ? "bg-gradient-to-br from-[#06C755]/5 to-white border-emerald-200" :
                    "bg-gradient-to-br from-slate-100 to-white border-slate-200"
                )}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className={cn(
                                "w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500",
                                planLevel >= 5 ? "bg-amber-500 shadow-amber-500/40" :
                                planLevel > 0 ? "bg-[#06C755] shadow-green-500/40" :
                                "bg-slate-800 shadow-slate-500/20"
                            )}>
                                 <div className="text-4xl transform group-hover:scale-110 transition-transform">{currentPlan?.emoji || "🎁"}</div>
                            </div>
                            <div>
                                 <h3 className="text-[40px] font-black text-slate-800 tracking-tight">
                                    {currentPlan?.name || "尚未開通正式方案"}
                                </h3>
                                <div className="flex items-center gap-2.5 mt-2">
                                    {planLevel > 0 ? (
                                        <div className="flex items-center gap-2">
                                            {cancelAtPeriodEnd ? (
                                                 <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-black uppercase tracking-widest border border-amber-100">
                                                    <Clock className="w-3 h-3" />
                                                    Pending Cancellation ・ 即將結束自續
                                                </span>
                                            ) : (
                                                 <span className={cn(
                                                     "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border",
                                                     planLevel >= 5 ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                 )}>
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Active ・ 訂閱執行中
                                                </span>
                                            )}
                                             <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border",
                                                dbBillingCycle === 'yearly' ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-slate-50 text-slate-500 border-slate-100"
                                            )}>
                                                {dbBillingCycle === 'yearly' ? '年費方案' : '月費方案'}
                                            </span>
                                        </div>
                                    ) : (
                                         <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-sm font-black uppercase tracking-widest border border-slate-200">
                                            <Clock className="w-3 h-3" />
                                            Free Version ・ 免費體驗中
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                 <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{cancelAtPeriodEnd ? "服務結束日" : "次期扣款日"}</p>
                                <p className="text-3xl font-bold text-slate-800">{planLevel > 0 ? "2026 / 04 / 28" : "---"}</p>
                                {planLevel > 0 && !cancelAtPeriodEnd && (
                                    <div className="mt-3 text-right">
                                        <button 
                                            onClick={() => setIsCancelModalOpen(true)}
                                            className="text-[10px] font-black text-slate-300 hover:text-rose-400 transition-all uppercase tracking-widest border-b border-transparent hover:border-rose-400 "
                                        >
                                            停止自動續約設定
                                        </button>
                                        <div className="flex items-center justify-end gap-1.5 mt-1 opacity-40">
                                            <Info className="w-2.5 h-2.5" />
                                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">註：停止後本期費用不予退還，服務將維持至本期結標日結束。</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="h-10 w-px bg-slate-200" />
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">支付金額</p>
                                <p className={cn(
                                    "text-4xl font-black",
                                    planLevel >= 5 ? "text-amber-500" : (planLevel > 0 ? "text-[#06C755]" : "text-slate-400")
                                )}>
                                    ${planLevel > 0 ? (dbBillingCycle === 'yearly' ? currentPlan?.pricing.annual.toLocaleString() : currentPlan?.pricing.monthly.toLocaleString()) : "0"}
                                    <span className="text-xs font-bold text-slate-400 ml-1">/ {dbBillingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* 🛠️ Sandbox Internal Testing Panel */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-4 py-2 flex items-center gap-2">
                             <AlertCircle className="w-3 h-3" /> 內部權限測試：
                        </span>
                        <button onClick={() => { if(confirm('重置為免費？')) handleUpgrade(0, 'monthly') }} className="px-3 py-1.5 bg-slate-100 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] font-black transition-all">FREE</button>
                        <button onClick={() => { if(confirm('開通 199？')) handleUpgrade(1, 'monthly') }} className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-500 hover:text-white rounded-xl text-[10px] font-black transition-all">199</button>
                        <button onClick={() => handleUpgrade(2, 'monthly')} className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-xl text-[10px] font-black transition-all">499</button>
                        <button onClick={() => handleUpgrade(3, 'monthly')} className="px-3 py-1.5 bg-slate-100 hover:bg-blue-500 hover:text-white rounded-xl text-[10px] font-black transition-all">1299</button>
                        <button onClick={() => handleUpgrade(4, 'monthly')} className="px-3 py-1.5 bg-slate-100 hover:bg-purple-500 hover:text-white rounded-xl text-[10px] font-black transition-all">2490</button>
                        <button onClick={() => handleUpgrade(5, 'monthly')} className="px-3 py-1.5 bg-slate-100 hover:bg-amber-500 hover:text-white rounded-xl text-[10px] font-black transition-all">4990</button>
                        <button onClick={() => handleUpgrade(6, 'monthly')} className="px-3 py-1.5 bg-slate-100 hover:bg-[#FF5E00] hover:text-white rounded-xl text-[10px] font-black transition-all">7990</button>
                    </div>
                </div>
            </section>

            {/* 🚀 Upgrade Options Section */}
            <section>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 ml-2">
                      <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">所有的服務方案</h2>
                    <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-fit shadow-inner">
                        <button 
                            onClick={() => setSelectedBillingCycle('monthly')}
                             className={cn(
                                "px-6 py-2.5 rounded-xl text-[15px] font-black uppercase tracking-widest transition-all",
                                selectedBillingCycle === 'monthly' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            月費方案
                        </button>
                        <button 
                            onClick={() => setSelectedBillingCycle('yearly')}
                             className={cn(
                                "px-6 py-2.5 rounded-xl text-[15px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                selectedBillingCycle === 'yearly' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            年費更划算
                             <span className={cn(
                                "px-1.5 py-0.5 rounded text-[10px] font-black",
                                selectedBillingCycle === 'yearly' ? "bg-indigo-500 text-white" : "bg-slate-200 text-slate-500"
                            )}>
                                贈送一個月
                            </span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                    {allAvailablePlans.map((plan) => {
                        const isCurrentActive = plan.tier === planLevel && selectedBillingCycle === dbBillingCycle;
                        
                        return (
                            <motion.div 
                                key={plan.tier}
                                layout
                                whileHover={isCurrentActive ? {} : { y: -5 }}
                                className={cn(
                                    "group relative p-8 rounded-[40px] border-2 transition-all overflow-hidden bg-white h-full flex flex-col",
                                    isCurrentActive ? "border-indigo-500 ring-4 ring-indigo-500/10 shadow-2xl" : "shadow-sm hover:shadow-xl",
                                    isCurrentActive ? "cursor-default" : "cursor-pointer"
                                )}
                                style={!isCurrentActive ? { borderColor: `${plan.color}40` } : {}}
                                onClick={() => !isCurrentActive && handleUpgrade(plan.tier, selectedBillingCycle)}
                            >
                                {isCurrentActive && (
                                    <div className="absolute top-0 right-0 px-6 py-2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-bl-2xl shadow-lg z-10">
                                        目前的方案
                                    </div>
                                )}
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!isCurrentActive && <ArrowUpCircle className="w-8 h-8" style={{ color: plan.color }} />}
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                     <p className="text-sm font-black uppercase tracking-widest" style={{ color: plan.color }}>
                                        {plan.badge || (plan.tier >= 5 ? "Enterprise" : "Standard")}
                                    </p>
                                </div>
                                <div className="flex flex-col mb-6">
                                    <div className="flex items-center gap-2 mb-1">
                                         <span className="text-base font-bold text-slate-400 line-through decoration-slate-300">
                                            原價 ${selectedBillingCycle === 'monthly' ? plan.pricing.originalMonthly.toLocaleString() : (plan.pricing.originalMonthly * 12).toLocaleString()}
                                        </span>
                                        <span className="text-xs font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">限時優化價</span>
                                    </div>
                                    <div className="flex items-end gap-2">
                                         <h4 className="text-5xl font-black text-slate-800 tracking-tighter">
                                            ${selectedBillingCycle === 'monthly' ? plan.pricing.monthly.toLocaleString() : plan.pricing.annual.toLocaleString()}
                                        </h4>
                                        <span className="text-lg font-bold text-slate-400 mb-1">
                                            / {selectedBillingCycle === 'monthly' ? '月' : '年'}
                                        </span>
                                    </div>
                                    {selectedBillingCycle === 'yearly' && (
                                        <div className="mt-2 inline-flex items-center gap-1.5">
                                             <span className="text-sm font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                                                年繳現省 ${plan.pricing.annualSaving.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                 <h3 className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-3">
                                    <span className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">{plan.emoji}</span>
                                    {plan.name}
                                </h3>
                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.slice(0, 5).map((f: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-base text-slate-500 font-bold leading-tight">
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${plan.color}15` }}>
                                                <CheckCircle2 className="w-3 h-3" style={{ color: plan.color }} />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                 <button 
                                    className={cn(
                                        "w-full py-4 rounded-2xl font-black text-lg uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 shadow-lg",
                                        isCurrentActive ? "bg-slate-100 text-slate-400 cursor-default" : "text-white"
                                    )}
                                    style={!isCurrentActive ? { backgroundColor: plan.color, boxShadow: `0 10px 15px -3px ${plan.color}40` } : {}}
                                >
                                    {isCurrentActive ? '目前使用中' : (plan.tier === planLevel ? '恢復自動續約' : (planLevel > 0 ? '變更方案' : '立即開通'))} <ChevronRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* 📑 Invoice Settings Section */}
            <section>
                 <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">發票需求與設定</h2>
                <div className="bg-white rounded-[40px] p-8 border-2 border-slate-100 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 p-1.5 bg-slate-50 rounded-2xl w-fit">
                                <button 
                                    onClick={() => setInvoiceType('personal')}
                                     className={cn(
                                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all",
                                        invoiceType === 'personal' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    <User className="w-3 h-3" /> 個人發票
                                </button>
                                <button 
                                    onClick={() => setInvoiceType('company')}
                                     className={cn(
                                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all",
                                        invoiceType === 'company' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    <Building2 className="w-3 h-3" /> 公司三聯式
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {invoiceType === 'company' && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 overflow-hidden"
                                    >
                                        <div className="space-y-2">
                                             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">公司抬頭</p>
                                            <input 
                                                type="text" 
                                                value={invoiceTitle}
                                                onChange={(e) => setInvoiceTitle(e.target.value)}
                                                placeholder="請輸入公司完整名稱"
                                                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">統一編號</p>
                                            <input 
                                                type="text" 
                                                value={taxId}
                                                onChange={(e) => setTaxId(e.target.value)}
                                                placeholder="8 位數統一編號"
                                                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">紙本發票收件地址</p>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        value={mailingAddress}
                                        onChange={(e) => setMailingAddress(e.target.value)}
                                        placeholder="手開發票將以掛號寄至此地址"
                                         className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleSaveInvoice}
                                disabled={savingInvoice}
                                className="px-8 py-4 bg-indigo-500 text-white rounded-2xl font-black text-[15px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-3"
                            >
                                {savingInvoice ? <span className="animate-spin text-lg">◌</span> : <Save className="w-4 h-4" />}
                                儲存發票資訊
                            </button>
                        </div>

                        <div className="bg-slate-50/50 rounded-[32px] p-8 flex flex-col justify-center border border-slate-100">
                            <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-indigo-500" />
                                開立說明
                            </h4>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed">目前尚未辦理電子發票，系統採用 **「手開發票」** 方式開立。</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed">發票將於每月或每年扣款完成後 **7 個工作日內** 以掛號寄出。</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed">請務必填寫正確的收件地址，以免影響您的帳務報銷流程。</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 📝 Billing History Section */}
            <section>
                <div className="flex items-center justify-between mb-4 ml-2">
                     <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">最近的收費紀錄</h2>
                    <button className="text-sm font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-600 transition-all">所有帳務明細</button>
                </div>
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    {planLevel > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                         <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Transaction ID</th>
                                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">訂閱方案</th>
                                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">日期</th>
                                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">金額</th>
                                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">狀態</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <tr className="hover:bg-slate-50/50 transition-all">
                                        <td className="px-8 py-6 font-mono text-xs text-slate-500 uppercase tracking-widest">INV-2026-0328</td>
                                        <td className="px-8 py-6 text-sm font-bold text-slate-700">{currentPlan?.name || "未知方案"}</td>
                                        <td className="px-8 py-6 text-sm text-slate-500 font-medium tracking-tight">2026-03-28</td>
                                        <td className="px-8 py-6 text-sm font-black text-slate-800">${(dbBillingCycle === 'yearly' ? currentPlan?.pricing.annual : currentPlan?.pricing.monthly)?.toLocaleString()}</td>
                                        <td className="px-8 py-6">
                                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">Paid 成功</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30">
                            <Receipt className="w-12 h-12 text-slate-400" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[.25em]">尚無正式付費金流紀錄</p>
                        </div>
                    )}
                </div>
            </section>

            {/* 🛡️ Subscription Cancellation Modal */}
            <AnimatePresence>
                {isCancelModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsCancelModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6">
                                <button onClick={() => setIsCancelModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-400 hover:text-slate-800">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mb-6">
                                    <AlertTriangle className="w-10 h-10" />
                                </div>
                                 <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-2">確定要停止自動續約嗎？</h3>
                                <div className="space-y-4 mb-8">
                                     <p className="text-base text-slate-500 font-medium leading-relaxed">
                                        您的服務不會立即中斷。停止後，您可以繼續使用 **「${currentPlan?.name}」** 直到 **2026/04/28** 本期結束。
                                    </p>
                                    <div className="p-4 bg-slate-50 rounded-2xl text-left">
                                         <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">停止後您將失去：</p>
                                        <ul className="space-y-2">
                                             <li className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                                <div className="w-1 h-1 bg-rose-400 rounded-full" /> 24/7 AI 客服自動化服務
                                            </li>
                                            <li className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                                <div className="w-1 h-1 bg-rose-400 rounded-full" /> RAG 專屬知識庫 management 權限
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 w-full">
                                    <button 
                                        onClick={handleCancelSubscription}
                                        className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:brightness-110 active:scale-95 transition-all"
                                    >
                                        確認停止自動續約
                                    </button>
                                     <button 
                                        onClick={() => setIsCancelModalOpen(false)}
                                        className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-base uppercase tracking-widest hover:bg-slate-200 transition-all font-bold"
                                    >
                                        我再考慮看看
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 🛡️ Policy & Support Footer */}
            <footer className="mt-20 pt-16 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16">
                    {/* 1. 客服聯絡資訊 */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-slate-800">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                                <Mail className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-sm uppercase tracking-[0.2em] text-slate-500">客服聯絡資訊</h3>
                        </div>
                        <div className="space-y-4 pl-1">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">官方客服信箱</p>
                                <p className="text-slate-800 font-bold text-base">info@ycideas.com</p>
                            </div>
                            <div className="pt-2">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-4 h-4 rounded-full bg-[#06C755] flex items-center justify-center text-[8px] text-white">
                                        <MessageCircle className="w-2.5 h-2.5 fill-current" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LINE 專屬通道</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm group hover:border-emerald-200 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                                            <img src="/Lai Logo_3.svg" alt="Lai Logo" className="w-8 h-8 object-contain" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400">你的AI客服</span>
                                            <span className="text-emerald-600 font-black text-sm">@967iypui</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-lg grayscale group-hover:grayscale-0 transition-all">👤</div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400">真人專員</span>
                                            <span className="text-indigo-600 font-black text-sm">ivanlai33</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 italic pt-2">服務、合作、採訪、洽詢</p>
                        </div>
                    </div>

                    {/* 2. 付費方案說明 */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-slate-800">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-sm uppercase tracking-[0.2em] text-slate-500">付費方案說明</h3>
                        </div>
                        <div className="space-y-5 pl-1">
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-slate-600 leading-relaxed">
                                    本平台採<span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md mx-1">訂閱制 (SaaS)</span>收費模式
                                </p>
                            </div>
                            <div className="space-y-3 bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                                {[
                                    { label: '入門嚐鮮', price: '$199 / 月' },
                                    { label: '單店主力', price: '$499 / 月' },
                                    { label: '成長多店', price: '$1,299 / 月' },
                                    { label: '連鎖專業', price: '$2,490 / 月' },
                                    { label: '旗艦 Lite', price: '$4,990 起 / 月' },
                                    { label: '旗艦 Pro', price: '$7,990 起 / 月' },
                                ].map((p) => (
                                    <div key={p.label} className="flex justify-between items-center text-xs font-bold">
                                        <span className="text-slate-500 tracking-wider text-[11px]">{p.label} ：</span>
                                        <span className="text-slate-800 font-black">{p.price}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100/50 uppercase tracking-widest leading-none">
                                <Sparkles className="w-3 h-3" />
                                年費方案包含「買 11 個月送 1 個月」優惠
                            </div>
                        </div>
                    </div>

                    {/* 3. 退款與終止政策 */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-slate-800">
                            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm border border-rose-100/50">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-sm uppercase tracking-[0.2em] text-slate-500">退款與終止政策</h3>
                        </div>
                        <div className="space-y-5 pl-1">
                            <p className="text-sm font-bold text-slate-600 leading-relaxed">
                                數位服務開通後，除不可抗力因素外，<span className="text-rose-500">恕不提供退款</span>。
                            </p>
                            <p className="text-sm font-bold text-slate-500 leading-relaxed">
                                用戶可隨時於後台取消次月續訂，服務將持續至該帳單週期結束。
                            </p>
                            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <AlertCircle className="w-4 h-4 text-slate-300" />
                                <span className="text-[11px] font-bold text-slate-400">若有異常扣款，請於 7 日內聯繫客服。</span>
                            </div>
                        </div>
                    </div>

                    {/* 4. 營運單位 */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-slate-800">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm border border-slate-200/50">
                                <Store className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-sm uppercase tracking-[0.2em] text-slate-500">營運單位</h3>
                        </div>
                        <div className="space-y-6 pl-1">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">© 2026 您的專屬AI智能店長</p>
                                <div className="pt-2">
                                    <h4 className="text-slate-800 font-black text-xl tracking-tight leading-none">YC Ideas</h4>
                                    <p className="text-slate-400 font-bold text-[10px] mt-1 italic">奕暢創新工作室</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-3">AI 數位服務開發 運作</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Legal bar */}
                <div className="mt-8 py-10 border-t border-slate-100 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <span className="opacity-50">本網站交易資料由</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">藍新金流 NEWEBPAY</span>
                        <span className="opacity-50">提供 256-BIT SSL 加密安全保護</span>
                    </div>
                    <div className="flex items-center gap-10">
                        {['服務條款', '隱私權政策', '免責聲明'].map((item) => (
                            <button key={item} className="text-xs font-bold text-slate-400 hover:text-indigo-600 hover:scale-105 transition-all uppercase tracking-widest">
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
