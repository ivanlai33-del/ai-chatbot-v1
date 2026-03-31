"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, CheckCircle2 } from 'lucide-react';
import Sidebar from '@/components/PartnerDashboard/Sidebar';
import SaaSChatInterface from '@/components/SaaSChatInterface';

// Modular Components
import ProvisionIdentityStep from '@/components/PartnerDashboard/Provision/ProvisionIdentityStep';
import ProvisionBrainStep from '@/components/PartnerDashboard/Provision/ProvisionBrainStep';
import ProvisionDeployStep from '@/components/PartnerDashboard/Provision/ProvisionDeployStep';
import ProvisionSuccessStep from '@/components/PartnerDashboard/Provision/ProvisionSuccessStep';

export default function ProvisionPage() {
    const [currentStep, setCurrentStep] = useState(0); // 0: Identity, 1: Knowledge/Personality, 2: Deploy, 3: Live Preview
    const [botInfo, setBotInfo] = useState({
        name: '',
        industry: '',
        systemPrompt: ''
    });
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deploymentData, setDeploymentData] = useState<any>(null);

    const templates = [
        { id: 'fitness', name: '健身瑜珈', desc: '強調健康、課程預約、體驗方案', prompt: '你是一個專業的瑜珈館客服，語氣溫柔寧靜，主要目標是吸引客人預約體驗課。' },
        { id: 'beauty', name: '美容美髮', desc: '強調設計師作品、保養建議、價格透明', prompt: '你是一個時尚的美髮沙龍顧問，語氣親切專業，熟悉各種髮型與護理推薦。' },
        { id: 'fnb', name: '餐飲零售', desc: '強調菜單特色、促銷活動、訂位引導', prompt: '你是一個熱情的餐廳外場經理，說話俐落大方，熟知今日特餐並能引導客人線上訂位。' }
    ];

    const handleNextStep = () => {
        if (currentStep < 2) setCurrentStep(currentStep + 1);
    };

    const handleDeploy = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/partner/provision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(botInfo)
            });
            const data = await res.json();

            if (data.success) {
                setDeploymentData(data.bot);
                setCurrentStep(3); // Go to live preview
            } else {
                console.error("Provisioning failed:", data.error);
                alert("建立失敗，請查看控制台！");
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
                    {/* Left Panel: Wizard Form */}
                    <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto custom-scrollbar">
                        <header className="mb-12">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black tracking-widest text-emerald-400 uppercase mb-4"
                            >
                                <BrainCircuit className="w-3 h-3" />
                                Customer Provisioning
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4"
                            >
                                佈署您的第一位<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">
                                    分身店長 (AI 店員)
                                </span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-slate-400 text-sm md:text-base font-medium max-w-xl leading-relaxed"
                            >
                                從您剛剛購買的AI店長席位中，快速開通一間實體門市的 AI 客服大腦。這個步驟將會扣除一個 Partner Slot。
                            </motion.p>
                        </header>

                        <div className="max-w-3xl">
                            {/* Visual Stepper */}
                            <div className="flex items-center gap-4 text-sm font-bold border-b border-slate-700/50 pb-6 mb-8 overflow-x-auto">
                                {[
                                    { step: 0, label: '店鋪身分' },
                                    { step: 1, label: '大腦設定' },
                                    { step: 2, label: '佈署上線' },
                                    { step: 3, label: '端點預覽' }
                                ].map((s, idx) => (
                                    <React.Fragment key={s.step}>
                                        <div className={`flex items-center gap-2 whitespace-nowrap ${currentStep === s.step ? 'text-indigo-400' : currentStep > s.step ? 'text-emerald-400' : 'text-slate-600'}`}>
                                            {currentStep > s.step ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep === s.step ? 'bg-indigo-500/20' : 'bg-slate-800'}`}>
                                                    {s.step + 1}
                                                </span>
                                            )}
                                            {s.label}
                                        </div>
                                        {idx < 3 && <div className={`w-8 h-px shrink-0 ${currentStep > s.step ? 'bg-emerald-500/50' : 'bg-slate-700'}`}></div>}
                                    </React.Fragment>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {currentStep === 0 && (
                                    <ProvisionIdentityStep
                                        name={botInfo.name}
                                        onNameChange={(name) => setBotInfo({ ...botInfo, name })}
                                        onNext={handleNextStep}
                                        onFocus={setFocusedField}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                )}

                                {currentStep === 1 && (
                                    <ProvisionBrainStep
                                        templates={templates}
                                        industry={botInfo.industry}
                                        systemPrompt={botInfo.systemPrompt}
                                        onTemplateSelect={(id, prompt) => setBotInfo({ ...botInfo, industry: id, systemPrompt: prompt })}
                                        onPromptChange={(prompt) => setBotInfo({ ...botInfo, systemPrompt: prompt })}
                                        onNext={handleNextStep}
                                        onBack={() => setCurrentStep(0)}
                                        onFocus={setFocusedField}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                )}

                                {currentStep === 2 && (
                                    <ProvisionDeployStep
                                        botName={botInfo.name}
                                        onDeploy={handleDeploy}
                                        onBack={() => setCurrentStep(1)}
                                        isSubmitting={isSubmitting}
                                    />
                                )}

                                {currentStep === 3 && (
                                    <ProvisionSuccessStep
                                        botName={deploymentData?.name || botInfo.name}
                                        onReturnToDashboard={() => window.location.href = '/saas-partnership/dashboard'}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Panel: AI Consultant / Preview Identity Shift */}
                    <div className="hidden lg:block w-[400px] xl:w-[480px]">
                        <SaaSChatInterface
                            storeName={botInfo.name || "未命名店鋪"}
                            isMaster={false}
                            isSaaS={true}
                            focusedField={focusedField}
                            currentStep={currentStep}
                            isProvisioning={true}
                            botKnowledge={currentStep === 3 ? (deploymentData || botInfo) : undefined}
                            pageContext="provision"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
