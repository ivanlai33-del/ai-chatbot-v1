'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Plus, Bot, Link2 } from 'lucide-react';
import { getStoreLimit } from '@/lib/config/pricing';

interface BotSelectorProps {
    bots: any[];
    selectedBotId: string | null;
    setSelectedBotId: (id: string | null) => void;
    onAddBot?: () => void;
    /** 目前用戶的方案 tier（0=免費, 1=入門, 2=單店...6=旗艦Pro）預設 6（顯示最大欄位數）*/
    tier?: number;
}

export default function BotSelector({ bots, selectedBotId, setSelectedBotId, tier = 6 }: BotSelectorProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeDot, setActiveDot] = useState(0);
    const [hasOverflow, setHasOverflow] = useState(false);

    // 依方案 tier 動態決定槽位數（從 pricing.ts 讀取，不寫死）
    const maxSlots = getStoreLimit(tier);
    const slots = Array.from({ length: maxSlots }, (_, i) => bots[i] || null);

    const checkOverflow = () => {
        if (scrollRef.current) {
            setHasOverflow(scrollRef.current.scrollWidth > scrollRef.current.clientWidth);
        }
    };

    useEffect(() => {
        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [bots]);

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            const scrollTotal = scrollWidth - clientWidth;
            if (scrollTotal <= 0) {
                setActiveDot(0);
                return;
            }
            const progress = scrollLeft / scrollTotal;
            setActiveDot(progress > 0.5 ? 1 : 0);
        }
    };

    const handleDotClick = (index: number) => {
        if (scrollRef.current) {
            const { scrollWidth, clientWidth } = scrollRef.current;
            scrollRef.current.scrollTo({
                left: index === 0 ? 0 : scrollWidth - clientWidth,
                behavior: 'smooth'
            });
            setActiveDot(index);
        }
    };

    return (
        <div className="flex flex-col items-center w-full relative">
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex flex-nowrap items-center gap-3 pt-2 w-full overflow-x-auto pb-4 no-scrollbar scroll-smooth relative z-10"
            >
                {slots.map((bot, index) => {
                    const emptyId = `empty-${index}`;
                    const isSelected = selectedBotId === (bot?.id || emptyId);
                    const avatarSrc = bot?.channelIcon || bot?.channel_icon || bot?.pictureUrl || null;

                    return (
                        <div key={bot?.id || emptyId} className="relative group/slot shrink-0">
                            <button
                                onClick={() => {
                                    if (!bot) {
                                        window.location.href = `/dashboard/connect?action=new&slot=${index}`;
                                    } else {
                                        setSelectedBotId(bot.id);
                                    }
                                }}
                                className={`flex items-center gap-4 px-6 min-w-[200px] justify-start rounded-2xl border-2 transition-all whitespace-nowrap overflow-hidden ${
                                    isSelected
                                        ? 'border-transparent bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-black shadow-lg translate-y-[-2px] h-[85px]'
                                        : 'bg-white border-slate-200 text-slate-700 font-bold hover:border-emerald-300 hover:bg-emerald-50 h-[85px]'
                                } ${!bot && !isSelected ? 'opacity-75 border-dashed border-slate-300 bg-slate-50/50' : ''}`}
                            >
                                {bot ? (
                                    <>
                                        <div className="relative shrink-0">
                                            {avatarSrc ? (
                                                <img src={avatarSrc} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm bg-white/20 border border-white/20" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center">
                                                    <Bot className={`w-6 h-6 ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`} />
                                                </div>
                                            )}
                                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${bot.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        </div>
                                        <div className="flex flex-col items-start min-w-0">
                                            <span className={`text-[13.5px] font-black truncate w-full ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                                {bot.channelName || bot.channel_name || '未命名店長'}
                                            </span>
                                            <span className={`text-[10px] font-bold opacity-70 truncate w-full ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                                                LINE 官方帳號
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 shrink-0">
                                            <Plus className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                        </div>
                                        <span className={`text-[12.5px] font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>尚未串聯</span>
                                    </>
                                )}
                            </button>
                            
                            {/* Instant Link to Connect Page for Existing Bot */}
                            {bot && isSelected && (
                                <button 
                                    onClick={() => window.location.href = `/dashboard/connect?botId=${bot.id}`}
                                    className="absolute -top-2 -right-2 w-8 h-8 bg-white text-slate-500 rounded-full flex items-center justify-center shadow-xl border border-slate-100 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all z-20 group"
                                    title="串聯 LINE 店長"
                                >
                                    <Link2 className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ✨ Integrated Round Button Indicators (High Z-Index & Clickable) - CUSTOMER REQUEST: GREEN AT BOTTOM */}
            {hasOverflow && (
                <div className="flex gap-4 mt-2 mb-2 relative z-50">
                    <button 
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDotClick(0);
                        }}
                        className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 hover:bg-emerald-400 shadow-[0_2px_12px_rgba(16,185,129,0.2)] cursor-pointer active:scale-95 ${
                            activeDot === 0 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)] scale-110' : 'bg-emerald-500/20'
                        }`}
                        aria-label="回第一頁"
                    />
                    <button 
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDotClick(1);
                        }}
                        className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 hover:bg-emerald-400 shadow-[0_2px_12px_rgba(16,185,129,0.2)] cursor-pointer active:scale-95 ${
                            activeDot === 1 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)] scale-110' : 'bg-emerald-500/20'
                        }`}
                        aria-label="進第二頁"
                    />
                </div>
            )}
        </div>
    );
}
