'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Database, FileText, Globe, CheckCircle2 } from 'lucide-react';

interface RAGTabProps {
    planLevel: number;
    bots: any[];
    selectedBotId: string | null;
}

export default function RAGTab({ planLevel, bots, selectedBotId }: RAGTabProps) {
    if (planLevel < 2) {
        return (
            <div className="py-16 flex flex-col items-center justify-center text-center px-10 bg-white/10 backdrop-blur-md rounded-[24px] /20 shadow-sm">
                <div className="w-24 h-24 rounded-[24px] bg-white/60 flex items-center justify-center mb-8 shadow-2xl /40">
                    <Lock className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
                </div>
                <h3 className="text-[32px] font-black text-slate-900 mb-4">PDF 深度學習 (RAG) 尚未開通</h3>
                <p className="text-[18px] text-slate-600 max-w-lg mb-10 font-bold leading-relaxed">
                    此功能目前僅限於 <span className="text-emerald-600">單店主力 ($499) 方案以上</span> 用戶使用，升級後可讓 AI 自動讀懂您的型錄與說明書。
                </p>

                {/* 功能預覽 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mb-8 text-left">
                    {[
                        { icon: FileText, title: '上傳 PDF 型錄', desc: '商品型錄、服務說明書、價格表' },
                        { icon: Database, title: 'AI 自動學習', desc: '讀取完成，問什麼都能精準回答' },
                    ].map(f => (
                        <div key={f.title} className="p-4 rounded-[24px] bg-slate-50 border border-slate-100 flex items-start gap-3">
                            <f.icon className="w-6 h-6 text-emerald-500 shrink-0" />
                            <div>
                                <p className="text-xs font-black text-slate-600">{f.title}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <motion.button 
                    onClick={() => window.location.href = '/dashboard/upgrade'} 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-8 py-3 rounded-[24px] bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-black text-sm shadow-xl shadow-emerald-500/20 transition-all hover:from-emerald-600 hover:to-cyan-700 active:scale-95"
                >
                    了解升級方案 →
                </motion.button>
            </div>
        );
    }

    const [documents, setDocuments] = React.useState<{id: string, name: string, size: string, status: 'ready' | 'loading' | 'error', type: string}[]>([
        { id: '1', name: '品牌經營核心策略.pdf', size: '1.2 MB', status: 'ready', type: 'pdf' },
        { id: '2', name: '2026年夏季商品價目表.pdf', size: '850 KB', status: 'ready', type: 'pdf' },
    ]);

    const MAX_FILES = 5;
    const MAX_SIZE_MB = 5;

    const currentBot = bots.find(b => b.id === selectedBotId);
    const isLimitReached = documents.length >= MAX_FILES;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (isLimitReached) {
            alert(`已達上傳上限 (${MAX_FILES} 份文件)，請先移除舊文件。`);
            return;
        }

        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            alert(`檔案太大 (上限 ${MAX_SIZE_MB}MB)！請提供更精簡的 PDF 版本。`);
            return;
        }

        // Mock upload behavior
        const newDoc = {
            id: Date.now().toString(),
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
            status: 'loading' as const,
            type: file.name.split('.').pop() || 'file'
        };
        
        setDocuments(prev => [...prev, newDoc]);
        
        // Simulate finished processing
        setTimeout(() => {
            setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'ready' } : d));
        }, 3000);
    };

    const removeDoc = (id: string) => {
        setDocuments(prev => prev.filter(d => d.id !== id));
    };

    return (
        <div className="py-8 px-2">
            <div className="flex items-center justify-between mb-10 pt-4">


                <div className="flex items-center gap-4 text-[13px] font-black bg-white/60 backdrop-blur-md p-5 rounded-[24px]  shadow-sm ring-1 ring-black/[0.03]">
                    <span className="text-slate-400 uppercase tracking-widest">已使用席位:</span>
                    <span className={isLimitReached ? "text-red-500" : "text-emerald-600"}>
                        {documents.length} / {MAX_FILES} 份
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* 📤 Upload Zone */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-6 text-left">
                    <div className={cn(
                        "relative p-12 rounded-[24px] border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-8 group",
                        isLimitReached 
                            ? "bg-white/10 /20 opacity-60" 
                            : "bg-white/60 border-emerald-500/20 backdrop-blur-md hover:border-emerald-500/40 hover:bg-white "
                    )}>
                        <div className="w-24 h-24 rounded-[24px] bg-white shadow-2xl flex items-center justify-center border border-emerald-50 transition-transform group-hover:scale-105">
                            <FileText className={isLimitReached ? "text-slate-300 w-10 h-10" : "text-emerald-500 w-10 h-10"} />
                        </div>
                        <div>
                            <p className="text-[24px] font-black text-slate-900">上傳 AI 學習文件</p>
                            <p className="text-[14px] text-slate-400 font-bold mt-2 uppercase tracking-[0.1em]">僅支援 PDF (單一檔案上限 5MB)</p>
                        </div>

                        {!isLimitReached ? (
                            <label className="cursor-pointer">
                                <span className="mt-4 inline-block p-5 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-[16px] font-black rounded-[24px] transition-all shadow-xl shadow-emerald-500/20 active:scale-95 hover:from-emerald-600 hover:to-cyan-700">
                                    選擇檔案
                                </span>
                                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} />
                            </label>
                        ) : (
                            <div className="mt-4 px-6 py-3 bg-red-50 rounded-[24px] border border-red-100 flex items-center gap-3">
                                <X className="w-5 h-5 text-red-500" />
                                <span className="text-[14px] text-red-600 font-black">席位已額滿，請移除舊檔</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 📜 Document List */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-4 text-left">
                    <div className="flex items-center justify-between px-2 mb-6">
                        <p className="text-[14px] font-black text-slate-400 uppercase tracking-[0.2em]">當前知識庫清單</p>
                        <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">{documents.length} FILES</span>
                    </div>

                    {documents.length > 0 ? (
                        <div className="space-y-4">
                            {documents.map((doc) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={doc.id} 
                                    className="p-8 rounded-[24px] bg-white/60 backdrop-blur-md   flex items-center justify-between hover:bg-white/80 transition-all group"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-[24px] bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-100">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[18px] font-black text-slate-900">{doc.name}</p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">{doc.size}</span>
                                                <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                                {doc.status === 'ready' ? (
                                                    <span className="text-[12px] font-black text-emerald-500 flex items-center gap-1.5 uppercase tracking-widest">
                                                        <CheckCircle2 className="w-4 h-4" /> 學習完成
                                                    </span>
                                                ) : (
                                                    <span className="text-[12px] font-black text-blue-500 flex items-center gap-1.5 animate-pulse uppercase tracking-widest">
                                                        <RefreshCw className="w-4 h-4 animate-spin" /> 正在閱讀
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => removeDoc(doc.id)}
                                        className="p-3 rounded-[24px] opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                                        title="移除此文件"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 border-2 border-dotted border-slate-200 rounded-[24px] flex flex-col items-center justify-center text-center opacity-40 bg-white/20">
                            <Database className="w-12 h-12 text-slate-300 mb-4" />
                            <p className="text-[15px] font-black text-slate-400 uppercase tracking-widest">尚無學習資料，請從左側上傳</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import { cn } from '@/lib/utils';
import { RefreshCw, X } from 'lucide-react';
