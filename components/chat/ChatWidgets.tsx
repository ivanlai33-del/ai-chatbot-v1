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
}

export const PricingWidget: React.FC<PricingWidgetProps> = ({ billingCycle, onToggleBilling, onSelectPlan }) => {
    const plans = [
        {
            name: '個人店長版',
            price: billingCycle === 'monthly' ? '499' : '4990',
            originalPrice: billingCycle === 'monthly' ? '999' : '9990',
            period: billingCycle === 'monthly' ? '/月' : '/年',
            tag: billingCycle === 'monthly' ? '前500名優惠' : '現省 1,000 元!',
            tagColor: 'text-red-500 bg-red-50',
            features: ['每月 5,000 則對話', '免 OpenAI API Key', '🤖 智慧文字客服', '🎯 產品/服務精準介紹', '🕒 24小時自動回訊', '🧬 品牌 DNA 個性設定'],
        },
        {
            name: '公司強力店長版',
            price: billingCycle === 'monthly' ? '1199' : '11000',
            originalPrice: null,
            period: billingCycle === 'monthly' ? '/月' : '/年',
            tag: billingCycle === 'monthly' ? '強力推薦' : '現省 2,988 元!',
            tagColor: 'text-amber-500 bg-amber-50',
            features: [
                '每月 20,000 則對話',
                '含個人店長版所有功能',
                '📢 主動廣播/精準開發',
                '📅 預約自動導流系統',
                '📁 PDF/網頁 深度學習 RAG',
                '📊 AI 商業洞察週報',
                'GPT-4o 旗艦級大腦',
            ],
            popular: true,
        },
        {
            name: '中小企業店長群規劃方案',
            price: '專人估價',
            desc: '多帳號部署 / 不限流量 / 多通路整合行銷',
            isRequirement: true
        }
    ];

    return (
        <div className="ml-14 max-w-[85%] space-y-4">
            <div className="flex p-1 bg-zinc-100/80 backdrop-blur-sm rounded-xl w-fit mx-auto shadow-inner">
                <button
                    onClick={() => onToggleBilling('monthly')}
                    className={cn(
                        "px-6 py-2 rounded-lg text-sm font-black transition-all",
                        billingCycle === 'monthly' ? "bg-[#06C755] text-white shadow-md" : "text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    月費制
                </button>
                <button
                    onClick={() => onToggleBilling('yearly')}
                    className={cn(
                        "px-6 py-2 rounded-lg text-sm font-black transition-all relative overflow-hidden",
                        billingCycle === 'yearly' ? "bg-[#06C755] text-white shadow-md" : "text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    年費更划算
                    {billingCycle !== 'yearly' && (
                        <motion.span 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute -top-1 -right-1 flex h-2 w-2"
                        >
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </motion.span>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {plans.map((p) => (
                    <button
                        key={p.name}
                        onClick={() => onSelectPlan(p.name, `${p.price}${p.period || ''}`)}
                        className={cn(
                            "p-5 rounded-2xl border-2 text-left transition-all active:scale-95 bg-white shadow-sm",
                            "border-zinc-100 hover:border-[#06C755] hover:shadow-xl hover:shadow-[#06C755]/40 hover:scale-[1.02]"
                        )}
                    >
                        <div className="flex justify-between items-center mb-1.5">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-[18px] text-zinc-800">{p.name}</span>
                                    {p.popular && (
                                        <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-full uppercase tracking-tighter shadow-sm">熱門推薦</span>
                                    )}
                                </div>
                                {p.tag && <span className={cn("text-[13px] font-bold px-1.5 py-0.5 mt-1 rounded-md w-fit", p.tagColor)}>{p.tag}</span>}
                            </div>
                            <div className="flex flex-col items-end justify-center">
                                {p.originalPrice && <span className="text-[11px] text-zinc-400 line-through font-medium -mb-1">原價 {p.originalPrice}</span>}
                                <div className="flex items-baseline gap-0.5">
                                    <span className="font-black text-[28px]" style={{ color: p.popular ? '#F59E0B' : LINE_GREEN }}>{p.price}</span>
                                    {p.period && <span className="text-sm font-bold text-zinc-400">{p.period}</span>}
                                </div>
                            </div>
                        </div>
                        {p.features && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {p.features.map((f, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-zinc-50 border border-zinc-100 rounded-md text-[12px] text-zinc-600 font-bold whitespace-nowrap">
                                        {f}
                                    </span>
                                ))}
                            </div>
                        )}
                    </button>
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
