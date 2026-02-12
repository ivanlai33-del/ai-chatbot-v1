"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, CreditCard, Settings, Rocket, ExternalLink, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
    id: string;
    role: 'ai' | 'user';
    content: string;
    type?: 'text' | 'pricing' | 'checkout' | 'setup' | 'success';
};

const LINE_GREEN = "#06C755";

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [step, setStep] = useState(0);
    const [storeName, setStoreName] = useState('');
    const [selectedPlan, setSelectedPlan] = useState({ name: '', price: '' });
    const [lineSecret, setLineSecret] = useState("");
    const [lineToken, setLineToken] = useState("");
    const [openaiKey, setOpenaiKey] = useState("");
    const [botId, setBotId] = useState<string | null>(null);
    const [placeholder, setPlaceholder] = useState("我想找Ai官方line小幫手....");
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeWebViewUrl, setActiveWebViewUrl] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'chat' | 'webview'>('chat');
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});
    const [isConnecting, setIsConnecting] = useState(false);
    const [isMasterMode, setIsMasterMode] = useState(false);

    const triggerAiResponse = async (currentMessages: Message[]) => {
        setIsTyping(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: currentMessages.map(m => ({ role: m.role, content: m.content })),
                    storeName,
                    currentStep: step,
                    isMaster: isMasterMode
                })
            });

            if (!res.ok) throw new Error('Chat API failed');

            const data = await res.json();
            setIsTyping(false);
            if (data.metadata?.suggestedPlaceholder) {
                setPlaceholder(data.metadata.suggestedPlaceholder);
            }
            processAiResponse(data.message, data.metadata);
        } catch (error: any) {
            console.error(error);
            setIsTyping(false);
            addAiMessage("抱歉，我現在連線有點問題，請稍後再跟我聊天！");
        }
    };

    const triggerGreeting = () => {
        const greetings = [
            ["ＨＩ老版/主管您好～", "只要 7 分鐘，我就能為您的 Line 官方帳號賦予靈魂！想知道我能幫您省下多少時間嗎？"],
            ["主管您好！正在想如何讓 Line 官方帳號更聰明嗎？", "給我 7 分鐘，我帶您實現全自動 AI 客服！"],
            ["歡迎老闆！我是您的 AI 數位轉型助手。", "準備好用 7 分鐘的時間，開啟您的 AI 自動化時代了嗎？"],
            ["ＨＩ主管！想讓您的 Line 官方帳號 24 小時不打烊嗎？", "只要 7 分鐘，我就可以幫您辦到！"],
            ["老闆您好～看來您很有眼光喔！", "想了解如何用 AI 幫您接單、省下那些繁瑣的客服時間嗎？"],
            ["主管您好～今天店裡的生意還好嗎？", "我可以幫您把 Line 官方帳號變得像真人店長一樣聰明喔！"],
            ["嘿，老闆！我來報到啦！", "聽說您在尋找能 24 小時上班、不用勞健保、還能精準回答客人的 AI 店長？"],
            ["主管您好～在這個 AI 時代，您的 Line 帳號還只會發推播嗎？", "給我 7 分鐘，我幫您升級成智慧店長！"],
            ["ＨＩ老闆！看到您點進來就對了！", "想知道為什麼其他 1688 間店家都選擇我幫他們處理 Line 客服嗎？"],
            ["歡迎老闆！我是您的 AI 數位顧問。", "想讓您的生意在 Line 上自動運轉嗎？只要 7 分鐘，我們就開始！"]
        ];

        const randomPair = greetings[Math.floor(Math.random() * greetings.length)];
        const isDoubleBubble = Math.random() < 0.3;

        setTimeout(() => {
            if (isDoubleBubble) {
                addAiMessage(randomPair[0]);
                setTimeout(() => {
                    addAiMessage(randomPair[1]);
                }, 2000);
            } else {
                addAiMessage(randomPair.join(' '));
            }
        }, 2000);
    };

    // Persistence: Load from localStorage
    useEffect(() => {
        const savedMsg = localStorage.getItem('chat_messages');
        const savedStep = localStorage.getItem('chat_step');
        const savedStoreName = localStorage.getItem('chat_store_name');
        const savedPlan = localStorage.getItem('chat_selected_plan');
        const savedLineSecret = localStorage.getItem('chat_line_secret');
        const savedLineToken = localStorage.getItem('chat_line_token');
        const savedOpenaiKey = localStorage.getItem('chat_openai_key');
        const savedBotId = localStorage.getItem('chat_bot_id');

        if (savedMsg) {
            const parsed = JSON.parse(savedMsg);
            setMessages(parsed);
            if (parsed.length === 0) triggerGreeting();
        } else {
            triggerGreeting();
        }

        if (savedStep) setStep(parseInt(savedStep));
        if (savedStoreName) setStoreName(savedStoreName);
        if (savedPlan) setSelectedPlan(JSON.parse(savedPlan));
        if (savedLineSecret) setLineSecret(savedLineSecret);
        if (savedLineToken) setLineToken(savedLineToken);
        if (savedOpenaiKey) setOpenaiKey(savedOpenaiKey);
        if (savedBotId) setBotId(savedBotId);
        const savedMasterMode = localStorage.getItem('chat_master_mode');
        if (savedMasterMode) setIsMasterMode(JSON.parse(savedMasterMode));

        setIsLoaded(true);
    }, []);

    // Persistence: Save to localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('chat_messages', JSON.stringify(messages));
            localStorage.setItem('chat_step', step.toString());
            localStorage.setItem('chat_store_name', storeName);
            localStorage.setItem('chat_selected_plan', JSON.stringify(selectedPlan));
            localStorage.setItem('chat_line_secret', lineSecret);
            localStorage.setItem('chat_line_token', lineToken);
            localStorage.setItem('chat_openai_key', openaiKey);
            if (botId) localStorage.setItem('chat_bot_id', botId);
            localStorage.setItem('chat_master_mode', JSON.stringify(isMasterMode));
        }
    }, [messages, step, storeName, selectedPlan, lineSecret, lineToken, openaiKey, botId, isLoaded, isMasterMode]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const addAiMessage = (content: string, type: Message['type'] = 'text') => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            const newMessage: Message = {
                id: Math.random().toString(36).substring(7),
                role: 'ai',
                content,
                type,
            };
            setMessages(prev => [...prev, newMessage]);
        }, 1000 + Math.random() * 500);
    };

    const processAiResponse = (content: string, metadata: any) => {
        let actionTip: Message['type'] = 'text';

        if (metadata.action) {
            const action = metadata.action;
            if (action === 'SHOW_PLANS') actionTip = 'pricing';
            if (action === 'SHOW_CHECKOUT') actionTip = 'checkout';
            if (action === 'SHOW_SETUP') actionTip = 'setup';
            if (action === 'SHOW_SUCCESS') actionTip = 'success';
        }

        if (metadata.storeName && metadata.storeName !== "未命名") {
            setStoreName(metadata.storeName);
        }

        addAiMessage(content, actionTip);
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isTyping) return;

        // 1. Client-side Bulk Data & Input Validation
        if (inputValue.length > 2000) {
            addAiMessage("哎呀老闆，這訊息比我老闆的長報表還長！能不能稍微簡短一點，或是分兩次發給我呀？");
            return;
        }

        // 2. Meaningless Text & Repetition Filter
        const isMeaningless = (str: string) => {
            const repetitive = /(.)\1{9,}/.test(str); // Repetitive characters like 'aaaaaaaaaa'
            const gibberish = str.length > 20 && !str.includes(' ') && !/[\u4e00-\u9fa5]/.test(str); // Long non-Chinese strings without spaces
            return repetitive || gibberish;
        };

        if (isMeaningless(inputValue)) {
            addAiMessage("老闆，您這是在跟我說外星語嗎？👽 我雖然博學，但這種高深莫測的亂碼我還在學習中，換個正常的說法吧！");
            setInputValue('');
            return;
        }

        const userMsg: Message = {
            id: Math.random().toString(36).substring(7),
            role: 'user',
            content: inputValue,
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputValue(''); // Clear immediately
        setIsTyping(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
                    storeName,
                    currentStep: step
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error('Chat API Error Response:', errorData);

                // Handle Security/Rate Limit Errors with Persona
                if (res.status === 429) {
                    addAiMessage("老闆！您這發訊息的速度快得我想起火了🔥 請稍微讓我喘口氣，幾秒鐘後再跟我聊嘛～");
                } else if (res.status === 400) {
                    addAiMessage(errorData.error || "哎呀，這訊息好像有點問題，我們換個內容試試？");
                } else {
                    addAiMessage("哎呀，連線好像被外星人攔截了🛸 請稍等一下再試試看！");
                }
                setIsTyping(false);
                return;
            }

            const data = await res.json();
            setIsTyping(false);
            processAiResponse(data.message, data.metadata);
        } catch (error: any) {
            console.error('handleSend Error:', error);
            setIsTyping(false);
            addAiMessage("哎呀，我這邊訊號跳跳的，老闆可以再跟我說一次嗎？");
        }
    };

    const handleSelectPlan = (name: string, price: string) => {
        setSelectedPlan({ name, price });
        const content = `我決定選擇 ${name} 方案`;
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content }]);
        setStep(2);
        // We could also call the API here to get AI's reaction to the plan choice
        setTimeout(() => {
            addAiMessage(`太棒了！這是最聰明的選擇。請完成支付以正式開通您的 AI 店長：`, "checkout");
        }, 800);
    };

    const handlePaymentSuccess = () => {
        setStep(3);
        addAiMessage(`付款成功！🎉 恭喜「${storeName || '您的店舖'}」正式進入 AI 自動化時代。`);
        setTimeout(() => {
            addAiMessage("最後一哩路，請依照下方精靈指示，將您的 Line 官方帳號與我串接：", "setup");
        }, 1500);
    };

    const handleSetupComplete = async () => {
        const errors: { [key: string]: boolean } = {};
        if (!lineSecret) errors.lineSecret = true;
        if (!lineToken) errors.lineToken = true;

        // Only require OpenAI Key for 2490 plan or if it was manually provided
        const isManagedPlan = selectedPlan.name?.includes('399') || selectedPlan.name?.includes('990') || selectedPlan.name?.includes('Lite') || selectedPlan.name?.includes('會計');
        if (!isManagedPlan && !openaiKey) errors.openaiKey = true;

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
        setIsConnecting(true);
        addAiMessage("連線測試中... ⚙️");

        try {
            const res = await fetch('/api/bot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeName,
                    lineSecret,
                    lineToken,
                    openaiKey,
                    selectedPlan
                })
            });

            if (!res.ok) throw new Error('API request failed');

            const data = await res.json();
            setBotId(data.botId);

            setTimeout(() => {
                addAiMessage("太棒了！連線測試成功。最後，請將下方的 Webhook 網址複製並填入您的 Line 後台，您的店長就會正式開始上班囉！", "success");
                setStep(4);
                setIsConnecting(false);
            }, 1000);
        } catch (error) {
            console.error(error);
            setIsConnecting(false);
            addAiMessage("哎呀，設定過程中發生一點問題。請檢查您的金鑰是否正確，然後再試一次。");
        }
    };

    const resetFlow = () => {
        setMessages([]);
        setStep(0);
        setStoreName('');
        setSelectedPlan({ name: '', price: '' });
        setLineSecret('');
        setLineToken('');
        setOpenaiKey('');
        setBotId(null);
        setShowResetConfirm(false);
        localStorage.clear();
        triggerGreeting();
    };

    if (!isLoaded) return null;

    return (
        <div className="min-h-screen bg-[#4D4D4D] relative overflow-hidden flex flex-col">
            {/* Background Footer Block */}
            <div
                className="absolute bottom-0 left-0 right-0 h-1/6 z-0"
                style={{ backgroundColor: LINE_GREEN }}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 80, damping: 25, delay: 0.2, duration: 1.5 }}
                className="relative z-10 flex flex-col min-h-[600px] h-[calc(100vh-60px)] my-[30px] max-w-2xl w-full mx-auto bg-white shadow-2xl overflow-hidden border border-zinc-200 rounded-[32px] font-sans"
            >
                {/* Header */}
                <header className="p-5 border-b glass flex items-center justify-between z-10 sticky top-0 bg-white/95 backdrop-blur-xl shrink-0">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-200/50 rotate-3 transition-transform hover:rotate-0"
                            style={{ backgroundColor: LINE_GREEN }}
                        >
                            <Bot className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="font-extrabold text-[23px] tracking-tight text-zinc-900 leading-tight">開通你的Line官方AI客服服務</h1>
                            <div className="flex items-center gap-1.5">
                                <span className="flex h-2 w-2 rounded-full bg-[#06C755] animate-pulse" />
                                <p className="text-[12px] font-black text-zinc-400 uppercase tracking-widest">{viewMode === 'webview' ? 'Resource Viewer' : 'Activate Your Line Official AI Service'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {activeWebViewUrl && (
                            <button
                                onClick={() => setViewMode(prev => prev === 'chat' ? 'webview' : 'chat')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm border",
                                    viewMode === 'webview'
                                        ? "bg-zinc-100 text-zinc-600 border-zinc-200"
                                        : "bg-[#06C755] text-white border-[#06C755] hover:brightness-110"
                                )}
                                title={viewMode === 'webview' ? "回到對話" : "查看網頁"}
                            >
                                {viewMode === 'webview' ? <Send className="w-4 h-4 rotate-180" /> : <ExternalLink className="w-4 h-4" />}
                                <span>{viewMode === 'webview' ? "回到對話" : "查看我的 AI 店長"}</span>
                            </button>
                        )}
                        <button
                            onClick={() => setIsMasterMode(!isMasterMode)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm border",
                                isMasterMode
                                    ? "bg-amber-500 text-white border-amber-500 shadow-amber-500/20"
                                    : "bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200"
                            )}
                            title={isMasterMode ? "切換至客戶助理模式" : "切換至總店長模式"}
                        >
                            <Bot className="w-4 h-4" />
                            <span>{isMasterMode ? "總店長模式" : "切換總店長"}</span>
                        </button>
                        <button
                            onClick={() => setShowResetConfirm(true)}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-600 transition-all shrink-0"
                            title="重新設定"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth bg-zinc-50/20"
                >
                    <AnimatePresence>
                        {messages.map((m) => (
                            <div key={m.id} className="space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={cn(
                                        "flex items-start gap-4",
                                        m.role === 'user' ? "flex-row-reverse" : ""
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 mt-1 shadow-md",
                                            m.role === 'ai' ? "bg-[#06C755]" : "bg-zinc-200"
                                        )}
                                        style={m.role === 'ai' ? { backgroundColor: LINE_GREEN } : {}}
                                    >
                                        {m.role === 'ai' ? <Bot className="w-8 h-8" /> : <User className="w-8 h-8" />}
                                    </div>
                                    <div className={cn(
                                        "relative p-5 shadow-sm text-[19.5px] leading-relaxed max-w-[85%] transition-all font-bold whitespace-pre-wrap",
                                        m.role === 'ai'
                                            ? "bg-white border border-zinc-200 rounded-2xl rounded-tl-none text-zinc-800"
                                            : "bg-[#06C755] text-white rounded-2xl rounded-tr-none ml-auto shadow-[#06C755]"
                                    )}>
                                        {m.role === 'ai' ? (
                                            <div>
                                                {m.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) => {
                                                    if (part.match(/^https?:\/\//)) {
                                                        // Trim trailing punctuation (., ), !, 。, 」) that might be part of the sentence
                                                        const cleanUrl = part.replace(/[.。!！?？,，」)）]+$/, '');
                                                        return (
                                                            <button
                                                                key={i}
                                                                onClick={() => {
                                                                    setActiveWebViewUrl(cleanUrl);
                                                                    setViewMode('webview');
                                                                }}
                                                                className="text-[#06C755] underline break-all hover:text-green-700 decoration-dotted underline-offset-4"
                                                            >
                                                                {cleanUrl}
                                                            </button>
                                                        );
                                                    }
                                                    return part;
                                                })}
                                            </div>
                                        ) : m.content}
                                    </div>
                                </motion.div>

                                {/* Pricing Widget */}
                                {m.type === 'pricing' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="ml-14 grid grid-cols-1 gap-4 max-w-[85%]"
                                    >
                                        {[
                                            { name: 'AI 老闆分身 Lite', price: '$399', desc: '免 API Key / 每月 5,000 則 / 掃碼 3 分鐘開通', popular: true },
                                            { name: 'AI 小會計 + 倉管', price: '$990', desc: '免 API Key / 每月 20,000 則 / 毛利庫存管理' },
                                            { name: 'AI 小公司衝刺版', price: '$2,490', desc: '可自備 Key / 不限流量 / 多通路整合行銷' }
                                        ].map((p) => (
                                            <button
                                                key={p.name}
                                                onClick={() => handleSelectPlan(p.name, p.price)}
                                                className={cn(
                                                    "p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] active:scale-95 bg-white shadow-sm",
                                                    p.popular ? "border-[#06C755] shadow-xl shadow-[#06C755]/50" : "border-zinc-100"
                                                )}
                                            >
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <span className="font-extrabold text-[21px] text-zinc-800">{p.name}</span>
                                                    <span className="font-black text-[23px]" style={{ color: LINE_GREEN }}>{p.price}</span>
                                                </div>
                                                <p className="text-[16px] text-zinc-500 font-medium">{p.desc}</p>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Checkout Widget */}
                                {m.type === 'checkout' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="ml-14 bg-white p-8 rounded-3xl border border-zinc-100 shadow-2xl space-y-6 max-w-[85%]"
                                    >
                                        <div className="flex items-center gap-3 font-black text-[21px]" style={{ color: LINE_GREEN }}>
                                            <CreditCard className="w-7 h-7" />
                                            <span>安全加密結帳</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex justify-between items-center mb-2">
                                                <span className="text-zinc-500 font-bold text-[16px]">已選方案</span>
                                                <span className="font-black text-zinc-900 text-[21px]">{selectedPlan.name || '標準型'} ({selectedPlan.price || '$990'})</span>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-[12px] font-black text-zinc-400 uppercase tracking-widest pl-1">信用卡卡號</p>
                                                <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full p-4 rounded-xl border border-zinc-100 bg-zinc-50 text-[18.5px] focus:ring-2 focus:ring-green-500 transition-all outline-none" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <p className="text-[12px] font-black text-zinc-400 pl-1 uppercase tracking-widest">有效期</p>
                                                    <input type="text" placeholder="MM/YY" className="w-full p-4 rounded-xl border border-zinc-100 bg-zinc-50 text-[18.5px] focus:ring-2 focus:ring-green-500 transition-all outline-none" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <p className="text-[2px] font-black text-zinc-400 pl-1 uppercase tracking-widest">CVC</p>
                                                    <input type="text" placeholder="123" className="w-full p-4 rounded-xl border border-zinc-100 bg-zinc-50 text-[18.5px] focus:ring-2 focus:ring-green-500 transition-all outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handlePaymentSuccess}
                                            className="w-full py-5 text-white rounded-2xl font-black text-[21px] hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-[#06C755]"
                                            style={{ backgroundColor: LINE_GREEN }}
                                        >
                                            立即付款 {selectedPlan.price || '$990'}
                                        </button>
                                    </motion.div>
                                )}

                                {/* Setup Widget */}
                                {m.type === 'setup' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="ml-14 bg-white p-8 rounded-3xl border border-zinc-100 shadow-2xl space-y-6 max-w-[85%]"
                                    >
                                        <div className="flex items-center gap-2 font-black text-[21px]" style={{ color: LINE_GREEN }}>
                                            <Settings className="w-7 h-7 animate-spin-slow" />
                                            <span>Line 串接精靈</span>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="bg-[#06C755] p-5 rounded-2xl border border-[#06C755]">
                                                <p className="text-[15px] text-white font-black mb-3 uppercase tracking-widest">第一步：前往您的官方Line開發者後台</p>
                                                <a
                                                    href="https://developers.line.biz/console/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between group bg-white hover:bg-zinc-50 p-4 rounded-xl transition-all border border-zinc-200 shadow-sm"
                                                >
                                                    <span className="font-bold text-zinc-700 text-[16.5px]">Line Developers Console</span>
                                                    <ExternalLink className="w-4.5 h-4.5 text-zinc-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                                </a>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[12px] font-black text-zinc-500 uppercase tracking-widest pl-1">Channel Secret</label>
                                                    <input
                                                        type="password"
                                                        value={lineSecret}
                                                        onChange={(e) => {
                                                            setLineSecret(e.target.value);
                                                            if (fieldErrors.lineSecret) setFieldErrors(prev => ({ ...prev, lineSecret: false }));
                                                        }}
                                                        placeholder="位於「Basic settings」頁籤下"
                                                        className={cn(
                                                            "w-full p-4 rounded-xl bg-zinc-50 border text-[18.5px] text-zinc-800 placeholder:text-zinc-400 focus:ring-2 outline-none transition-all",
                                                            fieldErrors.lineSecret ? "border-red-500 focus:ring-red-100" : "border-zinc-100 focus:border-green-500 focus:ring-green-100"
                                                        )}
                                                    />
                                                    {fieldErrors.lineSecret && <p className="text-[10px] text-red-500 font-bold pl-1 mt-1">此欄位不可為空</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[12px] font-black text-zinc-500 uppercase tracking-widest pl-1">Access Token</label>
                                                    <input
                                                        type="password"
                                                        value={lineToken}
                                                        onChange={(e) => {
                                                            setLineToken(e.target.value);
                                                            if (fieldErrors.lineToken) setFieldErrors(prev => ({ ...prev, lineToken: false }));
                                                        }}
                                                        placeholder="位於「Messaging API」頁籤底部"
                                                        className={cn(
                                                            "w-full p-4 rounded-xl bg-zinc-50 border text-[18.5px] text-zinc-800 placeholder:text-zinc-400 focus:ring-2 outline-none transition-all",
                                                            fieldErrors.lineToken ? "border-red-500 focus:ring-red-100" : "border-zinc-100 focus:border-green-500 focus:ring-green-100"
                                                        )}
                                                    />
                                                    {fieldErrors.lineToken && <p className="text-[10px] text-red-500 font-bold pl-1 mt-1">此欄位不可為空</p>}
                                                </div>
                                                {!(selectedPlan.name?.includes('399') || selectedPlan.name?.includes('990') || selectedPlan.name?.includes('Lite') || selectedPlan.name?.includes('會計')) && (
                                                    <div className="space-y-2">
                                                        <label className="text-[12px] font-black text-zinc-500 uppercase tracking-widest pl-1">OpenAI API Key (進階選配)</label>
                                                        <input
                                                            type="password"
                                                            value={openaiKey}
                                                            onChange={(e) => {
                                                                setOpenaiKey(e.target.value);
                                                                if (fieldErrors.openaiKey) setFieldErrors(prev => ({ ...prev, openaiKey: false }));
                                                            }}
                                                            placeholder="sk-..."
                                                            className={cn(
                                                                "w-full p-4 rounded-xl bg-zinc-50 border text-[18.5px] text-zinc-800 placeholder:text-zinc-400 focus:ring-2 outline-none transition-all",
                                                                fieldErrors.openaiKey ? "border-red-500 focus:ring-red-100" : "border-zinc-100 focus:border-green-500 focus:ring-green-100"
                                                            )}
                                                        />
                                                        {fieldErrors.openaiKey && <p className="text-[10px] text-red-500 font-bold pl-1 mt-1">此欄位不可為空</p>}
                                                        <p className="text-[11px] text-zinc-400 pl-1 font-medium">399/990 方案由我們託管，免填此項。</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSetupComplete}
                                            disabled={isConnecting}
                                            className={cn(
                                                "w-full py-5 rounded-2xl font-black text-[21px] flex items-center justify-center gap-3 shadow-xl transition-all text-white",
                                                isConnecting ? "bg-zinc-400 cursor-not-allowed shadow-none" : "hover:brightness-110 active:scale-95 shadow-[#06C755]/50"
                                            )}
                                            style={!isConnecting ? { backgroundColor: LINE_GREEN } : {}}
                                        >
                                            {isConnecting ? (
                                                <RefreshCw className="w-7 h-7 animate-spin" />
                                            ) : (
                                                <Rocket className="w-7 h-7" />
                                            )}
                                            <span>{isConnecting ? "正在連線測試..." : "完成串接 · 開放店長上班"}</span>
                                        </button>
                                    </motion.div>
                                )}

                                {/* Success Widget */}
                                {m.type === 'success' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="ml-14 bg-white p-8 rounded-3xl border border-zinc-100 shadow-2xl space-y-6 max-w-[85%]"
                                    >
                                        <div className="flex items-center gap-3 font-black text-[21px] text-[#06C755]">
                                            <Sparkles className="w-7 h-7" />
                                            <span>恭喜！您的 AI 店長已待命</span>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="bg-[#06C755] p-6 rounded-2xl border border-[#06C755] space-y-3">
                                                <p className="text-[13.5px] font-black text-white uppercase tracking-widest text-center">您的專屬 Webhook 網址</p>
                                                <div className="bg-white p-4 rounded-xl border border-[#06C755] text-center select-all font-mono text-[16px] text-zinc-600 break-all cursor-copy active:bg-green-50 transition-colors">
                                                    {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhook/{botId || '...'}
                                                </div>
                                                <p className="text-[12px] text-white text-center font-bold">點擊網址即可複製</p>
                                            </div>
                                            <div className="space-y-4">
                                                <p className="font-bold text-zinc-800 text-[16px]">最後三指領：</p>
                                                <ul className="text-[14px] space-y-3 text-zinc-500 font-medium">
                                                    <li className="flex gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">1</span>
                                                        <span>貼入 Line 後台的 <b>Webhook URL</b> 並點擊 Update</span>
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">2</span>
                                                        <span>點擊 <b>Verify</b> 直到顯示 Success</span>
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">3</span>
                                                        <span>開啟 <b>Use webhook</b> 選項</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-zinc-100">
                                            <p className="text-xs text-zinc-400 text-center font-medium leading-relaxed">
                                                現在您可以對您的 Line 官方帳號說聲「你好」來測試了！如有任何問題，請點擊下方重新設定。
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-4"
                            >
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 shadow-md"
                                    style={{ backgroundColor: LINE_GREEN }}
                                >
                                    <Bot className="w-8 h-8" />
                                </div>
                                <div className="bg-white border border-zinc-200 rounded-2xl rounded-tl-none flex gap-1.5 items-center px-6 py-5 shadow-sm">
                                    <span className="w-2 h-2 bg-[#06C755] rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-2 h-2 bg-[#06C755] rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-2 h-2 bg-[#06C755] rounded-full animate-bounce" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Input */}
                <footer className="p-6 border-t bg-white z-10 sticky bottom-0 shadow-[0_-4px_30px_rgba(0,0,0,0.04)] shrink-0">
                    <motion.div
                        animate={{ scale: inputValue ? 1.02 : 1 }}
                        className="relative flex items-center gap-3"
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onFocus={() => setInputValue('')}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={placeholder}
                            className="flex-1 bg-zinc-100 border-none rounded-2xl px-6 py-4 pr-16 text-[20px] focus:ring-2 focus:ring-[#06C755] transition-all outline-none font-medium text-zinc-800 shadow-inner"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                            className="absolute right-2 p-3 text-white rounded-xl hover:scale-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg"
                            style={{ backgroundColor: LINE_GREEN }}
                        >
                            <Send className="w-6 h-6" />
                        </button>
                    </motion.div>
                    <p className="text-[12px] font-black text-center text-zinc-400 mt-4 uppercase tracking-[0.2em]">
                        Powered by Global AI Network · Secure & Encrypted
                    </p>
                </footer>

                {/* WebView Overlay */}
                <AnimatePresence>
                    {viewMode === 'webview' && activeWebViewUrl && (
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute inset-x-0 bottom-0 top-[88px] bg-white z-[50] flex flex-col"
                        >
                            <div className="flex-1 relative bg-zinc-50">
                                {activeWebViewUrl.includes('manager.line.biz') || activeWebViewUrl.includes('account.line.biz') ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-zinc-50">
                                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-[#06C755] mb-6 shadow-sm">
                                            <ExternalLink className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-black text-zinc-900 mb-3">此網頁受到安全保護</h3>
                                        <p className="text-zinc-500 font-medium mb-8 max-w-sm">LINE 管理後台與部分加密頁面不允許直接嵌入。請點擊下方的綠色按鈕開啟新視窗進行操作。</p>
                                        <a
                                            href={activeWebViewUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-10 py-5 bg-[#06C755] text-white rounded-2xl font-black text-lg shadow-xl shadow-green-200 hover:brightness-110 active:scale-95 transition-all flex items-center gap-3"
                                        >
                                            <ExternalLink className="w-6 h-6" />
                                            <span>在新視窗開啟網頁</span>
                                        </a>
                                    </div>
                                ) : (
                                    <>
                                        <iframe
                                            src={activeWebViewUrl}
                                            className="w-full h-full border-none"
                                            title="Resource Viewer"
                                        />
                                        {/* Fallback for other sites that might block frames */}
                                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent flex flex-col items-center text-center opacity-0 hover:opacity-100 transition-opacity">
                                            <p className="text-zinc-500 font-bold mb-3 text-sm">如果網頁未正常顯示，請點擊：</p>
                                            <a
                                                href={activeWebViewUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-bold text-sm shadow-lg flex items-center gap-2"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                在新視窗開啟
                                            </a>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="p-4 bg-white border-t flex justify-center">
                                <button
                                    onClick={() => setViewMode('chat')}
                                    className="px-8 py-3 bg-zinc-100 text-zinc-600 rounded-full font-bold hover:bg-zinc-200 transition-all"
                                >
                                    返回對話
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showResetConfirm && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowResetConfirm(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                            />
                            <motion.div
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="absolute right-0 top-0 bottom-0 w-[85%] bg-white z-[101] shadow-2xl p-8 flex flex-col justify-center items-center text-center gap-8"
                            >
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-[#06C755]">
                                    <RefreshCw className="w-10 h-10 animate-spin-slow" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-zinc-900 mb-2">確定要重新設定？</h2>
                                    <p className="text-zinc-500 font-medium">這將會清除目前所有的對話紀錄與進度。</p>
                                </div>
                                <div className="flex flex-col w-full gap-3">
                                    <button
                                        onClick={resetFlow}
                                        className="w-full py-4 bg-[#06C755] text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-colors shadow-lg shadow-green-200 font-bold"
                                    >
                                        確定重置
                                    </button>
                                    <button
                                        onClick={() => setShowResetConfirm(false)}
                                        className="w-full py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold text-lg hover:bg-zinc-200 transition-colors"
                                    >
                                        取消
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <style jsx global>{`
                .animate-spin-slow {
                    animation: spin 5s linear infinite;
                }
                @keyframes spin {
                    from {transform: rotate(0deg); }
                to {transform: rotate(360deg); }
                }
                ::-webkit-scrollbar {
                    width: 5px;
                }
                ::-webkit-scrollbar-thumb {
                    background: #e4e4e7;
                border-radius: 10px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                `}</style>
            </motion.div>
        </div>
    );
}
