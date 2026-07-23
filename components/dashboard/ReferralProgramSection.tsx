'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Gift, Share2, Copy, Check, Lock, Unlock, Clock, ShieldCheck, 
    Sparkles, Users, Award, ExternalLink, ArrowRight, CheckCircle2, AlertTriangle, AlertCircle
} from 'lucide-react';

interface ReferralProgramSectionProps {
    botId?: string | null;
}

export default function ReferralProgramSection({ botId }: ReferralProgramSectionProps) {
    const [referralCode, setReferralCode] = useState('');
    const [referralUrl, setReferralUrl] = useState('');
    const [clicksCount, setClicksCount] = useState(0);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [referrals, setReferrals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bot.ycideas.com';
        
        // 取得使用者 LINE ID 或傳入的 botId
        const getCookie = (name: string) => {
            const match = typeof document !== 'undefined' ? document.cookie.split('; ').find(r => r.startsWith(name + '=')) : null;
            return match ? decodeURIComponent(match.split('=')[1]) : '';
        };

        const uid = localStorage.getItem('line_user_id') || getCookie('line_user_id') || 'Ud8b8dd79162387a80b2b5a4aba20f604';
        const activeId = botId || uid;

        if (activeId) {
            fetchRealReferralData(activeId, origin);
        } else {
            setLoading(false);
        }
    }, [botId]);

    // 真正向 Supabase API 撈取真實推薦資料 (不使用任何假資料)
    const fetchRealReferralData = async (targetId: string, origin: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/bot/${targetId}/referral?lineUserId=${targetId}`);
            const data = await res.json();
            if (data.success) {
                if (data.referralCode) {
                    setReferralCode(data.referralCode);
                    setReferralUrl(`${origin}/r/${data.referralCode}`);
                }
                setClicksCount(data.clicksCount || 0);
                setTimeline(data.timeline || []);
                setReferrals(data.referrals || []);
            }
        } catch (err) {
            console.error('[Real Referral Fetch Error]', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!referralUrl) return;
        navigator.clipboard.writeText(referralUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleLineShare = () => {
        if (!referralUrl) return;
        const shareText = `👋 哈囉！我正在使用「AI 店長」幫我的 LINE 官方帳號做 24H 自動化接單與客服，效果超棒！\n\n推薦你也來試試看！點擊我的專屬連結開通 $199/月 方案：\n${referralUrl}`;
        const lineShareUrl = `https://line.me/R/share?text=${encodeURIComponent(shareText)}`;
        window.open(lineShareUrl, '_blank');
    };

    const sectionTitleClass = "text-[16px] font-black text-slate-600 uppercase tracking-[0.3em] mb-3 ml-4";

    return (
        <section className="space-y-6 pt-4">
            <h2 className={sectionTitleClass}>推薦好友·月費全免計畫</h2>

            <div className="relative overflow-hidden rounded-[32px] bg-white/80 backdrop-blur-xl border border-emerald-500/20 p-8 md:p-10 shadow-xl shadow-emerald-500/5 text-slate-800 space-y-8">
                {/* 背景裝飾微光 */}
                <div className="absolute -right-10 -top-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute left-1/3 -bottom-10 w-60 h-60 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

                {/* 頂部標題與說明 (精準依照需求修改文案) */}
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                    <div className="space-y-3 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] font-black tracking-wider uppercase">
                            <Gift className="w-4 h-4 text-emerald-600" />
                            🎁 每月成功推薦 1 位好友·最高全年享九個月免費
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            推薦一位免費贈送一個月
                        </h3>
                        <p className="text-slate-600 text-sm font-bold leading-relaxed">
                            只需分享您的專屬推薦連結給同行朋友。當朋友成功使用並付費滿 3 個月，系統將在【第 4 個月】自動為您折抵全額月費 $199！年繳客戶更享加碼<span className="text-emerald-600 font-black">連續 2 個月免費</span>！
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-emerald-50/60 border border-emerald-200/50 px-6 py-4 rounded-2xl shrink-0">
                        <div className="text-center">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">連結點擊率</p>
                            <p className="text-2xl font-black text-slate-800">{clicksCount} 次</p>
                        </div>
                        <div className="w-px h-8 bg-emerald-200/60" />
                        <div className="text-center">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">成功推薦</p>
                            <p className="text-2xl font-black text-emerald-600">
                                {referrals.filter(r => r.status === 'QUALIFIED' || r.status === 'REDEEMED').length} 家
                            </p>
                        </div>
                    </div>
                </div>

                {/* 專屬連結與 LINE 分享區 */}
                <div className="relative z-10 space-y-3">
                    <label className="text-[13px] font-black text-slate-700 flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-emerald-600" />
                        您的專屬推薦連結：
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative w-full">
                            <input 
                                type="text" 
                                readOnly 
                                value={referralUrl || '載入中...'}
                                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-slate-700 outline-none select-all focus:ring-2 ring-emerald-500/20"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                            <button
                                onClick={handleCopy}
                                disabled={!referralUrl}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white font-black rounded-2xl text-sm hover:bg-slate-800 active:scale-95 transition-all shadow-md disabled:opacity-50"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                {copied ? '已複製！' : '複製連結'}
                            </button>
                            <button
                                onClick={handleLineShare}
                                disabled={!referralUrl}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-[#06C755] text-white font-black rounded-2xl text-sm hover:bg-[#05b34c] active:scale-95 transition-all shadow-lg shadow-[#06C755]/20 disabled:opacity-50"
                            >
                                <Share2 className="w-4 h-4" />
                                一鍵分享至 LINE
                            </button>
                        </div>
                    </div>
                </div>

                {/* 🗓️ 免費月費行事曆 (Reward Timeline) */}
                <div className="relative z-10 space-y-4 pt-2">
                    <h4 className="text-[14px] font-black text-slate-800 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-emerald-600" />
                            🗓️ 免費月費解鎖行事曆 (Reward Timeline)
                        </span>
                        <span className="text-xs text-slate-400 font-medium">系統每月 1 號自動判定折抵</span>
                    </h4>

                    {loading ? (
                        <div className="p-8 text-center text-slate-400 text-xs font-bold">載入行事曆中...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {timeline.map((item, idx) => {
                                const isUnlocked = item.status === 'unlocked';
                                const isPending = item.status === 'pending';
                                const isLocked = item.status === 'locked';

                                return (
                                    <div 
                                        key={idx}
                                        className={`p-5 rounded-2xl border transition-all ${
                                            isUnlocked 
                                                ? 'bg-emerald-50/80 border-emerald-300/80 shadow-md shadow-emerald-500/5' 
                                                : isPending 
                                                ? 'bg-amber-50/60 border-amber-200/80' 
                                                : 'bg-slate-50/60 border-slate-200/60 opacity-70'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-black text-slate-500">{item.monthLabel}</span>
                                            {isUnlocked && <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center gap-1"><Unlock className="w-3 h-3" /> 已解鎖</span>}
                                            {isPending && <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center gap-1"><Clock className="w-3 h-3" /> 審核中</span>}
                                            {isLocked && <span className="px-2.5 py-0.5 rounded-full bg-slate-300 text-slate-700 text-[10px] font-black flex items-center gap-1"><Lock className="w-3 h-3" /> 待解鎖</span>}
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-lg font-black text-slate-900">
                                                {isUnlocked ? '🔓 0 元月費免單' : isPending ? '⏳ 審核中免單' : '🔒 待解鎖月份'}
                                            </p>
                                            <p className="text-xs font-bold text-slate-500 truncate">
                                                {item.refereeName ? `來自：${item.refereeName}` : '分享連結邀請好友解鎖'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 👥 真實推薦好友明細表格 (無任何假資料) */}
                <div className="relative z-10 space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-[14px] font-black text-slate-800 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
                        👥 我推薦的好友明細 (Referral Network)
                    </h4>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/60">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black">
                                <tr>
                                    <th className="px-6 py-4">店家名稱 / LINE 暱稱</th>
                                    <th className="px-6 py-4">加入日期</th>
                                    <th className="px-6 py-4">方案類型</th>
                                    <th className="px-6 py-4">目前狀態</th>
                                    <th className="px-6 py-4">付費進度 (90天觀察)</th>
                                    <th className="px-6 py-4 text-right">預計折抵月份</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-bold">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                            載入推薦明細中...
                                        </td>
                                    </tr>
                                ) : referrals.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                                            目前尚無推薦好友紀錄，複製專屬連結分享給同行朋友吧！
                                        </td>
                                    </tr>
                                ) : (
                                    referrals.map((r) => (
                                        <tr key={r.id} className="hover:bg-slate-50/50 transition">
                                            <td className="px-6 py-4 text-slate-900 font-black">
                                                {r.referee_name || r.referee_bot?.store_name || '新開通 AI 店家'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {r.plan_type === 'annual' ? (
                                                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-full font-black text-[11px]">
                                                        👑 年繳方案 (送2個月)
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-black text-[11px]">
                                                        月繳方案 (送1個月)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {r.status === 'QUALIFIED' && <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 🟢 正常使用 (達標)</span>}
                                                {r.status === 'PENDING' && <span className="text-amber-600 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 🟡 觀察審核中</span>}
                                                {r.status === 'FAILED' && <span className="text-rose-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> 🔴 訂閱中斷 (失效)</span>}
                                                {r.status === 'REDEEMED' && <span className="text-cyan-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 🔵 已成功套用免單</span>}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {r.plan_type === 'annual' ? '90天審核中 (防止退費)' : `${r.paid_months_count || 0} / 3 個月`}
                                            </td>
                                            <td className="px-6 py-4 text-right text-emerald-700 font-black">
                                                {r.reward_applied_month || '累積審核中'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 免責條款備註 */}
                <div className="relative z-10 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-[12px] text-slate-500 space-y-1">
                    <p className="font-black text-slate-700 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        推廣機制條款與風控說明：
                    </p>
                    <p>1. 推薦人（您）必須在獎勵發放時保持付費訂閱中斷，若中途取消訂閱，先前排定之未發放免費月份將全數作廢。</p>
                    <p>2. 被推薦人需完成前 3 個月（共 3 期）之扣款，或年繳通過 90 天觀察期（無退費），系統於第 4 個月起為您自動進行月費折抵。</p>
                </div>
            </div>
        </section>
    );
}
