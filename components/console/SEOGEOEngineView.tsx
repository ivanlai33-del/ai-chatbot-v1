'use client';

import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, Sparkles, Share2, 
    CheckCircle2, RefreshCw, Layers, 
    ExternalLink, Search, Zap, Globe, AlertCircle, ArrowRight, ShieldCheck, Link2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    botId?: string;
    storeName?: string;
    industry?: string;
}

export default function SEOGEOEngineView({ botId = 'default-bot', storeName = '我的專屬店家', industry = '美容美睫' }: Props) {
    const [loading, setLoading] = useState(false);
    const [triggering, setTriggering] = useState(false);
    const [data, setData] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/modules/seo-geo/dashboard?botId=${botId}&industry=${encodeURIComponent(industry)}&storeName=${encodeURIComponent(storeName)}`);
            const json = await res.json();
            if (json.success) {
                setData(json);
            }
        } catch (e) {
            console.error('Failed to fetch SEO/GEO data:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [botId, industry]);

    const handleRunFlywheel = async () => {
        setTriggering(true);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🚀 正在為「${storeName}」啟動【${industry}】全自動流量飛輪...`]);
        try {
            const res = await fetch('/api/modules/seo-geo/cron', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botId, storeName, industry })
            });
            const json = await res.json();
            if (json.success) {
                setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ 飛輪成功執行！已產出落地頁 Slug: ${json.data?.slug}`]);
                setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 📱 Threads 爆款貼文已自動排程`]);
                setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🔍 Google Indexing API 已通知 Googlebot 收錄`]);
                fetchData();
            } else {
                setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ⚠️ 執行中提醒：${json.error}`]);
            }
        } catch (e: any) {
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ 錯誤：${e.message}`]);
        } finally {
            setTriggering(false);
        }
    };

    const isConnected = data?.threadsConnected;
    const threadsUsername = data?.threadsUsername;
    const metrics = data?.metrics;
    const recentArticles = data?.recentArticles || [];

    return (
        <div className="space-y-6 text-slate-800">
            {/* Top Banner / Header Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shadow-xl">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-emerald-100 backdrop-blur-md">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>全自動流量飛輪引擎 LIVE</span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black tracking-tight">
                            產業風向與全自動 SEO/GEO 爆款引擎
                        </h2>
                        <p className="text-xs text-emerald-100/90 leading-relaxed max-w-xl">
                            系統 24 小時全自動爬取【{industry}】熱搜關鍵字、生成 Google SEO 落地頁、排程 Threads 爆款貼文並自動回覆顧客導流！
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={handleRunFlywheel}
                            disabled={triggering}
                            className="px-5 py-2.5 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-black transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50"
                        >
                            <Zap className={`w-4 h-4 ${triggering ? 'animate-bounce text-amber-500' : 'text-emerald-600'}`} />
                            <span>{triggering ? 'AI 飛輪運算中...' : '手動觸發全自動飛輪'}</span>
                        </button>
                        <button
                            onClick={fetchData}
                            className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-md"
                            title="重新整理數據"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ⚠️ Threads 帳號未串聯 - 引導式串接步驟卡片 (Onboarding Guided Card) */}
            {!isConnected && (
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 border-2 border-amber-400/40 rounded-3xl p-6 relative overflow-hidden shadow-lg space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md shrink-0">
                            <AlertCircle className="w-6 h-6 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase">
                                    尚未串聯 Threads 帳號
                                </span>
                                <span className="text-xs font-bold text-amber-800">請完成 30 秒官方授權以啟用全自動發文</span>
                            </div>
                            <h3 className="text-base font-black text-slate-900">
                                📢 完成 Threads 連動，AI 行銷店長即可自動為您發布爆款短文！
                            </h3>
                        </div>
                    </div>

                    {/* Step-by-Step Guidance */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="p-4 bg-white/80 rounded-2xl border border-amber-200/60 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-black text-amber-700">
                                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">1</span>
                                <span>準備 Threads 帳號</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                                確認您已擁有店家的 Threads 或 Instagram 商業帳號。
                            </p>
                        </div>

                        <div className="p-4 bg-white/80 rounded-2xl border border-amber-200/60 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-black text-amber-700">
                                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">2</span>
                                <span>官方授權點擊</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                                點擊下方連結跳轉至 Meta Threads 官方授權頁面。
                            </p>
                        </div>

                        <div className="p-4 bg-white/80 rounded-2xl border border-amber-200/60 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-black text-amber-700">
                                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">3</span>
                                <span>AI 自動接管發文</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                                點擊同意授權後，系統將自動開始定時貼文與導流！
                            </p>
                        </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-amber-200/40">
                        <div className="flex items-center gap-2 text-xs text-amber-800 font-bold">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>使用 Meta 官方 Graph API 授權，資訊嚴格安全保障</span>
                        </div>

                        <a
                            href={`/api/modules/seo-geo/auth/threads?botId=${botId}`}
                            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Link2 className="w-4 h-4" />
                            <span>點擊進行 Threads 官方授權串聯</span>
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            )}

            {/* Quick Status Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>Threads 帳號狀態</span>
                        <Share2 className="w-4 h-4 text-sky-500" />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                        {isConnected ? (
                            <>
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-black text-slate-800">已串聯 ({threadsUsername || '授權中'})</span>
                            </>
                        ) : (
                            <>
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                <span className="text-xs font-black text-rose-600">未串聯 (點上方授權)</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>Google Index 收錄</span>
                        <Globe className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-black text-slate-800">
                            {metrics?.totalGoogleIndexed > 0 ? `已收錄 ${metrics.totalGoogleIndexed} 篇` : 'Sitemap 秒提交'}
                        </span>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>GEO 大模型引用</span>
                        <Sparkles className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${metrics?.aiCitationStatus === 'INDEXED' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                            {metrics?.aiCitationStatus === 'INDEXED' ? 'ChatGPT / Gemini 已收錄' : '等待首篇生成'}
                        </span>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>LINE 新導流人數</span>
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-lg font-black text-emerald-600 pt-0.5">
                        +{metrics?.lineLeadConversions || 0} 人
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (2/3): SERP Keywords & Live Generated Feeds */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Google Keyword SERP Rankings */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <Search className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900">Google SERP 關鍵字實時排名</h3>
                                    <p className="text-[11px] text-slate-400 font-medium">針對產業【{industry}】追蹤高轉換關鍵字</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                全自動每日監測
                            </span>
                        </div>

                        <div className="space-y-2">
                            {metrics?.totalArticlesGenerated === 0 ? (
                                <div className="p-5 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                                    <p className="text-xs font-bold text-slate-500">
                                        尚無發布文章與爆款貼文紀錄
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                        點擊右上角【🚀 手動觸發全自動飛輪】按鈕，AI 將自動為您產出第一篇爆款網頁與 Threads 短文！
                                    </p>
                                </div>
                            ) : (
                                (metrics?.rankings || []).map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl transition-all">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${item.rank ? 'bg-amber-400 text-white shadow-md' : 'bg-slate-200 text-slate-500'}`}>
                                                {item.rank ? `#${item.rank}` : '-'}
                                            </span>
                                            <span className="text-xs font-bold text-slate-800">{item.keyword}</span>
                                        </div>
                                        <a href={item.pageUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1">
                                            <span>查看落地頁</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Terminal Activity Logs */}
                    {logs.length > 0 && (
                        <div className="bg-slate-900 rounded-3xl p-5 text-slate-300 font-mono text-xs space-y-2 shadow-2xl border border-slate-800">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400 font-bold uppercase">
                                <span>AI 飛輪日誌 (Live Logs)</span>
                                <span className="text-emerald-400">STATUS: RUNNING</span>
                            </div>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-hide">
                                {logs.map((log, i) => (
                                    <div key={i} className="leading-relaxed">{log}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column (1/3): Strategy Summary & Settings */}
                <div className="space-y-6">
                    {/* Strategy & Automation Settings */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Layers className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900">自動化運作規則</h3>
                        </div>

                        <div className="space-y-3 text-xs font-medium text-slate-600">
                            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                                <span>每日熱度爬蟲</span>
                                <span className="font-bold text-emerald-600">03:00 AM 自動發動</span>
                            </div>
                            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                                <span>Threads 貼文發布時段</span>
                                <span className="font-bold text-indigo-600">每日 21:00 PM</span>
                            </div>
                            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                                <span>Threads 留言回覆速度</span>
                                <span className="font-bold text-amber-600">30 秒內自動回應</span>
                            </div>
                        </div>

                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl text-[11px] text-amber-800 leading-relaxed font-medium">
                            💡 <strong>全自動託管提醒</strong>：您不需要手動撰寫文章或發文。AI 店長將全權為您捕捉產業【{industry}】熱點並導流至您的 LINE 官方帳號！
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
