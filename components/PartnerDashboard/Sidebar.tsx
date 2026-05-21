"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, Users, MessageSquare, 
    ShoppingBag, Calendar, BarChart3, 
    Settings, Zap, Sparkles, Target, 
    BrainCircuit, ClipboardList, LifeBuoy,
    Menu as MenuIcon, ArrowLeft,
    CheckCircle2, Lock, ChevronDown
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PRICING_PLANS } from '@/lib/config/pricing';

export default function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    // 方案等級持久化狀態
    const [userTier, setUserTier] = useState<number>(2); // 預設 Tier 2

    // 初始化：從 LocalStorage 讀取先前選擇的方案
    useEffect(() => {
        const savedTier = localStorage.getItem('partner_user_tier');
        if (savedTier) {
            setUserTier(parseInt(savedTier));
        }
    }, []);

    // 當方案變更時，儲存到 LocalStorage 並發送事件通知
    const handleTierChange = (tier: number) => {
        setUserTier(tier);
        localStorage.setItem('partner_user_tier', tier.toString());
        // 觸發全站事件通知
        window.dispatchEvent(new CustomEvent('partner-tier-changed', { detail: { tier } }));
    };

    const menuItems = [
        { name: '總覽儀表板', icon: LayoutDashboard, href: '/saas-partnership/dashboard', tier: 0 },
        { name: '報表與歸因', icon: BarChart3, href: '/saas-partnership/dashboard/reports', tier: 5 },
        { category: '客資中台' },
        { name: '聯絡人中心', icon: Users, href: '/saas-partnership/dashboard/crm', tier: 0 },
        { name: '標籤與分眾', icon: Target, href: '/saas-partnership/dashboard/segments', tier: 2 },
        { name: 'BD 商機中心', icon: ClipboardList, href: '/saas-partnership/dashboard/bd', tier: 4 },
        { category: '店長智庫' },
        { name: '內容資產庫', icon: BrainCircuit, href: '/saas-partnership/dashboard/assets', tier: 0 },
        { name: '選單中心', icon: MenuIcon, href: '/saas-partnership/dashboard/menu', tier: 0 },
        { name: '活動與優惠', icon: Sparkles, href: '/saas-partnership/dashboard/campaigns', tier: 2 },
        { category: '服務收集' },
        { name: '表單中心', icon: ClipboardList, href: '/saas-partnership/dashboard/forms', tier: 0 },
        { name: '預約中心', icon: Calendar, href: '/saas-partnership/dashboard/booking', tier: 2 },
        { name: '客服工單', icon: LifeBuoy, href: '/saas-partnership/dashboard/support', tier: 3 },
        { category: '自動化' },
        { name: '旅程與自動化', icon: Zap, href: '/saas-partnership/dashboard/journey', tier: 4 },
        { name: '交易與訂單', icon: ShoppingBag, href: '/saas-partnership/dashboard/orders', tier: 2 },
    ];

    const textMain = 'rgba(0, 0, 0, 0.85)';
    const textSub = 'rgba(0, 0, 0, 0.7)';

    // 取得當前方案名稱
    const currentPlanName = Object.values(PRICING_PLANS).find(p => p.tier === userTier)?.name || `Tier ${userTier} 方案`;

    return (
        <motion.aside 
            animate={{ width: isCollapsed ? 120 : 350 }}
            className="bg-white/30 backdrop-blur-3xl border-r border-white/40 flex flex-col pt-10 h-screen shrink-0 overflow-y-auto overflow-x-hidden relative transition-all"
        >
            {/* Logo & Name - Click to Toggle */}
            <div 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`flex items-center cursor-pointer transition-all mb-16 px-8 ${isCollapsed ? 'justify-center' : 'justify-start gap-6'}`}
            >
                <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-[86px] h-[86px] shrink-0"
                >
                    <Image 
                        src="/lai_logo_3.svg" 
                        alt="Logo" 
                        fill 
                        className="object-contain"
                    />
                </motion.div>
                
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col overflow-hidden whitespace-nowrap"
                        >
                            <span className="text-[33px] font-black tracking-tighter leading-none" style={{ color: textMain }}>官方智庫</span>
                            <span className="text-xl font-bold opacity-50 tracking-widest mt-1" style={{ color: textSub }}>系統中心</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 🛠️ Persistent Plan Switcher */}
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="px-8 mb-12"
                    >
                        <div className="p-6 bg-white/70 rounded-[2rem] border border-white/80 shadow-sm">
                            <p className="text-sm font-black text-[rgba(0,0,0,0.5)] uppercase tracking-widest mb-5 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-[#06C755]" /> 測試：切換方案等級
                            </p>
                            <div className="relative">
                                <select 
                                    value={userTier}
                                    onChange={(e) => handleTierChange(parseInt(e.target.value))}
                                    className="w-full bg-white px-5 py-4 rounded-2xl border border-black/5 text-base font-black appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#06C755]/20 shadow-inner"
                                    style={{ color: textMain }}
                                >
                                    <option value={0}>Tier 0 (基礎版)</option>
                                    <option value={2}>Tier 2 (單店主力)</option>
                                    <option value={3}>Tier 3 (品牌連鎖)</option>
                                    <option value={4}>Tier 4 (企業進階)</option>
                                    <option value={5}>Tier 5 (官方旗艦)</option>
                                    <option value={100}>Tier MAX (全能開發)</option>
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#06C755] pointer-events-none" />
                            </div>
                            <p className="mt-3 text-[10px] font-bold text-[#06C755] px-2 italic">此設定將在頁面跳轉時自動固定</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            <div className={`flex-1 space-y-4 pb-12 ${isCollapsed ? 'px-4' : 'px-5'}`}>
                {menuItems.map((item, index) => (
                    item.category ? (
                        !isCollapsed && (
                            <motion.p 
                                key={index} 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="px-6 pt-10 pb-4 text-[18px] font-black text-[rgba(0,0,0,0.3)] uppercase tracking-[0.2em]"
                            >
                                {item.category}
                            </motion.p>
                        )
                    ) : (
                        <Link
                            key={index}
                            href={userTier < (item.tier || 0) ? '/saas-partnership/pricing' : (item.href || '#')}
                            className={`flex items-center transition-all group rounded-2xl ${
                                isCollapsed ? 'justify-center p-5' : 'justify-between px-6 py-6'
                            } ${
                                pathname === item.href 
                                ? 'bg-gradient-to-r from-[#06C755] to-[#05A044] text-white shadow-md shadow-[#06C755]/20' 
                                : 'text-[rgba(0,0,0,0.6)] hover:bg-white/50 hover:text-[rgba(0,0,0,0.85)]'
                            }`}
                        >
                            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-5'}`}>
                                {item.icon && <item.icon className={`w-7 h-7 ${pathname === item.href ? 'text-white' : 'text-[#06C755] group-hover:scale-110 transition-transform'}`} />}
                                {!isCollapsed && <span className="text-[21px] font-bold">{item.name}</span>}
                            </div>
                            {!isCollapsed && userTier < (item.tier || 0) && (
                                <Lock className="w-6 h-6 opacity-40" />
                            )}
                        </Link>
                    )
                ))}
            </div>

            {/* Footer Action */}
            <div className={`border-t border-white/20 bg-transparent ${isCollapsed ? 'p-4 flex justify-center' : 'p-10'}`}>
                <Link href="/saas-partnership" className={`flex items-center transition-all text-lg font-bold ${isCollapsed ? 'justify-center' : 'gap-5 px-5 py-5 text-[rgba(0,0,0,0.5)] hover:text-[rgba(0,0,0,0.85)]'}`}>
                    <ArrowLeft className="w-6 h-6" />
                    {!isCollapsed && <span>返回合作方案</span>}
                </Link>
            </div>
        </motion.aside>
    );
}
