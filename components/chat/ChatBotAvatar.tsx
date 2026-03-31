'use client';

import { Bot } from 'lucide-react';

interface ChatBotAvatarProps {
    bot?: {
        pictureUrl?: string;
        channelName?: string;
    } | null;
    size?: string;
}

export default function ChatBotAvatar({ bot, size = "w-10 h-10" }: ChatBotAvatarProps) {
    const isLineBot = !!bot?.pictureUrl;

    return (
        <div className={`${size} rounded-2xl bg-white/20 flex items-center justify-center border border-white/20 shadow-inner overflow-hidden`}>
            {isLineBot ? (
                <img 
                    src={bot.pictureUrl} 
                    alt={bot.channelName || 'AI Bot'} 
                    className="w-full h-full object-cover" 
                />
            ) : (
                <Bot className="w-5 h-5 text-white" />
            )}
        </div>
    );
}
