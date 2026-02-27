"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Building2, BrainCircuit, CheckCircle2, MessageSquare, ArrowRight, Save, LayoutDashboard } from 'lucide-react';
import Sidebar from '@/components/PartnerDashboard/Sidebar';
import SaaSChatInterface from '@/components/SaaSChatInterface';

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
                                {/* STEP 0: Identity Setup */}
                                {currentStep === 0 && (
                                    <motion.div
                                        key="step-0"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">實體分店 / 品牌名稱</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                                <input
                                                    type="text"
                                                    placeholder="例如：Oasis Yoga 忠孝旗艦店"
                                                    value={botInfo.name}
                                                    onChange={(e) => setBotInfo({ ...botInfo, name: e.target.value })}
                                                    onFocus={() => setFocusedField('botName')}
                                                    onBlur={() => setFocusedField(null)}
                                                    className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2">這將會是顯示在終端消費者面前的 LINE 官方帳號名稱。</p>
                                        </div>

                                        <button
                                            onClick={handleNextStep}
                                            disabled={!botInfo.name}
                                            className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                                        >
                                            下一步：大腦設定 <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                )}

                                {/* STEP 1: Knowledge / Template Selection */}
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step-1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">套用產業範本 (Master Prompt)</label>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {templates.map(t => (
                                                    <div
                                                        key={t.id}
                                                        onClick={() => setBotInfo({ ...botInfo, industry: t.id, systemPrompt: t.prompt })}
                                                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${botInfo.industry === t.id ? 'bg-indigo-500/20 border-indigo-500' : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-500'}`}
                                                    >
                                                        <h4 className={`font-bold mb-1 ${botInfo.industry === t.id ? 'text-indigo-400' : 'text-slate-300'}`}>{t.name}</h4>
                                                        <p className="text-xs text-slate-500">{t.desc}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">微調機器人核心指令 (System Prompt)</label>
                                            <textarea
                                                rows={5}
                                                value={botInfo.systemPrompt}
                                                onChange={(e) => setBotInfo({ ...botInfo, systemPrompt: e.target.value })}
                                                onFocus={() => setFocusedField('systemPrompt')}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors custom-scrollbar"
                                                placeholder="請選擇範本或自行輸入指令..."
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setCurrentStep(0)}
                                                className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm transition-all"
                                            >
                                                上一步
                                            </button>
                                            <button
                                                onClick={handleNextStep}
                                                disabled={!botInfo.industry || !botInfo.systemPrompt}
                                                className="flex-1 md:flex-none px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                                            >
                                                下一步：佈署上線 <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 2: Deploy */}
                                {currentStep === 2 && (
                                    <motion.div
                                        key="step-2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="p-8 rounded-[2rem] border border-indigo-500/30 bg-indigo-500/5 text-center">
                                            <BrainCircuit className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
                                            <h2 className="text-2xl font-black text-white mb-2">準備好喚醒 {botInfo.name} 了嗎？</h2>
                                            <p className="text-slate-400 text-sm font-medium mb-8">
                                                點擊佈署後將扣除一個 Partner Slot，並即時寫入核心大腦資料至系統叢集。
                                            </p>

                                            <div className="flex justify-center gap-4">
                                                <button
                                                    onClick={() => setCurrentStep(1)}
                                                    className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm transition-all"
                                                >
                                                    返回修改
                                                </button>
                                                <button
                                                    onClick={handleDeploy}
                                                    disabled={isSubmitting}
                                                    className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                            佈署中...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="w-5 h-5" /> 正式上線
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 3: Live Preview */}
                                {currentStep === 3 && (
                                    <motion.div
                                        key="step-3"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-8"
                                    >
                                        <div className="p-10 rounded-[2.5rem] border border-emerald-500/30 bg-emerald-500/5 text-center relative overflow-hidden">
                                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
                                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                                                <CheckCircle2 className="w-10 h-10 text-emerald-400 outline-none" />
                                            </div>
                                            <h2 className="text-2xl font-black text-white mb-2 relative z-10">佈署完畢！大腦已啟動</h2>
                                            <p className="text-slate-400 text-sm font-medium mb-8 relative z-10">
                                                右側的對話視窗已經直接連線到 **{deploymentData?.name || botInfo.name}**。
                                                現在，您可以扮演顧客，直接在右邊測試聊天了！
                                            </p>

                                            <button
                                                onClick={() => window.location.href = '/saas-partnership/dashboard'}
                                                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 mx-auto relative z-10"
                                            >
                                                <LayoutDashboard className="w-4 h-4" /> 返回合作夥伴儀表板
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Panel: AI Consultant / Preview Identity Shift */}
                    <div className="hidden lg:block w-[400px] xl:w-[480px]">
                        <SaaSChatInterface
                            storeName={botInfo.name || "未命名店鋪"}
                            isMaster={false}
                            isSaaS={true} // Still keeping it as part of SaaS flow
                            focusedField={focusedField}
                            currentStep={currentStep}
                            isProvisioning={true} // New prop for API to know it's the provisioning flow
                            botKnowledge={currentStep === 3 ? (deploymentData || botInfo) : undefined} // Pass specific bot knowledge when live testing
                            pageContext="provision"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
