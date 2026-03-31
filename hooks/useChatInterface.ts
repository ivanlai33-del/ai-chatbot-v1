import { useState, useEffect, useRef, useCallback } from 'react';
import { Message, ChatPlan } from '@/lib/chat-types';
import { OWNER_INSIGHTS } from '@/lib/chat-constants';

export function useChatInterface(initialType: string | null = null) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [selectedPlan, setSelectedPlan] = useState<ChatPlan>({ name: '', price: '' });
    const [lineUserId, setLineUserId] = useState<string | null>(null);
    const [lineUserName, setLineUserName] = useState<string | null>(null);
    const [lineUserPicture, setLineUserPicture] = useState<string | null>(null);
    const [botId, setBotId] = useState<string | null>(null);
    const [mgmtToken, setMgmtToken] = useState<string | null>(null);
    const [isAdminView, setIsAdminView] = useState(false);
    const [adminBotData, setAdminBotData] = useState<any>(null);
    const [insightIndex, setInsightIndex] = useState(0);
    const [isConnecting, setIsConnecting] = useState(false);
    const [viewMode, setViewMode] = useState<'chat' | 'webview'>('chat');
    const [activeWebViewUrl, setActiveWebViewUrl] = useState<string | null>(null);
    const [randomBgPath, setRandomBgPath] = useState<string>('/images/bg-landing_1.jpg');
    const [randomBotPath, setRandomBotPath] = useState<string>('/bot_01.svg');

    const messagesRef = useRef<Message[]>([]);
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const addAiMessage = useCallback((content: string, type: Message['type'] = 'text', metadata?: any) => {
        const newMessage: Message = {
            id: crypto.randomUUID(),
            role: 'ai',
            content,
            type,
            ...metadata
        };
        setMessages(prev => [...prev, newMessage]);
    }, []);

    const triggerAiResponse = async (currentMessages: Message[]) => {
        setIsTyping(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: currentMessages.map(m => ({ role: m.role, content: m.content })),
                    context: {
                        lineUserId,
                        lineUserName,
                    }
                }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                console.error('Chat API Error:', errorData);
                addAiMessage("抱歉，我現在有點頭暈（伺服器錯誤），要求失敗，可以請您晚點再試試嗎？");
                return;
            }
            const data = await res.json();
            const reply = data.reply || data.message;
            if (reply) {
                addAiMessage(reply, data.type || 'text', data.metadata);
            }
        } catch (error) {
            console.error('Failed to get AI response:', error);
            addAiMessage("抱歉，我現在有點頭暈，請稍後再跟我說話...");
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;
        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: inputValue,
            type: 'text'
        };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputValue('');
        await triggerAiResponse(newMessages);
    };

    const checkExistingBots = async (userId: string) => {
        try {
            const res = await fetch(`/api/bot?lineUserId=${userId}`);
            const data = await res.json();
            if (data.success && data.bots && data.bots.length > 0) {
                const bot = data.bots[0];
                setBotId(bot.id);
                setTimeout(() => {
                    addAiMessage(
                        `老闆歡迎回來！✨ 偵測到您已開通過「${bot.store_name}」的 AI 店長服務。您想直接進入管理後台進行設定嗎？`,
                        'member_greeting'
                    );
                }, 1500);
                return true;
            }
        } catch (error) {
            console.error('Failed to check existing bots:', error);
        }
        return false;
    };

    const initiateLineLogin = () => {
        const width = 500;
        const height = 650;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        window.open('/api/auth/line?popup=true', 'LineLogin', `width=${width},height=${height},left=${left},top=${top}`);
    };

    // Shared Initialization
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedId = localStorage.getItem('line_user_id');
            const savedName = localStorage.getItem('line_user_name');
            const savedPicture = localStorage.getItem('line_user_picture');
            if (savedId) {
                setLineUserId(savedId);
                setLineUserName(savedName);
                setLineUserPicture(savedPicture);
                checkExistingBots(savedId);
            }

            // Random BG and Bot
            const bgNum = Math.floor(Math.random() * 6) + 1;
            const botNum = Math.floor(Math.random() * 10) + 1;
            setRandomBgPath(`/images/bg-landing_${bgNum}.jpg`);
            setRandomBotPath(`/bot_${botNum.toString().padStart(2, '0')}.svg`);

            // Security Shield
            const handleContextMenu = (e: MouseEvent) => e.preventDefault();
            document.addEventListener('contextmenu', handleContextMenu);
            return () => document.removeEventListener('contextmenu', handleContextMenu);
        }
    }, []);

    // LINE Login Message Listener
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'LINE_LOGIN_SUCCESS') {
                const { line_id, line_name, line_picture } = event.data;
                setLineUserId(line_id);
                setLineUserName(line_name);
                setLineUserPicture(line_picture || null);
                localStorage.setItem('line_user_id', line_id || '');
                localStorage.setItem('line_user_name', line_name || '');
                localStorage.setItem('line_user_picture', line_picture || '');
                
                checkExistingBots(line_id).then(isMember => {
                    if (!isMember) {
                        const loginSuccessMsg: Message = { 
                            id: crypto.randomUUID(),
                            role: 'user', 
                            content: `我已經完成 LINE 身份綁定，我是 ${line_name}。`
                        };
                        setMessages(prev => [...prev, loginSuccessMsg]);
                        triggerAiResponse([...messagesRef.current, loginSuccessMsg]);
                    }
                });
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Placeholder rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setInsightIndex((prev) => (prev + 1) % OWNER_INSIGHTS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Initial Greeting
    useEffect(() => {
        if (messages.length === 0) {
            if (initialType === 'pricing') {
                addAiMessage("老闆您好！我是您的 AI 客服助理。關於服務方案與預算，以下是我們為您準備的詳細對照：", "pricing");
            } else {
                const randomMsg = OWNER_INSIGHTS[Math.floor(Math.random() * OWNER_INSIGHTS.length)];
                addAiMessage(randomMsg);
            }
        }
    }, [initialType]);

    return {
        messages, setMessages,
        inputValue, setInputValue,
        isTyping,
        billingCycle, setBillingCycle,
        selectedPlan, setSelectedPlan,
        lineUserId, lineUserName, lineUserPicture,
        botId, setBotId,
        mgmtToken, setMgmtToken,
        isAdminView, setIsAdminView,
        adminBotData, setAdminBotData,
        viewMode, setViewMode,
        activeWebViewUrl, setActiveWebViewUrl,
        randomBgPath, randomBotPath,
        handleSend,
        initiateLineLogin,
        addAiMessage,
        placeholder: OWNER_INSIGHTS[insightIndex]
    };
}
