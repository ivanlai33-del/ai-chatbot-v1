'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Crown, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PricingPlan {
    name: string;
    price: string;
    originalPrice: string;
    period: string;
    description: string;
    features: string[];
    icon: React.ReactNode;
    color: string;
    popular?: boolean;
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
    onAction 
}: PricingModalProps) {
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
                        transition={{ 
                            type: 'spring',
                            stiffness: 150,
                            damping: 18,
                            mass: 0.9
                        }}
                        className="relative w-full max-w-5xl bg-[#0f172a]/60 border border-white/20 rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row backdrop-blur-2xl"
                    >
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white/40 hover:text-white/60 transition-all z-10"
                            aria-label="關閉視窗"
                            title="關閉視窗"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="hidden lg:flex w-1/3 bg-gradient-to-br from-[#06C755] via-[#05b34c] to-[#04903d] p-12 flex-col justify-between border-r border-white/10">
                            <div className="space-y-6">
                                <div className="w-16 h-16 relative">
                                    <Image
                                        src="/Lai Logo_4.svg"
                                        alt="Lai Logo"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <h2 className="text-3xl font-black text-white leading-tight">
                                    啟動您的<br />AI 自動化時代
                                </h2>
                                <p className="text-white/70 font-medium">
                                    不管是個人工作室或是連鎖品牌，我們都有最適合您的 AI 店長方案。
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-white">
                                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <Check className="w-3 h-3 text-[#06C755]" />
                                    </div>
                                    <span className="text-sm font-bold">24 小時無間斷服務</span>
                                </div>
                                <div className="flex items-center gap-3 text-white">
                                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <Check className="w-3 h-3 text-[#06C755]" />
                                    </div>
                                    <span className="text-sm font-bold">秒速回訊毫不延遲</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
                            <div className="flex flex-col items-center gap-8">
                                <div className="flex p-1.5 bg-white/5 rounded-2xl w-fit border border-white/10">
                                    <button
                                        onClick={() => setBillingCycle('monthly')}
                                        className={cn(
                                            "px-8 py-3 rounded-xl text-sm font-black transition-all",
                                            billingCycle === 'monthly' ? "bg-white text-slate-900 shadow-lg" : "text-white/44 hover:text-white/60"
                                        )}
                                    >
                                        月費方案
                                    </button>
                                    <button
                                        onClick={() => setBillingCycle('yearly')}
                                        className={cn(
                                            "px-8 py-3 rounded-xl text-sm font-black transition-all relative overflow-hidden",
                                            billingCycle === 'yearly' ? "bg-emerald-500 text-white shadow-lg" : "text-white/44 hover:text-white/60"
                                        )}
                                    >
                                        年費更划算
                                        {billingCycle !== 'yearly' && (
                                            <span className="absolute top-1 right-1 flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                            </span>
                                        )}
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 w-full">
                                    {plans.map((plan) => (
                                        <div 
                                            key={plan.name}
                                            className={cn(
                                                "relative p-8 rounded-[32px] border-2 transition-all flex flex-col gap-6 bg-white/5 backdrop-blur-sm",
                                                plan.popular ? "border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.15)] bg-amber-500/5" : "border-white/10"
                                            )}
                                        >
                                            {plan.popular && (
                                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-amber-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">
                                                    強力熱門推薦
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                                    {plan.icon}
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-white/30 line-through text-xs block">原價 {plan.originalPrice}</span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className={cn(
                                                            "text-3xl font-black",
                                                            plan.popular ? "text-amber-400" : "text-emerald-400"
                                                        )}>$ {plan.price}</span>
                                                        <span className="text-white/40 text-sm font-bold">{plan.period}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h-px bg-white/10" />
                                            <ul className="space-y-3 flex-1">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-start gap-3">
                                                        <Check className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                                                        <span className="text-sm text-white/80 font-bold leading-tight">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <button 
                                                onClick={onAction}
                                                className={cn(
                                                    "w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 group",
                                                    plan.popular 
                                                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-[0_10px_20px_rgba(245,158,11,0.25)]" 
                                                        : "bg-[#06C755] text-white hover:bg-[#05b34c] shadow-[0_10px_20px_rgba(6,199,85,0.2)]"
                                                )}
                                            >
                                                請用 Line 登入
                                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-8 border-t border-white/10 w-full text-center space-y-4">
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed max-w-md mx-auto">
                                        本平台交易由藍新金流提供 256-bit SSL 加密安全保護<br/>
                                        服務由 <span className="text-white font-bold underline decoration-emerald-500/50">YC Ideas 奕暢創新工作室</span> 提供運作
                                    </p>
                                    <div className="flex justify-center gap-6 text-[10px] font-black text-white/30 uppercase tracking-widest">
                                        <span>數位服務開通後恕不退款</span>
                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                        <span>客服信箱：info@ycideas.com</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
