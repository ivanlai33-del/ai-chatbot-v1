"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, ArrowLeft, Bot, CreditCard, ChevronRight, Globe, Layers, Sparkles, CheckCircle2, ArrowRight, BrainCircuit, Cpu, Network } from 'lucide-react';
import SaaSChatInterface from '@/components/SaaSChatInterface';
import SaaSLoginModal from '@/components/SaaSLoginModal';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
} as const;

export default function SaaSPage() {
    const router = useRouter();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);

    const handlePurchaseFlow = (plan: any) => {
        setSelectedPlan(plan);
        setIsLoginModalOpen(true);
    };

    const handleLoginSuccess = (plan: any) => {
        setIsLoginModalOpen(false);
        router.push(`/saas-partnership/dashboard/subscribe?plan=${plan.slots || 'enterprise'}`);
    };

    return (
        <main className="h-screen w-full bg-[#0f172a] flex flex-col md:flex-row overflow-hidden relative selection:bg-emerald-500/30">
            {/* Global Scrollbar Style */}
            <style jsx global>{`
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #475569;
                }
            `}</style>

            {/* Main Column: Vision, Features & Pricing */}
            <div className="flex-1 h-screen overflow-y-auto custom-scrollbar bg-[#0f172a] px-8 md:px-12 lg:px-20 pt-12 pb-24 relative">
                {/* Tech Theme Background Animations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
                    <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] -translate-y-1/2"></div>

                    {/* Floating Tech Icons (Overlapping & Large) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.08, scale: 1, y: [0, -40, 0], x: [0, 20, 0], rotate: [0, 5, 0] }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[5%] right-[10%] text-emerald-400"
                    >
                        <Bot className="w-80 h-80" strokeWidth={0.5} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, rotate: -15 }}
                        animate={{ opacity: 0.08, rotate: [-15, -5, -15], y: [0, 50, 0] }}
                        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute bottom-[10%] left-[5%] text-emerald-400"
                    >
                        <BrainCircuit className="w-96 h-96" strokeWidth={0.5} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.05, y: [0, -30, 0], x: [0, -30, 0], rotate: [0, -10, 0] }}
                        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                        className="absolute top-[30%] left-[20%] text-purple-400"
                    >
                        <Cpu className="w-72 h-72" strokeWidth={0.5} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.06, y: [0, 60, 0], x: [0, 40, 0], rotate: [0, 15, 0] }}
                        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute top-[40%] right-[30%] text-blue-400"
                    >
                        <Network className="w-[400px] h-[400px]" strokeWidth={0.5} />
                    </motion.div>

                    {/* Random Signal Flashes (Simulating Data Transfer) */}
                    <motion.div
                        animate={{ opacity: [0, 0.9, 0], scale: [0.5, 1.5, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "circIn" }}
                        className="absolute top-[35%] left-[28%] w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_20px_10px_rgba(52,211,153,0.6)]"
                    />
                    <motion.div
                        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 7, ease: "circIn" }}
                        className="absolute bottom-[35%] right-[35%] w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_15px_8px_rgba(52,211,153,0.6)]"
                    />
                    <motion.div
                        animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.2, 0.5] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 5.5, ease: "circIn" }}
                        className="absolute top-[60%] left-[15%] w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_18px_8px_rgba(192,132,252,0.6)]"
                    />
                    <motion.div
                        animate={{ opacity: [0, 0.9, 0], scale: [0.5, 1.6, 0.5] }}
                        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 6.2, ease: "circIn" }}
                        className="absolute top-[20%] right-[45%] w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_15px_8px_rgba(96,165,250,0.6)]"
                    />
                </div>

                <div className="max-w-5xl mx-auto space-y-20 relative z-10">
                    {/* Top Navigation */}
                    <div className="flex justify-between items-center">
                        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mr-4 group-hover:bg-emerald-600 group-hover:border-emerald-500 transition-all shadow-lg backdrop-blur-sm">
                                <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-white" />
                            </div>
                            <span className="text-sm font-bold tracking-wide">返回個人／公司版</span>
                        </Link>

                        <Link href="/saas-partnership/dashboard" className="px-5 py-2.5 bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full border border-slate-700/50 text-xs font-black transition-all flex items-center gap-2 group backdrop-blur-sm">
                            管理後臺登入
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Hero Section */}
                    <motion.div initial="hidden" animate="visible" variants={itemVariants} className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-8">
                            <Layers className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 font-bold text-[11px] uppercase tracking-[0.2em]">B2B API & Toolkit</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black mb-6 text-white tracking-tight leading-[1.15]">
                            為主機增添 AI 大腦<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">軟體開發商專屬代理人</span>
                        </h1>
                        <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-2xl">
                            專為 POS 系統商、CRM 平台與接案團隊打造的 API 批發方案。只需持有一組 Partner Token，即可一鍵賦予您的系統自動化 AI 應答與智能導購能力。
                        </p>
                    </motion.div>

                    {/* Technical Features Grid */}
                    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div variants={itemVariants} className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 hover:bg-slate-800/50 transition-colors">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                                <Zap className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-black text-white mb-3">Single API Key</h3>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                核發專屬 Partner Token，透過單一金鑰程式化管理旗下數百位商家的機器人席次，無須個別設定。
                            </p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 hover:bg-slate-800/50 transition-colors">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-black text-white mb-3">Tenant Isolation</h3>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                子帳號與加盟主的對話數據、銷售報表完全隔離，符合系統商開發合規標準，保障商家商業機密。
                            </p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 hover:bg-slate-800/50 transition-colors">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                                <Globe className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-black text-white mb-3">Webhook Ready</h3>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                即時雙向資料同步，輕鬆將 AI 收集到的客戶意圖與訂單狀態，推送回您現有的 CRM 或進銷存系統。
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Pricing Section */}
                    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="pt-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl font-black text-white">選擇授權規模</h2>
                                <p className="text-sm text-slate-400 mt-2 font-medium">專為開發者準備的定價級距。年付全方案享九折優惠，企業客製化請透過顧問安排。</p>
                            </div>
                            <div className="inline-flex items-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-black uppercase tracking-widest shrink-0">
                                ✨ 已含工程顧問支援
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    name: 'SaaS 試水溫', slots: 20, price: '5,500',
                                    desc: '適合小型接案團隊初期整合測試。',
                                    features: ['20 個終端機器人AI店長席位', '基礎 API 存取權限', '共用環境部署', '社群技術支援']
                                },
                                {
                                    name: '成長方案', slots: 50, price: '16,000', popular: true,
                                    desc: '主力推廣方案，包含產業模版庫同步配置。',
                                    features: ['50 個終端機器人AI店長席位', '無限制 API 調用額度', '專屬 Technical PM 支援', '全產業模板庫 One-Click Sync']
                                },
                                {
                                    name: '企業不限席位', price: '專案報價', slots: null,
                                    desc: '為百店以上的超大型系統商提供完整授權。',
                                    features: ['無限量機器人AI店長席位配置', '支援獨立地端部署 (On-Premise)', '完整白牌 (White-label) UI 授權', 'SLA 99.9% 級別企業保障']
                                }
                            ].map((p, idx) => (
                                <motion.div
                                    key={p.name}
                                    variants={itemVariants}
                                    className={`relative p-8 rounded-[2.5rem] border flex flex-col h-full overflow-hidden transition-all duration-300 ${p.popular ? 'bg-slate-800/80 border-emerald-500/50 shadow-[0_20px_60px_rgba(16,185,129,0.15)] scale-100 hover:scale-[1.02]' : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600'}`}
                                >
                                    {p.popular && (
                                        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 to-emerald-400"></div>
                                    )}
                                    <div className="mb-6">
                                        {p.popular && <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">推廣主力</span>}
                                        <h3 className="text-xl font-black text-white mb-2">{p.name}</h3>
                                        <p className="text-xs text-slate-400 leading-relaxed font-medium">{p.desc}</p>
                                    </div>

                                    <div className="mb-8">
                                        <div className="flex items-baseline gap-2">
                                            {p.price !== '專案報價' && <span className="text-[13px] font-black text-slate-500 uppercase">NT$</span>}
                                            <span className="text-4xl font-black text-white tracking-tight">{p.price}</span>
                                            {p.price !== '專案報價' && <span className="text-sm font-medium text-slate-500">/ mo</span>}
                                        </div>
                                    </div>

                                    <ul className="space-y-4 mb-10 flex-1">
                                        {p.features.map((f, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-300 leading-relaxed">
                                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                </div>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handlePurchaseFlow(p)}
                                        className={`w-full py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${p.popular ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-700/50 hover:bg-slate-700 text-slate-200'}`}
                                    >
                                        立即登入並開通授權
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="pt-12 pb-8 border-t border-slate-800/50 text-center">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] opacity-80">Securely processed by Global AI Network | Developer Enterprise Billing</p>
                    </div>
                </div>
            </div>

            {/* Right Column: AI Consultant Chat - Specialized Minimalist UI */}
            <div className="w-full md:w-[450px] h-screen border-l border-slate-800/50 shrink-0">
                <SaaSChatInterface pageContext="landing" />
            </div>

            {/* Login Modal Overlay */}
            <SaaSLoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                planDetails={selectedPlan}
                onSuccess={handleLoginSuccess}
            />
        </main>
    );
}
