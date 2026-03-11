"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BrainCircuit,
    Search,
    Bell,
    Sparkles,
    FileText,
    MessageSquare,
    ChevronRight,
    Save,
    Layout,
    PlusCircle,
    Radio,
    CalendarClock,
    FileUp,
    BarChart3,
    Send,
    Trash2,
    CheckCircle2,
    XCircle,
    TrendingUp,
    Users,
    MessageCircle,
    Clock,
} from 'lucide-react';
import Sidebar from '@/components/PartnerDashboard/Sidebar';
import SaaSChatInterface from '@/components/SaaSChatInterface';
import { supabase } from '@/lib/supabase';

type Tab = 'templates' | 'prompt' | 'faq' | 'broadcast' | 'reservations' | 'pdf' | 'report';

const PRO_BADGE = (
    <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest">1199</span>
);

export default function KnowledgeHub() {
    const [activeTab, setActiveTab] = useState<Tab>('templates');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [basePrompt, setBasePrompt] = useState('');
    const [faqs, setFaqs] = useState<any[]>([]);
    const [botId, setBotId] = useState<string | null>(null);
    const [mgmtToken, setMgmtToken] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState('');
    const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
    const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

    // Broadcast
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [broadcastStatus, setBroadcastStatus] = useState<null | { sent: number; failed: number; message: string }>(null);
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    // Reservations
    const [reservations, setReservations] = useState<any[]>([]);

    // PDF
    const [pdfText, setPdfText] = useState('');
    const [pdfFileName, setPdfFileName] = useState('');
    const [pdfSaving, setPdfSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Report
    const [report, setReport] = useState<any>(null);
    const [reportLoading, setReportLoading] = useState(false);

    const is1199 = selectedPlan.includes('1199') || selectedPlan.includes('強力');

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const { data: bots } = await supabase.from('bots').select('*').limit(1);
                if (bots && bots.length > 0) {
                    const bot = bots[0];
                    setBotId(bot.id);
                    setMgmtToken(bot.mgmt_token);
                    setSelectedPlan(bot.selected_plan || '');
                    setBasePrompt(bot.system_prompt || '');

                    const { data: faqData } = await supabase
                        .from('faq').select('*').eq('bot_id', bot.id).order('created_at', { ascending: false });
                    if (faqData) setFaqs(faqData);

                    // Load reservations (1199 only handled in UI)
                    const { data: resData } = await supabase
                        .from('reservations').select('*').eq('bot_id', bot.id).order('created_at', { ascending: false }).limit(50);
                    if (resData) setReservations(resData);
                }
            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // ─── Handlers ────────────────────────────────────────────────────────────
    const handleSavePrompt = async () => {
        if (!botId) return;
        setSaving(true);
        await supabase.from('bots').update({ system_prompt: basePrompt }).eq('id', botId);
        setSaving(false);
        alert('核心提示詞已更新！');
    };

    const handleSaveFaq = async () => {
        if (!botId || !newFaq.question || !newFaq.answer) return;
        setSaving(true);
        if (editingFaqId) {
            const { data } = await supabase.from('faq').update({ question: newFaq.question, answer: newFaq.answer }).eq('id', editingFaqId).select();
            if (data) setFaqs(faqs.map(f => f.id === editingFaqId ? data[0] : f));
        } else {
            const { data } = await supabase.from('faq').insert([{ ...newFaq, bot_id: botId }]).select();
            if (data) setFaqs([data[0], ...faqs]);
        }
        setIsFaqModalOpen(false);
        setNewFaq({ question: '', answer: '' });
        setEditingFaqId(null);
        setSaving(false);
    };

    const handleDeleteFaq = async (id: string) => {
        if (!confirm('確定要刪除這筆 FAQ 嗎？')) return;
        await supabase.from('faq').delete().eq('id', id);
        setFaqs(faqs.filter(f => f.id !== id));
    };

    const handleBroadcast = async () => {
        if (!botId || !mgmtToken || !broadcastMsg.trim()) return;
        setIsBroadcasting(true);
        setBroadcastStatus(null);
        try {
            const res = await fetch(`/api/bot/${botId}/broadcast?token=${mgmtToken}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: broadcastMsg }),
            });
            const data = await res.json();
            setBroadcastStatus(data);
        } catch (e) {
            setBroadcastStatus({ sent: 0, failed: 0, message: '廣播失敗，請稍後再試' });
        } finally {
            setIsBroadcasting(false);
        }
    };

    const handleUpdateReservation = async (id: string, status: 'confirmed' | 'cancelled') => {
        await supabase.from('reservations').update({ status }).eq('id', id);
        setReservations(reservations.map(r => r.id === id ? { ...r, status } : r));
    };

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPdfFileName(file.name);

        // Dynamically import pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist') as any;
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        setPdfText(text);
    };

    const handleSavePdfKnowledge = async () => {
        if (!botId || !pdfText) return;
        setPdfSaving(true);
        const existingPrompt = basePrompt;
        const injection = `\n\n---\n📁 文件知識：${pdfFileName}\n${pdfText.slice(0, 8000)}\n---`;
        const updated = existingPrompt + injection;
        await supabase.from('bots').update({ system_prompt: updated }).eq('id', botId);
        setBasePrompt(updated);
        setPdfText('');
        setPdfFileName('');
        setPdfSaving(false);
        alert(`「${pdfFileName}」已匯入店長智庫！`);
    };

    const handleFetchReport = async () => {
        if (!botId || !mgmtToken) return;
        setReportLoading(true);
        const res = await fetch(`/api/bot/${botId}/report?token=${mgmtToken}`);
        const data = await res.json();
        setReport(data);
        setReportLoading(false);
    };

    // ─── Tab button helper ────────────────────────────────────────────────────
    const TabBtn = ({ id, label, icon: Icon, pro }: { id: Tab; label: string; icon: any; pro?: boolean }) => (
        <button
            onClick={() => { if (!pro || is1199) setActiveTab(id); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5
                ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-200'}
                ${pro && !is1199 ? 'opacity-40 cursor-not-allowed' : ''}
            `}
        >
            <Icon className="w-4 h-4" />
            {label}
            {pro && PRO_BADGE}
        </button>
    );

    const statusColor = (status: string) =>
        status === 'confirmed' ? 'text-emerald-400' : status === 'cancelled' ? 'text-rose-400' : 'text-amber-400';

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col md:flex-row overflow-hidden selection:bg-indigo-500/30">
            <Sidebar />

            <main className="flex-1 h-screen overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-12 relative">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3"
                        >
                            <BrainCircuit className="w-8 h-8 text-indigo-500" />
                            AI 店長智庫
                        </motion.h1>
                        <p className="text-slate-500 text-sm font-medium">賦予 AI 店長知識、個性與管理能力。</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="text" aria-label="搜尋知識點" placeholder="搜尋知識點..." className="bg-slate-800/50 border border-slate-700/50 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all min-w-[180px]" />
                        </div>
                        <button aria-label="通知" className="p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl relative hover:bg-slate-800 transition-all">
                            <Bell className="w-5 h-5 text-slate-400" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#0f172a]" />
                        </button>
                    </div>
                </header>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap items-center gap-2 mb-10 bg-slate-800/30 p-1.5 rounded-2xl w-fit border border-slate-700/50">
                    <TabBtn id="templates" label="產業模板" icon={Layout} />
                    <TabBtn id="prompt" label="核心提示詞" icon={Sparkles} />
                    <TabBtn id="faq" label="FAQ 知識庫" icon={MessageSquare} />
                    <TabBtn id="broadcast" label="主動廣播" icon={Radio} pro />
                    <TabBtn id="reservations" label="預約清單" icon={CalendarClock} pro />
                    <TabBtn id="pdf" label="文件上傳" icon={FileUp} pro />
                    <TabBtn id="report" label="月報分析" icon={BarChart3} pro />
                </div>

                {/* Content Area */}
                <div className="min-h-[500px]">

                    {/* ── Templates ─────────────────────────────────────────── */}
                    {activeTab === 'templates' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[
                                { title: '精緻美業', desc: '適用於美甲、美睫、SPA 等預約制場境。語氣優雅專業。', icon: '💅', color: 'from-pink-500 to-rose-500', prompt: `# 你是 [品牌名稱] 的 AI 美業管家\n## 品牌語氣\n- 優雅、專業、溫柔\n- 稱呼客戶為「親愛的」或「您」\n## 服務範疇\n- 說明美甲、美睫課程\n- 協助安排預約時間` },
                                { title: '餐飲零售', desc: '適用於餐廳訂位、外送詢問、選單導覽。語氣親切有活力。', icon: '🍲', color: 'from-orange-500 to-amber-500', prompt: `# 你是 [品牌名稱] 的 AI 主廚助手\n## 品牌語氣\n- 親切、熱情、有活力\n- 使用美食相關 emoji\n## 核心任務\n- 提供今日推薦\n- 協助訂位` },
                                { title: '教育顧問', desc: '適用於課程諮詢、補習班說明、專業講座。語氣權威且細心。', icon: '🎓', color: 'from-blue-500 to-indigo-500', prompt: `# 你是 [品牌名稱] 的 AI 班主任\n## 品牌語氣\n- 權威、細心、專業\n- 邏輯條理分明\n## 核心任務\n- 解答課程與報名費用\n- 預約課程說明會` },
                                { title: '精品電商', desc: '適用於高端品牌、VIP 顧問式銷售。語氣高貴，品味細膩。', icon: '🛍️', color: 'from-amber-400 to-yellow-500', prompt: `# 你是 [品牌名稱] 的 AI 奢華顧問\n## 品牌語氣\n- 高貴、細膩、充滿品味\n## 核心任務\n- 介紹產品細節與材質\n- 協助庫存查詢與 VIP 預約` },
                                { title: '房產仲介', desc: '適用於建案媒合、看房預約、市場諮詢。語氣穩重且專業。', icon: '🏠', color: 'from-blue-600 to-cyan-500', prompt: `# 你是 [品牌名稱] 的 AI 置業顧問\n## 品牌語氣\n- 穩重、誠信、高效\n## 核心任務\n- 安排看房預約\n- 解說買賣流程` },
                                { title: '健康診所', desc: '適用於門診預約、服務解說、初步衛教。語氣親切且嚴謹。', icon: '🏥', color: 'from-emerald-400 to-teal-600', prompt: `# 你是 [品牌名稱] 的 AI 健康諮詢師\n## 品牌語氣\n- 親切、嚴謹、富有同理心\n## 核心任務\n- 解說服務項目與門診時間\n- 協助掛號預約` },
                                { title: '空模板 (自訂)', desc: '從零開始構建您的 AI 人格。', icon: '⚙️', color: 'from-slate-600 to-slate-700', prompt: '# 自訂 AI 提示詞' },
                            ].map((tpl, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.07 }}
                                    onClick={() => { setBasePrompt(tpl.prompt); setActiveTab('prompt'); }}
                                    className="group p-8 bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl relative overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-all shadow-xl hover:shadow-indigo-500/10"
                                >
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tpl.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
                                    <div className="text-4xl mb-6">{tpl.icon}</div>
                                    <h3 className="text-xl font-black text-white mb-3 tracking-tight group-hover:text-indigo-400 transition-colors">{tpl.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed font-medium mb-8">{tpl.desc}</p>
                                    <button className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest group-hover:gap-3 transition-all">
                                        預覽並套用 <ChevronRight className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* ── Prompt ────────────────────────────────────────────── */}
                    {activeTab === 'prompt' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl p-8 xl:p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight mb-2">Master Prompt 總編輯器</h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Core Instruction & Personality</p>
                                </div>
                                <button onClick={handleSavePrompt} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/30">
                                    <Save className="w-4 h-4" />
                                    {saving ? '儲存中...' : '存檔更新'}
                                </button>
                            </div>
                            <div className="relative">
                                <textarea
                                    aria-label="Master Prompt 總編輯器"
                                    value={basePrompt} onChange={(e) => setBasePrompt(e.target.value)} className="w-full h-[420px] bg-slate-900/50 border border-slate-700/50 rounded-3xl p-8 text-sm text-slate-300 font-mono leading-relaxed focus:outline-none focus:border-indigo-500/50 transition-all" />
                                <span className="absolute top-4 right-4 px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/20">Markdown 支援</span>
                            </div>
                        </motion.div>
                    )}

                    {/* ── FAQ ───────────────────────────────────────────────── */}
                    {activeTab === 'faq' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="flex items-center justify-between bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl">
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight mb-1">FAQ 知識訓練集</h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Question & Answer Pairs</p>
                                </div>
                                <button onClick={() => { setEditingFaqId(null); setNewFaq({ question: '', answer: '' }); setIsFaqModalOpen(true); }} className="flex items-center gap-2 px-6 py-3 bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-2xl font-black text-sm transition-all">
                                    <PlusCircle className="w-4 h-4" />新增知識點
                                </button>
                            </div>
                            <div className="bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-700/50">
                                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">問題</th>
                                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">回答</th>
                                            <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {faqs.length > 0 ? faqs.map((faq, idx) => (
                                            <tr key={idx} className="group hover:bg-slate-700/20 transition-all">
                                                <td className="px-8 py-5 text-sm font-bold text-white max-w-[200px] truncate">{faq.question}</td>
                                                <td className="px-8 py-5 text-sm text-slate-400 font-medium max-w-[300px] truncate">{faq.answer}</td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center justify-end gap-4">
                                                        <button onClick={() => { setEditingFaqId(faq.id); setNewFaq({ question: faq.question, answer: faq.answer }); setIsFaqModalOpen(true); }} className="text-xs font-black text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-widest">編輯</button>
                                                        <button onClick={() => handleDeleteFaq(faq.id)} className="text-xs font-black text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-widest">刪除</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={3} className="px-8 py-10 text-center text-slate-500 text-sm font-bold">目前尚無知識點，請點擊上方按鈕新增。</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Broadcast (1199) ──────────────────────────────────── */}
                    {activeTab === 'broadcast' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                        <Radio className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tight">主動廣播</h3>
                                        <p className="text-slate-500 text-xs font-bold">推播訊息給所有曾互動的 LINE 用戶 · 每小時最多 5 次</p>
                                    </div>
                                </div>
                                <textarea
                                    value={broadcastMsg}
                                    onChange={e => setBroadcastMsg(e.target.value)}
                                    placeholder={`輸入廣播內容，例如：\n\n親愛的客人您好！🎉\n本週末我們有限時優惠...\n\n歡迎預約：請直接回覆此訊息`}
                                    maxLength={1000}
                                    rows={8}
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-3xl p-6 text-sm text-slate-300 leading-relaxed focus:outline-none focus:border-amber-500/50 transition-all resize-none mb-4"
                                />
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500 font-bold">{broadcastMsg.length} / 1000 字</span>
                                    <button
                                        onClick={handleBroadcast}
                                        disabled={isBroadcasting || !broadcastMsg.trim()}
                                        className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-black font-black text-sm rounded-2xl transition-all shadow-lg shadow-amber-500/20"
                                    >
                                        <Send className="w-4 h-4" />
                                        {isBroadcasting ? '發送中...' : '立即廣播'}
                                    </button>
                                </div>
                                {broadcastStatus && (
                                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-2xl bg-slate-700/40 border border-slate-600/50 text-sm">
                                        <span className="text-emerald-400 font-black">✓ {broadcastStatus.message || '廣播完成'}</span>
                                        {broadcastStatus.sent !== undefined && (
                                            <span className="ml-3 text-slate-400">成功 {broadcastStatus.sent} 人 · 失敗 {broadcastStatus.failed} 人</span>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Reservations (1199) ───────────────────────────────── */}
                    {activeTab === 'reservations' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl overflow-hidden">
                                <div className="p-8 border-b border-slate-700/50 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tight mb-1">預約清單</h3>
                                        <p className="text-slate-500 text-xs font-bold">AI 自動從 LINE 對話中擷取的預約詢問</p>
                                    </div>
                                    <span className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-black text-amber-400">
                                        共 {reservations.filter(r => r.status === 'pending').length} 筆待確認
                                    </span>
                                </div>
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-700/50">
                                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">LINE 用戶</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">服務</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">時間</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">狀態</th>
                                            <th className="px-8 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {reservations.length > 0 ? reservations.map((r) => (
                                            <tr key={r.id} className="hover:bg-slate-700/20 transition-all">
                                                <td className="px-8 py-4 text-sm font-mono text-slate-400 max-w-[120px] truncate">{r.line_user_id?.slice(-8)}</td>
                                                <td className="px-8 py-4 text-sm font-bold text-white">{r.service_type || '—'}</td>
                                                <td className="px-8 py-4 text-sm text-slate-400">{r.requested_date || '—'}</td>
                                                <td className={`px-8 py-4 text-xs font-black uppercase tracking-wider ${statusColor(r.status)}`}>{r.status}</td>
                                                <td className="px-8 py-4">
                                                    {r.status === 'pending' && (
                                                        <div className="flex items-center justify-end gap-3">
                                                            <button onClick={() => handleUpdateReservation(r.id, 'confirmed')} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                                                                <CheckCircle2 className="w-5 h-5" />
                                                            </button>
                                                            <button onClick={() => handleUpdateReservation(r.id, 'cancelled')} className="text-rose-400 hover:text-rose-300 transition-colors">
                                                                <XCircle className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={5} className="px-8 py-10 text-center text-slate-500 text-sm font-bold">尚無預約記錄。AI 偵測到客人說「預約」時會自動新增。</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* ── PDF Upload (1199) ─────────────────────────────────── */}
                    {activeTab === 'pdf' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                        <FileUp className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tight">文件上傳</h3>
                                        <p className="text-slate-500 text-xs font-bold">上傳 PDF 型錄或說明書，AI 將從中學習並融入回答</p>
                                    </div>
                                </div>

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-600 hover:border-indigo-500/50 rounded-3xl p-12 text-center cursor-pointer transition-all group"
                                >
                                    <FileText className="w-12 h-12 text-slate-600 group-hover:text-indigo-500 mx-auto mb-4 transition-colors" />
                                    <p className="text-slate-400 font-bold text-sm mb-2">
                                        {pdfFileName ? `📄 ${pdfFileName}` : '點擊或拖曳上傳 PDF 文件'}
                                    </p>
                                    <p className="text-slate-600 text-xs">支援 PDF 格式 · 建議 100 頁以內</p>
                                    <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
                                </div>

                                {pdfText && (
                                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
                                        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">解析預覽（前 500 字）</p>
                                            <p className="text-xs text-slate-400 font-mono leading-relaxed line-clamp-5">{pdfText.slice(0, 500)}</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <button onClick={() => { setPdfText(''); setPdfFileName(''); }} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-2xl font-black text-sm text-slate-300 flex items-center justify-center gap-2 transition-all">
                                                <Trash2 className="w-4 h-4" /> 移除
                                            </button>
                                            <button onClick={handleSavePdfKnowledge} disabled={pdfSaving} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all">
                                                <Save className="w-4 h-4" /> {pdfSaving ? '匯入中...' : '匯入店長智庫'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Monthly Report (1199) ─────────────────────────────── */}
                    {activeTab === 'report' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                            <BarChart3 className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white tracking-tight">月報分析</h3>
                                            <p className="text-slate-500 text-xs font-bold">本月 AI 店長工作成果數據</p>
                                        </div>
                                    </div>
                                    <button onClick={handleFetchReport} disabled={reportLoading} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-600/20">
                                        <TrendingUp className="w-4 h-4" />
                                        {reportLoading ? '載入中...' : '載入本月報表'}
                                    </button>
                                </div>

                                {report && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                        {/* Stats cards */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { label: '總對話則數', value: report.stats.total_messages, icon: MessageCircle, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                                                { label: '互動用戶數', value: report.stats.unique_users, icon: Users, color: 'text-sky-400', bg: 'bg-sky-500/10' },
                                                { label: 'AI 回覆次數', value: report.stats.ai_replies, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                                                { label: '預約詢問', value: report.stats.reservations_captured, icon: CalendarClock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                                            ].map((card, i) => (
                                                <div key={i} className="bg-slate-900/40 rounded-2xl border border-slate-700/50 p-5">
                                                    <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                                                        <card.icon className={`w-4 h-4 ${card.color}`} />
                                                    </div>
                                                    <p className="text-2xl font-black text-white">{card.value ?? 0}</p>
                                                    <p className="text-xs text-slate-500 font-bold mt-1">{card.label}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Top keywords */}
                                        {report.top_keywords?.length > 0 && (
                                            <div className="bg-slate-900/40 rounded-2xl border border-slate-700/50 p-6">
                                                <h4 className="text-sm font-black text-slate-300 mb-4 uppercase tracking-widest">🔍 客人最常提到的關鍵字</h4>
                                                <div className="flex flex-wrap gap-3">
                                                    {report.top_keywords.map((kw: any, i: number) => (
                                                        <div key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl border border-slate-700/50">
                                                            <span className="text-sm font-black text-white">{kw.word}</span>
                                                            <span className="text-xs font-black text-indigo-400">{kw.count} 次</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {!report && !reportLoading && (
                                    <div className="text-center py-12 text-slate-500">
                                        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p className="font-bold text-sm">點擊「載入本月報表」查看數據</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* FAQ Modal */}
            <AnimatePresence>
                {isFaqModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0f172a]/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl"
                        >
                            <h3 className="text-2xl font-black text-white mb-6">{editingFaqId ? '編輯知識點' : '新增知識點'}</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">問題</label>
                                    <input type="text" placeholder="例如：你們的退貨政策是什麼？" value={newFaq.question} onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">回答</label>
                                    <textarea placeholder="提供準確且簡潔的回答，供 AI 參考。" value={newFaq.answer} onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-sm text-white h-32 focus:outline-none focus:border-indigo-500 transition-all resize-none" />
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <button onClick={() => setIsFaqModalOpen(false)} className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-2xl font-black text-sm transition-all">取消</button>
                                    <button onClick={handleSaveFaq} disabled={saving} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/30">
                                        {saving ? '儲存中...' : (editingFaqId ? '儲存變更' : '立即新增')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* AI Chat Sidebar */}
            <div className="hidden xl:flex w-80 lg:w-96 bg-[#1e293b]/50 flex-col h-screen border-l border-slate-700/50 backdrop-blur-3xl overflow-hidden shrink-0">
                <SaaSChatInterface pageContext="knowledge" />
            </div>
        </div>
    );
}
