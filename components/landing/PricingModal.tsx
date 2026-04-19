'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PricingPlan {
    id: string;
    name: string;
    price: string;
    originalPrice: string;
    period: string;
    description: string;
    annualTag?: string;
    features: string[];
    icon: React.ReactNode;
    color: string;
    popular?: boolean;
    badge?: string;
    storeCount?: number;
    monthlyQuota?: number;
    isStartingPrice?: boolean;
    newebpayLink?: string;
}

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    billingCycle: 'monthly' | 'yearly';
    setBillingCycle: (cycle: 'monthly' | 'yearly') => void;
    plans: PricingPlan[];
    onAction: () => void;
}

export default function PricingModal({
    isOpen,
    onClose,
    billingCycle,
    setBillingCycle,
    plans,
    onAction,
}: PricingModalProps) {
    // 分兩區：一般方案(前4) / 旗艦方案(後2)
    const generalPlans = plans.filter(p =>
        !p.id.startsWith('flagship')
    );
    const flagshipPlans = plans.filter(p =>
        p.id.startsWith('flagship')
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 150, damping: 18, mass: 0.9 }}
                        className="relative w-full max-w-6xl bg-[#0f172a]/60 border border-white/20 rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row backdrop-blur-2xl max-h-[95vh]"
                    >
                        {/* 關閉按鈕 */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white/40 hover:text-white/60 transition-all z-10"
                            aria-label="關閉視窗"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* 左側品牌欄 */}
                        <div className="hidden lg:flex w-64 shrink-0 bg-gradient-to-br from-[#06C755] via-[#05b34c] to-[#04903d] p-10 flex-col justify-between border-r border-white/10">
                            <div className="space-y-6">
                                <div className="w-14 h-14 relative">
                                    <Image src="/lai_logo_4.svg" alt="Logo" fill className="object-contain" />
                                </div>
                                <div className="w-72 h-72 relative -ml-12 -mb-8 animate-float hover-bobble transition-all cursor-pointer">
                                    <Image src="/bot_06.svg" alt="Bot" fill className="object-contain" />
                                </div>
                                <h2 className="text-3xl font-black text-white leading-tight">
                                    選一個適合<br />您的方案
                                </h2>
                                <p className="text-white/70 font-medium text-lg">
                                    先看您有幾間店，再看每月客人詢問量，就能找到最對的那格。
                                </p>
                            </div>
                            <div className="space-y-3">
                                {['24H 無間斷服務', '秒速回訊不漏接', '品牌個性自由設定', '隨時可升級方案'].map(t => (
                                    <div key={t} className="flex items-center gap-3 text-white">
                                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                            <Check className="w-3 h-3 text-[#06C755]" />
                                        </div>
                                        <span className="text-lg font-bold">{t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 右側內容 */}
                        <div className="flex-1 p-6 md:p-10 overflow-y-auto scrollbar-dark">
                            {/* 月付/年付切換 */}
                            <div className="flex justify-center mb-8">
                                <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/10">
                                    <button
                                        onClick={() => setBillingCycle('monthly')}
                                        className={cn(
                                            'px-6 py-2.5 rounded-xl text-lg font-black transition-all',
                                            billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-lg' : 'text-white/50 hover:text-white/70'
                                        )}
                                    >
                                        月付
                                    </button>
                                    <button
                                        onClick={() => setBillingCycle('yearly')}
                                        className={cn(
                                            'px-6 py-2.5 rounded-xl text-lg font-black transition-all relative',
                                            billingCycle === 'yearly' ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/50 hover:text-white/70'
                                        )}
                                    >
                                        年付（送 1 個月）
                                        {billingCycle !== 'yearly' && (
                                            <span className="absolute top-1 right-1 flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* ── 一般方案 2×2 ── */}
                            <p className="text-base font-black uppercase tracking-widest text-white/30 mb-4">一般方案</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                {generalPlans.map(plan => (
                                    <PlanCard key={plan.id} plan={plan} billingCycle={billingCycle} onAction={onAction} />
                                ))}
                            </div>

                            {/* ── 旗艦方案 ── */}
                            <p className="text-base font-black uppercase tracking-widest text-white/30 mb-4">旗艦高流量方案（優先技術支援）</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                {flagshipPlans.map(plan => (
                                    <PlanCard key={plan.id} plan={plan} billingCycle={billingCycle} onAction={onAction} flagship />
                                ))}
                            </div>

                            {/* 底部說明 */}
                             <div className="pt-6 border-t border-white/10 text-center space-y-3">
                                <p className="text-white/30 text-xs font-black uppercase tracking-widest">
                                    本平台交易由藍新金流提供 256-bit SSL 加密安全保護<br />
                                    服務由 <span className="text-white font-bold">YC Ideas 奕暢創新工作室</span> 提供運作
                                </p>
                                <div className="flex justify-center gap-6 text-sm font-black text-white/30 uppercase tracking-widest">
                                    <span>數位服務開通後恕不退款</span>
                                    <span className="w-1 h-1 rounded-full bg-white/10" />
                                    <span>客服：info@ycideas.com</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// ── 單一方案卡片元件 ──────────────────────────────────────────────────────
function PlanCard({ plan, billingCycle, onAction, flagship = false }: {
    plan: PricingPlan;
    billingCycle: 'monthly' | 'yearly';
    onAction: () => void;
    flagship?: boolean;
}) {
    return (
        <div 
            className={cn(
                'relative p-6 rounded-[24px] border-2 flex flex-col gap-4 bg-white/5 backdrop-blur-sm transition-all',
                plan.popular ? 'z-10 scale-[1.02]' : ''
            )}
            style={{ 
                borderColor: `${plan.color}40`,
                boxShadow: plan.popular ? `0 0 40px ${plan.color}15` : `0 0 20px ${plan.color}08`
            }}
        >
            {/* 推薦徽章 */}
            {plan.badge && (
                <div 
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-white text-[13px] font-black rounded-full uppercase tracking-widest shadow-lg whitespace-nowrap"
                    style={{ backgroundColor: plan.color }}
                >
                    {plan.badge}
                </div>
            )}

            {/* 標題 + 價格 */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 min-w-[40px] min-h-[40px]">{plan.icon}</div>
                    <div>
                        <h3 className="text-xl font-black text-white">{plan.name}</h3>
                        <p className="text-sm text-white/40 font-medium mt-0.5">{plan.description}</p>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <span className="text-white/30 line-through text-sm block">原價 {plan.originalPrice}</span>
                    <div className="flex items-baseline gap-0.5 justify-end">
                        <span className="text-white/50 text-sm font-bold">NT$</span>
                        <span className="text-4xl font-black" style={{ color: plan.color }}>
                            {Number(plan.price).toLocaleString()}
                        </span>
                        <span className="text-white/40 text-[15px] font-bold">{plan.period}</span>
                        {plan.isStartingPrice && <span className="text-white/30 text-[13px] font-black ml-0.5">起</span>}
                    </div>
                    {billingCycle === 'yearly' && (
                        <span className="text-emerald-400 text-[13px] font-black">送 1 個月</span>
                    )}
                </div>
            </div>

            {/* 規格標籤 */}
             <div className="flex flex-wrap gap-2">
                {plan.storeCount && plan.storeCount > 0 && (
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-sm font-black text-white/60">
                        🏪 最多 {plan.storeCount === -1 ? '無限' : plan.storeCount} 店
                    </span>
                )}
                {plan.monthlyQuota && plan.monthlyQuota > 0 && (
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-sm font-black text-white/60">
                        💬 {plan.monthlyQuota === -1 ? '無限' : plan.monthlyQuota.toLocaleString()} 則/月
                    </span>
                )}
            </div>

            <div className="h-px bg-white/10" />

            {/* 功能列表 */}
            <ul className="space-y-2 flex-1">
                {plan.features.slice(0, 6).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: plan.color }} />
                         <span className="text-[15px] text-white/75 font-bold leading-tight">{feature}</span>
                    </li>
                ))}
            </ul>

            {/* CTA 按鈕 */}
             <button
                onClick={onAction}
                className="w-full py-3 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 group text-white"
                style={{ 
                    backgroundColor: plan.color,
                    boxShadow: `0 8px 20px ${plan.color}30`
                }}
            >
                請用 LINE 登入
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}
