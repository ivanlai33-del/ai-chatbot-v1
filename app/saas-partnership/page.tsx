"use client";

import React from 'react';
import Link from 'next/link';
import { 
    ArrowLeft, ChevronRight, Zap, 
    ShieldCheck, Globe, Database, 
    Sparkles, CheckCircle2, MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function SaasPartnershipLanding() {
    const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);

    const handleCheckout = async (planId: string, cycle: 'monthly' | 'yearly' = 'monthly') => {
        setLoadingPlan(planId);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = `/saas-partnership/login?redirect=/saas-partnership&plan=${planId}`;
                return;
            }

            const res = await fetch('/api/payment/checkout', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ planId, cycle, isPartner: true })
            });

            const { data, error } = await res.json();
            if (error) throw new Error(error);

            // Create hidden form to submit to NewebPay
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = data.TargetUrl;

            const fields = {
                MerchantID: data.MerchantID,
                TradeInfo: data.TradeInfo,
                TradeSha: data.TradeSha,
                Version: data.Version,
            };

            for (const [key, value] of Object.entries(fields)) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value as string;
                form.appendChild(input);
            }

            document.body.appendChild(form);
            form.submit();
        } catch (err) {
            console.error('Checkout failed:', err);
            alert('支付初始化失敗，請稍後再試');
        } finally {
            setLoadingPlan(null);
        }
    };
    const textMain = 'rgba(0, 0, 0, 0.85)';
    const textSub = 'rgba(0, 0, 0, 0.7)';

    return (
        <div className="min-h-screen w-full flex flex-col items-center">
            {/* Main Content Wrapper */}
            <div className="w-full max-w-[1400px] px-8 md:px-16 py-12 relative z-10">
                
                {/* Navbar */}
                <nav className="flex justify-between items-center mb-24">
                    <Link href="/" className="flex items-center gap-3 px-6 py-3 bg-white/40 hover:bg-white/60 rounded-2xl border border-white/60 transition-all group backdrop-blur-md">
                        <ArrowLeft className="w-4 h-4 text-[#06C755] group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black" style={{ color: textMain }}>返回個人 / 公司版</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/saas-partnership/pricing" className="px-6 py-3 text-xs font-black text-slate-600 hover:text-[#06C755] transition-all">
                            批發方案
                        </Link>
                        <Link href="/saas-partnership/login" className="px-8 py-3 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-2xl font-black text-xs shadow-lg shadow-[#06C755]/20 hover:scale-[1.02] transition-all flex items-center gap-2">
                            合作夥伴登入 <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="max-w-4xl mb-32">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#06C755]/10 border border-[#06C755]/20 rounded-full mb-8"
                    >
                        <Zap className="w-4 h-4 text-[#06C755]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#06C755]">B2B API & Toolkit</span>
                    </motion.div>
                    
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] mb-8" style={{ color: textMain }}>
                        為主機增添 <span className="bg-gradient-to-br from-[#06C755] to-[#05A044] bg-clip-text text-transparent">AI 大腦</span><br />
                        軟體開發商專屬代理人
                    </h1>
                    
                    <p className="text-xl font-medium leading-relaxed max-w-2xl" style={{ color: textSub }}>
                        專為 POS 系統商、CRM 平台與接案團隊打造的 API 批發方案。只需要一組 Partner Token，即可一鍵賦予您的系統自動化 AI 應答與智能導購能力。
                    </p>
                </div>

                {/* Core Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    {[
                        { title: 'Single API Key', desc: '核發專屬 Partner Token，透過單一金鑰程式化管理旗下數百位商家的機器人席次。', icon: Zap },
                        { title: 'Tenant Isolation', desc: '子帳號與加盟主的對話數據、銷售報表完全隔離，符合系統商開發合規標準。', icon: ShieldCheck },
                        { title: 'Webhook Ready', desc: '即時雙向資料同步，輕鬆將 AI 收集到的客戶意圖與訂單狀態，推送回您現有的系統。', icon: Globe },
                    ].map((feature, i) => (
                        <div key={i} className="bg-white/50 backdrop-blur-3xl border border-white/60 p-10 rounded-[3rem] shadow-xl hover:border-[#06C755]/30 transition-all group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-all border border-black/5">
                                <feature.icon className="w-7 h-7 text-[#06C755]" />
                            </div>
                            <h3 className="text-xl font-black mb-4" style={{ color: textMain }}>{feature.title}</h3>
                            <p className="text-xs leading-relaxed font-medium" style={{ color: textSub }}>{feature.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Pricing Section - Embedded */}
                <div className="mt-32 mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-6" style={{ color: textMain }}>適合各種規模的授權方案</h2>
                        <p className="text-lg font-medium max-w-2xl mx-auto" style={{ color: textSub }}>
                            從單店到跨國集團，選擇最適合您的 API 授權模式。所有方案皆可隨業務成長彈性升級。
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Starter',
                                desc: '適合單店品牌、小型工作室。',
                                price: '3,000',
                                yearly: '32,400',
                                features: ['1 個品牌 (Tenant)', '3 個 LINE 官方帳號', '20,000 事件量 /月', '500 次 AI 任務 /月'],
                            },
                            {
                                name: 'Pro',
                                desc: '適合連鎖品牌與中型團隊。',
                                price: '9,000',
                                yearly: '97,200',
                                featured: true,
                                features: ['5 個品牌 (Tenant)', '25 個 LINE 官方帳號', '150,000 事件量 /月', '5,000 次 AI 任務 /月', '跨品牌數據中心'],
                            },
                            {
                                name: 'Elite',
                                desc: '適合代理商與大型集團。',
                                price: '25,000',
                                yearly: '270,000',
                                priceSuffix: '起',
                                features: ['10+ 品牌 (可擴充)', 'LINE OA 數量彈性配置', '1M+ 事件量 /月', '20,000 次 AI 任務 /月', '白牌化 / 獨立部署'],
                            }
                        ].map((plan, idx) => (
                            <div key={idx} className={`bg-white/40 backdrop-blur-3xl border ${plan.featured ? 'border-[#06C755] ring-1 ring-[#06C755]' : 'border-white'} p-10 rounded-[3rem] shadow-xl relative flex flex-col`}>
                                {plan.featured && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#06C755] text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">Most Popular</div>}
                                <h3 className="text-2xl font-black mb-2" style={{ color: textMain }}>{plan.name}</h3>
                                <p className="text-xs font-medium mb-8" style={{ color: textSub }}>{plan.desc}</p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-sm font-black text-slate-400">NT$</span>
                                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                                    <span className="text-xs font-bold text-slate-400">{plan.priceSuffix} /月</span>
                                </div>
                                <ul className="space-y-4 mb-10 flex-1">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                            <CheckCircle2 className="w-4 h-4 text-[#06C755]" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <button 
                                    onClick={() => handleCheckout(plan.name.toLowerCase())}
                                    disabled={loadingPlan !== null}
                                    className={`w-full py-4 rounded-2xl font-black text-sm text-center transition-all ${plan.featured ? 'bg-[#06C755] text-white shadow-lg shadow-[#06C755]/20' : 'bg-white border border-slate-100 text-slate-900 hover:bg-slate-50'}`}
                                >
                                    {loadingPlan === plan.name.toLowerCase() ? '處理中...' : '立即開始'}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add-ons brief */}
                    <div className="mt-12 p-8 bg-white/20 border border-white/40 rounded-[2.5rem] flex flex-wrap items-center justify-between gap-6 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <Sparkles className="w-6 h-6 text-[#06C755]" />
                            <p className="text-sm font-bold text-slate-700">需要更多配額或專屬部署？我們提供彈性的加購模組與 API 深度整合服務。</p>
                        </div>
                        <Link href="/saas-partnership/pricing" className="text-sm font-black text-[#06C755] hover:underline flex items-center gap-2">
                            完整方案詳情 <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Footer Section */}
                <footer className="mt-32 pt-12 border-t border-black/5 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(0,0,0,0.4)' }}>
                    <span>Official B2B Portal</span>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-[#06C755] transition-all">Documentation</Link>
                        <Link href="#" className="hover:text-[#06C755] transition-all">Privacy Policy</Link>
                        <Link href="#" className="hover:text-[#06C755] transition-all">Terms of Service</Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}
