"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Search, Calendar, MessageSquare, ArrowLeft, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { usePartner } from '@/context/PartnerContext';

interface Memory {
    id: string;
    role: 'user' | 'ai';
    content: string;
    created_at: string;
}

export default function NeuralMemoryPage() {
    const { partner } = usePartner();
    const [memories, setMemories] = useState<Memory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchMemories = async () => {
            if (!partner.email) return;
            const { data, error } = await supabase
                .from('chat_memories')
                .select('*')
                .eq('membership_email', partner.email)
                .order('created_at', { ascending: false });

            if (data) setMemories(data);
            setLoading(false);
        };

        fetchMemories();
    }, [partner.email]);

    const filteredMemories = memories.filter(m => 
        m.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-transparent p-12">
            <div className="max-w-5xl mx-auto space-y-12">
                
                {/* Header */}
                <div className="flex flex-col gap-6">
                    <Link 
                        href="/saas-partnership/dashboard/modules" 
                        className="flex items-center gap-2 text-slate-400 hover:text-[#06C755] transition-colors font-bold text-sm group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        返回功能積木
                    </Link>
                    
                    <div className="flex items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#06C755]/10 flex items-center justify-center border border-[#06C755]/20">
                                    <BrainCircuit className="w-7 h-7 text-[#06C755]" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">神經記憶資料庫</h1>
                            </div>
                            <p className="text-slate-500 font-bold max-w-xl leading-relaxed">
                                這裡保存了您與 AI 指揮官的所有對話脈絡。這些數據將作為 AI 檢索的基礎，提供更精準的客製化建議。
                            </p>
                        </div>

                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="搜尋歷史記憶..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/50 backdrop-blur-md border border-white rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 ring-[#06C755]/20 transition-all shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Memories List */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-[#06C755]/20 border-t-[#06C755] rounded-full animate-spin" />
                        </div>
                    ) : filteredMemories.length === 0 ? (
                        <div className="bg-white/40 backdrop-blur-md border border-white rounded-[2rem] p-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                <Database className="w-8 h-8" />
                            </div>
                            <p className="text-slate-400 font-bold">目前尚無神經記憶紀錄</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredMemories.map((memory) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={memory.id}
                                    className="bg-white/40 backdrop-blur-md border border-white rounded-3xl p-6 hover:bg-white/60 transition-all group shadow-sm"
                                >
                                    <div className="flex items-start gap-6">
                                        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                                            memory.role === 'user' ? 'bg-slate-100 text-slate-400' : 'bg-[#06C755]/10 text-[#06C755]'
                                        }`}>
                                            {memory.role === 'user' ? <MessageSquare className="w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    {memory.role === 'user' ? 'Commander Instruction' : 'AI Response'}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-slate-300">
                                                    <Calendar className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold">
                                                        {new Date(memory.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold text-slate-800 leading-relaxed">
                                                {memory.content}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
