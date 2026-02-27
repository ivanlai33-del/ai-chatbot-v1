"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Building2, BrainCircuit, CreditCard, CheckCircle2, Copy, ArrowRight } from 'lucide-react';
import Sidebar from '@/components/PartnerDashboard/Sidebar';
import SaaSChatInterface from '@/components/SaaSChatInterface';

export default function SubscribePage() {
    const [currentStep, setCurrentStep] = useState(0); // 0: Select Plan, 1: Brand Info, 2: Payment, 3: Success
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [brandInfo, setBrandInfo] = useState({ name: '', industry: '' });
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activationData, setActivationData] = useState<any>(null);

    const plans = [
        {
            id: 'trial',
            name: '試水溫首選',
            title: '開通 20 個 AI店長席位',
            price: 'NT$ 5,500',
            description: 'SaaS 試水溫首選，為您的客戶添加基本 AI 自動化管理。',
            slots: 20
        },
        {
            id: 'growth',
            name: '成長方案 50 AI店長席位',
            title: '開通 50 個 AI店長席位',
            price: 'NT$ 16,000',
            description: '含產業板模同步，最受中型 SaaS 平台青睞的超值方案。',
            slots: 50,
            recommended: true
        },
        {
            id: 'enterprise',
            name: '企業不限AI店長席位',
            title: '不限AI店長席位授權',
            price: 'NT$ 專案報價',
            description: '完整白牌授權，最高規格的技術轉移與客製化支援。',
            slots: 9999
        }
    ];

    const handlePlanSelect = (plan: any) => {
        setSelectedPlan(plan);
        setCurrentStep(1);
    };

    const handleCheckout = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/partner/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: selectedPlan.id,
                    slots: selectedPlan.slots,
                    brandInfo
                })
            });
            const data = await res.json();
            if (data.success) {
                setActivationData({
                    token: data.token,
                    slots: data.slots
                });
                setCurrentStep(3);
            } else {
                console.error("Subscription failed:", data.error);
                alert("Subscription failed. Please check console.");
            }
        } catch (err) {
            console.error("Network error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col md:flex-row overflow-hidden selection:bg-indigo-500/30">
            <Sidebar />

            <main className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">
                <div className="flex h-full">
                    <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto custom-scrollbar">
                        <header className="mb-12">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black tracking-widest text-indigo-400 uppercase mb-4"
                            >
                                <Sparkles className="w-3 h-3" />
                                Activation Flow
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4"
                            >
                                開通企業專屬 AI 店長<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                                    規模化導入方案
                                </span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-slate-400 text-sm md:text-base font-medium max-w-xl leading-relaxed"
                            >
                                請填寫以下導入表單，我們的 AI 店長專家將為您的品牌生成專屬的產業自動化模組。
                            </motion.p>
                        </header>

                        <div className="max-w-3xl">
                            <AnimatePresence mode="wait">
                                {currentStep === 0 && (
                                    <motion.div
                                        key="step-0"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-black text-slate-300">選擇定價計畫</h2>
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                                                年付九折優惠
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6">
                                            {plans.map((plan) => (
                                                <div
                                                    key={plan.id}
                                                    onClick={() => handlePlanSelect(plan)}
                                                    className={`relative p-8 rounded-[2rem] border ${plan.recommended ? 'border-indigo-500' : 'border-slate-700/50'} bg-slate-800/20 hover:bg-slate-800/40 transition-all cursor-pointer group`}
                                                >
                                                    {plan.recommended && (
                                                        <div className="absolute -top-3 right-8 px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-500/30">
                                                            最受歡迎
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h3 className="text-xl font-black text-white mb-1 group-hover:text-indigo-400 transition-colors">{plan.title}</h3>
                                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{plan.name}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-black text-white">{plan.price}</div>
                                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">/ 月</div>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-slate-400 font-medium">{plan.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {currentStep === 1 && (
                                    <motion.div
                                        key="step-1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-10"
                                    >
                                        <div className="flex items-center gap-4 text-sm font-bold border-b border-slate-700/50 pb-6">
                                            <div className="flex items-center gap-2 text-indigo-400">
                                                <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">1</span>
                                                品牌基本資料
                                            </div>
                                            <div className="w-12 h-px bg-slate-700"></div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">2</span>
                                                支付與開通
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">夥伴/廠商名稱</label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                                    <input
                                                        type="text"
                                                        placeholder="例如：瑜珈大師系統"
                                                        value={brandInfo.name}
                                                        onChange={(e) => setBrandInfo({ ...brandInfo, name: e.target.value })}
                                                        onFocus={() => setFocusedField('brandName')}
                                                        onBlur={() => setFocusedField(null)}
                                                        className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">產業別</label>
                                                <select
                                                    value={brandInfo.industry}
                                                    onChange={(e) => setBrandInfo({ ...brandInfo, industry: e.target.value })}
                                                    onFocus={() => setFocusedField('industry')}
                                                    onBlur={() => setFocusedField(null)}
                                                    className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl py-4 px-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors appearance-none"
                                                >
                                                    <option value="" disabled>請選擇產業</option>
                                                    <option value="beauty">美容美髮 (Beauty & Salon)</option>
                                                    <option value="fitness">健身瑜珈 (Fitness & Yoga)</option>
                                                    <option value="fnb">餐飲零售 (F&B & Retail)</option>
                                                    <option value="education">補教教育 (Education)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="pt-6">
                                            <button
                                                onClick={() => setCurrentStep(2)}
                                                disabled={!brandInfo.name || !brandInfo.industry}
                                                className="w-full md:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/30"
                                            >
                                                下一步：結帳開通
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {currentStep === 2 && (
                                    <motion.div
                                        key="step-2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-10"
                                    >
                                        <div className="flex items-center gap-4 text-sm font-bold border-b border-slate-700/50 pb-6">
                                            <div className="flex items-center gap-2 text-emerald-400">
                                                <CheckCircle2 className="w-6 h-6" />
                                                品牌基本資料
                                            </div>
                                            <div className="w-12 h-px bg-slate-700"></div>
                                            <div className="flex items-center gap-2 text-indigo-400">
                                                <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">2</span>
                                                支付與開通
                                            </div>
                                        </div>

                                        <div className="p-8 rounded-[2rem] border border-indigo-500/30 bg-indigo-500/5 flex flex-col md:flex-row justify-between items-center gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
                                                    <CreditCard className="w-6 h-6 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">已選擇：{selectedPlan?.title}</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <h3 className="text-3xl font-black text-white">{selectedPlan?.price}</h3>
                                                        <span className="text-sm text-slate-500">/ mo</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleCheckout}
                                                disabled={isSubmitting}
                                                className="w-full md:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                        處理中...
                                                    </>
                                                ) : '立即付款開通'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {currentStep === 3 && (
                                    <motion.div
                                        key="step-3"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-8"
                                    >
                                        <div className="p-10 rounded-[2.5rem] border border-emerald-500/30 bg-emerald-500/5 text-center">
                                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <CheckCircle2 className="w-10 h-10 text-emerald-400 outline-none" />
                                            </div>
                                            <h2 className="text-2xl font-black text-white mb-2">開通成功！歡迎加入生態系</h2>
                                            <p className="text-slate-400 text-sm font-medium mb-8">
                                                系統已為您核發專屬的 Partner Token，請交由您的工程團隊進行 API 串接。
                                            </p>

                                            <div className="max-w-md mx-auto relative group">
                                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 rounded-2xl blur-xl transition-all group-hover:blur-2xl" />
                                                <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
                                                    <code className="text-sm font-mono text-emerald-300 truncate pr-4">
                                                        {activationData?.token}
                                                    </code>
                                                    <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-3 text-center mb-6">Your High-Privilege Partner Token</p>

                                                <button
                                                    onClick={() => window.location.href = '/saas-partnership/dashboard'}
                                                    className="w-full mt-4 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 group"
                                                >
                                                    進入總部管理後台
                                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="hidden lg:block w-[400px] xl:w-[480px]">
                        <SaaSChatInterface
                            storeName={brandInfo.name || "未命名品牌"}
                            isMaster={false}
                            isSaaS={true}
                            focusedField={focusedField}
                            currentStep={currentStep}
                            isActivation={true}
                            pageContext="subscribe"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
