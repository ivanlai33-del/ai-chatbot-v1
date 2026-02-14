"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, CreditCard, Settings, Rocket, ExternalLink, RefreshCw, Key, Brain, Power, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
    id: string;
    role: 'ai' | 'user';
    content: string;
    type?: 'text' | 'pricing' | 'checkout' | 'setup' | 'success' | 'recovery';
};

const LINE_GREEN = "#06C755";

const TUTORIAL_POSITIONS = [
    { x: 500, y: 350 }, // Step 0: Login
    { x: 450, y: 400 }, // Step 1: Channel
    { x: 600, y: 550 }, // Step 2: Secret
    { x: 600, y: 700 }, // Step 3: Token
];

const OWNER_INSIGHTS = [
    "老闆身兼客服，半夜還在回訊息？",
    "客人問的問題都大同小異，好想找人代勞...",
    "不想讓客人在 Line 等太久，但手邊真的在忙...",
    "如果有個店長 24 小時幫我接單就好了。",
    "廣告費花了，結果客人問一問就消失，好可惜。",
    "每天都要回答營業時間和地址，心好累。",
    "想讓 Line 官方帳號更聰明，而不是只會發推播。",
    "我需要一個懂我家產品、能精準報價的幫手。",
    "生意變好是好事，但客服量多到回不完...",
    "客人說：有人在嗎？但我正在開會中...",
    "希望能自動辨認熟客，給點親切感。",
    "不想一直複製貼上 FAQ，好浪費生命。",
    "如果有個 AI 能幫我顧店，我就可以好好陪家人。",
    "想知道 AI 是不是真的能像人一樣對話？",
    "店員流動率高，教育訓練要一直重來...",
    "我只想專心研發產品，瑣碎回覆交給 AI。",
    "半夜三點有客人下單，AI 幫我成交了？",
    "想讓 Line 也能有像官網一樣的自動轉單功能。",
    "客服態度要始終如一，AI 不會鬧脾氣。",
    "我的 Line 帳號好冷清，AI 能幫我主動招呼嗎？",
    "出國旅遊時，也不用擔心 Line 訊息沒人回。",
    "老闆心聲：我好想分身，多開幾家分店。",
    "AI 能幫我記錄客人的特殊需求嗎？",
    "不想再被客訴：為什麼下午傳的訊息晚上才回？",
    "數位轉型很難嗎？聽說只要 7 分鐘就能搞定。"
];

// --- Sub-components for Phase 28: Interactive Onboarding Wizard ---

const GhostCursor = ({ targetX, targetY, isVisible }: { targetX: number, targetY: number, isVisible: boolean }) => (
    <motion.div
        initial={{ opacity: 0, x: 0, y: 0 }}
        animate={{
            opacity: isVisible ? 1 : 0,
            x: targetX,
            y: targetY,
            scale: isVisible ? 1 : 0.5
        }}
        transition={{
            type: "spring",
            damping: 25,
            stiffness: 120,
            mass: 0.8
        }}
        className="fixed pointer-events-none z-[200] w-8 h-8 filter drop-shadow-lg"
    >
        <svg viewBox="0 0 24 24" className="w-full h-full text-[#06C755] fill-current">
            <path d="M5.5 3l13.5 13.5-5.5 1.5 3 4-2.5 2-3.5-4.5-5 3.5z" />
        </svg>
        <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-[#06C755]/30 rounded-full blur-md"
        />
    </motion.div>
);

const MockLineUI = ({ step }: { step: number }) => (
    <div className="bg-[#f4f5f7] border border-zinc-200 rounded-2xl overflow-hidden shadow-inner font-sans text-xs">
        {/* Mock Header */}
        <div className="bg-[#1e252d] text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#06C755] rounded-sm flex items-center justify-center font-bold text-[10px]">L</div>
                <span className="font-bold">LINE Developers</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-zinc-600"></div>
        </div>

        {/* Mock Sidebar & Body */}
        <div className="flex h-48">
            <div className="w-16 bg-[#2c343e] p-2 space-y-2">
                <div className="h-2 bg-zinc-500 rounded-sm"></div>
                <div className="h-2 bg-zinc-600 rounded-sm w-3/4"></div>
                <div className="h-2 bg-[#06C755] rounded-sm mt-4"></div>
            </div>
            <div className="flex-1 p-4 bg-white space-y-3">
                {step === 0 && (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
                            <Rocket className="w-6 h-6 text-zinc-300" />
                        </div>
                        <div className="px-6 py-2 bg-[#06C755] text-white rounded-md font-bold text-[10px] shadow-sm">Log in to Console</div>
                    </div>
                )}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="text-zinc-400 font-bold text-[8px] uppercase tracking-wider">Recently visited channel</div>
                        <div className="p-3 border-2 border-green-500 rounded-lg flex items-center gap-3 bg-green-50">
                            <div className="w-8 h-8 bg-zinc-100 rounded-md border flex items-center justify-center"><Bot className="w-4 h-4 text-zinc-400" /></div>
                            <div>
                                <div className="h-2 bg-zinc-800 rounded-sm w-16 mb-1"></div>
                                <div className="h-1 bg-zinc-400 rounded-sm w-10"></div>
                            </div>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-4 pt-4">
                        <div className="flex gap-4 border-b border-zinc-100">
                            <div className="pb-2 border-b-2 border-green-500 text-green-600 font-bold scale-110">Basic settings</div>
                            <div className="pb-2 text-zinc-300 font-bold">Messaging API</div>
                        </div>
                        <div className="space-y-1">
                            <div className="h-2 bg-zinc-100 rounded-sm w-20"></div>
                            <div className="p-2 bg-zinc-50 border border-green-400 rounded-md font-mono text-[9px] text-zinc-400 flex justify-between items-center">
                                <span>1688****************1688</span>
                                <RefreshCw className="w-3 h-3 text-green-500" />
                            </div>
                            <div className="flex items-center gap-1 text-[8px] text-green-500 font-bold animate-pulse">
                                <Power className="w-2 h-2" /> 拷貝此欄位
                            </div>
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div className="space-y-4 pt-4">
                        <div className="flex gap-4 border-b border-zinc-100">
                            <div className="pb-2 text-zinc-300 font-bold">Basic settings</div>
                            <div className="pb-2 border-b-2 border-green-500 text-green-600 font-bold scale-110">Messaging API</div>
                        </div>
                        <div className="h-24 overflow-y-auto space-y-3 pt-2">
                            <div className="h-1 bg-zinc-100 rounded-sm w-full"></div>
                            <div className="h-1 bg-zinc-100 rounded-sm w-3/4"></div>
                            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg space-y-2">
                                <div className="h-2 bg-zinc-800 rounded-sm w-24"></div>
                                <div className="py-2 px-4 bg-green-500 text-white rounded text-[8px] font-bold text-center">Issue</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
);

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
    const [businessIndustry, setBusinessIndustry] = useState("");
    const [businessMission, setBusinessMission] = useState("");
    const [mgmtToken, setMgmtToken] = useState<string | null>(null);
    const [isAdminView, setIsAdminView] = useState(false);
    const [adminBotData, setAdminBotData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);

    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg?.type === 'setup' && (lastMsg as any).metadata?.tutorialStep !== undefined) {
            setTutorialStep((lastMsg as any).metadata.tutorialStep);
        }
    }, [messages]);
    const [paypalInitialized, setPaypalInitialized] = useState(false);
    const [botId, setBotId] = useState<string | null>(null);
    const [placeholder, setPlaceholder] = useState("我想找Ai官方line小幫手....");
    const [adminTab, setAdminTab] = useState<'brain' | 'products' | 'faq' | 'orders'>('brain');
    const [products, setProducts] = useState<any[]>([]);
    const [faqList, setFaqList] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', cost: '', stock_quantity: '' });
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeWebViewUrl, setActiveWebViewUrl] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'chat' | 'webview'>('chat');
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});
    const [isConnecting, setIsConnecting] = useState(false);
    const [isMasterMode, setIsMasterMode] = useState(false);
    const [insightIndex, setInsightIndex] = useState(0);

    // Dynamic Placeholder Rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setInsightIndex((prev) => (prev + 1) % OWNER_INSIGHTS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // 🛡️ Security Shield - Anti-Tamper Logic
    useEffect(() => {
        // 1. Disable Right Click
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();

        // 2. Disable DevTools Shortcuts (F12, Ctrl+Shift+I, Ctrl+U)
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 's'))
            ) {
                e.preventDefault();
                console.warn("🛡️ Security Shield: Inspecting is disabled to protect intellectual property.");
            }
        };

        // 3. Disable Dragging of Images (Logos)
        const handleDragStart = (e: DragEvent) => e.preventDefault();

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('dragstart', handleDragStart);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('dragstart', handleDragStart);
        };
    }, []);

    // Effect to update placeholder when insightIndex changes
    useEffect(() => {
        setPlaceholder(OWNER_INSIGHTS[insightIndex]);
    }, [insightIndex]);

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
        const savedIndustry = localStorage.getItem('chat_industry');
        const savedMission = localStorage.getItem('chat_mission');

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
        if (savedIndustry) setBusinessIndustry(savedIndustry);
        if (savedMission) setBusinessMission(savedMission);
        const savedMgmtToken = localStorage.getItem('chat_mgmt_token');
        if (savedMgmtToken) setMgmtToken(savedMgmtToken);

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
            localStorage.setItem('chat_industry', businessIndustry);
            localStorage.setItem('chat_mission', businessMission);
            if (mgmtToken) localStorage.setItem('chat_mgmt_token', mgmtToken);
            localStorage.setItem('chat_master_mode', JSON.stringify(isMasterMode));
        }
    }, [messages, step, storeName, selectedPlan, lineSecret, lineToken, openaiKey, botId, isLoaded, isMasterMode, businessIndustry, businessMission]);

    // URL Magic Link Detection
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlBotId = params.get('botId');
        const urlToken = params.get('token');

        if (urlBotId && urlToken) {
            handleAdminLogin(urlBotId, urlToken);
        }
    }, [isLoaded]);

    const fetchAdminData = async () => {
        if (!botId || !mgmtToken) return;
        try {
            const [pRes, fRes, oRes] = await Promise.all([
                fetch(`/api/bot/${botId}/products?token=${mgmtToken}`),
                fetch(`/api/bot/${botId}/faq?token=${mgmtToken}`),
                fetch(`/api/bot/${botId}/orders?token=${mgmtToken}`)
            ]);
            const [pData, fData, oData] = await Promise.all([pRes.json(), fRes.json(), oRes.json()]);
            setProducts(pData.products || []);
            setFaqList(fData.faq || []);
            setOrders(oData.orders || []);
        } catch (err) {
            console.error("Failed to fetch admin data:", err);
        }
    };

    useEffect(() => {
        if (isAdminView) fetchAdminData();
    }, [isAdminView, adminTab]);

    const handleAddProduct = async () => {
        if (!newProduct.name || !newProduct.price) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/bot/${botId}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newProduct, mgmtToken })
            });
            if (res.ok) {
                setNewProduct({ name: '', price: '', cost: '', stock_quantity: '' });
                fetchAdminData();
            }
        } catch (err) { console.error(err); }
        setIsSaving(false);
    };

    const handleAddFaq = async () => {
        if (!newFaq.question || !newFaq.answer) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/bot/${botId}/faq`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newFaq, mgmtToken })
            });
            if (res.ok) {
                setNewFaq({ question: '', answer: '' });
                fetchAdminData();
            }
        } catch (err) { console.error(err); }
        setIsSaving(false);
    };

    const handleAdminLogin = async (id: string, token: string) => {
        setIsConnecting(true);
        try {
            const res = await fetch('/api/bot/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botId: id, mgmtToken: token })
            });
            if (!res.ok) throw new Error('驗證失敗');
            const data = await res.json();
            setAdminBotData(data.bot);
            setMgmtToken(token);
            setBotId(id);
            setIsAdminView(true);
            setStep(4); // Success/Admin state
        } catch (err) {
            console.error(err);
            addAiMessage("魔法連結已失效或資訊錯誤，請檢查您的管理連結。");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleUpdateBot = async () => {
        if (!botId || !mgmtToken || !adminBotData) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/bot/${botId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mgmtToken,
                    systemPrompt: adminBotData.systemPrompt,
                    status: adminBotData.status
                })
            });
            if (!res.ok) throw new Error('更新失敗');
            addAiMessage("✨ 訓練完成！您的 AI 客服大腦已成功更新。", "success");
        } catch (err) {
            console.error(err);
            addAiMessage("哎呀，更新知識時發生一點問題，請稍後再試。");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRecoverLink = async (sName: string, lSecret: string) => {
        setIsConnecting(true);
        try {
            const res = await fetch('/api/bot/recover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeName: sName, lineSecret: lSecret })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || '驗證失敗');
            }
            const data = await res.json();
            setBotId(data.botId);
            setMgmtToken(data.mgmtToken);
            setAdminBotData(null); // Clear previous
            addAiMessage(`✨ 身份驗證成功！已找回您的 AI 店長管理連結。您可以點擊下方按鈕進入練功房：`, "success");
        } catch (err: any) {
            console.error(err);
            addAiMessage(`驗證失敗：${err.message}。請確認店名與 Line Secret 是否正確。`);
        } finally {
            setIsConnecting(false);
        }
    };
    const [paypalInitializedMap, setPaypalInitializedMap] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.type === 'checkout' && (window as any).paypal && !paypalInitializedMap[lastMessage.id]) {
            const containerId = `paypal-button-container-${lastMessage.id}`;

            // Robust rendering with retry loop
            let attempts = 0;
            const renderPaypal = () => {
                const container = document.getElementById(containerId);
                if (container && container.innerHTML === '') {
                    const is990 = selectedPlan.price?.includes('990');
                    (window as any).paypal.Buttons({
                        style: {
                            shape: is990 ? 'rect' : 'pill',
                            color: 'white',
                            layout: 'vertical',
                            label: 'subscribe'
                        },
                        createSubscription: function (data: any, actions: any) {
                            return actions.subscription.create({
                                plan_id: is990 ? 'P-4JM25682K0587452HNGG7XDI' : 'P-2PB914293B086421VNGG7SDQ',
                                custom_id: storeName
                            });
                        },
                        onApprove: function (data: any, actions: any) {
                            handlePaymentSuccess();
                        },
                        onError: function (err: any) { console.error('PayPal Error:', err); }
                    }).render(`#${containerId}`);
                    setPaypalInitializedMap(prev => ({ ...prev, [lastMessage.id]: true }));
                } else if (attempts < 20) { // Retry for 2 seconds
                    attempts++;
                    requestAnimationFrame(renderPaypal);
                }
            };
            renderPaypal();
        }
    }, [messages, storeName, selectedPlan]);

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
            if (action === 'SHOW_RECOVERY') actionTip = 'recovery';
        }

        // 🗑️ Frontend Safety Net: Strip any JSON-like blocks that leaked through
        const cleanContent = content.replace(/\{[\s\S]*\}$/, '').trim();

        if (metadata.storeName && metadata.storeName !== "未命名") {
            setStoreName(metadata.storeName);
        }

        if (metadata.industry) setBusinessIndustry(metadata.industry);
        if (metadata.mission) setBusinessMission(metadata.mission);

        // 🚀 Robust Plan Detection & Validation
        if (metadata.selectedPlan) {
            if (typeof metadata.selectedPlan === 'object') {
                setSelectedPlan(metadata.selectedPlan);
            } else if (typeof metadata.selectedPlan === 'string') {
                if (metadata.selectedPlan.includes('399') || metadata.selectedPlan.includes('Lite')) {
                    setSelectedPlan({ name: 'AI 老闆分身 Lite', price: '$399' });
                } else if (metadata.selectedPlan.includes('990') || metadata.selectedPlan.includes('會計')) {
                    setSelectedPlan({ name: 'AI 小會計 + 倉管', price: '$990' });
                }
            }
        } else if (actionTip === 'checkout') {
            // 🚀 Content-Aware Detection Fallback
            if (cleanContent.includes('399') || cleanContent.includes('Lite')) {
                setSelectedPlan({ name: 'AI 老闆分身 Lite', price: '$399' });
            } else if (cleanContent.includes('990') || cleanContent.includes('會計')) {
                setSelectedPlan({ name: 'AI 小會計 + 倉管', price: '$990' });
            }
        }

        addAiMessage(cleanContent, actionTip);
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
                    currentStep: step,
                    isMaster: isMasterMode
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
                    selectedPlan,
                    businessIndustry,
                    businessMission
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || '伺服器連線失敗');
            }

            const data = await res.json();
            setBotId(data.botId);
            setMgmtToken(data.mgmtToken);

            setTimeout(() => {
                addAiMessage("太棒了！連線測試成功。最後，請將下方的 Webhook 網址複製並填入您的 Line 後台，您的店長就會正式開始上班囉！", "success");
                setStep(4);
                setIsConnecting(false);
            }, 1000);
        } catch (error: any) {
            console.error('Setup Error:', error);
            setIsConnecting(false);
            addAiMessage(`哎呀，設定過程中發生一點問題：${error.message}。請檢查金鑰或稍後再試。`);
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

    const isSetupActive = step === 3;

    return (
        <div className="min-h-screen bg-[#4D4D4D] relative overflow-hidden flex flex-col select-none">
            {/* Ghost Mouse - Phase 28 */}
            <GhostCursor
                isVisible={isSetupActive && messages.length > 0}
                targetX={TUTORIAL_POSITIONS[tutorialStep]?.x || 500}
                targetY={TUTORIAL_POSITIONS[tutorialStep]?.y || 500}
            />

            {/* Background Footer Block */}
            {/* 1. Background Footer Block - Rises first */}
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="absolute bottom-0 left-0 right-0 h-1/6 z-0"
                style={{ backgroundColor: LINE_GREEN }}
            />

            {/* 2. Background Watermark Logo - Slides in from left after footer starts */}
            <motion.div
                initial={{ x: "-100vw", opacity: 0, rotate: -25 }}
                animate={{
                    x: 0,
                    opacity: 1,
                    rotate: -12,
                    y: [0, -15, 0] // Breath after entrance is handled by Framer's sequence if we are clever, 
                    // but simple repeat: Infinity on Y will work alongside the entrance X.
                }}
                transition={{
                    x: { delay: 0.4, duration: 1.2, ease: "backOut" },
                    opacity: { delay: 0.4, duration: 1.0 },
                    rotate: { delay: 0.4, duration: 1.2 },
                    y: {
                        delay: 1.6, // Start breathing after entrance finishes
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }
                }}
                className="absolute bottom-[5%] left-[calc(-10%+140px)] w-auto h-[45%] max-h-[450px] pointer-events-none z-0 select-none overflow-visible"
            >
                <img
                    src="/Lai Logo_3.svg"
                    className="w-full h-full object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)]"
                    alt="Background Watermark"
                />
            </motion.div>

            {/* 3. Main Chat Window - Floats in last */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: isLoaded ? 1 : 0.95,
                    x: isSetupActive ? "-15%" : "0%"
                }}
                transition={{
                    delay: 1.2, // Starts as logo is finishing
                    duration: 1.3, // Completes at 2.5s
                    ease: [0.16, 1, 0.3, 1] // Custom quintic ease for premium feel
                }}
                className="relative z-10 flex flex-col min-h-[600px] h-[calc(100vh-60px)] my-[30px] max-w-2xl w-full mx-auto bg-white shadow-2xl overflow-hidden border border-zinc-200 rounded-[32px] font-sans transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            >
                {/* Sidecar Instruction Panel - Phase 28 */}
                <AnimatePresence>
                    {isSetupActive && (
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                            className="absolute -right-full top-0 bottom-0 w-[80%] bg-zinc-50 border-l border-zinc-200 shadow-[-20px_0_40px_rgba(0,0,0,0.05)] z-0 p-8 flex flex-col gap-6"
                            style={{ right: "-75%" }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-zinc-100">
                                    <img src="/Lai Logo_2.svg" className="w-8 h-8" alt="Lai Logo" />
                                </div>
                                <div>
                                    <h3 className="font-black text-zinc-900 text-lg">開通導引經靈</h3>
                                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Setup Instructions</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-6 scroll-smooth">
                                {[
                                    { title: "1. 登入 LINE Developers", step: 0, desc: "點擊按鈕進入後台，建議使用與 Line 官方帳號同一個帳號登入。" },
                                    { title: "2. 選擇您的 Channel", step: 1, desc: "在首頁找到您要串接的那個店家的 Channel 區塊。" },
                                    { title: "3. 獲取 Channel Secret", step: 2, desc: "進入 Basic settings 頁籤，向下捲動即可找到並拷貝 Secret。" },
                                    { title: "4. 獲取 Access Token", step: 3, desc: "切換到 Messaging API 頁籤，滾動到底部點擊 Issue 生成 Token。" }
                                ].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        className={cn(
                                            "p-5 rounded-3xl border transition-all duration-500",
                                            (lineSecret && idx === 2) || (lineToken && idx === 3)
                                                ? "bg-green-50 border-green-200 shadow-sm"
                                                : "bg-white border-zinc-100 shadow-sm hover:border-zinc-300"
                                        )}
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-black text-zinc-800 text-[16px]">{item.title}</h4>
                                            {((lineSecret && idx === 2) || (lineToken && idx === 3)) && (
                                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                    <Save className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <MockLineUI step={item.step} />
                                        <p className="mt-4 text-zinc-500 text-xs leading-relaxed font-medium">{item.desc}</p>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="bg-white p-4 rounded-2xl border border-zinc-100 text-[10px] text-zinc-400 font-bold flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                總店長小提醒：跟著右邊範例點選，就不會錯囉！
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <header className="p-5 border-b glass flex items-center justify-between z-10 sticky top-0 bg-white/95 backdrop-blur-xl shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-[75.6px] h-[75.6px] flex items-center justify-center transition-transform hover:scale-105">
                            <img src="/Lai Logo_2.svg" className="w-full h-full object-contain" alt="Lai Logo" />
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
                            <div className="w-5 h-5 flex items-center justify-center overflow-hidden">
                                <img src="/Lai Logo_2.svg" className="w-full h-full object-contain filter brightness-0 invert" alt="Lai Logo" />
                            </div>
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
                                            "w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 mt-1 shadow-md bg-white border border-zinc-100",
                                            m.role === 'ai' ? "" : "bg-zinc-200"
                                        )}
                                    >
                                        {m.role === 'ai' ? (
                                            <img src="/Lai Logo.svg" className="w-[50px] h-[50px] object-contain" alt="Lai Logo" />
                                        ) : (
                                            <User className="w-8 h-8 text-zinc-500" />
                                        )}
                                    </div>
                                    <div className={cn(
                                        "relative p-5 shadow-sm text-[19.5px] leading-relaxed max-w-[85%] transition-all font-bold whitespace-pre-wrap",
                                        m.role === 'ai'
                                            ? "bg-white border border-zinc-200 rounded-2xl rounded-tl-none text-zinc-800"
                                            : "bg-[#06C755] text-white rounded-2xl rounded-tr-none ml-auto shadow-[#06C755]"
                                    )}>
                                        {m.role === 'ai' ? (
                                            <div className="space-y-3">
                                                {m.content.split(/\n/).map((line, lineIdx) => {
                                                    if (!line.trim()) return <div key={lineIdx} className="h-2" />;

                                                    // 1. Horizontal Rule
                                                    if (line.trim() === '---') return <hr key={lineIdx} className="my-4 border-zinc-100" />;

                                                    // 2. Headers
                                                    const headerMatch = line.match(/^(#{1,3})\s+(.*)/);
                                                    if (headerMatch) {
                                                        return (
                                                            <div key={lineIdx} className="mt-4 mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                                                    <span className="font-extrabold text-[21px] text-zinc-900 tracking-tight">{headerMatch[2]}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    // 3. Inline Elements (Images, Bold, Links)
                                                    const parts = line.split(/(!\[.*?\]\(.*?\))|(\*\*.*?\*\*)|(https?:\/\/[^\s]+)/g);
                                                    return (
                                                        <div key={lineIdx} className="leading-relaxed">
                                                            {parts.map((part, i) => {
                                                                if (!part) return null;

                                                                // Markdown Images
                                                                const imgMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
                                                                if (imgMatch) return (
                                                                    <div key={i} className="my-4 rounded-2xl overflow-hidden border border-zinc-100 shadow-sm max-w-xs">
                                                                        <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full h-auto" />
                                                                    </div>
                                                                );

                                                                // Bold Text
                                                                const boldMatch = part.match(/\*\*(.*?)\*\*/);
                                                                if (boldMatch) return <span key={i} className="font-black text-zinc-900 mx-0.5">{boldMatch[1]}</span>;

                                                                // Links
                                                                if (part.match(/^https?:\/\//)) {
                                                                    const cleanUrl = part.replace(/[.。!！?？,，」)）]+$/, '');
                                                                    return (
                                                                        <button
                                                                            key={i}
                                                                            onClick={() => { setActiveWebViewUrl(cleanUrl); setViewMode('webview'); }}
                                                                            className="text-[#06C755] underline break-all hover:text-green-700 decoration-dotted underline-offset-4 font-bold"
                                                                        >
                                                                            {cleanUrl}
                                                                        </button>
                                                                    );
                                                                }
                                                                return <span key={i}>{part}</span>;
                                                            })}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-white font-bold">{m.content}</div>
                                        )}
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
                                            {
                                                name: '個人店長版 (Lite)',
                                                price: '399',
                                                features: ['每月 5,000 則對話', '免 OpenAI API Key', '智慧服務介紹', '公司/產品QA介紹', '24小時自動回訊'],
                                            },
                                            {
                                                name: '中小企業版 (會計倉管)',
                                                price: '990',
                                                features: ['每月 20,000 則對話', '含 399 所有內容', 'AI 庫存查詢', '預約/定位查詢', '毛利利潤計算', '訂單狀態追蹤'],
                                                popular: true,
                                            },
                                            { name: 'AI 小公司衝刺版', price: '2490', desc: '可自備 Key / 不限流量 / 多通路整合行銷' }
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
                                        {(selectedPlan.price === '$399' || selectedPlan.price === '$990') ? (
                                            <div className="space-y-4">
                                                <div id={`paypal-button-container-${m.id}`} className="min-h-[150px]"></div>
                                                <p className="text-[12px] text-zinc-400 text-center font-medium">點擊「Subscribe」完成支付並自動辨識店家：<b>{storeName}</b></p>

                                                {/* Testing Bypass Button */}
                                                <button
                                                    onClick={handlePaymentSuccess}
                                                    className="w-full py-3 text-zinc-500 rounded-xl font-medium text-[14px] hover:bg-zinc-100 transition-colors border border-dashed border-zinc-300 mt-2"
                                                >
                                                    跳過支付直接開通 (測試開發專用)
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handlePaymentSuccess}
                                                className="w-full py-5 text-white rounded-2xl font-black text-[21px] hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-[#06C755]"
                                                style={{ backgroundColor: LINE_GREEN }}
                                            >
                                                立即付款 {selectedPlan.price || '$990'}
                                            </button>
                                        )}
                                    </motion.div>
                                )}

                                {/* Recovery Widget */}
                                {m.type === 'recovery' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="ml-14 bg-white p-8 rounded-3xl border border-zinc-100 shadow-2xl space-y-6 max-w-[85%]"
                                    >
                                        <div className="flex items-center gap-3 font-black text-[21px] text-amber-500">
                                            <Key className="w-7 h-7" />
                                            <span>找回管理連結</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <p className="text-[12px] font-black text-zinc-400 uppercase tracking-widest pl-1">店舖名稱</p>
                                                <input
                                                    id={`recover-name-${m.id}`}
                                                    type="text"
                                                    placeholder="請輸入正確的店名"
                                                    className="w-full p-4 rounded-xl border border-zinc-100 bg-zinc-50 text-[18.5px] focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-[12px] font-black text-zinc-400 uppercase tracking-widest pl-1">Line Channel Secret</p>
                                                <input
                                                    id={`recover-secret-${m.id}`}
                                                    type="password"
                                                    placeholder="只有老闆才知道的密鑰"
                                                    className="w-full p-4 rounded-xl border border-zinc-100 bg-zinc-50 text-[18.5px] focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const nameInput = document.getElementById(`recover-name-${m.id}`) as HTMLInputElement;
                                                const secretInput = document.getElementById(`recover-secret-${m.id}`) as HTMLInputElement;
                                                handleRecoverLink(nameInput.value, secretInput.value);
                                            }}
                                            className="w-full py-5 text-white bg-amber-500 rounded-2xl font-black text-[21px] hover:bg-amber-600 active:scale-95 transition-all shadow-xl shadow-amber-500/30"
                                        >
                                            立即驗證並找回
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
                                        className="ml-14 bg-white p-8 rounded-[32px] border border-zinc-100 shadow-2xl space-y-6 max-w-[85%]"
                                    >
                                        <div className="flex items-center gap-3 font-black text-[21px] text-[#06C755]">
                                            <Sparkles className="w-7 h-7" />
                                            <span>恭喜！您的 AI 店長已待命</span>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Webhook URL Section */}
                                            <div className="bg-[#06C755] p-6 rounded-2xl border border-[#06C755] space-y-3 shadow-lg shadow-emerald-100">
                                                <p className="text-[13.5px] font-black text-white uppercase tracking-widest text-center">您的專屬 Webhook 網址</p>
                                                <div className="bg-white p-4 rounded-xl border border-[#06C755] text-center select-all font-mono text-[16px] text-zinc-600 break-all cursor-copy active:bg-green-50 transition-colors shadow-inner">
                                                    {typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/${botId}` : ''}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${window.location.origin}/api/webhook/${botId}`);
                                                        alert("Webhook 網址已複製！");
                                                    }}
                                                    className="w-full py-2 text-white text-[12px] font-bold border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
                                                >
                                                    複製網址
                                                </button>
                                            </div>

                                            {/* Admin Center / Training Room Section */}
                                            <div className="bg-indigo-50/80 p-6 rounded-2xl border border-indigo-100 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Key className="w-5 h-5 text-indigo-500" />
                                                        <span className="font-black text-indigo-900">AI 練功房 (管理)</span>
                                                    </div>
                                                    {isAdminView && (
                                                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${adminBotData?.status === 'active' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-red-100 text-red-600 border-red-200'}`}>
                                                            {adminBotData?.status === 'active' ? '服務中' : '已關閉'}
                                                        </div>
                                                    )}
                                                </div>

                                                {!isAdminView ? (
                                                    <div className="space-y-4">
                                                        <p className="text-[13px] text-slate-600 leading-relaxed">
                                                            這是您的**店長私鑰 (Magic Link)**。請務必妥善保存，點擊即可隨時回來調整 AI 知識。
                                                        </p>
                                                        <div className="p-3 bg-white/80 border border-indigo-100 rounded-xl font-mono text-[10px] text-indigo-400 break-all select-all">
                                                            {typeof window !== 'undefined' ? `${window.location.origin}/?botId=${botId}&token=${mgmtToken}` : ''}
                                                        </div>
                                                        <button
                                                            onClick={() => handleAdminLogin(botId!, mgmtToken!)}
                                                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-[15px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                                                        >
                                                            進入練功房 · 管理中心 ➔
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {/* Admin Tabs */}
                                                        <div className="flex border-b border-slate-200">
                                                            {(['brain', 'products', 'faq', 'orders'] as const).map((tab) => (
                                                                <button
                                                                    key={tab}
                                                                    onClick={() => setAdminTab(tab)}
                                                                    className={cn(
                                                                        "flex-1 py-3 text-[12px] font-black transition-all border-b-2",
                                                                        adminTab === tab ? "border-indigo-500 text-indigo-600" : "border-transparent text-slate-400"
                                                                    )}
                                                                >
                                                                    {tab === 'brain' ? 'AI 大腦' : tab === 'products' ? '商品/課程' : tab === 'faq' ? '知識庫' : '訂單'}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {/* Tab Content */}
                                                        <div className="min-h-[300px] max-h-[400px] overflow-y-auto pr-1">
                                                            {adminTab === 'brain' && (
                                                                <div className="space-y-4 pt-2">
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500">
                                                                            <Brain className="w-3.5 h-3.5" />
                                                                            AI 的大腦指令 (人格/知識)
                                                                        </div>
                                                                        <textarea
                                                                            value={adminBotData.systemPrompt || ""}
                                                                            onChange={(e) => setAdminBotData({ ...adminBotData, systemPrompt: e.target.value })}
                                                                            className="w-full h-40 p-4 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-600 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                                                            placeholder="輸入要教給 AI 的知識..."
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex-1 flex gap-1 p-1 bg-slate-200/50 rounded-lg">
                                                                            <button
                                                                                onClick={() => setAdminBotData({ ...adminBotData, status: 'active' })}
                                                                                className={cn(
                                                                                    "flex-1 py-2 rounded-md text-[11px] font-bold transition-all",
                                                                                    adminBotData.status === 'active' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"
                                                                                )}
                                                                            >
                                                                                開啟
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setAdminBotData({ ...adminBotData, status: 'inactive' })}
                                                                                className={cn(
                                                                                    "flex-1 py-2 rounded-md text-[11px] font-bold transition-all",
                                                                                    adminBotData.status === 'inactive' ? "bg-white text-red-600 shadow-sm" : "text-slate-400"
                                                                                )}
                                                                            >
                                                                                關閉
                                                                            </button>
                                                                        </div>
                                                                        <button
                                                                            onClick={handleUpdateBot}
                                                                            disabled={isSaving}
                                                                            className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold text-[13px] hover:bg-indigo-700 transition-all"
                                                                        >
                                                                            {isSaving ? "傳輸中..." : "保存新的訓練 ✨"}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {adminTab === 'products' && (
                                                                <div className="space-y-4 pt-2">
                                                                    <div className="bg-white p-4 rounded-xl border border-dashed border-indigo-200 space-y-3">
                                                                        <input
                                                                            type="text"
                                                                            placeholder="商品或課程名稱"
                                                                            value={newProduct.name}
                                                                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                                                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm"
                                                                        />
                                                                        <div className="grid grid-cols-3 gap-2">
                                                                            <input
                                                                                type="number"
                                                                                placeholder="售價"
                                                                                value={newProduct.price}
                                                                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                                                                className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm"
                                                                            />
                                                                            <input
                                                                                type="number"
                                                                                placeholder="成本"
                                                                                value={newProduct.cost}
                                                                                onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
                                                                                className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm"
                                                                            />
                                                                            <input
                                                                                type="number"
                                                                                placeholder="庫存"
                                                                                value={newProduct.stock_quantity}
                                                                                onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                                                                                className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm"
                                                                            />
                                                                        </div>
                                                                        <button
                                                                            onClick={handleAddProduct}
                                                                            className="w-full py-2 bg-indigo-500 text-white rounded-lg font-bold text-sm"
                                                                        >
                                                                            新增商品/課程
                                                                        </button>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        {products.map((p: any) => (
                                                                            <div key={p.id} className="p-3 bg-white border border-slate-100 rounded-xl flex justify-between items-center">
                                                                                <div>
                                                                                    <p className="font-bold text-sm text-slate-800">{p.name}</p>
                                                                                    <p className="text-[10px] text-slate-400">售價: ${p.price} | 庫存: {p.stock_quantity}</p>
                                                                                </div>
                                                                                <div className="text-right">
                                                                                    <p className="text-[10px] text-emerald-500 font-bold">預估毛利: ${p.price - p.cost}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {adminTab === 'faq' && (
                                                                <div className="space-y-4 pt-2">
                                                                    <div className="bg-white p-4 rounded-xl border border-dashed border-indigo-200 space-y-3">
                                                                        <input
                                                                            type="text"
                                                                            placeholder="常見問題 (Q)"
                                                                            value={newFaq.question}
                                                                            onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                                                                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm"
                                                                        />
                                                                        <textarea
                                                                            placeholder="回答內容 (A)"
                                                                            value={newFaq.answer}
                                                                            onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                                                                            className="w-full p-3 h-20 bg-slate-50 border border-slate-100 rounded-lg text-sm"
                                                                        />
                                                                        <button
                                                                            onClick={handleAddFaq}
                                                                            className="w-full py-2 bg-indigo-500 text-white rounded-lg font-bold text-sm"
                                                                        >
                                                                            新增知識
                                                                        </button>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        {faqList.map((f: any) => (
                                                                            <div key={f.id} className="p-3 bg-white border border-slate-100 rounded-xl space-y-1">
                                                                                <p className="font-bold text-sm text-indigo-600">Q: {f.question}</p>
                                                                                <p className="text-[12px] text-slate-500">A: {f.answer}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {adminTab === 'orders' && (
                                                                <div className="space-y-4 pt-2">
                                                                    <div className="space-y-2">
                                                                        {orders.length === 0 && <p className="text-center py-10 text-slate-400 text-sm italic">目前尚無訂單紀錄</p>}
                                                                        {orders.map((o: any) => (
                                                                            <div key={o.id} className="p-4 bg-white border border-slate-100 rounded-xl space-y-2">
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-[10px] font-black uppercase py-0.5 px-2 bg-slate-100 rounded-full text-slate-500">{o.status}</span>
                                                                                    <span className="text-[10px] text-slate-400">{new Date(o.created_at).toLocaleString()}</span>
                                                                                </div>
                                                                                <div className="flex justify-between items-center">
                                                                                    <p className="font-bold text-slate-800">總額: ${o.total_amount}</p>
                                                                                    <p className="text-[12px] text-indigo-500 font-medium">客戶: {o.line_user_id.slice(0, 8)}...</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-zinc-100 flex flex-col gap-3">
                                            <p className="text-xs text-zinc-400 text-center font-medium leading-relaxed">
                                                現在您可以對您的 Line 官方帳號說聲「你好」來測試了！
                                            </p>
                                            <button
                                                onClick={() => {
                                                    localStorage.clear();
                                                    window.location.href = '/';
                                                }}
                                                className="w-full py-2 text-[12px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                結束並回到首頁 ➔
                                            </button>
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
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={placeholder}
                            className="flex-1 bg-zinc-100 border-none rounded-2xl px-6 py-4 pr-16 text-[20px] focus:ring-2 focus:ring-[#06C755] transition-all outline-none font-medium text-zinc-800 shadow-inner select-text"
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
