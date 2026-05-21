"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, BrainCircuit, Globe, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const plans = [
        {
            name: 'Starter',
            id: 'starter',
            desc: '適合單店品牌、小型工作室或剛開始建立 LINE 營運流程的團隊。',
            monthlyPrice: '3,000',
            yearlyPrice: '32,400',
            cta: '立即開始',
            features: [
                '1 個品牌（Tenant）',
                '最多 3 個 LINE 官方帳號',
                '聯絡人資料中心',
                '基本表單與預約模組',
                '圖文選單 / Flex 基本配置',
                '基本自動化流程',
                '每月含 20,000 事件',
                '每月含 1,000 次流程執行',
                '每月含 500 次 AI 任務',
            ],
            color: 'slate'
        },
        {
            name: 'Pro',
            id: 'pro',
            desc: '適合多品牌工作室、中型連鎖品牌與需要跨店管理的營運團隊。',
            monthlyPrice: '9,000',
            yearlyPrice: '97,200',
            cta: '預約產品展示',
            featured: true,
            features: [
                '最多 5 個品牌（Tenant）',
                '每品牌最多 5 個 LINE 官方帳號',
                '聯絡人與事件資料中心',
                '表單、預約、活動、分眾模組',
                'BD / 商機管理',
                '進階流程引擎',
                '每月含 150,000 事件',
                '每月含 10,000 次流程執行',
                '每月含 5,000 次 AI 任務',
            ],
            color: 'emerald'
        },
        {
            name: 'Elite',
            id: 'elite',
            desc: '適合代理商、集團品牌與需要白牌化或獨立部署的大型客戶。',
            monthlyPrice: '25,000',
            yearlyPrice: '270,000',
            cta: '洽詢企業方案',
            priceSuffix: '起',
            features: [
                '10 個品牌起（可客製擴充）',
                'LINE OA 數量依合約彈性配置',
                '全模組開放 / API 深度整合',
                '白牌化品牌介面 (White Label)',
                '高階權限與組織管理',
                '自訂報表與審計紀錄',
                '每月含 1,000,000 事件',
                '每月含 100,000 流程執行',
                '每月含 20,000 AI 任務',
            ],
            color: 'blue'
        }
    ];

    return (
        <div className="min-h-screen bg-transparent py-24 px-6 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#06C755]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-20">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-black tracking-widest text-[#06C755] uppercase mb-6"
                    >
                        <Zap className="w-3 h-3" />
                        Pricing v2.0
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6"
                    >
                        適合單店到大型品牌的<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06C755] to-blue-600">
                            LINE 營運系統方案
                        </span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg font-medium max-w-3xl mx-auto leading-relaxed"
                    >
                        從 LINE 官方帳號入口、客戶資料、流程自動化到 AI 行銷加速，依品牌規模與使用量選擇最適合的方案。所有方案皆可隨業務成長升級。
                    </motion.p>

                    {/* Billing Toggle */}
                    <div className="mt-12 flex items-center justify-center gap-4">
                        <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>月費模式</span>
                        <button 
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                            className="w-14 h-8 bg-slate-200 rounded-full p-1 relative transition-colors"
                        >
                            <motion.div 
                                animate={{ x: billingCycle === 'monthly' ? 0 : 24 }}
                                className="w-6 h-6 bg-white rounded-full shadow-sm"
                            />
                        </button>
                        <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>
                            年費模式 <span className="text-[#06C755] text-xs font-black ml-1">省下 10%</span>
                        </span>
                    </div>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative bg-white/70 backdrop-blur-xl border ${plan.featured ? 'border-[#06C755] ring-1 ring-[#06C755]' : 'border-slate-100'} rounded-[2.5rem] p-8 md:p-10 flex flex-col group hover:shadow-2xl hover:shadow-slate-200/50 transition-all`}
                        >
                            {plan.featured && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#06C755] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl shadow-[#06C755]/30">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-slate-900 mb-4">{plan.name}</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed min-h-[48px]">
                                    {plan.desc}
                                </p>
                            </div>

                            <div className="mb-10">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-black text-slate-400">NT$</span>
                                    <span className="text-5xl font-black text-slate-900 tracking-tight">
                                        {billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                                    </span>
                                    <span className="text-sm font-black text-slate-400">
                                        {plan.priceSuffix} / {billingCycle === 'monthly' ? '月' : '年'}
                                    </span>
                                </div>
                                {billingCycle === 'monthly' && (
                                    <p className="mt-2 text-xs font-bold text-[#06C755]">年繳僅需 NT$ {plan.yearlyPrice}</p>
                                )}
                            </div>

                            <button className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all mb-10 ${plan.featured ? 'bg-[#06C755] text-white hover:bg-[#05A044] shadow-xl shadow-[#06C755]/20' : 'bg-white border-2 border-slate-200 text-slate-900 hover:border-[#06C755] hover:text-[#06C755]'}`}>
                                {plan.cta}
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            <div className="space-y-4 flex-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">包含功能</p>
                                {plan.features.map((feature, fIdx) => (
                                    <div key={fIdx} className="flex items-start gap-3">
                                        <div className="mt-1 w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                            <Check className="w-2.5 h-2.5 text-[#06C755]" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 leading-tight">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Add-ons Section - Light Glassmorphic Style */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="bg-white/40 backdrop-blur-3xl border border-white rounded-[3rem] p-8 md:p-16 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <BrainCircuit className="w-64 h-64 text-slate-900" />
                    </div>
                    
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center text-slate-900">
                        <div>
                            <h2 className="text-3xl font-black mb-6">彈性加購與企業擴充</h2>
                            <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                所有方案皆可依需求彈性加購用量或模組，支援 API / Webhook 深度整合與獨立部署需求。
                            </p>
                            <Link href="/contact" className="inline-flex items-center gap-2 text-[#06C755] font-black text-sm hover:gap-4 transition-all">
                                了解詳細加購方案 <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#06C755]">用量加購</h4>
                                <ul className="space-y-3 text-sm font-bold text-slate-700">
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 事件量擴充</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 流程執行次數</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> AI 任務次數</li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500">模組加購</h4>
                                <ul className="space-y-3 text-sm font-bold text-slate-700">
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> 預約/商機模組</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> 跨平台訂單整合</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> 白牌化/獨立部署</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
