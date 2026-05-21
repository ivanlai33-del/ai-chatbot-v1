'use client';

import React, { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageBubble } from './MessageBubble';

interface ChatMessageListProps {
    messages: any[];
    isTyping: boolean;
    lineUserPicture: string | null | undefined;
    initiateLineLogin: () => void;
    setInputValue: (val: string) => void;
    setActiveWebViewUrl: (url: string | null) => void;
    setViewMode: (mode: 'chat' | 'webview') => void;
    renderWidgets?: (message: any) => React.ReactNode;
}

export default function ChatMessageList({
    messages,
    isTyping,
    lineUserPicture,
    initiateLineLogin,
    setInputValue,
    setActiveWebViewUrl,
    setViewMode,
    renderWidgets
}: ChatMessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar scroll-smooth">
            <AnimatePresence initial={false}>
                {messages.map((m) => (
                    <React.Fragment key={m.id}>
                        <MessageBubble 
                            message={m}
                            lineUserPicture={lineUserPicture}
                            initiateLineLogin={initiateLineLogin}
                            setInputValue={setInputValue}
                            setActiveWebViewUrl={setActiveWebViewUrl}
                            setViewMode={setViewMode}
                        />
                        {renderWidgets?.(m)}
                    </React.Fragment>
                ))}
            </AnimatePresence>

            {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 ml-14">
                    <span className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce delay-75" />
                    <span className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce delay-150" />
                </motion.div>
            )}
        </div>
    );
}
