'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, ShoppingBag, UtensilsCrossed, User } from 'lucide-react';

const industries = [
    {
        id: 0,
        title: '美容工作室',
        desc: '療程介紹、價目表查詢、自動引導預約時段，讓老師專心服務現場客人。',
        icon: Sparkles,
        image: '/images/landing/occ-beauty.png',
        color: 'from-pink-500/20 to-rose-500/20',
        iconColor: 'text-pink-400'
    },
    {
        id: 1,
        title: '零售品牌',
        desc: '尺寸建議、庫存查詢、出貨進度與退換貨說明，24 小時導購不漏單。',
        icon: ShoppingBag,
        image: '/images/landing/occ-retail.png',
        color: 'from-blue-500/20 to-indigo-500/20',
        iconColor: 'text-blue-400'
    },
    {
        id: 2,
        title: '餐飲／預約服務',
        desc: '營業時間、菜單內容、訂位方式引導，尖峰時段不再擔心漏接 LINE 詢問。',
        icon: UtensilsCrossed,
        image: '/images/landing/occ-catering.png',
        color: 'from-orange-500/20 to-amber-500/20',
        iconColor: 'text-amber-400'
    },
    {
        id: 3,
        title: '個人商家／課程',
        desc: '常見 FAQ 自動回答、引導報名流程，一個人也能維持超高回覆效率。',
        icon: User,
        image: '/images/landing/occ-course.png',
        color: 'from-emerald-500/20 to-teal-500/20',
        iconColor: 'text-emerald-400'
    }
];

export default function IndustryFit() {
    const [expandedCards, setExpandedCards] = useState<number[]>([]);

    const toggleCard = (id: number) => {
        setExpandedCards(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <section className="py-24 px-6 relative z-30 overflow-hidden">
            {/* Main Background Image - Set to full opacity as requested */}
            <div 
                className="absolute inset-0 z-0 opacity-50 pointer-events-none"
                style={{ 
                    backgroundImage: "url('/images/landing/industry-bg.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />
            
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header with Mascot */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-0 px-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5, x: 300 }}
                        whileInView={{ opacity: 1, scale: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.1 }}
                        // Mascot size: 640px / 511px
                        // Shifted down by 80px AND right by 130px
                        className="relative w-[511px] h-[511px] md:w-[640px] md:h-[640px] flex-shrink-0 translate-y-[80px] translate-x-[130px] z-20"
                    >
                        <Image 
                            src="/images/landing/ai-mascot.svg" 
                            alt="AI Mascot"
                            fill
                            sizes="(max-width: 768px) 100vw, 640px"
                            className="object-contain"
                        />
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        // Title moved further left by 80px (Total -130px)
                        className="text-center md:text-left flex-1 z-10 translate-x-[-230px]"
                    >
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                            AI 智能店長，<br className="hidden md:block" />適不適合我的店家？
                        </h2>
                        <p className="text-slate-200 text-lg md:text-xl font-bold max-w-2xl drop-shadow-sm">
                            不論您的產業規模，只要您在 LINE 官方帳號經營上遇到重複問答的痛點，這就是為您設計的解決方案。
                        </p>
                    </motion.div>
                </div>

                {/* Interactive Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-30 -mt-24 md:-mt-20">
                    {industries.map((ind) => {
                        const isExpanded = expandedCards.includes(ind.id);
                        return (
                            <motion.div
                                key={ind.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: ind.id * 0.1 }}
                                onClick={() => toggleCard(ind.id)}
                                className="relative aspect-[4/5] rounded-[32px] overflow-hidden group cursor-pointer border border-white/10 select-none shadow-2xl transition-all"
                            >
                                {/* Card Base Background Layer */}
                                <div 
                                    className="absolute inset-0 z-0 opacity-70 group-hover:opacity-90 transition-opacity"
                                    style={{ 
                                        backgroundImage: "url('/images/landing/card-base.png')",
                                        backgroundSize: 'cover'
                                    }}
                                />
                                
                                {/* Inner Container to hold layers */}
                                <div className="relative w-full h-full flex flex-col items-center">
                                    {/* Glass Overlay when expanded */}
                                    <motion.div 
                                        className="absolute inset-0 z-10 bg-emerald-900/40 backdrop-blur-xl"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: isExpanded ? 1 : 0 }}
                                    />

                                    {/* Illustration - Moves and scales */}
                                    <motion.div
                                        className="relative z-20 w-full h-full flex items-center justify-center p-4"
                                        animate={{ 
                                            // Shrunk position adjusted: moved down 45px (previous 35px + 10px)
                                            y: isExpanded ? 'calc(-35% + 45px)' : '0%',
                                            // Scale increased by another 5% (0.66 -> 0.7)
                                            scale: isExpanded ? 0.7 : 1,
                                        }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    >
                                        <div className="relative w-full h-full">
                                            <Image 
                                                src={ind.image} 
                                                alt={ind.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                                className="object-contain"
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Text Content - Slides up below the shrunk illustration */}
                                    <motion.div
                                        className="absolute inset-x-0 bottom-0 z-20 p-8 flex flex-col items-center justify-end text-center h-full"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ 
                                            opacity: isExpanded ? 1 : 0, 
                                            y: isExpanded ? 0 : 40 
                                        }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    >
                                        <h3 className="text-3xl font-bold text-white mb-4">{ind.title}</h3>
                                        <p className="text-slate-100 leading-relaxed font-bold text-lg">
                                            {ind.desc}
                                        </p>
                                    </motion.div>
                                </div>
                                
                                {/* Glow effect when expanded or hovered */}
                                <div className={`absolute inset-0 border-2 transition-colors pointer-events-none rounded-[32px] z-30 ${
                                    isExpanded ? 'border-emerald-400/60 shadow-[inset_0_0_20px_rgba(52,211,153,0.2)]' : 'border-emerald-500/0 group-hover:border-emerald-500/40'
                                }`} />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
