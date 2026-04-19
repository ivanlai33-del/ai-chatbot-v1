'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Star, Zap } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/config/pricing';

export default function PricingComparison() {
    const plans = [
        PRICING_PLANS.free,
        PRICING_PLANS.starter,
        PRICING_PLANS.solo,
        PRICING_PLANS.growth,
        PRICING_PLANS.chain,
        PRICING_PLANS.flagship_lite
    ];

    return (
        <section id="pricing-plans" className="py-24 px-6 relative z-10 overflow-hidden bg-slate-900/40 backdrop-blur-xl border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <motion.div 
                    initial={{ opacity: 1 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                        選擇適合您的 <span className="text-emerald-400">成長方案</span>
                    </h2>
                    <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">
                        不論是一人品牌還是連鎖多店，我們都為您準備了最合適的服務級別。
                    </p>
                    <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-black uppercase tracking-widest animate-pulse">
                        <Flame className="w-4 h-4" /> 年費方案 買 11 個月送 1 個月
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((p, i) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 1, scale: 1 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative p-6 md:p-8 rounded-[40px] bg-white/10 border ${p.id === 'solo' ? 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'border-white/20'} backdrop-blur-xl hover:border-white/40 transition-all flex flex-col shadow-2xl`}
                        >
                            {p.id === 'solo' && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase flex items-center gap-1 shadow-lg">
                                    <Star className="w-3 h-3 fill-white" /> 目前 60% 用戶選擇
                                </div>
                            )}

                            <div className="mb-8">
                                <div className="text-4xl mb-4">{p.emoji}</div>
                                <h3 className="text-2xl font-black text-white mb-2">{p.name}</h3>
                                <p className="text-slate-500 text-sm font-medium h-10">{p.tagline}</p>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-white text-4xl font-black">NT${p.pricing.monthly.toLocaleString()}</span>
                                    {p.pricing.isStartingPrice && <span className="text-emerald-400 text-lg font-black ml-1">起</span>}
                                    <span className="text-slate-500 text-sm">/月</span>
                                </div>
                                <div className="text-slate-600 text-[11px] font-black uppercase tracking-widest mt-2">{p.monthlyInquiryRange}</div>
                            </div>

                            <div className="flex-1 space-y-4 mb-8">
                                {p?.features?.slice(0, 5).map((f, fi) => (
                                    <div key={fi} className="flex items-start gap-3">
                                        <div className="p-0.5 rounded-full bg-emerald-500/20 mt-1 backdrop-blur-md">
                                            <Check className="w-3 h-3 text-emerald-500" />
                                        </div>
                                        <span className="text-slate-300 text-sm font-medium leading-tight">{f}</span>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => window.location.href = '/api/auth/line'}
                                className={`w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-95 ${p.id === 'solo' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white text-slate-900 shadow-lg'}`}
                            >
                                {p.pricing.monthly === 0 ? '免費開始' : '立即訂閱'}
                            </button>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-slate-500 text-sm font-medium mb-6 italic opacity-70">
                        「我們不只提供軟體，更提供讓您省時省力的數位轉型方案。」
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
                        <span className="text-white font-black tracking-widest uppercase text-sm">Safe Payment</span>
                        <div className="h-6 w-px bg-white/20" />
                        <span className="text-white font-black tracking-widest uppercase text-sm">SSL Secured</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
