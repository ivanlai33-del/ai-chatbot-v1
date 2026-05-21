"use client";

import React from 'react';
import { 
    Hammer, Box, Globe, Users, Megaphone, 
    ImageIcon, Layout, Zap, Bot, Ticket, 
    Gem, ClipboardList, MessageSquare, BarChart3,
    Cloud, Terminal, ShieldCheck, ArrowRight,
    Link as LinkIcon, Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ToolkitDirectoryPage() {
    const groups = [
        {
            title: "指揮模組 (Command Modules)",
            items: [
                { icon: Cloud, label: "發布中心", href: "/saas-partnership/dashboard/publish", desc: "同步全站積木至 LINE 端點" },
                { icon: Terminal, label: "執行日誌", href: "/saas-partnership/dashboard/logs", desc: "審核 AGI 與人工的操作軌跡" },
                { icon: Zap, label: "智慧腳本", href: "/saas-partnership/dashboard/scripts", desc: "定義 24/7 自動化神經反射" },
            ]
        },
        {
            title: "連結模組 (Connection Modules)",
            items: [
                { icon: Globe, label: "頻道連線", href: "/saas-partnership/dashboard/provision", desc: "管理 LINE API 與連線參數" },
                { icon: Users, label: "聯絡人 CRM", href: "/saas-partnership/dashboard/crm", desc: "深度追蹤會員行為與標籤" },
            ]
        },
        {
            title: "創意模組 (Creative Modules)",
            items: [
                { icon: Megaphone, label: "活動與推播", href: "/saas-partnership/dashboard/campaigns", desc: "發送精準分眾訊息" },
                { icon: ImageIcon, label: "素材工廠", href: "/saas-partnership/dashboard/studio/factory", desc: "AI 視覺圖像與排版生成" },
                { icon: Layout, label: "圖文選單", href: "/saas-partnership/dashboard/menu", desc: "設計與部署 Rich Menu 介面" },
            ]
        },
        {
            title: "營運模組 (Operational Modules)",
            items: [
                { icon: Zap, label: "行銷旅程", href: "/saas-partnership/dashboard/journey", desc: "自動化客戶培育路徑" },
                { icon: Bot, label: "智庫設定", href: "/saas-partnership/dashboard/knowledge", desc: "訓練 AGI 的產業知識庫" },
                { icon: Ticket, label: "優惠券中心", href: "/saas-partnership/dashboard/coupons", desc: "行銷促銷與核銷管理系統" },
                { icon: Gem, label: "集點卡系統", href: "/saas-partnership/dashboard/loyalty", desc: "建立會員回購忠誠度循環" },
                { icon: ClipboardList, label: "問卷數據", href: "/saas-partnership/dashboard/surveys", desc: "回收客戶意向與統計分析" },
                { icon: MessageSquare, label: "客服工作台", href: "/saas-partnership/dashboard/support", desc: "專員介入對話與工單" },
                { icon: BarChart3, label: "報表中心", href: "/saas-partnership/dashboard/reports", desc: "全方位營運動察與預測" },
            ]
        },
        {
            title: "串接模組 (Integration Modules)",
            items: [
                { icon: LinkIcon, label: "API 串接", href: "/saas-partnership/dashboard/integrations/api", desc: "外部資料源與 ERP 系統對接" },
                { icon: Cpu, label: "Webhook 配置", href: "/saas-partnership/dashboard/integrations/webhooks", desc: "事件驅動的即時數據回傳" },
            ]
        }
    ];

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-16 pb-32">
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-5 bg-gradient-to-br from-[#06C755] to-[#05A044] rounded-[2.5rem] shadow-2xl shadow-emerald-500/20 text-white">
                    <Hammer className="w-10 h-10" />
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter">AGI 智庫中心</h1>
                <p className="max-w-2xl text-slate-500 font-medium text-lg leading-relaxed">這是您的功能本體，所有已開發的營運工具皆存放在此，供您隨時手動調用。</p>
            </div>

            {/* Grid Sections */}
            {groups.map((group, idx) => (
                <section key={idx} className="space-y-8">
                    <div className="flex items-center gap-6">
                        <h3 className="text-sm font-black text-emerald-600 uppercase tracking-[0.3em] whitespace-nowrap">{group.title}</h3>
                        <div className="flex-1 h-px bg-emerald-100" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {group.items.map((item, i) => (
                            <Link key={i} href={item.href}>
                                <motion.div 
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className="h-full bg-white/60 backdrop-blur-xl border border-white rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl hover:bg-white transition-all group cursor-pointer flex flex-col justify-between relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-all" />
                                    
                                    <div className="space-y-6 relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-gradient-to-br group-hover:from-[#06C755] group-hover:to-[#05A044] group-hover:text-white transition-all duration-500 shadow-sm">
                                            <item.icon className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900 mb-2 group-hover:text-[#06C755] transition-colors">{item.label}</h4>
                                            <p className="text-xs text-slate-400 font-bold leading-relaxed line-clamp-2">{item.desc}</p>
                                        </div>
                                    </div>
                                    <div className="mt-10 flex justify-end relative z-10">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-[#06C755] group-hover:text-white transition-all shadow-sm">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
