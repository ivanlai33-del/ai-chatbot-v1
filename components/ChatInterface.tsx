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
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const triggerAiResponse = async (currentMessages: Message[]) => {
        setIsTyping(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: currentMessages.map(m => ({ role: m.role, content: m.content })),
                    storeName,
                    currentStep: step
                })
            });

            if (!res.ok) throw new Error('Chat API failed');

            const data = await res.json();
            setIsTyping(false);
            processAiResponse(data.message, data.metadata);
        } catch (error) {
            console.error(error);
            setIsTyping(false);
            addAiMessage("抱歉，我現在連線有點問題，請稍後再跟我聊天！");
        }
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

        if (savedMsg) setMessages(JSON.parse(savedMsg));
        if (savedStep) setStep(parseInt(savedStep));
        if (savedStoreName) setStoreName(savedStoreName);
        if (savedPlan) setSelectedPlan(JSON.parse(savedPlan));
        if (savedLineSecret) setLineSecret(savedLineSecret);
        if (savedLineToken) setLineToken(savedLineToken);
        if (savedOpenaiKey) setOpenaiKey(savedOpenaiKey);
        if (savedBotId) setBotId(savedBotId);

        setIsLoaded(true);

        // Initial Greeting if no messages - Power it with AI
        if (!savedMsg) {
            const timer = setTimeout(() => {
                triggerAiResponse([{ id: 'init', role: 'user', content: '你好，我想了解如何建立 AI 客服。' }]);
            }, 1000);
            return () => clearTimeout(timer);
        }
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
        }
    }, [messages, step, storeName, selectedPlan, lineSecret, lineToken, openaiKey, botId, isLoaded]);

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

        const userMsg: Message = {
            id: Math.random().toString(36).substring(7),
            role: 'user',
            content: inputValue,
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputValue('');
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

            if (!res.ok) throw new Error('Chat API failed');

            const data = await res.json();
            setIsTyping(false);
            processAiResponse(data.message, data.metadata);
        } catch (error) {
            console.error(error);
            setIsTyping(false);
            addAiMessage("抱歉，我現在連線有點問題，請稍後再跟我聊天！");
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
        if (!lineSecret || !lineToken || !openaiKey) {
            alert("請填寫所有欄位");
            return;
        }

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
            }, 1000);
        } catch (error) {
            console.error(error);
            addAiMessage("哎呀，設定過程中發生一點問題。請檢查您的金鑰是否正確，然後再試一次。");
        }
    };

    const resetFlow = () => {
        if (confirm("確定要重頭開始設定嗎？")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    if (!isLoaded) return null;

    return (
        <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white shadow-2xl overflow-hidden border-x border-zinc-200 font-sans">
            {/* Header */}
            <header className="p-5 border-b glass flex items-center justify-between z-10 sticky top-0 bg-white/95 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200/50 rotate-3 transition-transform hover:rotate-0"
                        style={{ backgroundColor: LINE_GREEN }}
                    >
                        <Bot className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="font-extrabold text-xl tracking-tight text-zinc-900">AI 轉型助手</h1>
                        <div className="flex items-center gap-1.5">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Now</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={resetFlow}
                    className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 border border-zinc-200 px-3 py-1.5 rounded-full hover:bg-zinc-50 hover:text-zinc-600 transition-all uppercase tracking-tighter"
                >
                    <RefreshCw className="w-3 h-3" />
                    重新設定
                </button>
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
                                <div className={cn(
                                    "w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm transition-transform hover:scale-110",
                                    m.role === 'ai' ? "" : ""
                                )}
                                    style={{ backgroundColor: LINE_GREEN }}
                                >
                                    {m.role === 'ai' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                </div>
                                <div className={cn(
                                    "relative p-5 shadow-sm text-[17px] leading-relaxed max-w-[85%] transition-all",
                                    m.role === 'ai'
                                        ? "bg-white border border-zinc-200 rounded-2xl rounded-tl-none text-zinc-800"
                                        : "bg-[#06C755] text-white rounded-2xl rounded-tr-none ml-auto shadow-green-100"
                                )}>
                                    {m.content}
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
                                        { name: '輕量型', price: '$399', desc: '基礎 24/7 自動問答' },
                                        { name: '標準型', price: '$990', desc: '對話記憶 + 語音支援 (熱門推薦)', popular: true },
                                        { name: '企業型', price: '$2,490', desc: '串連內部知識庫 (RAG)' }
                                    ].map((p) => (
                                        <button
                                            key={p.name}
                                            onClick={() => handleSelectPlan(p.name, p.price)}
                                            className={cn(
                                                "p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] active:scale-95 bg-white shadow-sm",
                                                p.popular ? "border-[#06C755] shadow-xl shadow-green-100/50" : "border-zinc-100"
                                            )}
                                        >
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="font-extrabold text-lg text-zinc-800">{p.name}</span>
                                                <span className="font-black text-xl" style={{ color: LINE_GREEN }}>{p.price}</span>
                                            </div>
                                            <p className="text-sm text-zinc-500 font-medium">{p.desc}</p>
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
                                    <div className="flex items-center gap-3 font-black text-lg" style={{ color: LINE_GREEN }}>
                                        <CreditCard className="w-6 h-6" />
                                        <span>安全加密結帳</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex justify-between items-center mb-2">
                                            <span className="text-zinc-500 font-bold text-sm">已選方案</span>
                                            <span className="font-black text-zinc-900 text-lg">{selectedPlan.name || '標準型'} ({selectedPlan.price || '$990'})</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">信用卡卡號</p>
                                            <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full p-4 rounded-xl border border-zinc-100 bg-zinc-50 text-base focus:ring-2 focus:ring-green-500 transition-all outline-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-black text-zinc-400 pl-1 uppercase tracking-widest">有效期</p>
                                                <input type="text" placeholder="MM/YY" className="w-full p-4 rounded-xl border border-zinc-100 bg-zinc-50 text-base focus:ring-2 focus:ring-green-500 transition-all outline-none" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-black text-zinc-400 pl-1 uppercase tracking-widest">CVC</p>
                                                <input type="text" placeholder="123" className="w-full p-4 rounded-xl border border-zinc-100 bg-zinc-50 text-base focus:ring-2 focus:ring-green-500 transition-all outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handlePaymentSuccess}
                                        className="w-full py-5 text-white rounded-2xl font-black text-lg hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-green-200"
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
                                    <div className="flex items-center gap-2 font-black text-lg" style={{ color: LINE_GREEN }}>
                                        <Settings className="w-6 h-6 animate-spin-slow" />
                                        <span>Line 串接精靈</span>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                                            <p className="text-[10px] text-zinc-400 font-bold mb-3 uppercase tracking-widest">第一步：前往開發者後台</p>
                                            <a
                                                href="https://developers.line.biz/console/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between group bg-white hover:bg-zinc-50 p-4 rounded-xl transition-all border border-zinc-200 shadow-sm"
                                            >
                                                <span className="font-bold text-zinc-700">Line Developers Console</span>
                                                <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                            </a>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Channel Secret</label>
                                                <input
                                                    type="password"
                                                    value={lineSecret}
                                                    onChange={(e) => setLineSecret(e.target.value)}
                                                    placeholder="位於「Basic settings」頁籤下"
                                                    className="w-full p-4 rounded-xl bg-zinc-50 border border-zinc-100 text-base text-zinc-800 placeholder:text-zinc-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Access Token</label>
                                                <input
                                                    type="password"
                                                    value={lineToken}
                                                    onChange={(e) => setLineToken(e.target.value)}
                                                    placeholder="位於「Messaging API」頁籤底部"
                                                    className="w-full p-4 rounded-xl bg-zinc-50 border border-zinc-100 text-base text-zinc-800 placeholder:text-zinc-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">OpenAI API Key</label>
                                                <input
                                                    type="password"
                                                    value={openaiKey}
                                                    onChange={(e) => setOpenaiKey(e.target.value)}
                                                    placeholder="sk-..."
                                                    className="w-full p-4 rounded-xl bg-zinc-50 border border-zinc-100 text-base text-zinc-800 placeholder:text-zinc-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSetupComplete}
                                        className="w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:brightness-110 active:scale-95 transition-all text-white shadow-green-200/50"
                                        style={{ backgroundColor: LINE_GREEN }}
                                    >
                                        <Rocket className="w-6 h-6" />
                                        <span>完成串接 · 開放店長上班</span>
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
                                    <div className="flex items-center gap-3 font-black text-lg text-green-600">
                                        <Sparkles className="w-6 h-6" />
                                        <span>恭喜！您的 AI 店長已待命</span>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-green-50 p-6 rounded-2xl border border-green-100 space-y-3">
                                            <p className="text-xs font-black text-green-700 uppercase tracking-widest text-center">您的專屬 Webhook 網址</p>
                                            <div className="bg-white p-4 rounded-xl border border-green-200 text-center select-all font-mono text-sm text-zinc-600 break-all cursor-copy active:bg-green-50 transition-colors">
                                                {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhook/{botId || '...'}
                                            </div>
                                            <p className="text-[10px] text-green-600 text-center font-bold">點擊網址即可複製</p>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="font-bold text-zinc-800 text-sm">最後三指領：</p>
                                            <ul className="text-xs space-y-3 text-zinc-500 font-medium">
                                                <li className="flex gap-2">
                                                    <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">1</span>
                                                    <span>貼入 Line 後台的 <b>Webhook URL</b> 並點擊 Update</span>
                                                </li>
                                                <li className="flex gap-2">
                                                    <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">2</span>
                                                    <span>點擊 <b>Verify</b> 直到顯示 Success</span>
                                                </li>
                                                <li className="flex gap-2">
                                                    <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">3</span>
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
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0"
                                style={{ backgroundColor: LINE_GREEN }}
                            >
                                <Bot className="w-6 h-6" />
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
                <div className="relative flex items-center gap-3">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="說點什麼..."
                        className="flex-1 bg-zinc-100 border-none rounded-2xl px-6 py-4 pr-16 text-[17px] focus:ring-2 focus:ring-[#06C755] transition-all outline-none font-medium text-zinc-800"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className="absolute right-2 p-3 text-white rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg"
                        style={{ backgroundColor: LINE_GREEN }}
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </div>
                <p className="text-[10px] font-black text-center text-zinc-400 mt-4 uppercase tracking-[0.2em]">
                    Powered by Global AI Network · Secure & Encrypted
                </p>
            </footer>

            <style jsx global>{`
        .animate-spin-slow {
          animation: spin 5s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
        </div>
    );
}
