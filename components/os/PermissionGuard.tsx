"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface PermissionGuardProps {
    minTier: number;
    children: React.ReactNode;
}

export default function PermissionGuard({ minTier, children }: PermissionGuardProps) {
    const [userTier, setUserTier] = useState<number>(2); // 預設值
    const [isLoaded, setIsLoaded] = useState(false);

    // 監聽方案變更與初始化讀取
    useEffect(() => {
        const updateTier = () => {
            const savedTier = localStorage.getItem('partner_user_tier');
            if (savedTier !== null) {
                setUserTier(parseInt(savedTier));
            }
            setIsLoaded(true);
        };

        // 1. 初始化讀取
        updateTier();

        // 2. 監聽自定義事件 (來自 Sidebar 的切換)
        window.addEventListener('partner-tier-changed', updateTier);
        
        // 3. 監聽原生 Storage 事件 (跨分頁同步用)
        window.addEventListener('storage', updateTier);

        return () => {
            window.removeEventListener('partner-tier-changed', updateTier);
            window.removeEventListener('storage', updateTier);
        };
    }, []);

    const isLocked = userTier < minTier;

    // 防止 SSR 閃爍
    if (!isLoaded) return null;

    if (!isLocked) {
        return <>{children}</>;
    }

    const textMain = 'rgba(0, 0, 0, 0.85)';
    const textSub = 'rgba(0, 0, 0, 0.7)';

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-xl"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#06C755]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative shadow-sm border border-white">
                    <Lock className="w-10 h-10 text-[#06C755]" />
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-[#06C755] to-[#05A044] rounded-full flex items-center justify-center shadow-lg shadow-[#06C755]/20">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                </div>

                <h3 className="text-3xl font-black mb-4" style={{ color: textMain }}>解鎖官方智庫積木</h3>
                <p className="text-sm leading-relaxed mb-10 font-medium" style={{ color: textSub }}>
                    您目前的方案等級 (**Tier {userTier}**) 尚未包含此進階功能。升級至 **Tier {minTier}** 以上方案，即可立即啟動此模組並開啟全系統 AI 自動化。
                </p>

                <div className="space-y-4">
                    <Link 
                        href="/saas-partnership/pricing"
                        className="w-full py-4 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-2xl font-black text-sm shadow-xl shadow-[#06C755]/20 transition-all flex items-center justify-center gap-2 group hover:scale-[1.02]"
                    >
                        立即查看升級方案 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button className="w-full py-4 bg-white/60 hover:bg-white text-[rgba(0,0,0,0.5)] rounded-2xl font-bold text-xs transition-all border border-white">
                        與官方顧問聯繫
                    </button>
                </div>

                <div className="mt-10 pt-8 border-t border-black/5 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#06C755]" />
                    <span className="text-[10px] font-black text-[rgba(0,0,0,0.4)] uppercase tracking-[0.2em]">Official System Security</span>
                </div>
            </motion.div>
        </div>
    );
}
