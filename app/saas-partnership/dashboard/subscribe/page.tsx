"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Sidebar from '@/components/PartnerDashboard/Sidebar';
import SaaSChatInterface from '@/components/SaaSChatInterface';

// Modular Components
import SubscribePlanStep from '@/components/PartnerDashboard/Subscribe/SubscribePlanStep';
import SubscribeBrandStep from '@/components/PartnerDashboard/Subscribe/SubscribeBrandStep';
import SubscribePaymentStep from '@/components/PartnerDashboard/Subscribe/SubscribePaymentStep';
import SubscribeSuccessStep from '@/components/PartnerDashboard/Subscribe/SubscribeSuccessStep';

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
            description: 'SaaS 試水溫首選，為您的客戶添加基本 AI 自動化 management。',
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
                                    <SubscribePlanStep
                                        plans={plans}
                                        onPlanSelect={handlePlanSelect}
                                    />
                                )}

                                {currentStep === 1 && (
                                    <SubscribeBrandStep
                                        brandName={brandInfo.name}
                                        industry={brandInfo.industry}
                                        onBrandNameChange={(name) => setBrandInfo({ ...brandInfo, name })}
                                        onIndustryChange={(industry) => setBrandInfo({ ...brandInfo, industry })}
                                        onNext={() => setCurrentStep(2)}
                                        onFocus={setFocusedField}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                )}

                                {currentStep === 2 && (
                                    <SubscribePaymentStep
                                        planTitle={selectedPlan?.title}
                                        planPrice={selectedPlan?.price}
                                        onCheckout={handleCheckout}
                                        isSubmitting={isSubmitting}
                                    />
                                )}

                                {currentStep === 3 && (
                                    <SubscribeSuccessStep
                                        token={activationData?.token}
                                        onReturnToDashboard={() => window.location.href = '/saas-partnership/dashboard'}
                                    />
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
