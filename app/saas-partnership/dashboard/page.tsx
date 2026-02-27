"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    LayoutDashboard,
    Settings,
    LogOut,
    PlusCircle,
    Search,
    Bell,
    User
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SlotStats from '@/components/PartnerDashboard/SlotStats';
import TokenManager from '@/components/PartnerDashboard/TokenManager';
import BotList from '@/components/PartnerDashboard/BotList';
import SaaSChatInterface from '@/components/SaaSChatInterface';
import Sidebar from '@/components/PartnerDashboard/Sidebar';

export default function PartnerDashboard() {
    const [loading, setLoading] = useState(true);
    const [partnerData, setPartnerData] = useState<any>(null);
    const [bots, setBots] = useState<any[]>([]);

    // We'll use a search param or local storage for the partner ID in this demo version
    const [partnerId, setPartnerId] = useState<string | null>(null);

    useEffect(() => {
        // For demo purposes, we'll try to get the first partner if no ID is specified
        async function fetchPartner() {
            try {
                setLoading(true);

                // 1. Fetch Partner Basic Info
                let query = supabase.from('partners').select('*');

                if (partnerId) {
                    query = query.eq('id', partnerId);
                }

                const { data: partners, error: pError } = await query.limit(1);

                if (pError || !partners || partners.length === 0) {
                    console.warn("No partner found, using demo state");
                    setLoading(false);
                    return;
                }

                const currentPartner = partners[0];
                setPartnerData(currentPartner);

                // 2. Fetch Bots linked to this partner
                const { data: linkedBots, error: bError } = await supabase
                    .from('bots')
                    .select('*')
                    .eq('partner_id', currentPartner.id)
                    .order('created_at', { ascending: false });

                if (!bError) setBots(linkedBots);

            } catch (err) {
                console.error("Dashboard Load Error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchPartner();
    }, [partnerId]);

    // Fallback/Demo Data if nothing in DB
    const displayData = partnerData || {
        name: 'Demo Partner Portal',
        api_key: 'ps_live_demo_key_88229911',
        slots_purchased: 50
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col md:flex-row overflow-hidden selection:bg-indigo-500/30">
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 h-screen overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-12 relative">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-3xl font-black text-white tracking-tight mb-2"
                        >
                            歡迎回來，{displayData.name}
                        </motion.h1>
                        <p className="text-slate-500 text-sm font-medium">今天有新的導入排程嗎？我們隨時為您準備。 </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="搜尋店鋪或 Token..."
                                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all min-w-[240px]"
                            />
                        </div>
                        <button className="p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl relative hover:bg-slate-800 transition-all">
                            <Bell className="w-5 h-5 text-slate-400" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#0f172a]" />
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-indigo-500/20">
                            <div className="w-full h-full bg-[#0f172a] rounded-[10px] flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
                    {/* Left & Middle Column */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Stats Section */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">AI店長席位動態紀錄</h2>
                                <div className="h-px bg-slate-800 flex-1"></div>
                            </div>
                            <SlotStats
                                used={bots.length}
                                total={displayData.slots_purchased}
                                loading={loading}
                            />
                        </section>

                        {/* Bot List Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">全店鋪管理清單</h2>
                                    <div className="h-px bg-slate-800 flex-1"></div>
                                </div>
                                <button className="ml-4 px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-xs font-black hover:bg-indigo-600 hover:text-white transition-all">
                                    批量匯出 CSV
                                </button>
                            </div>
                            <BotList bots={bots} loading={loading} />
                        </section>
                    </div>

                    {/* Right Column */}
                    <aside className="space-y-10">
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">安全性與整合</h2>
                                <div className="h-px bg-slate-800 flex-1"></div>
                            </div>
                            <TokenManager apiKey={displayData.api_key} loading={loading} />
                        </section>

                        {/* System Notice */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-6 bg-indigo-600/5 rounded-3xl border border-indigo-500/10"
                        >
                            <h3 className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-3">系統公告</h3>
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                🚀 我們剛剛更新了 **產業模組 v2.0**，您的子帳號現在可以支援更多的自動預約處理邏輯。
                            </p>
                            <button className="mt-4 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:underline">
                                查看更新詳情 →
                            </button>
                        </motion.div>
                    </aside>
                </div>
            </main>

            {/* AI Chat Sidebar (Same position as SaaS Page) */}
            <div className="hidden xl:flex w-80 lg:w-96 bg-[#1e293b]/50 flex-col h-screen border-l border-slate-700/50 backdrop-blur-3xl overflow-hidden shrink-0">
                <SaaSChatInterface pageContext="dashboard" />
            </div>
        </div>
    );
}
