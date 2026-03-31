'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
}

interface UseChatSandboxOptions {
    planLevel: number;
    config: any;
}

export function useChatSandbox({ planLevel, config }: UseChatSandboxOptions) {
    const [chatInput, setChatInput] = useState('');
    const [chatCount, setChatCount] = useState(0);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { role: 'ai', content: '您好！我是您的 AI 店長 🤖\n請先填寫左側的「AI 店長智庫」，我就能立刻學會您的品牌個性，然後在這裡為您示範！' }
    ]);
    const [isChatting, setIsChatting] = useState(false);

    // Load initial count
    useEffect(() => {
        const saved = localStorage.getItem('sandbox_chat_count');
        if (saved) setChatCount(parseInt(saved));
    }, []);

    const handleChat = useCallback(async (msg?: string) => {
        const userMsg = msg || chatInput.trim();
        if (!userMsg || isChatting) return;

        // Sandbox limit set to 30 to protect API costs before payment
        if (planLevel === 0 && chatCount >= 30) {
            setChatMessages(prev => [...prev, { role: 'ai', content: '🚨【系統提醒】您的免費 Sandbox 測試額度 (30次) 已滿。為了不影響您後續在 LINE 上的實績營運，請先至左上方完成「方案開通」以解除所有限制！' }]);
            return;
        }

        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsChatting(true);

        try {
            const res = await fetch('/api/member/sandbox-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: userMsg, 
                    storeConfig: config,
                    isFree: planLevel === 0 
                }),
            });
            const data = await res.json();
            setChatMessages(prev => [...prev, { role: 'ai', content: data.reply || '目前 AI 尚未設定。' }]);
            
            if (planLevel === 0) {
                const newCount = chatCount + 1;
                setChatCount(newCount);
                localStorage.setItem('sandbox_chat_count', newCount.toString());
            }
        } catch {
            setChatMessages(prev => [...prev, { role: 'ai', content: '連線異常，請稍後再試。' }]);
        } finally {
            setIsChatting(false);
        }
    }, [chatInput, chatCount, isChatting, planLevel, config]);

    return {
        chatInput,
        setChatInput,
        chatMessages,
        isChatting,
        handleChat,
        chatCount
    };
}
