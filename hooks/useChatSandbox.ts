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
    
    // Dynamic Initial Message based on Brand Name
    const rawName = config?.brand_dna?.name || '您的 AI 專家';
    const expertKeywords = ["分析師", "律師", "顧問", "管家", "護理", "教師", "專家", "醫生", "教練", "導航", "助手"];
    const isExpert = expertKeywords.some(k => rawName.includes(k));
    const title = isExpert ? "" : "助手";
    
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { 
            role: 'ai', 
            content: `您好！我是您的「${rawName}」${title} 👋\n請在左側填寫「AI 智庫」，我會立刻學習您的專業知識，並在這裡為您示範！` 
        }
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
