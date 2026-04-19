'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, animate, useScroll } from 'framer-motion';
import { LogIn, CreditCard, Database, Bot } from 'lucide-react';
import Image from 'next/image';

const BACKGROUNDS = [
    '/hero-bg01.jpeg', '/hero-bg02.jpeg', '/hero-bg03.jpeg', '/hero-bg04.jpeg',
    '/hero-bg05.jpeg', '/hero-bg06.jpeg', '/hero-bg07.jpeg', '/hero-bg08.jpeg',
    '/hero-bg09.jpeg', '/hero-bg10.jpeg', '/hero-bg11.jpeg', '/hero-bg12.jpeg',
    '/hero-bg13.jpeg', '/hero-bg14.jpeg', '/hero-bg15.jpeg', '/hero-bg16.jpeg'
];

interface HeroSectionProps {
    isLoggedIn: boolean;
    onAction: () => void;
    onOpenChat: () => void;
    onShowPricing: () => void;
}

export default function HeroSection({ 
    isLoggedIn, 
    onAction, 
    onOpenChat, 
    onShowPricing 
}: HeroSectionProps) {
    const [bgImage, setBgImage] = useState<string>('');
    const [showContent, setShowContent] = useState(false);
    
    // 🎭 滾動監測：隨著捲動，底稿變暗 (從 20% 變到 75% 黑)
    const { scrollY } = useScroll();
    const bgOverlayOpacity = useTransform(scrollY, [0, 800], [0.2, 0.75]);

    // Animation Progress (0 = Expanded, 1 = Fully Collapsed)
    const rawProgress = useMotionValue(0);
    const smoothProgress = useSpring(rawProgress, {
        stiffness: 120,
        damping: 18,
        restDelta: 0.001
    });

    // Glass Mappings
    const glassY = useTransform(smoothProgress, [0, 1], ['0%', '-100%']);
    const textY = useTransform(smoothProgress, [0.5, 1], ['0%', '-100%']);
    const glassOpacity = useTransform(smoothProgress, [0.8, 1], [1, 0]);

    // 🎭 置頂召喚邏輯：維持展開狀態
    useEffect(() => {
        rawProgress.set(0); 
        setShowContent(true);
        setBgImage(BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)]);
    }, [rawProgress]);

    // Handle Wheel Event - Removed to keep content static as requested
    /*
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            const sensitivity = 0.002;
            const delta = -e.deltaY * sensitivity; 
            rawProgress.set(Math.min(Math.max(rawProgress.get() + delta, 0), 1));
        };
        window.addEventListener('wheel', handleWheel, { passive: true });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [rawProgress]);
    */

    return (
        <div className="relative z-10 min-h-screen flex flex-col overflow-hidden">
            {/* Background Image (Fixed Layer) */}
            <div className="fixed inset-0 z-0">
                <motion.div 
                    style={{ opacity: bgOverlayOpacity }}
                    className="absolute inset-0 bg-slate-950 z-10 pointer-events-none"
                />
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={bgImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="relative w-full h-full"
                    >
                        {bgImage ? (
                            <Image
                                src={bgImage}
                                alt="AI Background"
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="absolute inset-0 bg-slate-900" />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Animation Area */}
            <div className="w-full relative overflow-hidden">
                <motion.div
                    initial={{ y: '-100%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ y: glassY, opacity: glassOpacity }}
                    className="absolute inset-0 z-0 backdrop-blur-3xl bg-gradient-to-br from-[#058a40]/60 via-[#01142F]/80 to-[#1e3a8a]/40 border-y border-white/30"
                />

                <motion.div 
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15, mass: 0.8 }}
                    style={{ y: textY }}
                    className="relative z-10 flex flex-col items-center gap-10 px-6 pt-24 pb-20 max-w-5xl mx-auto w-full"
                >
                    <div className="flex flex-col items-center gap-6 text-center">
                        <div className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs font-black uppercase tracking-[0.4em] mb-2 backdrop-blur-md shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                            24/7 Automated Sales & Support
                        </div>
                         <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-tight drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-shimmer text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200">
                            給實體店、工作室、小品牌的 LINE 官方帳號：<br />
                            3 分鐘開通、客服量減半、詢問不漏接
                        </h1>
                         <p className="max-w-4xl text-xl md:text-2xl text-blue-50/90 font-medium leading-relaxed drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                            專為 LINE 官方帳號打造的 AI 客服機器人，24 小時幫您自動回覆、介紹商品、引導下單，幫助中小企業減少 60% 重複客服工作並提升非營業時間的成交機會。
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 mt-2">
                            {['評分 4.9/5', '已服務 80+ 店家', '處理 10 萬+ 則訊息'].map((badge, bi) => (
                                <div key={bi} className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs font-black tracking-wider backdrop-blur-md">
                                    ★ {badge}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg">
                        {isLoggedIn ? (
                            <>
                                 <button onClick={onAction}
                                    className="flex-1 flex items-center justify-center gap-3 bg-[#06C755] hover:bg-[#05b34c] text-white py-4 px-8 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(6,199,85,0.4)]"
                                >
                                    <Database className="w-5 h-5" /> 進入 AI 店長後台
                                </button>
                                 <button onClick={onOpenChat}
                                    className="flex-1 flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white py-4 px-8 rounded-2xl font-black text-xl transition-all hover:bg-white/20 active:scale-95"
                                >
                                    <Bot className="w-5 h-5" /> 開啟對話預覽
                                </button>
                            </>
                        ) : (
                            <>
                                 <button onClick={onShowPricing}
                                    className="flex-1 flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white py-4 px-8 rounded-2xl font-black text-xl transition-all hover:bg-white/20 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.05)]"
                                >
                                    了解價格與功能
                                </button>
                                 <button onClick={onAction}
                                    className="flex-1 flex items-center justify-center gap-3 bg-[#06C755] hover:bg-[#05b34c] text-white py-4 px-8 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(6,199,85,0.5)]"
                                >
                                    用 LINE 試玩 3 分鐘 (免費)
                                </button>
                            </>
                        )}
                    </div>

                     <div className="hidden md:flex items-center gap-8 text-blue-100/40 text-[11px] font-black uppercase tracking-[0.5em] mt-4">
                        <div className="flex items-center gap-2">
                             <img src="https://bot.ycideas.com/Lai Logo.svg" className="w-4 h-4 grayscale opacity-50" alt="YC Ideas" />
                             <span>Powered by YC Ideas</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                        <span>NewebPay Secured</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                        <span>LINE OA Integration</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
