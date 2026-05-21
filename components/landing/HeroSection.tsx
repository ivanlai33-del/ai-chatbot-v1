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

const BOT_IMAGES = Array.from({ length: 11 }, (_, i) => `/bot_${String(i + 1).padStart(2, '0')}.svg`);

const HERO_COPY_SETS = [
    {
        title: <><span className="whitespace-nowrap">LINE AI 機器人：</span><br /><span className="whitespace-nowrap">24 小時智慧回覆與</span><br /><span className="whitespace-nowrap">AI 智慧助手</span></>,
        subtitle: '專為實體店面與個人品牌設計，3 分鐘開通 LINE 官方帳號 AI 客服。結合最新的 AI 技術，精準回答客戶問題，有效減少大量重複諮詢，讓服務全天候不中斷。',
        tags: ['#LINEAI機器人', '#智慧回覆系統', '#AI客服', '#LINE經營工具']
    },
    {
        title: <><span className="whitespace-nowrap">LINE 智慧導購與 AI 客服：</span><br /><span className="whitespace-nowrap">您的數位與實體店專屬</span><br /><span className="whitespace-nowrap">官方帳號 AI 店長</span></>,
        subtitle: '告別漏接訊息！透過 AI 智慧引導對話，提升官方帳號服務品質。低門檻、免寫程式，讓小品牌也能擁有專業等級的自動化服務體驗。',
        tags: ['#LINE智慧導購', '#數位轉型', '#實體店面助攻', '#官方帳號經營']
    },
    {
        title: <><span className="whitespace-nowrap">打造您的專業 AI 客服：</span><br /><span className="whitespace-nowrap">LINE 官方帳號智慧對話</span><br /><span className="whitespace-nowrap">與商品導購助手</span></>,
        subtitle: '業界領進的 LINE 官方帳號 AI 解決方案。從智慧商品介紹到 24/7 自動回覆，協助您的品牌建立專業形象，節省人力成本並優化客戶對話體驗。',
        tags: ['#AI客服', '#SaaS服務', '#LINE行銷輔助', '#智慧導購']
    }
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
    const [botImage, setBotImage] = useState<string>('');
    const [copySet, setCopySet] = useState(HERO_COPY_SETS[0]);
    const [showContent, setShowContent] = useState(false);
    
    // 🎭 滾動監測
    const { scrollY } = useScroll();
    const bgOverlayOpacity = useTransform(scrollY, [0, 800], [0.2, 0.75]);

    const rawProgress = useMotionValue(0);
    const smoothProgress = useSpring(rawProgress, {
        stiffness: 120,
        damping: 18,
        restDelta: 0.001
    });

    const glassY = useTransform(smoothProgress, [0, 1], ['0%', '-100%']);
    const textY = useTransform(smoothProgress, [0.5, 1], ['0%', '-100%']);
    const glassOpacity = useTransform(smoothProgress, [0.8, 1], [1, 0]);

    useEffect(() => {
        rawProgress.set(0); 
        setShowContent(true);
        setBgImage(BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)]);
        setBotImage(BOT_IMAGES[Math.floor(Math.random() * BOT_IMAGES.length)]);
        // 隨機選擇一組文案
        setCopySet(HERO_COPY_SETS[Math.floor(Math.random() * HERO_COPY_SETS.length)]);
    }, [rawProgress]);

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
                                alt="AI 智能店長 Pro - LINE 官方帳號 API 自動銷售與客服助手"
                                fill
                                sizes="100vw"
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
                    className="relative z-10 flex flex-col items-center gap-10 px-6 pt-24 pb-20 max-w-7xl mx-auto w-full"
                >
                    <div className="flex flex-col items-center gap-8 text-center">
                        <div className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs font-black uppercase tracking-[0.4em] mb-2 backdrop-blur-md shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                            24/7 Automated Sales & Support
                        </div>
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20 w-full max-w-[1400px]">
                            {botImage && (
                                <motion.div
                                    initial={{ opacity: 0, x: -50, scale: 0, rotate: -360 }}
                                    animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
                                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                                    className="relative w-48 h-48 md:w-64 md:h-64 lg:w-[380px] lg:h-[380px] shrink-0 drop-shadow-[0_20px_60px_rgba(37,99,235,0.4)] lg:-ml-[70px]"
                                >
                                    <Image
                                        src={botImage}
                                        alt="AI Robot Assistant"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 380px"
                                        className="object-contain animate-float"
                                        priority
                                    />
                                </motion.div>
                            )}
                            <h1 className="text-4xl md:text-6xl lg:text-[80px] font-black tracking-tighter text-left leading-[1.15] drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-shimmer text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 break-keep">
                                {copySet.title}
                            </h1>
                        </div>
                         <p className="max-w-4xl text-xl md:text-2xl text-blue-50/90 font-medium leading-relaxed drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                            {copySet.subtitle}
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 mt-2">
                            {copySet.tags.map((tag, ti) => (
                                <div key={ti} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-black tracking-wider backdrop-blur-md">
                                    {tag}
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 mt-4 opacity-70">
                            {['穩定運作中', '眾多商家見證', '處理大量訊息'].map((badge, bi) => (
                                <div key={bi} className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-200 text-[10px] font-black tracking-wider backdrop-blur-md">
                                    ★ {badge}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg items-center justify-center mt-4">
                        {isLoggedIn ? (
                            <>
                                 <button onClick={onAction}
                                    className="flex-1 w-full flex items-center justify-center gap-3 bg-[#06C755] hover:bg-[#05b34c] text-white py-4 px-8 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(6,199,85,0.4)] whitespace-nowrap"
                                >
                                    <Database className="w-5 h-5" /> 進入 AI 店長後台
                                </button>
                                 <button onClick={onOpenChat}
                                    className="flex-1 w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white py-4 px-8 rounded-2xl font-black text-xl transition-all hover:bg-white/20 active:scale-95 whitespace-nowrap"
                                >
                                    <Bot className="w-5 h-5" /> 開啟對話預覽
                                </button>
                            </>
                        ) : (
                            <>
                                 <button onClick={onShowPricing}
                                    className="flex-1 w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white py-4 px-8 rounded-2xl font-black text-xl transition-all hover:bg-white/20 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.05)] whitespace-nowrap"
                                >
                                    了解價格與功能
                                </button>
                                 <button onClick={onAction}
                                    className="flex-1 w-full flex items-center justify-center gap-3 bg-[#06C755] hover:bg-[#05b34c] text-white py-4 px-8 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(6,199,85,0.5)] whitespace-nowrap"
                                >
                                    LINE賬號加入會員
                                </button>
                            </>
                        )}
                    </div>

                     <div className="hidden md:flex items-center gap-8 text-blue-100/40 text-[11px] font-black uppercase tracking-[0.5em] mt-4">
                        <div className="flex items-center gap-2">
                             <img src="https://bot.ycideas.com/lai_logo.svg" className="w-4 h-4 grayscale opacity-50" alt="YC Ideas AI 智能店長團隊" />
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
