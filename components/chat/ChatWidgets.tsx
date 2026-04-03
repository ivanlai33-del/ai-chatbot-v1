"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Bot, RefreshCw, CreditCard, ChevronRight, Building2, Send, User, Key, Layout, Settings, ExternalLink, Sparkles, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LINE_GREEN } from '@/lib/chat-constants';
import { MockLineUI } from './OnboardingWizard';

interface PricingWidgetProps {
    billingCycle: 'monthly' | 'yearly';
    onToggleBilling: (cycle: 'monthly' | 'yearly') => void;
    onSelectPlan: (name: string, price: string) => void;
    lineUserId?: string | null;
    initiateLineLogin?: () => void;
}

export const PricingWidget: React.FC<PricingWidgetProps> = ({ billingCycle, onToggleBilling, onSelectPlan, lineUserId, initiateLineLogin }) => {
    const isLoggedIn = !!lineUserId;
    const plans = [
        {
            name: '個人店長版',
            price: billingCycle === 'monthly' ? '499' : '4990',
            originalPrice: billingCycle === 'monthly' ? '999' : '9990',
            period: billingCycle === 'monthly' ? '/月' : '/年',
            tag: billingCycle === 'monthly' ? '限時 5 折優惠' : '現省 1,000 元!',
            tagColor: 'text-emerald-500 bg-emerald-50',
            features: [
                '1 組 AI 店長正式上線服役',
                '每月 5,000 則智慧對話',
                '免 OpenAI API Key',
                '🤖 智慧文字客服',
                '🎯 產品/服務精準介紹',
                '🕒 24小時自動回訊',
                '🧬 品牌 DNA 個性設定'
            ],
            payUrl: billingCycle === 'monthly' ? 'https://p.ecpay.com.tw/A06FE6B' : 'https://p.ecpay.com.tw/723E398'
        },
        {
            name: '公司強力店長版',
            price: billingCycle === 'monthly' ? '1199' : '11000',
            originalPrice: billingCycle === 'monthly' ? '1999' : '19188',
            period: billingCycle === 'monthly' ? '/月' : '/年',
            tag: billingCycle === 'monthly' ? '強力推薦' : '現省 2,988 元!',
            tagColor: 'text-amber-500 bg-amber-50',
            popular: true,
            features: [
                '可串接 5 組 【LINE 官方帳號】 AI 店長',
                '每月 35,000 則對話 (共享額度)',
                '各 AI 店長專屬獨立智庫',
                '📁 支援 PDF、DOC 文件學習',
                '📜 每組店長限額 5 份知識文件',
                '🚀 GPT-4o 旗艦級 AI 大腦'
            ],
            payUrl: billingCycle === 'monthly' ? 'https://p.ecpay.com.tw/FFD88CA' : 'https://p.ecpay.com.tw/C1E8916'
        }
    ];

    return (
        <div className="ml-14 max-w-[85%] space-y-6">
            {/* 🗓️ Billing Cycle Switch */}
            <div className="flex p-1 bg-zinc-100/80 backdrop-blur-sm rounded-2xl w-fit mx-auto shadow-inner border border-white">
                <button
                    onClick={() => onToggleBilling('monthly')}
                    className={cn(
                        "px-8 py-2.5 rounded-[14px] text-sm font-black transition-all",
                        billingCycle === 'monthly' ? "bg-white text-zinc-800 shadow-md" : "text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    月費制
                </button>
                <button
                    onClick={() => onToggleBilling('yearly')}
                    className={cn(
                        "px-8 py-2.5 rounded-[14px] text-sm font-black transition-all relative overflow-hidden",
                        billingCycle === 'yearly' ? "bg-[#06C755] text-white shadow-md" : "text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    年費更划算
                    {billingCycle !== 'yearly' && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                    )}
                </button>
            </div>

            {/* 📋 Pricing Cards */}
            <div className="space-y-6">
                {plans.map((p) => (
                    <div
                        key={p.name}
                        className={cn(
                            "relative overflow-hidden bg-white rounded-[32px] border-2 transition-all p-8 flex flex-col",
                            p.popular ? "border-amber-400 shadow-2xl shadow-amber-100/50" : "border-zinc-100 shadow-xl"
                        )}
                    >
                        {p.popular && (
                            <div className="absolute top-0 right-0">
                                <div className="bg-gradient-to-l from-amber-500 to-amber-600 px-4 py-1.5 rounded-bl-2xl font-black text-[11px] text-white flex items-center gap-1.5 shadow-sm">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    建議方案
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-[20px] font-black text-slate-800">{p.name}</h3>
                            <p className="text-slate-400 text-[13px] font-bold mt-1">限時前 500 名：原價 ${p.originalPrice} 優惠中</p>
                        </div>

                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-[24px] font-black" style={{ color: p.popular ? '#F59E0B' : '#06C755' }}>NT$</span>
                            <span className="text-[48px] font-black leading-none tracking-tighter" style={{ color: p.popular ? '#F59E0B' : '#06C755' }}>
                                {p.price}
                            </span>
                            <span className="text-zinc-400 font-bold ml-1">{p.period}</span>
                            {p.originalPrice && <span className="text-zinc-300 line-through text-sm font-medium ml-2">${p.originalPrice}</span>}
                        </div>

                        <div className="space-y-4 mb-8 flex-1">
                            {p.features.map((f, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className={cn("mt-1 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center", p.popular ? "bg-amber-100 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
                                        <ChevronRight className="w-3 h-3 stroke-[3px]" />
                                    </div>
                                    <span className="text-[14px] text-slate-600 font-bold leading-tight">{f}</span>
                                </div>
                            ))}
                        </div>

                        {/* 🔐 登入狀態決定按鈕行為 */}
                        {!isLoggedIn ? (
                            // 未登入：先去 LINE 登入成為免費會員
                            <button
                                onClick={() => initiateLineLogin?.()}
                                className="w-full py-5 rounded-2xl font-black text-[17px] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 bg-[#06C755] text-white shadow-green-200"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
                                LINE 登入 · 先成為免費會員
                            </button>
                        ) : (
                            // 已登入：直接付費開通
                            <button
                                onClick={() => window.location.href = p.payUrl}
                                className={cn(
                                    "w-full py-5 rounded-2xl font-black text-[17px] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2",
                                    p.popular 
                                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-200" 
                                        : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-200"
                                )}
                            >
                                <CreditCard className="w-5 h-5" />
                                立即開通 AI 智能店長
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const CheckoutWidget: React.FC<{ selectedPlan: any, billingCycle: string, onPayment: () => void, lineGreen: string }> = ({ selectedPlan, billingCycle, onPayment, lineGreen }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="ml-14 bg-white p-8 rounded-3xl border border-zinc-100 shadow-2xl space-y-6 max-w-[85%]"
    >
        <div className="flex items-center gap-3 font-black text-[21px]" style={{ color: lineGreen }}>
            <CreditCard className="w-7 h-7" />
            <span>信用卡結帳</span>
        </div>
        <div className="space-y-4">
            <div className="bg-zinc-50 p-4 rounded-xl border-2 border-[#06C755] flex justify-between items-center mb-2 shadow-sm shadow-green-500/5">
                <span className="text-zinc-500 font-bold text-[16px]">已選方案</span>
                <div className="text-right">
                    <div className="font-black text-zinc-900 text-[21px]">{selectedPlan.name || '標準型'}</div>
                </div>
            </div>
            {/* Input fields... truncated for brevity but should include card fields */}
            <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full p-4 rounded-xl border-2 border-zinc-200 bg-zinc-50 text-[18.5px] outline-none" />
        </div>
        <button
            onClick={onPayment}
            className="w-full py-5 text-white rounded-2xl font-black text-[21px] shadow-lg"
            style={{ backgroundColor: lineGreen }}
        >
            立即付款 {selectedPlan.price}
        </button>
    </motion.div>
);

export const SuccessWidget: React.FC<{ botId: string, mgmtToken: string, isAdminView: boolean, onAdminLogin: () => void }> = ({ botId, mgmtToken, isAdminView, onAdminLogin }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="ml-14 bg-white p-8 rounded-[32px] border border-zinc-100 shadow-2xl space-y-6 max-w-[85%]"
    >
        <div className="flex items-center gap-3 font-black text-[21px] text-[#06C755]">
            <Sparkles className="w-7 h-7" />
            <span>恭喜！您的 AI 店長已待命</span>
        </div>
        <div className="bg-[#06C755] p-6 rounded-2xl border border-[#06C755] space-y-3 shadow-lg">
            <p className="text-[13.5px] font-black text-white uppercase tracking-widest text-center">您的專屬 Webhook 網址</p>
            <div className="bg-white p-4 rounded-xl text-center font-mono text-[14px] break-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/${botId}` : ''}
            </div>
        </div>
        {!isAdminView && (
            <button
                onClick={onAdminLogin}
                className="w-full py-4 text-white rounded-xl font-black text-[15px] shadow-lg"
                style={{ backgroundColor: LINE_GREEN }}
            >
                進入店長智庫 · 管理中心 ➔
            </button>
        )}
    </motion.div>
);

export const HubPreviewWidget: React.FC<{ onEnterHub: () => void }> = ({ onEnterHub }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="ml-14 relative group max-w-[85%]"
    >
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 rounded-[36px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
        <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-[32px] border border-emerald-100 shadow-2xl space-y-6">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                    <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h3 className="text-[20px] font-black text-slate-800 leading-tight">AI 店長靈魂已建構完成</h3>
                    <p className="text-[13px] text-slate-500 font-bold mt-1">品牌 DNA、行業知識、接待計畫已就緒</p>
                </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                <p className="text-[13px] text-slate-600 font-bold leading-relaxed">
                    ✨ 我已經為您預填好了專屬的品牌介紹與店長人設。<br/>
                    🚀 點擊下方按鈕進入 **「店長智庫」**，您可以馬上預覽成果，並微調我對客人的回話口吻！
                </p>
            </div>

            <button
                onClick={onEnterHub}
                className="w-full py-5 bg-gradient-to-r from-[#06C755] to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-black text-[19px] shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
                進入店長智庫預覽成果 ➔
            </button>
            <p className="text-[10px] text-center text-slate-400 font-bold tracking-widest uppercase">無需付費 · 立即預覽 AI 人設</p>
        </div>
    </motion.div>
);
