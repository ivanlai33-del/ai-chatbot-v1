"use client";

import React, { useState } from 'react';
import { 
    Cpu, Zap, Globe, Plus, 
    RefreshCw, Terminal, CheckCircle2,
    Activity, ShieldCheck, Settings,
    Trash2, AlertTriangle, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WebhookConfigPage() {
    const [webhooks, setWebhooks] = useState([
        { id: 1, url: 'https://webhook.site/8k2f9s1l0m9n', event: 'message.received', status: 'active', health: 100 },
        { id: 2, url: 'https://my-crm.com/api/line-events', event: 'customer.followed', status: 'active', health: 98 },
    ]);

    return (
        <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-12 pb-32">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Real-time Stream</div>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 text-white">
                            <Cpu className="w-8 h-8" />
                        </div>
                        Webhook 監控中心
                    </h1>
                    <p className="mt-3 text-slate-500 font-medium italic">即時捕捉 LINE 官方帳號的動態事件，並推送到您的外部應用程式。</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-2xl text-xs font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20">
                    <Plus className="w-4 h-4" /> 新增 Webhook
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Webhook List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">目前配置的端點</h3>
                            <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> SYSTEM LIVE
                            </div>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {webhooks.map((hook) => (
                                <div key={hook.id} className="p-8 hover:bg-slate-50/50 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-black text-slate-900">{hook.url}</span>
                                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black rounded uppercase">{hook.event}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Endpoint ID: WH_00{hook.id}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200">
                                                <Settings className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 transition-all border border-transparent hover:border-red-100">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${hook.health}%` }} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-500">Health: {hook.health}%</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black">
                                            <CheckCircle2 className="w-3 h-3" /> 200 OK
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Console Output (Decorative) */}
                    <div className="bg-emerald-950 rounded-[2.5rem] p-8 font-mono text-[11px] text-emerald-400 border border-white/5 shadow-2xl shadow-emerald-950/20">
                        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4" />
                                <span className="uppercase tracking-widest">Event Live Stream</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[9px] text-slate-500 uppercase">Recording...</span>
                            </div>
                        </div>
                        <div className="space-y-1 opacity-80">
                            <p><span className="text-slate-500">[20:12:45]</span> <span className="text-indigo-400">INCOMING</span> - event: message, user: U82f...91k, content: "Hello AGI"</p>
                            <p><span className="text-slate-500">[20:12:46]</span> <span className="text-emerald-400">DELIVERED</span> - endpoint: WH_001, status: 200</p>
                            <p><span className="text-slate-500">[20:13:02]</span> <span className="text-indigo-400">INCOMING</span> - event: follow, user: U19c...22a</p>
                            <p><span className="text-slate-500">[20:13:03]</span> <span className="text-emerald-400">DELIVERED</span> - endpoint: WH_002, status: 200</p>
                            <p className="animate-pulse">_</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-8">
                    <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">傳輸統計 (24h)</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-[10px] font-black mb-2">
                                    <span className="text-slate-400 uppercase">Total Requests</span>
                                    <span className="text-slate-900">12,842</span>
                                </div>
                                <div className="h-1 bg-slate-50 rounded-full" />
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] font-black mb-2">
                                    <span className="text-slate-400 uppercase">Success Rate</span>
                                    <span className="text-emerald-600 font-black">99.8%</span>
                                </div>
                                <div className="h-1 bg-emerald-50 rounded-full" />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
