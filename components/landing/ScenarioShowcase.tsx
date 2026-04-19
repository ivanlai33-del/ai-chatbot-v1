'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Zap, 
    ShieldCheck, 
    Target, 
    LineChart, 
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Smartphone,
    Trophy
} from 'lucide-react';

interface Message {
    role: 'customer' | 'ai';
    content: string;
    time?: string;
}

interface Scenario {
    id: number;
    profession: string;
    icon: any;
    color: string;
    glowColor: string;
    obstacle: string;
    wowFactor: string;
    features: string[];
    messages: Message[];
}

const scenarios: Scenario[] = [
    {
        id: 0,
        profession: '美業AI店長',
        icon: Sparkles,
        color: 'from-pink-500 to-rose-400',
        glowColor: 'rgba(244, 63, 94, 0.6)',
        obstacle: '老闆忙碌操作中',
        wowFactor: '即時回覆 3 位客人的不同問價',
        features: ['常見問題', '聯絡窗口'],
        messages: [
            { role: 'customer', content: '請問霧眉特價到什麼時候？地點在平面嗎？' },
            { role: 'ai', content: '特價到月底！工作室在捷運中山站 2 號出口旁。這是導航路徑 [🔗]', time: '自動回覆 FAQ' },
            { role: 'customer', content: '週四下午 4 點還有空位嗎？' },
            { role: 'ai', content: '幫您確認中！週四 16:00 還有空檔，請留下手機，我會立刻通知店長為您保留。', time: '引導預約留電' }
        ]
    },
    {
        id: 1,
        profession: '家電AI店長',
        icon: Zap,
        color: 'from-blue-500 to-cyan-400',
        glowColor: 'rgba(6, 182, 212, 0.6)',
        obstacle: '面對複雜規格比對',
        wowFactor: '0.5 秒調閱 PDF 掌握產品細節',
        features: ['PDF/網頁學習', '引導規則'],
        messages: [
            { role: 'customer', content: '這款淨水器含鉛濾除率是多少？跟 A 牌差別在哪？' },
            { role: 'ai', content: '根據智庫內的 PDF 規格書，本款含鉛濾除率為 99.9%，優於 A 牌的 95%。', time: '調閱 PDF 智庫' },
            { role: 'customer', content: '很專業！那現在買有優惠嗎？' },
            { role: 'ai', content: '現在購買點擊下方連結可領 9 折優惠卡，下單再贈原廠濾瓶喔！', time: '自動化導購策略' }
        ]
    },
    {
        id: 2,
        profession: '餐廳AI經理',
        icon: User,
        color: 'from-emerald-500 to-teal-400',
        glowColor: 'rgba(16, 185, 129, 0.6)',
        obstacle: '深夜 03:00 老闆休息時',
        wowFactor: '半夜自動留住高單價預約',
        features: ['品牌 DNA', '引導規則'],
        messages: [
            { role: 'customer', content: '週末 10 人慶生想訂位，有推薦的包廂嗎？' },
            { role: 'ai', content: '半夜好！很高興您選擇在我們這慶生。週六尚有星空包廂可暫留。', time: '03:15 深更回應' },
            { role: 'customer', content: '好喔，預訂包廂要怎麼聯絡？' },
            { role: 'ai', content: '沒問題，請留下大名與電話。明早營業時間一到，專員會優先與您確認細節實況。', time: '自動留客不漏單' }
        ]
    },
    {
        id: 3,
        profession: '智能AI銷售客服',
        icon: LineChart,
        color: 'from-indigo-500 to-purple-400',
        glowColor: 'rgba(99, 102, 241, 0.6)',
        obstacle: '活動大量湧入詢價',
        wowFactor: '高速分眾並標註 CRM 客戶意圖',
        features: ['常見問題', 'CRM 分眾行銷'],
        messages: [
            { role: 'customer', content: '今年流行什麼色？這款粉色穿起來會顯黑嗎？' },
            { role: 'ai', content: '今年大勢色是柔焦粉。根據我們的趨勢週報，這款粉色極具提亮效果。', time: '智庫自動答覆' },
            { role: 'customer', content: '那我要怎麼下單？' },
            { role: 'ai', content: '已發送結帳細節！同時我已為您標註「高質感穿搭意向」標籤。', time: '自動標註 CRM' }
        ]
    },
    {
        id: 4,
        profession: '品牌公關AI客服',
        icon: ShieldCheck,
        color: 'from-orange-500 to-red-400',
        glowColor: 'rgba(239, 68, 68, 0.6)',
        obstacle: '客人情緒不滿時',
        wowFactor: '偵測負評並第一時間發送警報',
        features: ['品牌防護', '即時下指令'],
        messages: [
            { role: 'customer', content: '等半個月了都沒收到貨，你們是詐騙嗎？' },
            { role: 'ai', content: '萬分抱歉讓您久等了！我已即時將您的案件標註為「最高急件」處理中。', time: '情緒偵測中' },
            { role: 'customer', content: '請立刻處理，不然我就去爆料。' },
            { role: 'ai', content: '理解您的焦慮。我已發送緊急警告通知店長手機，會由專員查證後優先回電。', time: '後台同步報警' }
        ]
    },
    {
        id: 5,
        profession: 'TOP業務AI助理',
        icon: Target,
        color: 'from-amber-500 to-yellow-500',
        glowColor: 'rgba(245, 158, 11, 0.6)',
        obstacle: '過濾無效名單節省時間',
        wowFactor: '精準篩選出高潛力買主電話',
        features: ['引導規則', 'CRM 分眾行銷'],
        messages: [
            { role: 'customer', content: '那套景觀房看起來很棒，我可以去參觀嗎？' },
            { role: 'ai', content: '沒問題！為了給您最優品質的看屋體驗，請問您的預算範圍與區域偏好？', time: '執行資格篩選策略' },
            { role: 'customer', content: '預算約 4,000 萬，喜歡大安區。' },
            { role: 'ai', content: '收到！這已達到黃金名單門檻。已為您送至顧問手機，顧問會立即聯繫。', time: '捕捉高價值名單' }
        ]
    }
];

const ScenarioCard = ({ 
    scenario, 
    isActive, 
    onComplete 
}: { 
    scenario: Scenario, 
    isActive: boolean, 
    onComplete: (done: boolean) => void 
}) => {
    const [visibleCount, setVisibleCount] = useState(0);

    useEffect(() => {
        if (!isActive) {
            setVisibleCount(0);
            return;
        }

        const interval = setInterval(() => {
            setVisibleCount(prev => {
                if (prev < scenario.messages.length) return prev + 1;
                return prev;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [isActive, scenario.messages.length]);

    useEffect(() => {
        if (isActive && visibleCount === scenario.messages.length) {
            onComplete(true);
        } else if (isActive) {
            onComplete(false);
        }
    }, [visibleCount, scenario.messages.length, onComplete, isActive]);

    return (
        <div 
            className={`
                relative w-full max-w-[340px] aspect-[9/19] mx-auto rounded-[48px] overflow-hidden 
                border-[2px] border-white/20 bg-slate-950 transition-all duration-700
                ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
            `}
            style={{ 
                boxShadow: isActive ? `0 0 70px ${scenario.glowColor}, 0 0 140px rgba(0,0,0,0.7)` : 'none'
            }}
        >
            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-2xl z-30 opacity-60" />
            
            {/* Status Bar */}
            <div className="pt-8 px-6 pb-2 flex justify-between items-center bg-slate-950/80 backdrop-blur-md relative z-20">
                <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Live Demo</div>
                <div className="flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </div>
            </div>

            {/* Header */}
            <div className="px-6 py-5 flex items-center gap-4 bg-slate-950/90 backdrop-blur-md border-b border-white/5 relative z-20">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${scenario.color} flex items-center justify-center p-2.5 shadow-lg`}>
                    <scenario.icon className="w-full h-full text-white" />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-white font-black text-[15px] tracking-tight">{scenario.profession}</h3>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">智庫運作中</span>
                </div>
            </div>

            {/* Obstacle Box */}
            <div className="px-5 py-4 relative z-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-amber-500 uppercase tracking-widest font-black text-[10px]">
                        <Smartphone className="w-3.5 h-3.5" />
                        情境挑戰：{scenario.obstacle}
                    </div>
                    <p className="text-[13px] text-slate-300 font-medium leading-relaxed italic opacity-80">
                        每當老闆遇到此情況，AI 即刻接手救援...
                    </p>
                </div>
            </div>

            {/* Chat Flow */}
            <div className="flex-1 px-5 overflow-y-auto no-scrollbar pb-24 h-[calc(100%-250px)]">
                <div className="flex flex-col gap-5 pt-4">
                    {scenario.messages.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: m.role === 'customer' ? 20 : -20, scale: 0.9 }}
                            animate={i < visibleCount ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0 }}
                            className={`flex flex-col max-w-[90%] ${m.role === 'customer' ? 'ml-auto items-end' : 'items-start'}`}
                        >
                            <div className={`
                                px-4 py-3 rounded-2xl text-[14px] font-bold leading-relaxed
                                ${m.role === 'customer' 
                                    ? 'bg-slate-800 text-white rounded-tr-none' 
                                    : 'bg-emerald-500 text-white rounded-tl-none shadow-lg shadow-emerald-500/30'}
                            `}>
                                {m.content}
                            </div>
                            {m.time && (
                                <span className="text-[9px] text-slate-500 font-black uppercase mt-1.5 px-1">
                                    {m.time}
                                </span>
                            )}
                        </motion.div>
                    ))}
                    {isActive && visibleCount < scenario.messages.length && (
                        <div className="flex gap-1.5 p-2 ml-2">
                            <span className="w-2 h-2 bg-emerald-400 animate-bounce rounded-full" />
                            <span className="w-2 h-2 bg-emerald-400 animate-bounce delay-75 rounded-full" />
                            <span className="w-2 h-2 bg-emerald-400 animate-bounce delay-150 rounded-full" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function ScenarioShowcase() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const nextScenario = useCallback(() => {
        setIsComplete(false);
        setActiveIndex(prev => (prev + 1) % scenarios.length);
    }, []);

    const prevScenario = useCallback(() => {
        setIsComplete(false);
        setActiveIndex(prev => (prev - 1 + scenarios.length) % scenarios.length);
    }, []);

    useEffect(() => {
        if (isComplete) {
            const timer = setTimeout(() => {
                nextScenario();
            }, 8500);
            return () => clearTimeout(timer);
        }
    }, [isComplete, nextScenario]);

    return (
        <section id="scenarios" className="py-24 px-6 relative overflow-hidden bg-[#020617] border-t border-white/5">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1)_0%,transparent_60%)]" />
            
            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div 
                        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
                    >
                        <span className="text-emerald-400 text-[10px] font-black tracking-[0.4em] uppercase">解決老闆的障礙時刻</span>
                    </motion.div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                        AI店長如何幫您 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">處理大小事？</span>
                    </h2>
                </div>

                {/* Display Carousel */}
                <div className="relative flex items-center justify-center min-h-[720px] perspective-1000 mt-[-30px]">
                    {/* Navigation Buttons - Glassmorphism & Closer */}
                    <button 
                        onClick={prevScenario}
                        className="absolute left-4 md:-left-12 z-30 p-5 rounded-full bg-emerald-500/20 backdrop-blur-xl border border-white/20 text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:bg-emerald-500/40 hover:scale-110 transition-all cursor-pointer"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    
                    <button 
                        onClick={nextScenario}
                        className="absolute right-4 md:-right-12 z-30 p-5 rounded-full bg-emerald-500/20 backdrop-blur-xl border border-white/20 text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:bg-emerald-500/40 hover:scale-110 transition-all cursor-pointer"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Active Cards Transition */}
                    <div className="w-full flex items-center justify-center p-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, x: 120, rotateY: 35, scale: 0.85 }}
                                animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -120, rotateY: -35, scale: 0.85 }}
                                transition={{ type: 'spring', damping: 30, stiffness: 120 }}
                                className="w-full flex justify-center"
                            >
                                <ScenarioCard 
                                    scenario={scenarios[activeIndex]} 
                                    isActive={true}
                                    onComplete={(done) => setIsComplete(done)}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Optimized Footer with Achievement Bubble */}
                <div className="mt-[-15px] flex flex-col items-center">
                    <div className="h-32 flex items-end justify-center mb-[10px] w-full relative">
                        <AnimatePresence>
                            {isComplete && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                    className="bg-emerald-500/20 backdrop-blur-2xl border border-white/20 rounded-[32px] px-8 py-6 shadow-[0_30px_60px_rgba(0,0,0,0.5),0_0_30px_rgba(16,185,129,0.2)] flex items-center gap-6 relative z-20"
                                >
                                    {/* Bubble Arrow */}
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-emerald-500/40 backdrop-blur-md rotate-45 border-r border-b border-white/10" />
                                    
                                    <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                                        <Trophy className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] text-emerald-400 font-black uppercase tracking-[0.2em] mb-1">解決神救援達成</span>
                                        <p className="text-white font-black text-[20px] md:text-[24px] leading-tight tracking-tight">
                                            {scenarios[activeIndex].wowFactor}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Centered Single Profession Label */}
                    <div className="flex flex-col items-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="flex flex-col items-center"
                            >
                                <span className="text-[11px] font-black uppercase tracking-[0.5em] mb-2 text-emerald-400 opacity-60">目前職業情境</span>
                                <h4 className="text-2xl md:text-3xl font-black text-white tracking-[0.2em] uppercase text-center leading-none">
                                    {scenarios[activeIndex].profession}
                                </h4>
                            </motion.div>
                        </AnimatePresence>
                        
                        {/* Smooth Page Dots for Reference */}
                        <div className="flex gap-3.5 mt-10">
                            {scenarios.map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={false}
                                    animate={{ 
                                        width: i === activeIndex ? 40 : 10,
                                        backgroundColor: i === activeIndex ? '#10b981' : 'rgba(255,255,255,0.1)'
                                    }}
                                    className="h-2 rounded-full cursor-pointer transition-all duration-500"
                                    onClick={() => {
                                        setIsComplete(false);
                                        setActiveIndex(i);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
