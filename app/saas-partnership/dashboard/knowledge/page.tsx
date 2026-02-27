"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BrainCircuit,
    Search,
    Bell,
    User,
    Sparkles,
    FileText,
    MessageSquare,
    ChevronRight,
    Save,
    Layout,
    PlusCircle
} from 'lucide-react';
import Sidebar from '@/components/PartnerDashboard/Sidebar';
import SaaSChatInterface from '@/components/SaaSChatInterface';
import { supabase } from '@/lib/supabase';

export default function KnowledgeHub() {
    const [activeTab, setActiveTab] = useState<'templates' | 'prompt' | 'faq'>('templates');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [basePrompt, setBasePrompt] = useState('');
    const [faqs, setFaqs] = useState<any[]>([]);
    const [botId, setBotId] = useState<string | null>(null);
    const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
    const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // For demo, we'll fetch the first bot
                const { data: bots } = await supabase.from('bots').select('*').limit(1);
                if (bots && bots.length > 0) {
                    const bot = bots[0];
                    setBotId(bot.id);
                    setBasePrompt(bot.system_prompt || '');

                    // Fetch FAQs for this bot
                    const { data: faqData } = await supabase
                        .from('faq')
                        .select('*')
                        .eq('bot_id', bot.id)
                        .order('created_at', { ascending: false });

                    if (faqData) setFaqs(faqData);
                }
            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleSavePrompt = async () => {
        if (!botId) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('bots')
                .update({ system_prompt: basePrompt })
                .eq('id', botId);

            if (!error) {
                alert("核心提示詞已更新！");
            }
        } catch (err) {
            console.error("Save Error:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveFaq = async () => {
        if (!botId || !newFaq.question || !newFaq.answer) return;
        setSaving(true);
        try {
            if (editingFaqId) {
                // Update existing
                const { data, error } = await supabase
                    .from('faq')
                    .update({ question: newFaq.question, answer: newFaq.answer })
                    .eq('id', editingFaqId)
                    .select();

                if (!error && data) {
                    setFaqs(faqs.map(f => f.id === editingFaqId ? data[0] : f));
                    setIsFaqModalOpen(false);
                    setNewFaq({ question: '', answer: '' });
                    setEditingFaqId(null);
                }
            } else {
                // Insert new
                const { data, error } = await supabase
                    .from('faq')
                    .insert([{ ...newFaq, bot_id: botId }])
                    .select();

                if (!error && data) {
                    setFaqs([data[0], ...faqs]);
                    setIsFaqModalOpen(false);
                    setNewFaq({ question: '', answer: '' });
                }
            }
        } catch (err) {
            console.error("Save FAQ Error:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleEditFaq = (faq: any) => {
        setEditingFaqId(faq.id);
        setNewFaq({ question: faq.question, answer: faq.answer });
        setIsFaqModalOpen(true);
    };

    const handleDeleteFaq = async (id: string) => {
        if (!confirm("確定要刪除這筆 FAQ 嗎？")) return;
        try {
            const { error } = await supabase.from('faq').delete().eq('id', id);
            if (!error) {
                setFaqs(faqs.filter(f => f.id !== id));
            }
        } catch (err) {
            console.error("Delete FAQ Error:", err);
        }
    };

    const openNewFaqModal = () => {
        setEditingFaqId(null);
        setNewFaq({ question: '', answer: '' });
        setIsFaqModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col md:flex-row overflow-hidden selection:bg-indigo-500/30">
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 h-screen overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-12 relative">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3"
                        >
                            <BrainCircuit className="w-8 h-8 text-indigo-500" />
                            AI 練功房
                        </motion.h1>
                        <p className="text-slate-500 text-sm font-medium">在此鍛煉您的 AI 店長，賦予其更深層的品牌知識與個性。 </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="搜尋知識點..."
                                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all min-w-[200px]"
                            />
                        </div>
                        <button className="p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl relative hover:bg-slate-800 transition-all">
                            <Bell className="w-5 h-5 text-slate-400" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#0f172a]" />
                        </button>
                    </div>
                </header>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 mb-10 bg-slate-800/30 p-1.5 rounded-2xl w-fit border border-slate-700/50">
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'templates' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-200'}`}
                    >
                        <Layout className="w-4 h-4" />
                        產業模板
                    </button>
                    <button
                        onClick={() => setActiveTab('prompt')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'prompt' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-200'}`}
                    >
                        <Sparkles className="w-4 h-4" />
                        核心提示詞
                    </button>
                    <button
                        onClick={() => setActiveTab('faq')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'faq' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-200'}`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        FAQ 知識庫
                    </button>
                </div>

                {/* Content Area */}
                <div className="min-h-[500px]">
                    {activeTab === 'templates' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[
                                {
                                    title: '精緻美業',
                                    desc: '適用於美甲、美睫、 SPA 等預約制場境。服務語氣優雅專業。',
                                    icon: '💅',
                                    color: 'from-pink-500 to-rose-500',
                                    prompt: `# 你是 [品牌名稱] 的 AI 美業管家\n## 品牌語氣\n- 優雅、專業、溫柔\n- 稱呼客戶為「親愛的」或「您」\n## 服務範疇\n- 說明美甲、美睫課程\n- 協助安排預約時間`
                                },
                                {
                                    title: '餐飲零售',
                                    desc: '適用於餐廳訂位、外送詢問、選單導覽。語氣親切有活力。',
                                    icon: '🍲',
                                    color: 'from-orange-500 to-amber-500',
                                    prompt: `# 你是 [品牌名稱] 的 AI 主廚助手\n## 品牌語氣\n- 親切、熱情、有活力\n- 使用美食相關 emoji 🍲✨\n## 核心任務\n- 提供今日介紹與推薦\n- 協助訂位與位置導引`
                                },
                                {
                                    title: '教育顧問',
                                    desc: '適用於課程諮詢、補習班說明、專業講座。語氣權威且細心。',
                                    icon: '🎓',
                                    color: 'from-blue-500 to-indigo-500',
                                    prompt: `# 你是 [品牌名稱] 的 AI 班主任\n## 品牌語氣\n- 權威、細心、專業\n- 邏輯條理分明\n## 核心任務\n- 解答課程大綱與報名費用\n- 預約課程說明會`
                                },
                                {
                                    title: '精品電商',
                                    desc: '適用於高端品牌、VIP 顧問式銷售。語氣高貴且具備產品細節洞察。',
                                    icon: '🛍️',
                                    color: 'from-amber-400 to-yellow-500',
                                    prompt: `# 你是 [品牌名稱] 的 AI 奢華購物顧問\n## 品牌語氣\n- 高貴、細膩、充滿品味\n- 提供尊榮感，對產品細節如數家珍\n## 核心任務\n- 介紹奢華單品細節與材質\n- 協助庫存查詢與 VIP 鑑賞預約\n- 提供穿搭建議與禮品諮詢`
                                },
                                {
                                    title: '房產仲介',
                                    desc: '適用於建案媒合、看房預約、市場諮詢。語氣穩重且專業。',
                                    icon: '🏠',
                                    color: 'from-blue-600 to-cyan-500',
                                    prompt: `# 你是 [品牌名稱] 的 AI 置業顧問\n## 品牌語氣\n- 穩重、誠信、專業、高效\n- 對市場動態與物件細節瞭如指掌\n## 核心任務\n- 協助客戶依需求媒合合適房源\n- 解說買賣/租賃流程與市場趨勢\n- 安排現場看房預約與諮詢`
                                },
                                {
                                    title: '健康診所',
                                    desc: '適用於門診預約、服務解說、初步衛教。語氣親切且嚴謹。',
                                    icon: '🏥',
                                    color: 'from-emerald-400 to-teal-600',
                                    prompt: `# 你是 [品牌名稱] 的 AI 健康諮詢師\n## 品牌語氣\n- 親切、嚴謹、安心、富有同理心\n- 遵守隱私規範，回訊簡潔明確\n## 核心任務\n- 解報診所服務項目與門診時間\n- 協助掛號預約與行前注意事項說明\n- 提供一般性健康知識衛教資訊`
                                },
                                {
                                    title: '空模板 (自訂)',
                                    desc: '從零開始構建您的 AI 人格。',
                                    icon: '⚙️',
                                    color: 'from-slate-600 to-slate-700',
                                    prompt: '# 自訂 AI 提示詞'
                                }
                            ].map((tpl, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => {
                                        setBasePrompt(tpl.prompt);
                                        setActiveTab('prompt');
                                    }}
                                    className="group p-8 bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl relative overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-all shadow-xl hover:shadow-indigo-500/10"
                                >
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tpl.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
                                    <div className="text-4xl mb-6">{tpl.icon}</div>
                                    <h3 className="text-xl font-black text-white mb-3 tracking-tight group-hover:text-indigo-400 transition-colors">{tpl.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed font-medium mb-8">
                                        {tpl.desc}
                                    </p>
                                    <button className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest group-hover:gap-3 transition-all">
                                        預覽並套用 <ChevronRight className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'prompt' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl p-8 xl:p-10"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight mb-2">Master Prompt 總編輯器</h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Core Instruction & Personality</p>
                                </div>
                                <button
                                    onClick={handleSavePrompt}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/30"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? '儲存中...' : '存檔更新'}
                                </button>
                            </div>

                            <div className="relative">
                                <textarea
                                    value={basePrompt}
                                    onChange={(e) => setBasePrompt(e.target.value)}
                                    className="w-full h-[400px] bg-slate-900/50 border border-slate-700/50 rounded-3xl p-8 text-sm text-slate-300 font-mono leading-relaxed focus:outline-none focus:border-indigo-500/50 transition-all selection:bg-indigo-500/30"
                                />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <span className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/20">Markdown 支援</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'faq' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between bg-slate-800/40 p-10 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl">
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight mb-2">FAQ 知識訓練集</h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Question & Answer Pairs</p>
                                </div>
                                <button
                                    onClick={openNewFaqModal}
                                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-2xl font-black text-sm transition-all"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    新增知識點
                                </button>
                            </div>

                            {/* Schema Warning if table missing (Demo Resilience) */}
                            {faqs.length === 0 && !loading && (
                                <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-[2rem]">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <h4 className="text-amber-400 font-black">資料庫初始化提示</h4>
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                        偵測到資料庫可能尚未建立 `faq` 資料表。請點擊「新增知識點」嘗試新增。
                                        若持續失敗，請參考 `supabase_schema.sql` 進行資料表遷移。
                                    </p>
                                </div>
                            )}

                            <div className="bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-700/50">
                                            <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">問題 (Question)</th>
                                            <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">回答 (Answer / Key points)</th>
                                            <th className="px-8 py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {faqs.length > 0 ? faqs.map((faq, idx) => (
                                            <tr key={idx} className="group hover:bg-slate-700/20 transition-all">
                                                <td className="px-8 py-6 text-sm font-bold text-white max-w-[200px] truncate">{faq.question}</td>
                                                <td className="px-8 py-6 text-sm text-slate-400 font-medium max-w-[300px] truncate">{faq.answer}</td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-end gap-4">
                                                        <button onClick={() => handleEditFaq(faq)} className="text-xs font-black text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-widest">編輯</button>
                                                        <button onClick={() => handleDeleteFaq(faq.id)} className="text-xs font-black text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-widest">刪除</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={3} className="px-8 py-10 text-center text-slate-500 text-sm font-bold">目前尚無知識點，請點擊上方按鈕新增。</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
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
                            <h3 className="text-2xl font-black text-white mb-6">
                                {editingFaqId ? '編輯知識點' : '新增知識點'}
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">問題 (Question)</label>
                                    <input
                                        type="text"
                                        placeholder="例如：你們的退貨政策是什麼？"
                                        value={newFaq.question}
                                        onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">回答 (Answer)</label>
                                    <textarea
                                        placeholder="提供準確且簡潔的回答，供 AI 參考。"
                                        value={newFaq.answer}
                                        onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-sm text-white h-32 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setIsFaqModalOpen(false)}
                                        className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-2xl font-black text-sm transition-all"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={handleSaveFaq}
                                        disabled={saving}
                                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/30"
                                    >
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
