"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { BrainCircuit, Search, Bell, ChevronRight } from 'lucide-react';

import Sidebar from '@/components/PartnerDashboard/Sidebar';
import SaaSChatInterface from '@/components/SaaSChatInterface';
import { supabase } from '@/lib/supabase';

// Modular Components
import KnowledgeBasePrompt from '@/components/PartnerDashboard/Knowledge/KnowledgeBasePrompt';
import KnowledgeFaqList from '@/components/PartnerDashboard/Knowledge/KnowledgeFaqList';
import KnowledgeBroadcast from '@/components/PartnerDashboard/Knowledge/KnowledgeBroadcast';
import KnowledgeReservations from '@/components/PartnerDashboard/Knowledge/KnowledgeReservations';
import KnowledgePdfUpload from '@/components/PartnerDashboard/Knowledge/KnowledgePdfUpload';
import KnowledgeReport from '@/components/PartnerDashboard/Knowledge/KnowledgeReport';

// Config
import { KNOWLEDGE_CONFIG } from '@/config/knowledge_config';

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
        const injection = `\n\n---\n📁 文件知識：${pdfFileName}\n${pdfText.slice(0, 8000)}\n---`;
        const updated = basePrompt + injection;
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

    // ─── Helper Components ────────────────────────────────────────────────────
    const TabBtn = ({ id, label, iconName, pro }: { id: Tab; label: string; iconName: string; pro?: boolean }) => {
        const Icon = (Icons as any)[iconName] || Icons.HelpCircle;
        const isDisabled = pro && !is1199;
        
        return (
            <button
                onClick={() => { if (!isDisabled) setActiveTab(id); }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5
                    ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-200'}
                    ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
                `}
            >
                <Icon className="w-4 h-4" />
                {label}
                {pro && PRO_BADGE}
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col md:flex-row overflow-hidden selection:bg-indigo-500/30">
            <Sidebar />

            <main className="flex-1 h-screen overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-12 relative">
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
                            <input type="text" placeholder="搜尋知識點..." className="bg-slate-800/50 border border-slate-700/50 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all min-w-[180px]" />
                        </div>
                        <button title="通知" className="p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl relative hover:bg-slate-800 transition-all">
                            <Bell className="w-5 h-5 text-slate-400" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#0f172a]" />
                        </button>
                    </div>
                </header>

                <div className="flex flex-wrap items-center gap-2 mb-10 bg-slate-800/30 p-1.5 rounded-2xl w-fit border border-slate-700/50">
                    {KNOWLEDGE_CONFIG.tabs.map(tab => (
                        <TabBtn key={tab.id} id={tab.id as Tab} label={tab.label} iconName={tab.icon} pro={tab.pro} />
                    ))}
                </div>

                <div className="min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'templates' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {KNOWLEDGE_CONFIG.templates.map((tpl, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
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
                            </motion.div>
                        )}

                        {activeTab === 'prompt' && (
                            <KnowledgeBasePrompt 
                                value={basePrompt} 
                                onChange={setBasePrompt} 
                                onSave={handleSavePrompt} 
                                saving={saving} 
                            />
                        )}

                        {activeTab === 'faq' && (
                            <KnowledgeFaqList 
                                faqs={faqs} 
                                onEdit={(faq) => { setEditingFaqId(faq.id); setNewFaq({ question: faq.question, answer: faq.answer }); setIsFaqModalOpen(true); }}
                                onDelete={handleDeleteFaq}
                                onAdd={() => { setEditingFaqId(null); setNewFaq({ question: '', answer: '' }); setIsFaqModalOpen(true); }}
                                isModalOpen={isFaqModalOpen}
                                onCloseModal={() => setIsFaqModalOpen(false)}
                                onSaveFaq={handleSaveFaq}
                                newFaq={newFaq}
                                setNewFaq={setNewFaq}
                                editingId={editingFaqId}
                                saving={saving}
                            />
                        )}

                        {activeTab === 'broadcast' && (
                            <KnowledgeBroadcast 
                                message={broadcastMsg}
                                onChange={setBroadcastMsg}
                                onSend={handleBroadcast}
                                isBroadcasting={isBroadcasting}
                                status={broadcastStatus}
                            />
                        )}

                        {activeTab === 'reservations' && (
                            <KnowledgeReservations 
                                reservations={reservations}
                                onUpdateStatus={handleUpdateReservation}
                            />
                        )}

                        {activeTab === 'pdf' && (
                            <KnowledgePdfUpload 
                                fileName={pdfFileName}
                                text={pdfText}
                                onUpload={handlePdfUpload}
                                onSave={handleSavePdfKnowledge}
                                onRemove={() => { setPdfText(''); setPdfFileName(''); }}
                                saving={pdfSaving}
                            />
                        )}

                        {activeTab === 'report' && (
                            <KnowledgeReport 
                                report={report}
                                loading={reportLoading}
                                onFetch={handleFetchReport}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <div className="hidden xl:flex w-80 lg:w-96 bg-[#1e293b]/50 flex-col h-screen border-l border-slate-700/50 backdrop-blur-3xl overflow-hidden shrink-0">
                <SaaSChatInterface pageContext="knowledge" />
            </div>
        </div>
    );
}
