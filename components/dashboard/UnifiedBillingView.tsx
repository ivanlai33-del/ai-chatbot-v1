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
    const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
    const [isAllPlansExpanded, setIsAllPlansExpanded] = useState(false);
    
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
            fetch(`/api/platform/user?lineUserId=${uid}`, { cache: 'no-store' })
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.user) {
                        // 嚴謹判斷：只有在真的為 undefined 或 null 時才設為 0，避免 0 被 || 誤判
                        const fetchedLevel = (data.user.plan_level !== undefined && data.user.plan_level !== null) 
                            ? Number(data.user.plan_level) 
                            : 0;
                        setPlanLevel(fetchedLevel);
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
                const targetPlan = getPlanByTier(level);
                setPlanLevel(level);
                setDbBillingCycle(cycle);
                setCancelAtPeriodEnd(false); // Reset cancellation on upgrade
                alert(`已成功模擬切換為：${targetPlan?.name || '免費版'}`);
                window.location.reload();
            } else {
                alert(`切換失敗: ${data.error}`);
            }
        } catch (e) {
            console.error("Upgrade error", e);
            alert('系統錯誤，請稍後再試');
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
        <div className="max-w-5xl mx-auto space-y-16 py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
            {/* 🎨 Background Decoration */}
            <div className="absolute -top-20 -left-40 w-[600px] h-[600px] opacity-[0.02] pointer-events-none select-none z-0">
                <img src="/b_02.svg" alt="Decoration" className="w-full h-full object-contain rotate-12" />
            </div>

            {/* 👑 Page Header */}
            <header className="relative z-10 space-y-2 ml-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">帳單與訂閱管理</h1>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.25em]">Manage your premium identity and payments</p>
                <div className="w-12 h-1 bg-indigo-500 rounded-full mt-4" />
            </header>

            {/* 💎 Current Subscription Status Card */}
            <section className="relative z-10">
                <h2 className="text-xs font-black text-slate-400 underline decoration-slate-200 underline-offset-8 uppercase tracking-[0.4em] mb-8 ml-2">目前的收費狀態 / Subscription</h2>
                <div className={cn(
                    "relative overflow-hidden rounded-[32px] p-10 transition-all border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] bg-white",
                    planLevel > 0 && "ring-1 ring-emerald-500/10"
                )}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="flex items-center gap-8">
                            <div 
                                className="w-24 h-24 rounded-[32px] flex items-center justify-center bg-white shadow-xl border-2 transition-transform hover:scale-105 duration-500"
                                style={{ borderColor: currentPlan?.color || '#f1f5f9' }}
                            >
                                 <div className="text-5xl">{currentPlan?.emoji || "🎁"}</div>
                            </div>
                            <div className="space-y-3">
                                 <h3 className="text-[38px] font-black text-slate-800 tracking-tight leading-none">
                                    {currentPlan?.name || "體驗模式"}
                                </h3>
                                <div className="flex items-center gap-3">
                                    {planLevel > 0 ? (
                                        <>
                                            <span className={cn(
                                                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                cancelAtPeriodEnd ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            )}>
                                                {cancelAtPeriodEnd ? 'Pending Cancellation' : 'Active 訂閱中'}
                                            </span>
                                            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                                {dbBillingCycle === 'yearly' ? 'Annual 年繳' : 'Monthly 月繳'}
                                            </span>
                                        </>
                                    ) : (
                                         <span className="px-4 py-1.5 bg-slate-100 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                            Trial 體驗中
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
                            <div className="grid grid-cols-2 md:block gap-4">
                                <div className="mb-4">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">生效時間</p>
                                    <p className="text-base font-bold text-slate-500">{planLevel > 0 ? '2026/03/28' : '--'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">下次扣款</p>
                                    <p className="text-base font-bold text-slate-500">{planLevel > 0 ? (dbBillingCycle === 'yearly' ? '2027/03/28' : '2026/04/28') : '--'}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col justify-center items-end text-right border-l border-slate-50 md:pl-16">
                                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    {cancelAtPeriodEnd ? "服務到期日" : "本期結帳週期"}
                                </p>
                                <p className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
                                    {planLevel > 0 ? (dbBillingCycle === 'yearly' ? '2027 / 03 / 28' : '2026 / 04 / 28') : 'FREE TRIAL'}
                                </p>
                                {planLevel > 0 && !cancelAtPeriodEnd && (
                                    <button 
                                        onClick={() => setIsCancelModalOpen(true)}
                                        className="text-[10px] font-black text-slate-300 hover:text-rose-400 transition-all uppercase tracking-[0.2em] border-b border-transparent hover:border-rose-200 pb-0.5"
                                    >
                                        停止自動續約設定
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
order-b border-slate-200 hover:border-rose-400"
                                    >
                                        停止自動續約設定
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* 🛡️ Superuser Administrative / Sandbox Panel — Only for Authorized ID */}
                    {lineUserId === 'Ud8b8dd79162387a80b2b5a4aba20f604' && (
                        <div className="mt-8 pt-6 border-t font-black border-slate-100 flex flex-wrap items-center gap-2 animate-in fade-in zoom-in duration-500">
                            <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-[0.2em] mr-4 py-2 flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3" /> 系統營運特權：
                            </span>
                            <button onClick={() => { if(confirm('重置為免費？')) handleUpgrade(0, 'monthly') }} className="px-3 py-1.5 bg-slate-100 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] transition-all">FREE</button>
                            <button onClick={() => { if(confirm('開通 199？')) handleUpgrade(1, 'monthly') }} className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-500 hover:text-white rounded-xl text-[10px] transition-all">199</button>
                            <button onClick={() => handleUpgrade(2, 'monthly')} className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-xl text-[10px] transition-all">499</button>
                            <button onClick={() => handleUpgrade(3, 'monthly')} className="px-3 py-1.5 bg-slate-100 hover:bg-blue-500 hover:text-white rounded-xl text-[10px] transition-all">1299</button>
                            <button onClick={() => handleUpgrade(4, 'monthly')} className="px-3 py-1.5 bg-slate-100 hover:bg-purple-500 hover:text-white rounded-xl text-[10px] transition-all">2490</button>
                            <button onClick={() => handleUpgrade(5, 'monthly')} className="px-3 py-1.5 bg-slate-100 hover:bg-amber-500 hover:text-white rounded-xl text-[10px] transition-all">4990</button>
                            <button onClick={() => handleUpgrade(6, 'monthly')} className="px-3 py-1.5 bg-slate-100 hover:bg-[#FF5E00] hover:text-white rounded-xl text-[10px] transition-all">7990</button>
                        </div>
                    )}
                </div>
            </section>

            {/* 🚀 Upgrade Options Section */}
            <section className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 ml-2">
                    <div className="space-y-3">
                        <h2 className="text-xs font-black text-slate-400 underline decoration-slate-200 underline-offset-8 uppercase tracking-[0.4em]">所有的服務方案 / Plans</h2>
                        <button 
                            onClick={() => setIsAllPlansExpanded(!isAllPlansExpanded)}
                            className={cn(
                                "flex items-center gap-3 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border",
                                isAllPlansExpanded 
                                    ? "bg-slate-50 text-slate-400 border-slate-200" 
                                    : "bg-white text-indigo-600 border-indigo-100 shadow-xl shadow-indigo-500/5 hover:border-indigo-300 hover:bg-indigo-50"
                            )}
                        >
                            <span>{isAllPlansExpanded ? '收起詳細方案' : '展開所有方案'}</span>
                            <ChevronRight className={cn("w-3.5 h-3.5 transition-transform duration-300", isAllPlansExpanded ? "rotate-90" : "rotate-0")} />
                        </button>
                    </div>

                    <div className="flex items-center p-1.5 bg-slate-100/50 rounded-2xl w-fit shadow-inner border border-slate-200/50">
                        <button 
                            onClick={() => setSelectedBillingCycle('monthly')}
                             className={cn(
                                "px-6 py-2 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all",
                                selectedBillingCycle === 'monthly' ? "bg-white text-slate-800 shadow-md" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Monthly 月費
                        </button>
                        <button 
                            onClick={() => setSelectedBillingCycle('yearly')}
                             className={cn(
                                "px-6 py-2 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                selectedBillingCycle === 'yearly' ? "bg-white text-indigo-600 shadow-md" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Yearly 年費
                             <span className={cn(
                                "px-2 py-0.5 rounded text-[9px] font-black",
                                selectedBillingCycle === 'yearly' ? "bg-indigo-500 text-white" : "bg-slate-200 text-slate-500"
                            )}>
                                SAVE 15%
                            </span>
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isAllPlansExpanded && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
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
                                <h3 className="text-3xl font-black text-slate-800 mb-2 flex items-center gap-3">
                                    <span className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">{plan.emoji}</span>
                                    {plan.name}
                                </h3>
                                
                                <div className="mb-6 flex-1 text-sm font-bold text-slate-500">
                                    {[199, 499, 1299, 2490].includes(plan.pricing.monthly) && plan.limits.monthlyQuota > 0 ? (
                                        <div className="flex items-center gap-2 mb-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <Zap className="w-4 h-4 text-amber-500" /> 
                                            每月額度：<span className="text-slate-800 font-black">{plan.limits.monthlyQuota.toLocaleString()} 則</span>
                                        </div>
                                    ) : plan.limits.monthlyQuota > 0 && (
                                        <div className="flex items-center gap-2 mb-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <Zap className="w-4 h-4 text-amber-500" /> 
                                            {plan.limits.dailyQuota === -1 ? '旗艦級大容量專線' : `每月額度：${plan.limits.monthlyQuota.toLocaleString()} 則`}
                                        </div>
                                    )}

                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedPlans(prev => ({...prev, [plan.id]: !prev[plan.id]}));
                                        }}
                                        className="mt-3 flex items-center justify-between w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600 font-bold"
                                    >
                                        <span>查看方案內容</span>
                                        <ChevronRight className={cn("w-4 h-4 transition-transform", expandedPlans[plan.id] ? "rotate-90" : "rotate-0")} />
                                    </button>

                                    <AnimatePresence>
                                        {expandedPlans[plan.id] && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden mt-4"
                                            >
                                                <ul className="space-y-4 pt-2">
                                                    {plan.features.map((f: string, i: number) => {
                                                        const cleanText = f.replace(/^✅\s*/, '');
                                                        return (
                                                            <li key={i} className="flex items-start gap-3 text-base text-slate-600 font-bold leading-tight">
                                                                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-emerald-50">
                                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                                </div>
                                                                {cleanText}
                                                            </li>
                                                        );
                                                    })}
                                                    {plan.notIncluded && plan.notIncluded.map((f: string, i: number) => (
                                                        <li key={`not-${i}`} className="flex items-start gap-3 text-base text-slate-400 font-medium leading-tight">
                                                            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-slate-50">
                                                                <X className="w-3 h-3 text-slate-300" />
                                                            </div>
                                                            <span className="line-through">{f}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* 📑 Invoice Settings Section */}
            <section className="relative z-10">
                 <h2 className="text-xs font-black text-slate-400 underline decoration-slate-200 underline-offset-8 uppercase tracking-[0.4em] mb-8 ml-2">發票需求與設定 / Invoicing</h2>
                <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
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
            <section className="relative z-10">
                <div className="flex items-end justify-between mb-8 ml-2">
                     <h2 className="text-xs font-black text-slate-400 underline decoration-slate-200 underline-offset-8 uppercase tracking-[0.4em]">收費紀錄 / History</h2>
                    <button className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] hover:text-indigo-600 transition-all border-b border-indigo-100">所有帳務明細 View All</button>
                </div>
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    {planLevel > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">訂閱方案</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">日期</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">金額</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">狀態</th>
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

            {/* 🛡️ Modern SaaS Footer - Content-Relative Full Width */}
            <footer className="mt-32 relative group">
                {/* 50% 透明度的淺色玻璃背景 - 使用負邊距展開而非對螢幕定位 */}
                <div className="absolute -inset-x-10 md:-inset-x-20 inset-y-0 bg-white/50 backdrop-blur-2xl border-t border-slate-200/60 z-0" />
                
                {/* 裝飾性感應光暈 */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent z-10" />

                <div className="relative z-10 py-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 items-start">
                        {/* 1. 客服聯絡資訊 */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Support 聯繫專區</h3>
                            <div className="space-y-5">
                                <div className="group cursor-pointer">
                                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                        <Mail className="w-3 h-3" /> 官方客服信箱
                                    </p>
                                    <p className="text-slate-700 font-bold text-lg hover:text-indigo-600 transition-colors tracking-tight">info@ycideas.com</p>
                                </div>
                                <div className="pt-2">
                                    <div className="flex items-center gap-4 bg-white/40 p-3.5 rounded-[24px] border border-slate-200/50 shadow-sm hover:shadow-md hover:bg-white/60 transition-all cursor-pointer">
                                        <div className="w-12 h-12 rounded-2xl bg-[#06C755] flex items-center justify-center shadow-lg shadow-emerald-500/10">
                                            <MessageCircle className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400">LINE 官方服務</span>
                                            <span className="text-slate-800 font-black text-base">@967iypui</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. 付費方案說明 */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Plans 方案概覽</h3>
                            <div className="space-y-4">
                                <p className="text-sm font-bold text-slate-500 leading-relaxed">
                                    所有方案皆包含 <span className="text-indigo-600">YC Ideas</span> 基礎維護與 AI 模型對接服務。
                                </p>
                                <div className="space-y-3 pt-2">
                                    {[
                                        { label: '入門嚐鮮', price: '$199' },
                                        { label: '單店主力', price: '$499' },
                                        { label: '成長多店', price: '$1,299' },
                                        { label: '連鎖專業', price: '$2,490' },
                                        { label: '旗艦方案', price: '$4,990+' },
                                    ].map((p) => (
                                        <div key={p.label} className="flex justify-between items-center text-xs">
                                            <span className="text-slate-400 font-black">{p.label}</span>
                                            <span className="text-slate-800 font-bold font-mono">{p.price} / 月</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 3. 退款與政策 */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Policy 服務規範</h3>
                            <div className="space-y-5">
                                <div className="p-5 bg-rose-500/5 rounded-[28px] border border-rose-100/50">
                                    <p className="text-[11px] font-black text-rose-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5" /> 退款政策
                                    </p>
                                    <p className="text-xs font-bold text-rose-500/80 leading-relaxed">
                                        數位服務一經開通即無法退費。您可隨時取消次期續訂。
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 p-3 text-slate-400">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-[10px] font-bold">若有帳務異常請於 7 日內聯繫</span>
                                </div>
                            </div>
                        </div>

                        {/* 4. 營運單位 */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Company 品牌資訊</h3>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">© 2026 AI Intelligent Manager</p>
                                <h4 className="text-slate-800 font-black text-3xl tracking-tighter">YC Ideas</h4>
                                <p className="text-indigo-500 font-bold text-[11px] tracking-widest">奕暢創新工作室</p>
                                <div className="flex gap-2 mt-6">
                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-indigo-500 hover:text-white transition-all cursor-pointer shadow-sm">
                                        <Store className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-indigo-500 hover:text-white transition-all cursor-pointer shadow-sm">
                                        <Mail className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Utility Bar */}
                    <div className="mt-20 pt-10 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-4">
                            <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                Secured by <span className="text-slate-500">NEWEBPAY</span>
                            </span>
                            <div className="h-4 w-px bg-slate-200" />
                            <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                Encryption <span className="text-slate-500">256-BIT SSL</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-8">
                            {['Terms', 'Privacy', 'Security'].map((item) => (
                                <button key={item} className="text-[11px] font-black text-slate-600 hover:text-indigo-600 transition-all uppercase tracking-[0.2em] relative group">
                                    {item}
                                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
