"use client";

import React, { useState, useEffect } from 'react';
import { 
    MessageSquare, Search, Filter, 
    Clock, User, Send, CheckCircle2,
    AlertCircle, MoreVertical, Paperclip,
    Smile, Phone, Mail, ShieldCheck,
    ChevronRight, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { usePartner } from '@/context/PartnerContext';

export default function SupportDeskPage() {
    const { activeOA } = usePartner();
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        async function fetchTickets() {
            if (!activeOA) return;
            setLoading(true);
            try {
                const { data } = await supabase
                    .from('support_tickets')
                    .select('*, members(display_name, avatar_url, identity_score)')
                    .eq('oa_id', activeOA.id)
                    .order('created_at', { ascending: false });
                
                if (data) {
                    setTickets(data);
                    if (data.length > 0) setSelectedTicket(data[0]);
                }
            } catch (err) {
                console.error('Error fetching tickets:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchTickets();
    }, [activeOA]);

    const getPriorityColor = (p: string) => {
        switch(p) {
            case 'High': return 'text-rose-500 bg-rose-50';
            case 'Medium': return 'text-amber-500 bg-amber-50';
            default: return 'text-blue-500 bg-blue-50';
        }
    };

    return (
        <div className="h-[calc(100vh-120px)] flex gap-6 p-8 lg:p-12 overflow-hidden">
            {/* Ticket List Sidebar */}
            <aside className="w-80 lg:w-96 flex flex-col gap-6 shrink-0">
                <header className="space-y-4">
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-[#06C755]" />
                        客服工作台
                    </h1>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="搜尋工單、會員或問題..."
                            className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-slate-900 outline-none focus:ring-2 ring-[#06C755]/10 transition-all shadow-sm"
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] shadow-sm">
                    {loading ? (
                        <div className="p-20 text-center animate-pulse text-slate-300 font-black tracking-widest text-[10px]">正在載入工單神經元...</div>
                    ) : tickets.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {tickets.map((ticket) => (
                                <button 
                                    key={ticket.id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`w-full p-6 flex flex-col gap-3 text-left transition-all hover:bg-white/60 ${selectedTicket?.id === ticket.id ? 'bg-white shadow-inner border-l-4 border-l-[#06C755]' : ''}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority} Priority
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400">{new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 line-clamp-1">{ticket.subject || '無主旨問題'}</h4>
                                        <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-1">{ticket.last_message}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-5 h-5 rounded-full bg-slate-100 overflow-hidden border border-white shadow-sm">
                                            {ticket.members?.avatar_url && <img src={ticket.members.avatar_url} className="w-full h-full object-cover" />}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400">{ticket.members?.display_name || '未知會員'}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-20 text-center text-slate-300 italic text-xs">目前無待處理工單</div>
                    )}
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 bg-white/60 backdrop-blur-3xl border border-white rounded-[3rem] shadow-xl flex flex-col overflow-hidden relative">
                {selectedTicket ? (
                    <>
                        <header className="p-8 border-b border-white flex justify-between items-center bg-white/40">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#06C755] to-[#05A044] flex items-center justify-center text-white text-xl font-black shadow-lg">
                                    {selectedTicket.members?.display_name?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">{selectedTicket.members?.display_name}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-black text-[#06C755] uppercase tracking-widest flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> VIP 客戶</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Zap className="w-3 h-3" /> {selectedTicket.members?.identity_score}% 意向熱度</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-3 hover:bg-white rounded-xl text-slate-400 hover:text-emerald-500 transition-all border border-transparent hover:border-white shadow-sm"><CheckCircle2 className="w-5 h-5" /></button>
                                <button className="p-3 hover:bg-white rounded-xl text-slate-400 transition-all border border-transparent hover:border-white shadow-sm"><MoreVertical className="w-5 h-5" /></button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/30 shadow-inner">
                            {/* Message History Simulation */}
                            <div className="flex flex-col gap-6">
                                <div className="max-w-[80%] self-start bg-white p-5 rounded-3xl rounded-tl-none shadow-sm border border-slate-100">
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{selectedTicket.last_message}</p>
                                    <span className="text-[9px] font-bold text-slate-400 mt-2 block">10:42 AM</span>
                                </div>
                                <div className="max-w-[80%] self-end bg-[#06C755] p-5 rounded-3xl rounded-tr-none shadow-xl shadow-[#06C755]/10 text-white">
                                    <p className="text-sm font-bold leading-relaxed">您好！我是您的 AI 店長。關於您的預約問題，我正在為您調度專員處理中，請稍候片刻。</p>
                                    <span className="text-[9px] font-bold opacity-60 mt-2 block">10:43 AM · AI 回覆</span>
                                </div>
                            </div>
                        </div>

                        <footer className="p-8 bg-white/80 border-t border-white">
                            <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-[2rem] p-3 shadow-inner">
                                <button className="p-3 text-slate-400 hover:text-[#06C755] transition-colors"><Smile className="w-5 h-5" /></button>
                                <button className="p-3 text-slate-400 hover:text-[#06C755] transition-colors"><Paperclip className="w-5 h-5" /></button>
                                <input 
                                    type="text" 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="以 真人客服 身份輸入回覆內容..."
                                    className="flex-1 bg-transparent border-none text-sm font-bold text-slate-800 focus:ring-0 p-0"
                                />
                                <button className="p-4 bg-[#06C755] text-white rounded-[1.5rem] shadow-lg shadow-[#06C755]/20 hover:scale-105 active:scale-95 transition-all">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-6">
                        <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-[#06C755] shadow-inner">
                            <MessageSquare className="w-10 h-10" />
                        </div>
                        <div className="max-w-xs">
                            <h3 className="text-xl font-black text-slate-900 mb-2">選擇一個工單開始處理</h3>
                            <p className="text-xs text-slate-400 font-bold leading-relaxed italic">
                                當 AI 指揮官偵測到客戶情緒不穩定或涉及複雜售後需求時，會自動將對話轉入此工作台。
                            </p>
                        </div>
                    </div>
                )}
            </main>

            {/* Quick Profile Panel */}
            <aside className="hidden xl:block w-72 shrink-0 space-y-6">
                <section className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">會員快覽</h4>
                    {selectedTicket?.members && (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden mb-4 border-2 border-white shadow-xl">
                                    {selectedTicket.members.avatar_url && <img src={selectedTicket.members.avatar_url} className="w-full h-full object-cover" />}
                                </div>
                                <h5 className="font-black text-slate-900">{selectedTicket.members.display_name}</h5>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">ID: {selectedTicket.member_id.slice(0, 8)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="p-3 bg-white/60 hover:bg-white rounded-xl border border-white flex flex-col items-center gap-1 transition-all group shadow-sm">
                                    <Phone className="w-4 h-4 text-slate-400 group-hover:text-[#06C755]" />
                                    <span className="text-[8px] font-black text-slate-500">撥話</span>
                                </button>
                                <button className="p-3 bg-white/60 hover:bg-white rounded-xl border border-white flex flex-col items-center gap-1 transition-all group shadow-sm">
                                    <Mail className="w-4 h-4 text-slate-400 group-hover:text-[#06C755]" />
                                    <span className="text-[8px] font-black text-slate-500">信箱</span>
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                <button 
                    onClick={() => window.location.href = `/saas-partnership/dashboard/crm`}
                    className="w-full bg-gradient-to-br from-[#06C755] to-[#05A044] text-white p-5 rounded-[1.8rem] flex items-center justify-between hover:scale-[1.02] transition-all shadow-xl group"
                >
                    <span className="text-xs font-black">完整 CRM 軌跡</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-all" />
                </button>
            </aside>
        </div>
    );
}
