'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wallet, CreditCard, Sparkles, PlusCircle, ArrowUpRight, ArrowDownRight, 
    ShieldCheck, Zap, RefreshCw, CheckCircle2, AlertCircle, FileText, Check
} from 'lucide-react';

interface StoreWalletSectionProps {
    ownerLineId?: string | null;
}

export default function StoreWalletSection({ ownerLineId }: StoreWalletSectionProps) {
    const [balanceCredits, setBalanceCredits] = useState<number>(0);
    const [totalEarned, setTotalEarned] = useState<number>(0);
    const [totalSpent, setTotalSpent] = useState<number>(0);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<number>(5000);
    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const topUpPackages = [
        { amount: 1000, bonus: 50, label: '基礎儲值 (送50點)', tag: '適合試水溫' },
        { amount: 3000, bonus: 300, label: '超值儲值 (送300點)', tag: '熱門選擇 ⭐' },
        { amount: 5000, bonus: 750, label: '大小月爆量保險套裝 (送750點)', tag: '大小月店家首選 🔥' },
    ];

    useEffect(() => {
        const getCookie = (name: string) => {
            const match = typeof document !== 'undefined' ? document.cookie.split('; ').find(r => r.startsWith(name + '=')) : null;
            return match ? decodeURIComponent(match.split('=')[1]) : '';
        };

        const uid = ownerLineId || localStorage.getItem('line_user_id') || getCookie('line_user_id') || 'Ud8b8dd79162387a80b2b5a4aba20f604';
        fetchWalletData(uid);
    }, [ownerLineId]);

    const fetchWalletData = async (targetId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/wallet/${targetId}`);
            const data = await res.json();
            if (data.success) {
                setBalanceCredits(data.balanceCredits || 0);
                setTotalEarned(data.totalEarned || 0);
                setTotalSpent(data.totalSpent || 0);
                setTransactions(data.transactions || []);
            }
        } catch (err) {
            console.error('[Wallet Fetch Error]', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTopUpSubmit = async (pkg: typeof topUpPackages[0]) => {
        setProcessing(true);
        const getCookie = (name: string) => {
            const match = typeof document !== 'undefined' ? document.cookie.split('; ').find(r => r.startsWith(name + '=')) : null;
            return match ? decodeURIComponent(match.split('=')[1]) : '';
        };
        const uid = ownerLineId || localStorage.getItem('line_user_id') || getCookie('line_user_id') || 'Ud8b8dd79162387a80b2b5a4aba20f604';

        try {
            const res = await fetch(`/api/wallet/${uid}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: pkg.amount,
                    bonusCredits: pkg.bonus,
                    description: `儲值 ${pkg.label}`
                })
            });

            const data = await res.json();
            if (data.success) {
                setSuccessMessage(`🎉 成功儲值 $${pkg.amount.toLocaleString()} 元！獲得 ${pkg.amount + pkg.bonus} 點數！`);
                setIsTopUpModalOpen(false);
                fetchWalletData(uid);
                setTimeout(() => setSuccessMessage(null), 4000);
            }
        } catch (err) {
            console.error('[Top-up Error]', err);
        } finally {
            setProcessing(false);
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'REFERRAL_REWARD':
                return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-full font-black text-[11px] inline-flex items-center gap-1">🟢 推薦獎勵</span>;
            case 'TOP_UP':
                return <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-700 border border-cyan-500/20 rounded-full font-black text-[11px] inline-flex items-center gap-1">🔵 線上儲值</span>;
            case 'MONTHLY_DEDUCTION':
                return <span className="px-2.5 py-1 bg-rose-500/10 text-rose-700 border border-rose-500/20 rounded-full font-black text-[11px] inline-flex items-center gap-1">🔴 月費抵扣</span>;
            case 'OVERAGE_DEDUCTION':
                return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-full font-black text-[11px] inline-flex items-center gap-1">🟠 超量抵扣</span>;
            case 'STORE_DEDUCTION':
                return <span className="px-2.5 py-1 bg-purple-500/10 text-purple-700 border border-purple-500/20 rounded-full font-black text-[11px] inline-flex items-center gap-1">🟣 分店抵扣</span>;
            default:
                return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-black text-[11px]">⚪ 帳單異動</span>;
        }
    };

    const sectionTitleClass = "text-[16px] font-black text-slate-600 uppercase tracking-[0.3em] mb-3 ml-4";

    return (
        <section className="space-y-6 pt-4">
            <h2 className={sectionTitleClass}>店長購物金與大小月爆量保護錢包</h2>

            {/* 成功提示 Notifications */}
            {successMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-black flex items-center justify-between shadow-md">
                    <span className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-600" />
                        {successMessage}
                    </span>
                </div>
            )}

            <div className="relative overflow-hidden rounded-[32px] bg-white/80 backdrop-blur-xl border border-emerald-500/20 p-8 md:p-10 shadow-xl shadow-emerald-500/5 text-slate-800 space-y-8">
                {/* 背景裝飾微光 */}
                <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute left-1/3 -top-10 w-60 h-60 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

                {/* 頂部餘額卡片 */}
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-6 border-b border-slate-100">
                    <div className="lg:col-span-7 space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] font-black tracking-wider uppercase">
                            <Wallet className="w-4 h-4 text-emerald-600" />
                            💰 1 點 = NT$ 1 元 · 可自動抵扣月費與爆量費
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            可用購物金餘額：
                            <span className="text-4xl text-emerald-600 font-black">
                                ${balanceCredits.toLocaleString()} <span className="text-lg text-slate-500 font-normal">點 NTD</span>
                            </span>
                        </h3>
                        <p className="text-slate-600 text-xs font-bold leading-relaxed">
                            點數包含【推薦好友獲贈點數】與【大小月自主儲值金】。每月自動扣抵名下門市月費；淡季點數安穩留存，大月爆量時自動救援，防範單一分店吃光額度！
                        </p>
                    </div>

                    <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-4 justify-end shrink-0">
                        <button
                            onClick={() => setIsTopUpModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white font-black rounded-2xl text-base shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all"
                        >
                            <PlusCircle className="w-5 h-5 text-amber-300" />
                            儲值大小月爆量專用金
                        </button>
                    </div>
                </div>

                {/* 💳 快速儲值方案導覽 (大小月爆量保險專區) */}
                <div className="relative z-10 space-y-4">
                    <h4 className="text-[14px] font-black text-slate-800 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            💳 專屬大小月爆量保險儲值方案
                        </span>
                        <span className="text-xs text-slate-400 font-medium">點數永久有效、不限期扣抵</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {topUpPackages.map((pkg, idx) => (
                            <div 
                                key={idx}
                                className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 hover:border-emerald-500/40 hover:bg-emerald-50/20 transition-all flex flex-col justify-between space-y-4 group"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                                            {pkg.tag}
                                        </span>
                                        <span className="text-xs font-black text-emerald-600">+加碼 {pkg.bonus} 點</span>
                                    </div>
                                    <h5 className="text-xl font-black text-slate-900">${pkg.amount.toLocaleString()} 元</h5>
                                    <p className="text-xs font-bold text-slate-500">獲得 {(pkg.amount + pkg.bonus).toLocaleString()} 點數 (相當於 ${pkg.amount + pkg.bonus} 抵用金)</p>
                                </div>

                                <button
                                    onClick={() => handleTopUpSubmit(pkg)}
                                    disabled={processing}
                                    className="w-full py-3 bg-slate-900 group-hover:bg-emerald-600 text-white font-black rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                    <Zap className="w-4 h-4" />
                                    立刻儲值此方案
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🧾 錢包帳單交易明細表 (Itemized Wallet Statement) */}
                <div className="relative z-10 space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-[14px] font-black text-slate-800 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            🧾 門市購物金錢包交易對帳單 (Store Wallet Statement)
                        </span>
                        <span className="text-xs text-slate-400 font-medium">每筆異動均有透明對帳紀錄</span>
                    </h4>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/60">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black">
                                <tr>
                                    <th className="px-6 py-4">交易時間</th>
                                    <th className="px-6 py-4">交易類型</th>
                                    <th className="px-6 py-4">異動說明與門市備註</th>
                                    <th className="px-6 py-4">異動金額</th>
                                    <th className="px-6 py-4 text-right">交易後餘額</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-bold">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                            載入對帳單明細中...
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                                            目前尚無錢包點數異動紀錄。儲值爆量金或推薦好友成功即可獲得點數！
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => {
                                        const isPositive = Number(tx.amount) > 0;
                                        return (
                                            <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                                                <td className="px-6 py-4 text-slate-500">
                                                    {tx.created_at ? new Date(tx.created_at).toLocaleString() : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getTypeBadge(tx.type)}
                                                </td>
                                                <td className="px-6 py-4 text-slate-900 font-bold max-w-md truncate">
                                                    {tx.description}
                                                </td>
                                                <td className={`px-6 py-4 font-black ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                    {isPositive ? `+ ${Number(tx.amount).toLocaleString()} 點` : `- ${Math.abs(Number(tx.amount)).toLocaleString()} 點`}
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-900 font-black">
                                                    ${Number(tx.balance_after).toLocaleString()} 點
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 儲值 Modal (Modal) */}
            <AnimatePresence>
                {isTopUpModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl space-y-6 border border-slate-100"
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                    <Wallet className="w-6 h-6 text-emerald-600" />
                                    選擇爆量購物金儲值金額
                                </h3>
                                <button onClick={() => setIsTopUpModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
                            </div>

                            <div className="space-y-4">
                                {topUpPackages.map((pkg) => (
                                    <button
                                        key={pkg.amount}
                                        onClick={() => handleTopUpSubmit(pkg)}
                                        disabled={processing}
                                        className="w-full text-left p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex items-center justify-between group"
                                    >
                                        <div>
                                            <p className="font-black text-slate-900 text-lg">${pkg.amount.toLocaleString()} 元</p>
                                            <p className="text-xs text-slate-500 font-bold">獲得 {pkg.amount + pkg.bonus} 點數 (+{pkg.bonus}點優惠)</p>
                                        </div>
                                        <span className="px-4 py-2 bg-slate-900 group-hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all">
                                            選擇儲值
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <p className="text-xs text-slate-400 font-bold text-center">
                                線上信用卡交易通過 SSL 256-bit 金融級加密，請安心完成儲值。
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
