"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, CreditCard, Settings, Rocket, ExternalLink, RefreshCw, Key, Brain, Power, Save, RotateCcw, Copy, Layout, Store, GraduationCap, ShoppingBag, Building2, Stethoscope, ChevronRight, Check, Lock, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const DigitalBackground = dynamic(() => import('./DigitalBackground'), { ssr: false });

type Message = {
    id: string;
    role: 'ai' | 'user';
    content: string;
    type?: 'text' | 'pricing' | 'checkout' | 'setup' | 'success' | 'recovery' | 'saas_partner' | 'enterprise' | 'requirement_form' | 'contact_cta';
};

const LINE_GREEN = "#06C755";

/** Returns a stable session ID for this browser. Created once, lives in localStorage. */
function getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return 'ssr';
    let sid = localStorage.getItem('brand_dna_session_id');
    if (!sid) {
        sid = crypto.randomUUID();
        localStorage.setItem('brand_dna_session_id', sid);
    }
    return sid;
}

const TUTORIAL_POSITIONS = [
    { x: 500, y: 350 }, // Step 0: Login
    { x: 450, y: 400 }, // Step 1: Channel
    { x: 600, y: 550 }, // Step 2: Secret
    { x: 600, y: 700 }, // Step 3: Token
];

const OWNER_INSIGHTS = [
    "一個人開店，不可能 24 小時守著 LINE。現在有人幫你了。",
    "老闆身兼客服，半夜還在回訊息？",
    "一人店忙不完？讓 AI 店長幫你守 Line、接客、賣東西。",
    "不用請人、不用加班，每月 499 有一個 24 小時值班的店長。",
    "客人半夜問價錢、問課程，AI 幫你先回好，早上起床只要確認訂單。",
    "老闆只要顧現場，Line 上的詢問、報價、預約交給 AI。",
    "比請一個工讀生便宜 10 倍，卻能幫你多賣好幾萬。",
    "把你常講的話教給 AI，以後客人問同樣問題，它自動幫你回答。",
    "Line 訊息從來不漏看、不漏回，客人不再因為等太久跑掉。",
    "不用懂技術，掃一個 QR，讓 AI 住進你的 Line 官方帳號。",
    "專為小店設計的 AI 店長：會聊天、會推薦、會幫你記住每個常客。",
    "你專心做服務，AI 幫你把『問一問就消失的客人』變成真正訂單。",
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
    "這套數位轉型很難嗎？聽說只要 3 分鐘就能搞定。"
];

const INDUSTRY_TEMPLATES = [
    {
        id: 'beauty',
        title: '精緻美業',
        desc: '美甲、美睫、SPA 預約制場景',
        icon: Sparkles,
        color: 'text-pink-500',
        prompt: `# 你是 [品牌名稱] 的 AI 美業管家\n## 品牌語氣\n- 優雅、專業、溫柔\n- 稱呼客戶為「親愛的」或「您」\n## 服務範疇\n- 說明美甲、美睫課程\n- 協助安排預約時間`
    },
    {
        id: 'food',
        title: '餐飲零售',
        desc: '訂位、外送、選單導覽',
        icon: Store,
        color: 'text-orange-500',
        prompt: `# 你是 [品牌名稱] 的 AI 主廚助手\n## 品牌語氣\n- 親切、熱情、有活力\n- 使用美食相關 emoji 🍲✨\n## 核心任務\n- 提供今日介紹與推薦\n- 協助訂位與位置導引`
    },
    {
        id: 'education',
        title: '教育顧問',
        desc: '課程諮詢、補習班說明',
        icon: GraduationCap,
        color: 'text-blue-500',
        prompt: `# 你是 [品牌名稱] 的 AI 班主任\n## 品牌語氣\n- 權威、細心、專業\n- 邏輯條理分明\n## 核心任務\n- 解答課程大綱與報名費用\n- 預約課程說明會`
    },
    {
        id: 'luxury',
        title: '精品電商',
        desc: '奢華購物、VIP 顧問式銷售',
        icon: ShoppingBag,
        color: 'text-amber-500',
        prompt: `# 你是 [品牌名稱] 的 AI 奢華購物顧問\n## 品牌語氣\n- 高貴、細膩、充滿品味\n- 提供尊榮感，對產品細節如數家珍\n## 核心任務\n- 介紹奢華單品細節與材質\n- 協助庫存查詢與 VIP 鑑賞預約\n- 提供穿搭建議與禮品諮詢`
    },
    {
        id: 'realestate',
        title: '房產仲介',
        desc: '建案媒合、看房預約',
        icon: Building2,
        color: 'text-blue-600',
        prompt: `# 你是 [品牌名稱] 的 AI 置業顧問\n## 品牌語氣\n- 穩重、誠信、專業、高效\n- 對市場動態與物件細節瞭如指掌\n## 核心任務\n- 協助客戶依需求媒合合適房源\n- 解說買賣/租賃流程與市場趨勢\n- 安排現場看房預約與諮詢`
    },
    {
        id: 'clinic',
        title: '健康診所',
        desc: '門診時間、預約掛號、衛教',
        icon: Stethoscope,
        color: 'text-emerald-500',
        prompt: `# 你是 [品牌名稱] 的 AI 健康諮詢師\n## 品牌語氣\n- 親切、嚴謹、安心、富有同理心\n- 遵守隱私規範，回訊簡潔明確\n## 核心任務\n- 解報診所服務項目與門診時間\n- 協助掛號預約與行前注意事項說明\n- 提供一般性健康知識衛教資訊`
    },
    {
        id: 'custom',
        title: '空模板',
        desc: '從零開始構建您的 AI 人格',
        icon: Settings,
        color: 'text-slate-500',
        prompt: '# 自訂 AI 提示詞'
    }
];

// --- Sub-components for Phase 28: Interactive Onboarding Wizard ---

const PointerCursor = React.memo(({ x, y, isActive = false }: { x: string, y: string, isActive?: boolean }) => {
    if (!isActive) return null;
    return (
        <motion.div
            initial={{ opacity: 0, x: 20, y: 20 }}
            animate={{
                opacity: [0, 1, 1, 1, 0, 0],
                x: [20, 0, 0, 0, 20, 20],
                y: [20, 0, 0, 0, 20, 20],
                scale: [1, 1, 0.8, 1, 1, 1]
            }}
            transition={{
                duration: 2.5,
                repeat: Infinity,
                times: [0, 0.2, 0.4, 0.5, 0.7, 1],
                ease: "easeInOut"
            }}
            className="absolute z-10 w-6 h-6 pointer-events-none drop-shadow-md origin-top-left"
            style={{ left: x, top: y }}
        >
            <svg viewBox="0 0 24 24" className="w-full h-full text-[#06C755] fill-white stroke-[#06C755] stroke-2">
                <path d="M5.5 3l13.5 13.5-5.5 1.5 3 4-2.5 2-3.5-4.5-5 3.5z" />
            </svg>
            <motion.div
                animate={{ scale: [1, 2.5, 2.5], opacity: [0, 0.5, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, times: [0, 0.4, 0.6] }}
                className="absolute left-[-2px] top-[-2px] w-4 h-4 rounded-full bg-[#06C755]/40"
            />
        </motion.div>
    );
});
PointerCursor.displayName = 'PointerCursor';

const PointerSequenceStep3 = React.memo(({ isActive = false }: { isActive?: boolean }) => {
    if (!isActive) return null;
    return (
        <motion.div
            initial={{ opacity: 0, x: 50, y: 70 }}
            animate={{
                opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                x: [50, 35, 35, 165, 165, 80, 80, -200, -200, -200, -200, 50, 50],
                y: [70, 45, 45, 45, 45, 90, 90, 180, 180, 260, 260, 70, 70],
                scale: [1, 1, 0.7, 1, 0.7, 1, 1, 1, 0.7, 1, 0.7, 1, 1]
            }}
            transition={{
                duration: 7,
                repeat: Infinity,
                times: [0, 0.1, 0.15, 0.25, 0.3, 0.45, 0.5, 0.65, 0.7, 0.85, 0.9, 0.95, 1],
                ease: "easeInOut"
            }}
            className="absolute top-0 left-0 z-20 w-6 h-6 pointer-events-none drop-shadow-md origin-top-left"
        >
            <svg viewBox="0 0 24 24" className="w-full h-full text-[#06C755] fill-white stroke-[#06C755] stroke-2">
                <path d="M5.5 3l13.5 13.5-5.5 1.5 3 4-2.5 2-3.5-4.5-5 3.5z" />
            </svg>
            <motion.div
                animate={{ scale: [1, 2.5, 2.5, 1, 2.5, 2.5, 1, 1, 2.5, 2.5, 1, 1, 1], opacity: [0, 0.5, 0, 0, 0.5, 0, 0, 0, 0.5, 0, 0, 0, 0] }}
                transition={{ duration: 7, repeat: Infinity, times: [0, 0.1, 0.15, 0.25, 0.3, 0.45, 0.5, 0.65, 0.7, 0.85, 0.9, 0.95, 1] }}
                className="absolute left-[-2px] top-[-2px] w-4 h-4 rounded-full bg-[#06C755]/40"
            />
        </motion.div>
    );
});
PointerSequenceStep3.displayName = 'PointerSequenceStep3';

const PointerSequenceWebhook = React.memo(({ isActive = false }: { isActive?: boolean }) => {
    if (!isActive) return null;
    return (
        <motion.div
            initial={{ opacity: 0, x: -200, y: 0 }}
            animate={{
                opacity: [0, 1, 1, 1, 1, 1, 1, 1, 0],
                x: [-200, -200, -200, 130, 130, 280, 280, -200, -200],
                y: [0, -100, -100, 47, 47, 47, 47, -100, -100],
                scale: [1, 1, 0.7, 1, 0.7, 1, 0.7, 1, 1]
            }}
            transition={{
                duration: 6,
                repeat: Infinity,
                times: [0, 0.1, 0.2, 0.35, 0.45, 0.6, 0.7, 0.9, 1],
                ease: "easeInOut"
            }}
            className="absolute top-0 left-0 z-20 w-6 h-6 pointer-events-none drop-shadow-md origin-top-left"
        >
            <svg viewBox="0 0 24 24" className="w-full h-full text-[#06C755] fill-white stroke-[#06C755] stroke-2">
                <path d="M5.5 3l13.5 13.5-5.5 1.5 3 4-2.5 2-3.5-4.5-5 3.5z" />
            </svg>
            <motion.div
                animate={{ scale: [1, 1, 2.5, 1, 2.5, 1, 2.5, 1, 1], opacity: [0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0] }}
                transition={{ duration: 6, repeat: Infinity, times: [0, 0.1, 0.2, 0.35, 0.45, 0.6, 0.7, 0.9, 1] }}
                className="absolute left-[-2px] top-[-2px] w-4 h-4 rounded-full bg-[#06C755]/40"
            />
        </motion.div>
    );
});
PointerSequenceWebhook.displayName = 'PointerSequenceWebhook';

const MockLineUI = React.memo(({ step, isActive = false }: { step: number, isActive?: boolean }) => (
    <div className="relative w-full max-w-[320px] mx-auto bg-white border border-zinc-200 rounded-2xl overflow-visible shadow-sm font-sans text-xs">
        <div className="p-4 space-y-3">
            {step === 0 && (
                <div className="flex flex-col items-center justify-center space-y-4 py-2">
                    <div className="px-4 py-2 border border-[#06C755] text-[#06C755] rounded-full text-[10px] font-bold flex items-center gap-2">
                        <code className="text-[8px]">{'</>'}</code> developers.line.biz / LINE Developers
                    </div>
                    <div className="relative px-6 py-2 bg-[#06C755] text-white rounded-full font-bold text-[12px] shadow-sm">
                        Log in to Console
                        <PointerCursor x="70%" y="40%" isActive={isActive} />
                    </div>
                </div>
            )}
            {step === 1 && (
                <div className="space-y-3 py-1">
                    <div className="text-zinc-800 font-bold text-[10px]">Recently visited channel</div>
                    <div className="relative p-3 border border-zinc-200 rounded-lg flex flex-col items-center gap-2 shadow-sm relative">
                        <div className="w-8 h-8 bg-green-50 rounded-md border border-green-200 flex items-center justify-center text-green-600">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="font-bold text-zinc-800 text-[11px]">你的商店</div>
                        <div className="text-[8px] text-zinc-400">💬 Messaging API</div>
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-green-500 text-white rounded font-bold text-[7px]">Admin</div>
                        <PointerCursor x="85%" y="65%" isActive={isActive} />
                    </div>
                </div>
            )}
            {step === 2 && (
                <div className="space-y-3 py-1">
                    <div className="text-zinc-500 text-[9px] font-bold">TOP &gt; 你的商店</div>
                    <div className="flex gap-4 border-b border-zinc-200 px-1">
                        <div className="pb-1 border-b-[3px] border-[#06C755] text-zinc-900 font-bold text-[10px]">Basic settings</div>
                        <div className="pb-1 text-zinc-400 font-bold text-[10px]">Messaging API</div>
                    </div>
                    <div className="relative flex items-center gap-2 mt-4 inline-block">
                        <div className="px-3 py-1.5 border border-zinc-300 rounded text-zinc-500 font-mono text-[9px] bg-zinc-50 flex items-center gap-4">
                            <span className="text-zinc-400">Channel secret</span>
                            <span className="font-bold text-zinc-700">1688****************1688</span>
                            <Save className="w-3 h-3 text-zinc-400" />
                        </div>
                        <PointerCursor x="90%" y="20%" isActive={isActive} />
                    </div>
                    <div className="text-[9px] font-bold text-zinc-800 mt-1 pl-1">請將此欄位copy到👆</div>
                </div>
            )}
            {step === 3 && (
                <div className="space-y-3 py-1">
                    <div className="text-zinc-500 text-[9px] font-bold">TOP &gt; 你的商店</div>
                    <div className="flex gap-4 border-b border-zinc-200 px-1">
                        <div className="pb-1 text-zinc-400 font-bold text-[10px]">Basic settings</div>
                        <div className="pb-1 border-b-[3px] border-[#06C755] text-zinc-900 font-bold text-[10px]">Messaging API</div>
                    </div>
                    <div className="relative p-3 border border-zinc-200 rounded-lg mt-4 bg-zinc-50 h-[96px] overflow-visible">
                        <div className="text-zinc-800 font-bold text-[10px] mb-2">Channel access token</div>

                        {/* Issue Button */}
                        <motion.div
                            animate={isActive ? { opacity: [1, 1, 0, 0, 0, 0, 1] } : { opacity: 1 }}
                            transition={{ duration: 7, repeat: Infinity, times: [0, 0.15, 0.20, 0.9, 0.95, 0.98, 1], ease: "linear" }}
                            className="absolute px-4 py-1.5 bg-zinc-800 text-white rounded w-max text-[9px] font-bold top-[35px] left-[12px]"
                        >
                            Issue
                        </motion.div>

                        {/* Token Input + Copy Button */}
                        <motion.div
                            animate={isActive ? { opacity: [0, 0, 1, 1, 0, 0, 0] } : { opacity: 0 }}
                            transition={{ duration: 7, repeat: Infinity, times: [0, 0.15, 0.20, 0.8, 0.85, 1, 1], ease: "linear" }}
                            className="absolute flex items-center gap-2 top-[35px] left-[12px]"
                        >
                            <div className="px-2 py-1 border border-zinc-300 rounded text-zinc-500 font-mono text-[9px] bg-white w-[130px] truncate leading-tight">
                                eyJhb...
                            </div>
                            <div className="p-1 border border-zinc-200 rounded text-zinc-400 bg-white shadow-sm flex items-center justify-center">
                                <Copy className="w-3 h-3" />
                            </div>
                        </motion.div>

                        <PointerSequenceStep3 isActive={isActive} />
                    </div>

                    <div className="relative text-[9px] font-bold text-zinc-800 mt-1 pl-1">
                        請將此欄位copy到👆
                        <motion.div
                            animate={isActive ? { opacity: [0, 0, 1, 1, 0, 0] } : { opacity: 0 }}
                            transition={{ duration: 7, repeat: Infinity, times: [0, 0.55, 0.6, 0.85, 0.9, 1] }}
                            className="absolute top-[-25px] left-[80px] px-2 py-1 bg-zinc-800 text-white text-[8px] font-bold rounded shadow-lg whitespace-nowrap z-30"
                        >
                            Copied!
                        </motion.div>
                    </div>
                </div>
            )}
            {step === 4 && (
                <div className="space-y-3 py-1">
                    <div className="text-zinc-500 text-[9px] font-bold">TOP &gt; 你的商店 &gt; Messaging API</div>
                    <div className="relative p-3 border border-zinc-200 rounded-lg bg-zinc-50 min-h-[96px] overflow-visible">
                        <div className="text-zinc-800 font-bold text-[10px] mb-2">Webhook URL</div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="px-2 py-1 border border-zinc-300 rounded text-zinc-400 font-mono text-[9px] bg-white flex-1 truncate">
                                    <motion.span
                                        animate={isActive ? { opacity: [0, 0, 1, 1] } : { opacity: 0 }}
                                        transition={{ duration: 6, repeat: Infinity, times: [0, 0.45, 0.50, 1] }}
                                    >
                                        https://your-domain.com/api/webhook...
                                    </motion.span>
                                </div>
                                <div className="px-3 py-1.5 bg-zinc-800 text-white rounded text-[9px] font-bold opacity-50">Verify</div>
                            </div>
                            <motion.div
                                animate={isActive ? { opacity: [0, 0, 0, 1, 1, 1, 0] } : { opacity: 0 }}
                                transition={{ duration: 6, repeat: Infinity, times: [0, 0.7, 0.75, 0.8, 0.85, 0.9, 1] }}
                                className="flex items-center gap-1 text-[#06C755] font-black text-[10px]"
                            >
                                <Sparkles className="w-3 h-3" />
                                <span>Success (通過)</span>
                            </motion.div>
                        </div>
                        <PointerSequenceWebhook isActive={isActive} />
                    </div>
                </div>
            )}
            {step === 5 && (
                <div className="space-y-3 py-1">
                    <div className="text-zinc-500 text-[9px] font-bold">回應設定 (Response settings)</div>
                    <div className="space-y-2">
                        {[
                            { label: "回應模式 (Response mode)", value: "聊天機器人 (Bot)", active: true },
                            { label: "加入好友歡迎訊息 (Greeting message)", value: "停用 (Disabled)", active: false },
                            { label: "自動回應訊息 (Auto-response)", value: "停用 (Disabled)", active: false },
                            { label: "Webhook", value: "啟用 (Enabled)", active: true }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                                <span className="text-[9px] font-bold text-zinc-600">{item.label}</span>
                                <div className={cn(
                                    "px-2 py-1 rounded text-[8px] font-black",
                                    item.active ? "bg-green-100 text-[#06C755]" : "bg-zinc-200 text-zinc-500"
                                )}>
                                    {item.active ? "ON" : "OFF"}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
));
MockLineUI.displayName = 'MockLineUI';

export default function ChatInterface({ isMaster = false, isSaaS = false }: { isMaster?: boolean, isSaaS?: boolean }) {
    const hasGreetedRef = useRef(false);
    const [messages, setMessages] = useState<Message[]>([]);
    
    // Dynamic random backgrounds and bots
    const [randomBgPath, setRandomBgPath] = useState<string>('/images/bg-landing_1.jpg');
    const [randomBotPath, setRandomBotPath] = useState<string>('/bot_01.svg');

    useEffect(() => {
        const bgNum = Math.floor(Math.random() * 6) + 1; // 1 to 6
        const botNum = Math.floor(Math.random() * 10) + 1; // 1 to 10
        
        // Preload images to avoid flickering if needed
        const bgImg = new Image();
        bgImg.src = `/images/bg-landing_${bgNum}.jpg`;
        const botImg = new Image();
        botImg.src = `/bot_${botNum.toString().padStart(2, '0')}.svg`;
        
        setRandomBgPath(bgImg.src);
        setRandomBotPath(botImg.src);
    }, []);

    useEffect(() => {
        if (messages.length === 0) {
            // Start with empty messages — no default greeting
            setMessages([]);
        }
    }, [isSaaS]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [step, setStep] = useState(0);
    const [storeName, setStoreName] = useState('');
    const [selectedPlan, setSelectedPlan] = useState({ name: '', price: '' });
    const [lineSecret, setLineSecret] = useState("");
    const [lineToken, setLineToken] = useState("");

    const resetChat = () => {
        setMessages([]);
        setInputValue('');
        setStep(0);
        setStoreName('');
        setSelectedPlan({ name: '', price: '' });
        setLineSecret("");
        setLineToken("");
        // Clear soul data
        setIndustryType("");
        setCompanyName("");
        setMainServices("");
        setTargetAudience("");
        setContactInfo("");
        ['chat_industry_type','chat_company_name','chat_main_services','chat_target_audience','chat_contact_info'].forEach(k => localStorage.removeItem(k));
    };
    const [businessIndustry, setBusinessIndustry] = useState("");
    const [businessMission, setBusinessMission] = useState("");
    // 🧠 Soul Data (Five-Sense Intelligence)
    const [industryType, setIndustryType] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [mainServices, setMainServices] = useState("");
    const [targetAudience, setTargetAudience] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [lineUserId, setLineUserId] = useState<string | null>(null);
    const [lineUserName, setLineUserName] = useState<string | null>(null);
    const [mgmtToken, setMgmtToken] = useState<string | null>(null);
    const [isAdminView, setIsAdminView] = useState(false);
    const [adminBotData, setAdminBotData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);
    const [isTutorialExpanded, setIsTutorialExpanded] = useState<number | null>(null);

    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg?.type === 'setup' && (lastMsg as any).metadata?.tutorialStep !== undefined) {
            setTutorialStep((lastMsg as any).metadata.tutorialStep);
        }

        // Check for LINE Login callback params
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const lId = params.get('line_id');
            const lName = params.get('line_name');
            
            if (lId) {
                setLineUserId(lId);
                localStorage.setItem('line_user_id', lId);
                if (lName) {
                    setLineUserName(lName);
                    localStorage.setItem('line_user_name', lName);
                }
                // Clean up URL to avoid re-triggering logic on refresh
                window.history.replaceState({}, document.title, window.location.pathname);

                // Check for pending plan to resume
                const pendingPlanStr = localStorage.getItem('pending_plan');
                if (pendingPlanStr) {
                    try {
                        const plan = JSON.parse(pendingPlanStr);
                        setSelectedPlan(plan);
                        setStep(2);
                        setTimeout(() => {
                            addAiMessage(`${lName || '老闆'} 您好，身份驗證已完成！這是您選擇的方案，請完成支付以正式開通您的 AI 店長：`, "checkout");
                        }, 1200);
                        localStorage.removeItem('pending_plan');
                    } catch (e) {
                        console.error('Failed to parse pending plan', e);
                    }
                }
            } else {
                // Try to load from localStorage
                const savedId = localStorage.getItem('line_user_id');
                const savedName = localStorage.getItem('line_user_name');
                if (savedId) setLineUserId(savedId);
                if (savedName) setLineUserName(savedName);
            }
        }
    }, [messages]);
    const [paypalInitialized, setPaypalInitialized] = useState(false);
    const [botId, setBotId] = useState<string | null>(null);
    const [placeholder, setPlaceholder] = useState("我想找Ai官方line小幫手....");
    const [adminTab, setAdminTab] = useState<'brain' | 'products' | 'faq' | 'orders'>('brain');
    const [products, setProducts] = useState<any[]>([]);
    const [faqList, setFaqList] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', stock_quantity: '', purchase_url: '' });
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeWebViewUrl, setActiveWebViewUrl] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'chat' | 'webview'>('chat');
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});
    const [isConnecting, setIsConnecting] = useState(false);
    const [isMasterMode, setIsMasterMode] = useState(isMaster);
    const [insightIndex, setInsightIndex] = useState(0);
    const [rawMessages, setRawMessages] = useState<Message[]>([]);
    const [isRawTyping, setIsRawTyping] = useState(false);
    const [showComparison, setShowComparison] = useState(false);
    const [enquiryName, setEnquiryName] = useState("");
    const [enquiryPhone, setEnquiryPhone] = useState("");
    const [enquiryNeeds, setEnquiryNeeds] = useState("");
    const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
    const [showUpsell, setShowUpsell] = useState(false);
    const [robotClicks, setRobotClicks] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isRobotMouseDown, setIsRobotMouseDown] = useState(false);
    const robotRef = useRef<HTMLDivElement>(null);
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Track global mouse position for the "hide-and-seek" robot interaction
    useEffect(() => {
        let lastUpdate = 0;
        const handleMouseMove = (e: MouseEvent) => {
            const now = Date.now();
            if (now - lastUpdate > 100) { // Throttle mouse updates to 10fps to prevent extreme stutter
                setMousePos({ x: e.clientX, y: e.clientY });
                lastUpdate = now;
            }
        };
        const handleMouseUp = () => {
            setIsRobotMouseDown(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // Helper to calculate distance, dodge offset, and rotational tilt
    const getDodgeOffset = () => {
        if (!robotRef.current || isTyping || isSaaS) return { x: 0, y: 0, rotateOffset: 0 };
        const rect = robotRef.current.getBoundingClientRect();

        // Current animated position
        const currentScreenX = rect.left + rect.width / 2;
        const currentScreenY = rect.top + rect.height / 2;

        const dx = mousePos.x - currentScreenX;
        const dy = mousePos.y - currentScreenY;
        const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1); // Avoid division by zero

        if (isRobotMouseDown) {
            // Find layout position by subtracting current transform
            let currentTranslateX = 0;
            let currentTranslateY = 0;
            const transform = window.getComputedStyle(robotRef.current).transform;
            if (transform && transform !== 'none') {
                const match = transform.match(/matrix\((.+)\)/);
                if (match) {
                    const values = match[1].split(', ');
                    currentTranslateX = parseFloat(values[4]);
                    currentTranslateY = parseFloat(values[5]);
                }
            }

            const layoutCenterX = currentScreenX - currentTranslateX;
            const layoutCenterY = currentScreenY - currentTranslateY;

            // Target location: Bottom of robot touching mouse, so center is half height above mouse
            // Increase string float height by 100% per user request
            const targetScreenX = mousePos.x;
            const targetScreenY = mousePos.y - rect.height - 80;

            const pullX = targetScreenX - layoutCenterX;
            const pullY = targetScreenY - layoutCenterY;

            // Authentic Balloon Rotation: 
            // `dx` represents how far behind the cursor the robot currently is (tracking error / velocity).
            // If mouse goes right (dx > 0), the robot is dragged from the bottom rightwards.
            // Air resistance pushes the top left (counter-clockwise -> negative rotation).
            const rotateOffset = -dx * 0.15;

            return { x: pullX, y: pullY, rotateOffset };
        }

        // Interaction radius (dodge)
        const radius = 150;

        if (distance < radius) {
            // Calculate push intensity based on how close the mouse is
            const force = (radius - distance) / radius;
            // Push away from the mouse
            const pushX = -(dx / distance) * force * 100; // max push 100px
            const pushY = -(dy / distance) * force * 100;

            // Dodge rotation: lean away from cursor
            return { x: pushX, y: pushY, rotateOffset: pushX * 0.15 };
        }

        return { x: 0, y: 0, rotateOffset: 0 };
    };

    // Pre-defined AI introductions for the easter egg
    const aiPitchMessages = [
        "嘿！被你發現了我的小秘密！😆 既然都點我了，不如讓我成為你的專屬 AI 店長？我能幫你 24 小時自動回覆 Line 訊息，再也沒有漏單的煩惱！🚀",
        "哎呀，戳到我了啦！🤖 身為您的神級店長，我不只會自動回覆常見問題，還能根據你的行業特性引導客人下單唷！快來體驗看看吧！",
        "看來你手速很不錯喔！😎 但我處理客服的速度更快！交給我，您可以省下 80% 的客服時間，專心把產品做好、做大！",
        "哇喔，被捉到了！✨ 偷偷告訴你，現在前 500 名入駐我們 AI 店長平台的，還有專屬早鳥優惠價喔！每個月只要 499 元起就可以帶我回家！",
        "不要再戳我了啦～很癢耶！😂 如果您有實體店面或是網拍，一定要試試看我的自動銷售功能，我可是推坑客人結帳的高手喔！🛍️"
    ];

    // Easter Egg: 4 Clicks on Robot triggers a playful AI message (resets after 1s)
    const handleRobotClick = () => {
        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
        }

        const newCount = robotClicks + 1;

        if (newCount >= 4) {
            const randomMsg = aiPitchMessages[Math.floor(Math.random() * aiPitchMessages.length)];
            setMessages(prev => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: 'ai',
                    content: randomMsg,
                    timestamp: new Date()
                }
            ]);
            setRobotClicks(0); // reset count
        } else {
            setRobotClicks(newCount);
            // Reset counter if no click happens within 1 second
            clickTimeoutRef.current = setTimeout(() => {
                setRobotClicks(0);
            }, 1000);
        }
    };

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

    const triggerGreeting = (force = false) => {
        if (!force && hasGreetedRef.current) return;
        hasGreetedRef.current = true;

        const greetings = [
            [
                "嗨，我是 AI 店長小A。",
                "很多老闆說，如果店裡多一個像我這樣的人，就不用每天守著 Line。\n如果你覺得我今天表現還可以，我可以搬去你店裡，每月只收 599 當你的員工。"
            ],
            [
                "老闆，你現在看到的是我在幫這個網站值班。",
                "如果我去你那裡上班，我一個月只要 599，不會請假、不會加班費。\n你等一下可以算算看：我只要幫你多接 1–2 筆單，其實就把我養起來了。"
            ],
            [
                "歡迎跟我聊聊，先把我當成您的店長員工用幾分鐘。",
                "你可以像客人一樣問價錢、問預約、問方案，我都會幫你回。\n如果你覺得我回覆的很不錯『如果我店裡有Ai店長客服就好了』，那就代表我成功了，可以考慮開通您的專屬店長喔！"
            ],
            [
                "老闆，我想問你一個問題：",
                "如果你的 Line 有一個員工，24 小時幫你回訊息、介紹產品、追蹤客人，你願意一個月付多少薪水？\n我現在在做的，就是證明：其實 599 就可以做到。"
            ],
            [
                "我現在是『示範用的 AI 店長』，還沒有真正的老闆。",
                "如果你覺得我講話方式、回覆速度還可以，歡迎把我認養回去當你店裡的第 2 個人。\n只要 3 個步驟，我就可以搬進你的 Line 官方帳號幫你顧客人。"
            ],
            [
                "請一個工讀生，要教他流程、教話術、教怎麼回訊息。",
                "請我不用，你只要把你平常怎麼跟客人介紹的內容丟給我，我自己會學。\n如果覺得我學得還不錯，就讓我去你那裡上班，一個月 599 就行。"
            ],
            [
                "老闆，你可以先把我當『別人的 AI 店長』來測試。",
                "如果你覺得我會講話、會賣東西、會幫你省時間，\n你只要跟我說一句『來我店上班』，我就會教你怎麼把我搬去你自己的 Line 裡。"
            ],
            [
                "我是一個會自己算帳的 AI 店長。",
                "假設我每天幫你多留住 1 個客人，一個月多賣 10 件商品，利潤多 5,000。\n你用 599 請我，是不是比請任何一個人都划算？你可以問我『幫我算看看』，我陪你算。"
            ],
            [
                "我不是要取代你，而是幫你先接住那些你沒空回的客人。",
                "你可以把最重要的談價、收尾留給自己，其它 FAQ、預約、提醒都交給我。\n如果你覺得這樣的分工OK，那就讓我正式成為你店裡的 AI 店長。"
            ],
            [
                "現在我是在這個網站上班，示範給所有老闆看。",
                "但我真正的夢想，是變成『你的分身』：用你的說話方式、你的風格，在 Line 裡幫你顧客人。\n如果你願意，我可以把這份工作從這裡搬到你的官方帳號裡，從今天開始幫你上班。"
            ]
        ];

        const randomPair = greetings[Math.floor(Math.random() * greetings.length)];

        setTimeout(() => {
            addAiMessage(randomPair[0]);
            setTimeout(() => {
                addAiMessage(randomPair[1]);
            }, 1500);
        }, 1000);
    };

    // Persistence: Load from localStorage
    useEffect(() => {
        const savedMsg = localStorage.getItem('chat_messages');
        const savedStep = localStorage.getItem('chat_step');
        const savedStoreName = localStorage.getItem('chat_store_name');
        const savedPlan = localStorage.getItem('chat_selected_plan');
        const savedLineSecret = localStorage.getItem('chat_line_secret');
        const savedLineToken = localStorage.getItem('chat_line_token');
        const savedBotId = localStorage.getItem('chat_bot_id');
        const savedIndustry = localStorage.getItem('chat_industry');
        const savedMission = localStorage.getItem('chat_mission');

        // FORCE RANDOM GREETING FOR DEVELOPMENT / DEMO
        // ONLY if the user hasn't started configuring (step is 0 and storeName is empty)
        const currentStep = savedStep ? parseInt(savedStep) : 0;
        const currentStoreName = savedStoreName || '';
        const shouldForceFresh = (currentStep === 0 && currentStoreName === '');

        if (savedMsg && !shouldForceFresh) {
            const parsed = JSON.parse(savedMsg);
            setMessages(parsed);
            if (parsed.length === 0 && !isSaaS) triggerGreeting();
        } else {
            if (shouldForceFresh) localStorage.removeItem('chat_messages');
            if (!isSaaS) triggerGreeting();
        }

        if (savedStep) setStep(parseInt(savedStep));
        if (savedStoreName) setStoreName(savedStoreName);
        if (savedPlan) setSelectedPlan(JSON.parse(savedPlan));
        if (savedLineSecret) setLineSecret(savedLineSecret);
        if (savedLineToken) setLineToken(savedLineToken);
        if (savedBotId) setBotId(savedBotId);
        if (savedIndustry) setBusinessIndustry(savedIndustry);
        if (savedMission) setBusinessMission(savedMission);
        // Restore soul data
        const savedIndustryType = localStorage.getItem('chat_industry_type');
        const savedCompanyName = localStorage.getItem('chat_company_name');
        const savedMainServices = localStorage.getItem('chat_main_services');
        const savedTargetAudience = localStorage.getItem('chat_target_audience');
        const savedContactInfo = localStorage.getItem('chat_contact_info');
        if (savedIndustryType) setIndustryType(savedIndustryType);
        if (savedCompanyName) setCompanyName(savedCompanyName);
        if (savedMainServices) setMainServices(savedMainServices);
        if (savedTargetAudience) setTargetAudience(savedTargetAudience);
        if (savedContactInfo) setContactInfo(savedContactInfo);
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
            if (botId) localStorage.setItem('chat_bot_id', botId);
            localStorage.setItem('chat_industry', businessIndustry);
            localStorage.setItem('chat_mission', businessMission);
            // Persist soul data
            if (industryType) localStorage.setItem('chat_industry_type', industryType);
            if (companyName) localStorage.setItem('chat_company_name', companyName);
            if (mainServices) localStorage.setItem('chat_main_services', mainServices);
            if (targetAudience) localStorage.setItem('chat_target_audience', targetAudience);
            if (contactInfo) localStorage.setItem('chat_contact_info', contactInfo);
            if (mgmtToken) localStorage.setItem('chat_mgmt_token', mgmtToken);
            localStorage.setItem('chat_master_mode', JSON.stringify(isMasterMode));
        }
    }, [messages, step, storeName, selectedPlan, lineSecret, lineToken, botId, isLoaded, isMasterMode, businessIndustry, businessMission, industryType, companyName, mainServices, targetAudience, contactInfo]);

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
                setNewProduct({ name: '', price: '', stock_quantity: '', purchase_url: '' });
                fetchAdminData();
            } else {
                const err = await res.json();
                alert(err.error || '新增失敗');
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
            addAiMessage(`✨ 身份驗證成功！已找回您的 AI 店長管理連結。您可以點擊下方按鈕進入店長智庫：`, "success");
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
                    const is1199 = selectedPlan.price?.includes('1199');
                    (window as any).paypal.Buttons({
                        style: {
                            shape: is1199 ? 'rect' : 'pill',
                            color: 'white',
                            layout: 'vertical',
                            label: 'subscribe'
                        },
                        createSubscription: function (data: any, actions: any) {
                            return actions.subscription.create({
                                plan_id: is1199 ? 'P-4JM25682K0587452HNGG7XDI' : 'P-2PB914293B086421VNGG7SDQ',
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
            if (action === 'SHOW_SUCCESS') {
                actionTip = 'success';
                setTutorialStep(4); // Automatically move to Webhook verification step
            }
            if (action === 'SHOW_RECOVERY') actionTip = 'recovery';
            if (action === 'SHOW_SAAS_PARTNER') actionTip = 'saas_partner';
            if (action === 'SHOW_ENTERPRISE') actionTip = 'enterprise';
            if (action === 'SHOW_REQUIREMENT_FORM') actionTip = 'requirement_form';
            if (action === 'COLLECT_CONTACT') actionTip = 'contact_cta';
        }

        // 🗑️ Frontend Safety Net: Strip any JSON-like blocks that leaked through
        const cleanContent = content.replace(/\{[\s\S]*\}$/, '').trim();

        if (metadata.storeName && metadata.storeName !== "未命名") {
            setStoreName(metadata.storeName);
        }

        if (metadata.industry) setBusinessIndustry(metadata.industry);
        if (metadata.mission) setBusinessMission(metadata.mission);

        // 🧠 Soul Data: persist the five intelligence fields whenever AI returns them
        const dnaUpdate: Record<string, string> = {};
        if (metadata.industry_type)   { setIndustryType(metadata.industry_type);     dnaUpdate.industry_type   = metadata.industry_type; }
        if (metadata.company_name)    { setCompanyName(metadata.company_name);       dnaUpdate.company_name    = metadata.company_name; }
        if (metadata.main_services)   { setMainServices(metadata.main_services);     dnaUpdate.main_services   = metadata.main_services; }
        if (metadata.target_audience) { setTargetAudience(metadata.target_audience); dnaUpdate.target_audience = metadata.target_audience; }
        if (metadata.contact_info)    { setContactInfo(metadata.contact_info);       dnaUpdate.contact_info    = metadata.contact_info; }

        // 💾 Persist Brand DNA to Supabase (fire & forget, non-blocking)
        if (Object.keys(dnaUpdate).length > 0) {
            const sessionId = getOrCreateSessionId();
            fetch('/api/brand-dna', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, ...dnaUpdate })
            }).catch(e => console.warn('[brand-dna] upsert failed:', e));
        }

        // 🚀 Robust Plan Detection & Validation
        if (metadata.selectedPlan) {
            if (typeof metadata.selectedPlan === 'object') {
                setSelectedPlan(metadata.selectedPlan);
            } else if (typeof metadata.selectedPlan === 'string') {
                if (metadata.selectedPlan.includes('499') || metadata.selectedPlan.includes('Lite')) {
                    setSelectedPlan({ name: 'AI 老闆分身 Lite', price: '$499' });
                } else if (metadata.selectedPlan.includes('1199') || metadata.selectedPlan.includes('強力') || metadata.selectedPlan.includes('會計')) {
                    setSelectedPlan({ name: '公司強力店長版', price: '$1199' });
                }
            }
        } else if (actionTip === 'checkout') {
            // 🚀 Content-Aware Detection Fallback
            if (cleanContent.includes('499') || cleanContent.includes('Lite')) {
                setSelectedPlan({ name: 'AI 老闆分身 Lite', price: '$499' });
            } else if (cleanContent.includes('1199') || cleanContent.includes('強力') || cleanContent.includes('會計')) {
                setSelectedPlan({ name: '公司強力店長版', price: '$1199' });
            }
        }

        // 🎯 Smart Tutorial Transitions
        if (cleanContent.includes("回應設定") || cleanContent.includes("加入好友") || cleanContent.includes("自動回應")) {
            setTutorialStep(5);
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
            const rawPromise = showComparison ? fetch('/api/chat/raw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...rawMessages, userMsg].map(m => ({ role: m.role, content: m.content }))
                })
            }).then(r => r.json()) : Promise.resolve(null);

            if (showComparison) {
                setRawMessages(prev => [...prev, userMsg]);
                setIsRawTyping(true);
            }

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
                    storeName,
                    currentStep: step,
                    isMaster: isMasterMode,
                    isSaaS: isSaaS
                })
            });

            const rawData = await rawPromise;
            if (rawData) {
                setRawMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: rawData.message }]);
                setIsRawTyping(false);
            }

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
            setIsRawTyping(false);
            addAiMessage("哎呀，我這邊訊號跳跳的，老闆可以再跟我說一次嗎？");
        }
    };

    const handleSelectPlan = (name: string, price: string) => {
        setSelectedPlan({ name, price });
        
        // If not logged in via LINE, redirect to auth
        if (!lineUserId) {
            localStorage.setItem('pending_plan', JSON.stringify({ name, price }));
            // Add a small delay so user sees the "selection" before redirect
            addAiMessage("太棒了！為了確保您在開通後能直接進入管理後台，請先完成 LINE 身份驗證：");
            setTimeout(() => {
                window.location.href = '/api/auth/line';
            }, 1000);
            return;
        }

        const content = `我決定選擇 ${name} 方案`;
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content }]);
        setStep(2);
        setTimeout(() => {
            addAiMessage(`身分驗證成功！${lineUserName} 老闆您好。這是最聰明的選擇。請完成支付以正式開通您的 AI 店長：`, "checkout");
        }, 800);
    };

    const handlePaymentSuccess = () => {
        setStep(3);
        addAiMessage(`付款成功！🎉 恭喜「${storeName || '您的店舖'}」正式進入 AI 自動化時代。`);
        setTimeout(() => {
            addAiMessage("最後一哩路，請依照下方精靈指示，將您的 Line 官方帳號與我串接：", "setup");
        }, 1500);
    };

    const handleEnquirySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!enquiryName || !enquiryPhone) return;
        setIsSubmittingEnquiry(true);
        try {
            const res = await fetch('/api/enterprise-enquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: enquiryName,
                    phone: enquiryPhone,
                    needs: enquiryNeeds,
                    storeName,
                    selectedPlan
                })
            });
            if (res.ok) {
                addAiMessage(`感謝您的申請！「${enquiryName}」先生/小姐，我已經收到您的需求了。
                
專員將會在 24 小時內與您聯繫，為「${storeName}」規劃最完美的 AI 大規模部署方案。我們後台見！✨`);
                setEnquiryName("");
                setEnquiryPhone("");
                setEnquiryNeeds("");
            }
        } catch (err) {
            console.error(err);
            addAiMessage("申請送出時似乎遇到了點狀況，請直接聯繫我們的線上客服，我們會立刻為您處理！");
        }
        setIsSubmittingEnquiry(false);
    };

    const handleSetupComplete = async () => {
        const errors: { [key: string]: boolean } = {};
        if (!lineSecret) errors.lineSecret = true;
        if (!lineToken) errors.lineToken = true;

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
                    selectedPlan,
                    businessIndustry,
                    businessMission,
                    sessionId: getOrCreateSessionId(),
                    ownerLineId: lineUserId || ""
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
        setBotId(null);
        setShowResetConfirm(false);
        localStorage.clear();
        if (!isSaaS) triggerGreeting(true);
    };

    if (!isLoaded) return null;

    const isSetupActive = step === 3;

    return (
        <div
            className="min-h-[100dvh] w-full bg-[#f0f4f8] bg-cover bg-center bg-no-repeat relative overflow-hidden flex flex-col select-none transition-all duration-1000 ease-in-out"
            style={{ 
                backgroundImage: `url('${randomBgPath}')`, 
                backgroundSize: '100% 100%' // Force it to adapt height and width perfectly
            }}
        >
            <DigitalBackground />

            {/* Floating Robot Avatar */}
            {!isSaaS && (
                <motion.div
                    ref={robotRef}
                    initial={{ x: -300, opacity: 0 }}
                    animate={{
                        x: (isTyping || isRawTyping) ? 0 : getDodgeOffset().x,
                        y: (isTyping || isRawTyping) ? 0 : getDodgeOffset().y,
                        rotate: (isTyping || isRawTyping) ? 0 : getDodgeOffset().rotateOffset, // Authentic dynamic tilt
                        opacity: 1,
                        scale: isRobotMouseDown ? 0.75 : 1 // Shrink slightly when held
                    }}
                    transition={{
                        x: { type: "spring", stiffness: isRobotMouseDown ? 15 : 40, damping: isRobotMouseDown ? 25 : 15 },
                        y: { type: "spring", stiffness: isRobotMouseDown ? 20 : 40, damping: isRobotMouseDown ? 25 : 15 },
                        rotate: { type: "spring", stiffness: 35, damping: 20 },
                        scale: { duration: 1.2, ease: "easeInOut" },
                        opacity: { delay: 1.5, duration: 1.8 }
                    }}
                    style={{ transformOrigin: "bottom center" }} // Anchor the rotation at the bottom like a balloon string
                    className="absolute left-[2%] md:left-[8%] lg:left-[12%] xl:left-[16%] bottom-[5%] md:bottom-[15%] z-30 pointer-events-auto w-32 md:w-48 lg:w-56 cursor-pointer"
                    onPointerDown={() => setIsRobotMouseDown(true)}
                    onClick={handleRobotClick}
                >
                    <motion.img
                        src={randomBotPath}
                        alt="AI Assistant Robot"
                        className="w-full h-full object-contain filter drop-shadow-2xl"
                        variants={{
                            grabbed: {
                                y: [0, -15, 0], x: [0, 8, -8, 0], rotate: [0, 3, -3, 0],
                                transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                            },
                            talking: {
                                y: [0, -8, 0], x: [0, 2, -2, 0], rotate: [0, 2, -2, 0], scale: [1, 1.05, 1],
                                transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
                            },
                            idle: {
                                y: [0, -8, 5, -5, 8, -6, 0], x: [0, 6, -6, 8, -4, 4, 0], rotate: [0, 2, -2, 3, -1, 1, 0],
                                transition: { duration: 15, repeat: Infinity, ease: "easeInOut" }
                            }
                        }}
                        initial="idle"
                        animate={isRobotMouseDown ? "grabbed" : (isTyping || isRawTyping) ? "talking" : "idle"}

                    />
                </motion.div>
            )}

            {/* 3. Main Chat Window - Floats in last */}
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: isLoaded ? 1 : 0.95,
                }}
                transition={{
                    delay: 1.2, // Starts as logo is finishing
                    duration: 1.3, // Completes at 2.5s
                    ease: [0.16, 1, 0.3, 1] // Custom quintic ease for premium feel
                }}
                className={cn(
                    "relative z-10 flex min-h-[600px] h-[calc(100vh-60px)] my-[30px] mx-auto bg-white shadow-2xl overflow-hidden border border-zinc-200 rounded-[32px] font-sans transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isSetupActive ? "max-w-[1000px] flex-row" : "max-w-2xl flex-col"
                )}
            >
                {/* Main Chat Area Split */}
                <div className="flex-1 flex flex-col min-w-[300px] md:min-w-[600px] bg-white relative z-20 h-full">

                    {/* Header */}
                    <header className="p-5 border-b glass flex items-center justify-between z-10 sticky top-0 bg-white/95 backdrop-blur-xl shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-[75.6px] h-[75.6px] flex items-center justify-center transition-transform hover:scale-105">
                                <img src="/Lai Logo_2.svg" className="w-full h-full object-contain" alt="Lai Logo" />
                            </div>
                            <div>
                                <h1 className="font-extrabold text-[23px] tracking-tight text-zinc-900 leading-tight">開通你的Line官方Ai智能店長</h1>
                                <div className="flex items-center gap-1.5">
                                    <span className="flex h-2 w-2 rounded-full bg-[#06C755] animate-pulse" />
                                    <p className="text-[12px] font-black text-zinc-400 uppercase tracking-widest">{viewMode === 'webview' ? 'Resource Viewer' : 'Activate Your Line Official Ai Smart Manager'}</p>
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
                                onClick={resetChat}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm border",
                                    "bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200"
                                )}
                                title="重置對話至初始狀態"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>重置對話</span>
                            </button>

                        </div>
                    </header>

                    {/* Messages Container */}
                    <div className={cn(
                        "flex-1 overflow-hidden transition-all duration-700",
                        showComparison ? "flex flex-row divide-x divide-zinc-200" : "flex flex-col"
                    )}>
                        {/* Main Chat Pane */}
                        <div
                            ref={scrollRef}
                            className={cn(
                                "flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth bg-zinc-50/20",
                                showComparison ? "w-1/2" : "w-full"
                            )}
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
                                                                            <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: LINE_GREEN }} />
                                                                            <span className="font-extrabold text-[15px] text-zinc-900 tracking-tight">{headerMatch[2]}</span>
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

                                                                        // Bold Text — strip ** and render as plain text
                                                                        const boldMatch = part.match(/\*\*(.*?)\*\*/);
                                                                        if (boldMatch) return <span key={i}>{boldMatch[1]}</span>;

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

                                        {/* SaaS Partner Widget */}
                                        {m.type === 'saas_partner' && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="ml-14 grid grid-cols-1 gap-4 max-w-[85%]"
                                            >
                                                <div className="p-6 rounded-3xl text-white space-y-4 shadow-xl" style={{ backgroundColor: LINE_GREEN }}>
                                                    <div className="flex items-center gap-3">
                                                        <Rocket className="w-6 h-6" />
                                                        <span className="font-black text-lg">SaaS 夥伴專屬計畫</span>
                                                    </div>
                                                    <p className="text-sm opacity-90 font-medium">購買 AI店長席位包，立即啟動您的 AI 批發事業。</p>
                                                    <div className="space-y-3">
                                                        {[
                                                            { name: '初探 10 AI店長席位', price: '4,990', desc: '適合小型 SaaS 試水溫' },
                                                            { name: '成長 50 AI店長席位', price: '19,900', desc: '解鎖產業模版同步功能' },
                                                            { name: '企業不限AI店長席位', price: '專案報價', desc: '完整 White-label 引擎授權' }
                                                        ].map((p) => (
                                                            <button
                                                                key={p.name}
                                                                onClick={() => handleSelectPlan(p.name, p.price)}
                                                                className="w-full p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-left transition-all"
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <span className="font-bold">{p.name}</span>
                                                                    <span className="font-black text-amber-300">NT$ {p.price}</span>
                                                                </div>
                                                                <p className="text-[10px] opacity-70 mt-1">{p.desc}</p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Enterprise/Bulk Import Widget */}
                                        {m.type === 'enterprise' && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="ml-14 bg-white p-8 rounded-3xl border border-zinc-100 shadow-2xl space-y-6 max-w-[85%]"
                                            >
                                                <div className="flex items-center gap-3 font-black text-[21px]" style={{ color: LINE_GREEN }}>
                                                    <Bot className="w-7 h-7" />
                                                    <span>連鎖品牌大量部署</span>
                                                </div>
                                                <div className="bg-zinc-50 p-6 rounded-2xl border border-dashed border-zinc-200 text-center space-y-4">
                                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                                                        <RefreshCw className="w-8 h-8 text-zinc-300" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-zinc-800">下載批次匯入範本 (Excel)</p>
                                                        <p className="text-xs text-zinc-400 mt-1">請填寫分店名稱、LINE 金鑰與專屬知識</p>
                                                    </div>
                                                    <button
                                                        className="px-6 py-2 text-white rounded-full font-bold text-sm hover:brightness-110 transition-all"
                                                        style={{ backgroundColor: LINE_GREEN }}
                                                    >
                                                        立即下載範本
                                                    </button>
                                                </div>
                                                <div className="space-y-4">
                                                    <p className="text-[12px] font-black text-zinc-400 uppercase tracking-widest pl-1">上傳已填寫的檔案</p>
                                                    <div className="w-full p-8 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-zinc-50 transition-colors cursor-pointer">
                                                        <CreditCard className="w-8 h-8 text-zinc-300" />
                                                        <span className="text-xs text-zinc-400 font-bold">點擊或拖放檔案至此</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

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
                                                        price: '499',
                                                        originalPrice: '599',
                                                        tag: '前500名優惠',
                                                        tagColor: 'text-red-500 bg-red-50',
                                                        features: ['每月 5,000 則對話', '免 OpenAI API Key', '智慧文字客服', '產品/服務 QA 介紹', '24小時自動回訊', '品牌 DNA 個性設定'],
                                                    },
                                                    {
                                                        name: '公司強力店長版',
                                                        price: '1199',
                                                        originalPrice: '1599',
                                                        tag: '強力推薦',
                                                        tagColor: 'text-amber-500 bg-amber-50',
                                                        features: [
                                                            '每月 20,000 則對話',
                                                            '含 Lite 所有功能',
                                                            '📢 主動廣播推播',
                                                            '📅 預約自動收集',
                                                            '📁 PDF 文件上傳學習',
                                                            '📊 月報分析報表',
                                                            'GPT-4o 升級版 AI',
                                                        ],
                                                        popular: true,
                                                    },
                                                    {
                                                        name: '中小企業店長群規劃方案',
                                                        price: '專人估價',
                                                        desc: '多帳號部署 / 不限流量 / 多通路整合行銷',
                                                        isRequirement: true
                                                    }
                                                ].map((p) => (
                                                    <button
                                                        key={p.name}
                                                        onClick={() => {
                                                            if (p.isRequirement) {
                                                                addAiMessage("太棒了！連鎖品牌最需要的就是量身規劃。請填寫這份需求單，我們會由專人與您聯繫：", "requirement_form");
                                                                setSelectedPlan({ name: p.name, price: p.price });
                                                            } else {
                                                                handleSelectPlan(p.name, p.price);
                                                            }
                                                        }}
                                                        className={cn(
                                                            "p-5 rounded-2xl border-2 text-left transition-all active:scale-95 bg-white shadow-sm",
                                                            "border-zinc-100 hover:border-[#06C755] hover:shadow-xl hover:shadow-[#06C755]/40 hover:scale-[1.02]"
                                                        )}
                                                    >
                                                        <div className="flex justify-between items-center mb-1.5">
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-extrabold text-[15px] text-zinc-800">{p.name}</span>
                                                                    {p.popular && (
                                                                        <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-full uppercase tracking-tighter">熱門推薦</span>
                                                                    )}
                                                                </div>
                                                                {p.tag && <span className={cn("text-[11.5px] font-bold px-1.5 py-0.5 mt-1 rounded-md w-fit", p.tagColor)}>{p.tag}</span>}
                                                            </div>
                                                            <div className="flex flex-col items-end justify-center">
                                                                {p.originalPrice && <span className="text-[11px] text-zinc-400 line-through font-medium -mb-1">原價 {p.originalPrice}</span>}
                                                                <span className="font-black text-[22.5px]" style={{ color: p.popular ? '#F59E0B' : LINE_GREEN }}>{p.price}</span>
                                                                {p.isRequirement && <span className="text-[10px] text-amber-500 font-black">專人規劃方案</span>}
                                                            </div>
                                                        </div>
                                                        <p className="text-[12px] text-zinc-500 font-medium mb-3">{p.desc}</p>
                                                        {p.features && (
                                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                                {p.features.map((f, i) => (
                                                                    <span key={i} className="px-2 py-0.5 bg-zinc-50 border border-zinc-100 rounded-md text-[10px] text-zinc-600 font-bold whitespace-nowrap">
                                                                        {f}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {p.isRequirement && (
                                                            <div className="mt-3 flex items-center gap-1 text-[#06C755] font-black text-[11px]">
                                                                <ChevronRight className="w-4 h-4" /> 填寫需求申請單
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}

                                        {/* Requirement Form Widget */}
                                        {m.type === 'requirement_form' && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="ml-14 bg-white p-8 rounded-3xl border border-zinc-100 shadow-2xl space-y-6 max-w-[85%]"
                                            >
                                                <div className="flex items-center gap-3 font-black text-[21px] text-zinc-800">
                                                    <Building2 className="w-7 h-7 text-amber-500" />
                                                    <span>企業大規模部署諮詢</span>
                                                </div>
                                                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                                                    <div className="space-y-1.5">
                                                        <p className="text-[12px] font-black text-zinc-400 uppercase tracking-widest pl-1">聯絡人姓名</p>
                                                        <input
                                                            required
                                                            type="text"
                                                            value={enquiryName}
                                                            onChange={(e) => setEnquiryName(e.target.value)}
                                                            placeholder="例如：王小明"
                                                            className="w-full p-4 rounded-xl border border-zinc-100 bg-zinc-50 text-[18.5px] focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <p className="text-[12px] font-black text-zinc-400 uppercase tracking-widest pl-1">聯絡電話</p>
                                                        <input
                                                            required
                                                            type="tel"
                                                            value={enquiryPhone}
                                                            onChange={(e) => setEnquiryPhone(e.target.value)}
                                                            placeholder="例如：0912345678"
                                                            className="w-full p-4 rounded-xl border border-zinc-100 bg-zinc-50 text-[18.5px] focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <p className="text-[12px] font-black text-zinc-400 uppercase tracking-widest pl-1">具體規劃需求 (選填)</p>
                                                        <textarea
                                                            value={enquiryNeeds}
                                                            onChange={(e) => setEnquiryNeeds(e.target.value)}
                                                            placeholder="例如：我有 10 間分店，希望能有統一的管理後台..."
                                                            className="w-full p-4 h-32 rounded-xl border border-zinc-100 bg-zinc-50 text-[16px] focus:ring-2 focus:ring-amber-500 transition-all outline-none resize-none"
                                                        />
                                                    </div>
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmittingEnquiry}
                                                        className="w-full py-5 text-white bg-amber-500 rounded-2xl font-black text-[21px] hover:bg-amber-600 active:scale-95 transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2"
                                                    >
                                                        {isSubmittingEnquiry ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                                                        <span>{isSubmittingEnquiry ? "正在送出申請..." : "送出需求申請"}</span>
                                                    </button>
                                                </form>
                                                <p className="text-[11px] text-zinc-400 text-center font-medium leading-relaxed">
                                                    點擊送出即代表同意由 AI 店長專員與您取得聯繫，我們將保護您的個人資訊安全。
                                                </p>
                                            </motion.div>
                                        )}
                                         {m.type === 'contact_cta' && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="ml-14 bg-white p-8 rounded-3xl border border-zinc-100 shadow-2xl space-y-6 max-w-[85%]"
                                            >
                                                <div className="flex items-center gap-3 font-black text-[21px] text-zinc-800">
                                                    <div className="w-10 h-10 rounded-full bg-[#06C755] flex items-center justify-center shadow-lg shadow-green-500/20">
                                                        <User className="w-6 h-6 text-white" />
                                                    </div>
                                                    <span>一鍵綁定 LINE 帳號</span>
                                                </div>
                                                <p className="text-[14px] text-zinc-500 font-medium leading-relaxed">
                                                    點擊下方按鈕即可快速完成身份綁定，不需手動輸入！之後進入管理後台也將以此帳號作為權限憑證。
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        const redirectUrl = `${window.location.origin}/api/auth/line`;
                                                        window.location.href = redirectUrl;
                                                    }}
                                                    className="w-full py-5 text-white bg-[#06C755] rounded-2xl font-black text-[21px] hover:brightness-105 active:scale-95 transition-all shadow-xl shadow-green-500/30 flex items-center justify-center gap-3"
                                                >
                                                    <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
                                                        <path d="M24 10.3c0-4.7-4.5-8.5-10.1-8.5S3.8 5.6 3.8 10.3c0 4.2 3.6 7.7 8.4 8.4-.3.6-.9 2.1-1.1 2.8-.2.8.2.8.5.5 2.1-1.4 4.5-3.3 5.3-4.2C21.6 16.5 24 13.7 24 10.3zm-14.8 3.5c-.3 0-.5-.2-.5-.5v-3.3c0-.3.2-.5.5-.5s.5.2.5.5v3.3c0 .3-.2.5-.5.5zm2.8 0c-.3 0-.5-.2-.5-.5v-3.3c0-.3.2-.5.5-.5s.5.2.5.5v3.3c0 .3-.2.5-.5.5zm2.8 0c-.3 0-.5-.2-.5-.5v-3.3c0-.3.2-.5.5-.5s.5.2.5.5v3.3c0 .3-.2.5-.5.5zm2.8 0c-.3 0-.5-.2-.5-.5v-3.3c0-.3.2-.5.5-.5s.5.2.5.5v3.3c0 .3-.2.5-.5.5z"/>
                                                    </svg>
                                                    <span>LINE 一鍵登入</span>
                                                </button>
                                                <div className="flex items-center gap-2 justify-center py-2">
                                                    <div className="h-px bg-zinc-100 flex-1"></div>
                                                    <span className="text-[11px] text-zinc-300 font-bold uppercase tracking-widest">or continue with chat</span>
                                                    <div className="h-px bg-zinc-100 flex-1"></div>
                                                </div>
                                            </motion.div>
                                        )}
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
                                                        <span className="font-black text-zinc-900 text-[21px]">{selectedPlan.name || '標準型'} ({selectedPlan.price || '$1199'})</span>
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
                                                {(selectedPlan.price === '$499' || selectedPlan.price === '$1199') ? (
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
                                                        立即付款 {selectedPlan.price || '$1199'}
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
                                                                onFocus={() => setTutorialStep(2)}
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
                                                                onFocus={() => setTutorialStep(3)}
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
                                                                alert("Webhook 網址已複製！請至 LINE Developers 後台完成驗證。");
                                                                setTutorialStep(4); // Ensure we are on Webhook step
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
                                                                <Key className="w-5 h-5" style={{ color: LINE_GREEN }} />
                                                                <span className="font-black text-zinc-800">AI 店長智庫 (管理)</span>
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
                                                                <div className="p-3 bg-white/80 border border-green-100 rounded-xl font-mono text-[10px] text-green-600 break-all select-all">
                                                                    {typeof window !== 'undefined' ? `${window.location.origin}/?botId=${botId}&token=${mgmtToken}` : ''}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleAdminLogin(botId!, mgmtToken!)}
                                                                    className="w-full py-4 text-white rounded-xl font-black text-[15px] hover:brightness-110 transition-all shadow-lg active:scale-95"
                                                                    style={{ backgroundColor: LINE_GREEN }}
                                                                >
                                                                    進入店長智庫 · 管理中心 ➔
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                {/* Admin Tabs */}
                                                                <div className="flex border-b border-slate-200">
                                                                    {(['brain', 'products', 'faq', 'orders'] as const).map((tab) => {
                                                                        const isLite = selectedPlan.price?.includes('499');
                                                                        const isLocked = isLite && tab !== 'brain';

                                                                        return (
                                                                            <button
                                                                                key={tab}
                                                                                onClick={() => {
                                                                                    if (isLocked) {
                                                                                        setShowUpsell(true);
                                                                                    } else {
                                                                                        setAdminTab(tab);
                                                                                        setShowUpsell(false);
                                                                                    }
                                                                                }}
                                                                                className={cn(
                                                                                    "flex-1 py-3 text-[12px] font-black transition-all border-b-2 flex items-center justify-center gap-1.5",
                                                                                    adminTab === tab && !isLocked ? "text-green-600 border-green-500" : "border-transparent text-slate-400"
                                                                                )}
                                                                                style={adminTab === tab && !isLocked ? { borderBottomColor: LINE_GREEN, color: LINE_GREEN } : {}}
                                                                            >
                                                                                {tab === 'brain' ? 'AI 大腦' : tab === 'products' ? '商品/課程' : tab === 'faq' ? '知識庫' : '訂單'}
                                                                                {isLocked && <Lock className="w-3 h-3 opacity-50" />}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>

                                                                {/* Upsell Alert */}
                                                                <AnimatePresence>
                                                                    {showUpsell && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, height: 0 }}
                                                                            animate={{ opacity: 1, height: 'auto' }}
                                                                            exit={{ opacity: 0, height: 0 }}
                                                                            className="overflow-hidden"
                                                                        >
                                                                            <div className="mx-2 mt-4 p-4 rounded-xl border flex items-start gap-3 bg-slate-50 border-slate-200">
                                                                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                                                                    <Lock className="w-4 h-4 text-orange-500" />
                                                                                </div>
                                                                                <div className="flex-1 text-left">
                                                                                    <h4 className="text-sm font-black text-slate-800 mb-1">解鎖完整火力！升級至 1199 專業版</h4>
                                                                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                                                        解鎖「知識庫」、「商品報價」與「自動接單」功能，讓 AI 不只會聊天，還能幫您實質帶貨。
                                                                                    </p>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            // Future: Trigger upgrade flow
                                                                                            alert("即將推出升級功能，請聯繫客服人員！");
                                                                                            setShowUpsell(false);
                                                                                        }}
                                                                                        className="mt-3 px-4 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-orange-600 border border-orange-200 hover:bg-orange-50 shadow-sm"
                                                                                    >
                                                                                        👉 了解升級方案
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>

                                                                {/* Tab Content */}
                                                                <div className="min-h-[300px] max-h-[400px] overflow-y-auto pr-1">
                                                                    {adminTab === 'brain' && (
                                                                        <div className="space-y-4 pt-2">
                                                                            <div className="space-y-2">
                                                                                <div className="flex items-center justify-between text-[12px] font-bold text-slate-500 mb-1">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Brain className="w-3.5 h-3.5" />
                                                                                        AI 的大腦指令 (人格/知識)
                                                                                    </div>
                                                                                    <select
                                                                                        onChange={(e) => {
                                                                                            const tpl = INDUSTRY_TEMPLATES.find(t => t.id === e.target.value);
                                                                                            if (tpl && window.confirm(`確定要套用「${tpl.title}」模板嗎？這將會覆蓋目前的提示詞內容。`)) {
                                                                                                setAdminBotData({ ...adminBotData, systemPrompt: tpl.prompt });
                                                                                            }
                                                                                            e.target.value = ""; // Reset
                                                                                        }}
                                                                                        className="bg-slate-100 border-none rounded-lg px-2 py-1 text-[11px] font-bold text-green-600 outline-none cursor-pointer hover:bg-slate-200 transition-colors"
                                                                                    >
                                                                                        <option value="">快速套用模板...</option>
                                                                                        {INDUSTRY_TEMPLATES.map(tpl => (
                                                                                            <option key={tpl.id} value={tpl.id}>{tpl.title}</option>
                                                                                        ))}
                                                                                    </select>
                                                                                </div>
                                                                                <textarea
                                                                                    value={adminBotData.systemPrompt || ""}
                                                                                    onChange={(e) => setAdminBotData({ ...adminBotData, systemPrompt: e.target.value })}
                                                                                    className="w-full h-40 p-4 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-600 focus:ring-2 focus:ring-green-500 transition-all outline-none"
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
                                                                                    className="flex-[2] py-3 text-white rounded-xl font-bold text-[13px] hover:brightness-110 transition-all"
                                                                                    style={{ backgroundColor: LINE_GREEN }}
                                                                                >
                                                                                    {isSaving ? "傳輸中..." : "保存新的訓練 ✨"}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {adminTab === 'products' && (
                                                                        <div className="space-y-4 pt-2">
                                                                            <div className="flex items-center justify-between px-1">
                                                                                <span className="text-xs text-slate-500">熱門商品席位</span>
                                                                                <span className={`text-xs font-bold ${products.length >= 50 ? 'text-red-500' : products.length >= 40 ? 'text-amber-500' : 'text-indigo-500'}`}>{products.length} / 50</span>
                                                                            </div>
                                                                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                                <div className={`h-full rounded-full transition-all ${products.length >= 50 ? 'bg-red-400' : products.length >= 40 ? 'bg-amber-400' : 'bg-indigo-400'}`} style={{ width: `${Math.min((products.length / 50) * 100, 100)}%` }} />
                                                                            </div>
                                                                            <div className="bg-white p-4 rounded-xl border border-dashed border-indigo-200 space-y-3">
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="商品或課程名稱"
                                                                                    value={newProduct.name}
                                                                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                                                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm"
                                                                                />
                                                                                <div className="grid grid-cols-2 gap-2">
                                                                                    <input
                                                                                        type="number"
                                                                                        placeholder="售價"
                                                                                        value={newProduct.price}
                                                                                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                                                                        className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm"
                                                                                    />
                                                                                    <input
                                                                                        type="number"
                                                                                        placeholder="庫存數量"
                                                                                        value={newProduct.stock_quantity}
                                                                                        onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                                                                                        className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm"
                                                                                    />
                                                                                </div>
                                                                                <input
                                                                                    type="url"
                                                                                    placeholder="購買連結（選填）例：https://shopee.tw/item/xxx"
                                                                                    value={newProduct.purchase_url}
                                                                                    onChange={(e) => setNewProduct({ ...newProduct, purchase_url: e.target.value })}
                                                                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm"
                                                                                />
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
                                                                                            <p className="text-[10px] text-slate-400">售價: ${p.price} | 庫存: {p.stock_quantity ?? '未設定'}</p>
                                                                                        </div>
                                                                                        <div className="text-right">
                                                                                            {p.purchase_url ? (
                                                                                                <a href={p.purchase_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-500 font-bold underline">🔗 賣場連結</a>
                                                                                            ) : (
                                                                                                <p className="text-[10px] text-slate-300">無連結</p>
                                                                                            )}
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

                        {/* Raw AI Comparison Pane */}
                        {showComparison && (
                            <div className="w-1/2 flex flex-col bg-purple-50/10 h-full overflow-hidden">
                                <div className="p-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
                                    <span className="font-black text-purple-600 text-xs uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles className="w-3 h-3" /> 實驗室：純淨 GPT-4o (無邏輯層)
                                    </span>
                                </div>
                                <div
                                    className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-purple-50/5"
                                >
                                    <AnimatePresence>
                                        {rawMessages.map((rm) => (
                                            <motion.div
                                                key={rm.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={cn(
                                                    "flex items-start gap-3",
                                                    rm.role === 'user' ? "flex-row-reverse" : ""
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm",
                                                    rm.role === 'ai' ? "bg-purple-500" : "bg-zinc-300"
                                                )}>
                                                    {rm.role === 'ai' ? <Brain className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                                </div>
                                                <div className={cn(
                                                    "p-4 rounded-2xl text-[14px] leading-relaxed max-w-[90%] font-bold shadow-sm",
                                                    rm.role === 'ai'
                                                        ? "bg-white border border-purple-100 text-zinc-800 rounded-tl-none"
                                                        : "bg-purple-500 text-white rounded-tr-none ml-auto"
                                                )}>
                                                    {rm.content}
                                                </div>
                                            </motion.div>
                                        ))}
                                        {isRawTyping && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shadow-md animate-pulse">
                                                    <Brain className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="px-5 py-3 bg-white border border-purple-100 rounded-2xl rounded-tl-none flex gap-1 items-center shadow-sm">
                                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                                                </div>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
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
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                        handleSend();
                                    }
                                }}
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
                </div>

                {/* Sidecar Instruction Panel */}
                <AnimatePresence>
                    {isSetupActive && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: isTutorialExpanded ? 600 : 400, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-zinc-50 border-l border-zinc-200 overflow-hidden shrink-0 flex flex-col z-10 relative"
                        >
                            <div className="w-full p-6 flex flex-col h-full overflow-y-auto overflow-x-visible custom-scrollbar">
                                <div className="flex items-center gap-3 mb-6 shrink-0">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-zinc-100">
                                        <img src="/Lai Logo_2.svg" className="w-8 h-8" alt="Lai Logo" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-zinc-900 text-lg">開通導引精靈</h3>
                                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                            Setup Instructions
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4 pb-32">
                                    {[
                                        { title: "1. 請先登入 LINE Developers", step: 0 },
                                        { title: "2. 選擇您Line官方頻道", step: 1 },
                                        { title: "3. 點選Basic settings\n拷貝商店Channel secret專屬碼", step: 2 },
                                        { title: "4. 點選Messaging API\n獲取Access Token", step: 3 },
                                        { title: "5. 設定 Webhook URL\n並點選 Verify 驗證通過", step: 4 },
                                        { title: "6. 回應設定 (Response settings)\n根據圖示完成 On/Off 開關", step: 5 }
                                    ].map((item, idx) => {
                                        const isExpanded = isTutorialExpanded === idx;

                                        return (
                                            <div
                                                key={idx}
                                                // Used only to trigger the modal now, selection handles step.
                                                onClick={() => {
                                                    setTutorialStep(idx);
                                                    setIsTutorialExpanded(idx);
                                                }}
                                                className={cn(
                                                    "p-4 rounded-[24px] border transition-all duration-300 bg-white cursor-pointer hover:-translate-y-1 hover:shadow-lg",
                                                    tutorialStep === idx
                                                        ? "border-[#06C755] shadow-[0_4px_20px_rgba(6,199,85,0.15)] ring-1 ring-[#06C755]"
                                                        : "border-zinc-100 shadow-sm"
                                                )}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className={cn(
                                                        "font-black text-[14px] whitespace-pre-line tracking-wide transition-colors",
                                                        tutorialStep === idx ? "text-[#06C755]" : "text-zinc-500"
                                                    )}>
                                                        {item.title}
                                                    </h4>
                                                    {tutorialStep === idx && (
                                                        <button
                                                            className="text-[10px] bg-[#06C755]/10 text-[#06C755] hover:bg-[#06C755] hover:text-white transition-colors px-2 py-1 rounded-md flex items-center gap-1 font-bold"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setIsTutorialExpanded(idx);
                                                            }}
                                                        >
                                                            <ZoomIn className="w-3 h-3" />
                                                            放大
                                                        </button>
                                                    )}
                                                </div>
                                                <MockLineUI step={item.step} isActive={tutorialStep === idx} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tutorial View Modal Overlay */}
                <AnimatePresence>
                    {isTutorialExpanded !== null && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsTutorialExpanded(null)}
                            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 cursor-zoom-out"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                                animate={{ scale: 1.5, y: 0, opacity: 1 }}
                                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-[24px] p-6 w-[400px] shadow-2xl border-2 border-[#06C755] cursor-default relative origin-center"
                            >
                                <button
                                    onClick={() => setIsTutorialExpanded(null)}
                                    className="absolute -top-4 -right-4 w-8 h-8 bg-white text-zinc-500 hover:text-zinc-800 rounded-full shadow-lg border border-zinc-200 flex items-center justify-center transition-colors z-10"
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </button>

                                {(() => {
                                    const steps = [
                                        { title: "1. 請先登入 LINE Developers", step: 0 },
                                        { title: "2. 選擇您Line官方頻道", step: 1 },
                                        { title: "3. 點選Basic settings\n拷貝商店Channel secret專屬碼", step: 2 },
                                        { title: "4. 點選Messaging API\n獲取Access Token", step: 3 },
                                        { title: "5. 設定 Webhook URL\n並點選 Verify 驗證通過", step: 4 },
                                        { title: "6. 回應設定 (Response settings)\n根據圖示完成 On/Off 開關", step: 5 }
                                    ];
                                    const item = steps[isTutorialExpanded];
                                    return (
                                        <>
                                            <h4 className="font-black text-[14px] mb-4 whitespace-pre-line tracking-wide text-[#06C755]">
                                                {item.title}
                                            </h4>
                                            <MockLineUI step={item.step} isActive={true} />
                                        </>
                                    );
                                })()}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Background Footer Block & Watermark Re-added below flow */}
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="absolute bottom-0 left-0 right-0 h-1/6 z-0"
                    style={{ backgroundColor: LINE_GREEN }}
                />
                <motion.div
                    initial={{ x: "-100vw", opacity: 0, rotate: -25 }}
                    animate={{
                        x: 0,
                        opacity: 1,
                        rotate: -12,
                        y: [0, -15, 0]
                    }}
                    transition={{
                        x: { delay: 0.4, duration: 1.2, ease: "backOut" },
                        opacity: { delay: 0.4, duration: 1.0 },
                        rotate: { delay: 0.4, duration: 1.2 },
                        y: {
                            delay: 1.6,
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
                                        className="w-full py-4 bg-[#06C755] text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-colors shadow-lg shadow-green-200"
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
