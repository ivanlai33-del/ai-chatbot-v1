"use client";

import React, { useState } from 'react';
import { 
    Link as LinkIcon, Database, ShieldCheck, 
    Plus, Key, RefreshCw, Copy, CheckCircle2,
    Lock, Globe, Cpu, Server, Terminal,
    ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function APIIntegrationPage() {
    const [apiKey, setApiKey] = useState('aim_live_8k2f9s1l0m9n8b7v6c5x4z');
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-12 pb-32">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="px-3 py-1 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white text-[10px] font-black rounded-full uppercase tracking-widest">Developer Alpha</div>
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> API Link Active
                    </div>
                </div>
                <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#06C755] to-[#05A044] rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
                        <LinkIcon className="w-8 h-8" />
                    </div>
                    API 串接中心
                </h1>
                <p className="mt-3 text-slate-500 font-medium italic">連結外部 ERP、CRM 或自定義系統，讓 AGI 具備跨平台的資料調度能力。</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Config */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-xl font-black text-slate-900">API Key 管理</h3>
                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-black text-slate-600 transition-all">
                                <RefreshCw className="w-3 h-3" /> 重整金鑰
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Production API Key</label>
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between font-mono text-sm text-slate-600">
                                        <span>{apiKey}</span>
                                        <button onClick={handleCopy} className="text-slate-300 hover:text-indigo-600 transition-colors">
                                            {isCopied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                                <ShieldCheck className="w-6 h-6 text-amber-500 shrink-0" />
                                <div>
                                    <p className="text-xs font-black text-amber-900 mb-1">安全提醒</p>
                                    <p className="text-[10px] text-amber-700 font-bold leading-relaxed">請勿在客戶端 JavaScript 中直接使用此 Key。建議透過伺服器端 Proxy 進行轉發以確保 AGI 資料安全。</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-gradient-to-br from-[#06C755] to-[#05A044] rounded-[2.5rem] p-10 text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-white/30 transition-all duration-1000" />
                        
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-5 h-5 text-indigo-400" />
                                <h3 className="text-lg font-black tracking-tight">快速啟動程式碼</h3>
                            </div>
                            <div className="bg-black/40 rounded-2xl p-6 font-mono text-xs text-indigo-300 border border-white/5 leading-relaxed">
                                <p className="mb-2 text-slate-500"># 獲取 AGI 目前對話內容</p>
                                <p>curl -X GET "https://api.agi-os.com/v1/context" \</p>
                                <p className="pl-4">-H "Authorization: Bearer <span className="text-white">YOUR_API_KEY</span>" \</p>
                                <p className="pl-4">-H "X-OA-ID: {'>'}oa_current_active"</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Docs */}
                <div className="space-y-8">
                    <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">可用 API 端點</h3>
                        <div className="space-y-4">
                            {[
                                { method: 'POST', path: '/v1/message', label: '發送訊息' },
                                { method: 'GET', path: '/v1/customers', label: '會員查詢' },
                                { method: 'PATCH', path: '/v1/tags', label: '標籤更新' },
                                { method: 'POST', path: '/v1/coupon/send', label: '發送優惠券' },
                            ].map((api, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${api.method === 'POST' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>{api.method}</span>
                                        <span className="text-[11px] font-mono text-slate-600 group-hover:text-slate-900 transition-colors">{api.path}</span>
                                    </div>
                                    <ExternalLink className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
