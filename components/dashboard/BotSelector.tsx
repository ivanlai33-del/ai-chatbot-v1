'use client';

import React from 'react';
import { Plus, Bot } from 'lucide-react';

interface BotSelectorProps {
    bots: any[];
    selectedBotId: string | null;
    setSelectedBotId: (id: string | null) => void;
    onAddBot?: () => void;
}

export default function BotSelector({ bots, selectedBotId, setSelectedBotId }: BotSelectorProps) {
    // Exactly 5 slots for the PLG Strategy
    const slots = Array.from({ length: 5 }, (_, i) => bots[i] || null);

    return (
        <div className="flex flex-nowrap items-center gap-3 pt-2 w-full overflow-x-auto pb-2 no-scrollbar">
            {slots.map((bot, index) => {
                const emptyId = `empty-${index}`;
                const isSelected = selectedBotId === (bot?.id || emptyId);
                const avatarSrc = bot?.channelIcon || bot?.channel_icon || bot?.pictureUrl || null;

                return (
                    <button
                        key={bot?.id || emptyId}
                        onClick={() => {
                            if (!bot) {
                                window.location.href = '/dashboard/connect?action=new';
                            } else {
                                setSelectedBotId(bot.id);
                            }
                        }}
                        className={`flex items-center gap-2.5 px-4 min-w-[140px] h-[52px] justify-center rounded-2xl border-2 transition-all whitespace-nowrap ${
                            isSelected
                                ? 'border-transparent bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-black shadow-md'
                                : 'bg-slate-50 border-slate-200 text-slate-700 font-bold hover:border-emerald-300 hover:bg-emerald-50'
                        } ${!bot && !isSelected ? 'opacity-75 border-dashed border-slate-300 bg-white' : ''}`}
                    >
                        {bot ? (
                            <>
                                {/* Avatar: image if available, else icon */}
                                {avatarSrc ? (
                                    <img
                                        src={avatarSrc}
                                        alt=""
                                        className="w-6 h-6 rounded-lg object-cover shrink-0"
                                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                ) : (
                                    <Bot
                                        className={`w-[22px] h-[22px] shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`}
                                    />
                                )}
                                <span className={`text-[13.5px] max-w-[120px] truncate ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                    {bot.channelName || bot.channel_name || '未命名店長'}
                                </span>
                            </>
                        ) : (
                            <>
                                <Plus className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                <span className={`text-[13px] font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>尚未串聯</span>
                            </>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
