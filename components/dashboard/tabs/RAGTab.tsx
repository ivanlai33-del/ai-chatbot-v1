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
            <div className="py-16 flex flex-col items-center justify-center text-center px-10">
                <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                    <Lock className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">PDF / 網頁深度學習 (RAG) 尚未開通</h3>
                <p className="text-slate-500 max-w-sm mb-6 leading-relaxed">
                    此功能目前僅限於 <span className="text-amber-600 font-bold">Company 旗艦版</span> 用戶使用，升級後可讓 AI 自動讀懂您的型錄、說明書與官網內容。
                </p>

                {/* 功能預覽 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mb-8 text-left">
                    {[
                        { icon: FileText, title: '上傳 PDF 型錄', desc: '商品型錄、服務說明書、價格表' },
                        { icon: Globe, title: '貼入網頁網址', desc: '官網、菜單、房型介紹頁' },
                        { icon: Database, title: 'AI 自動學習', desc: '讀取完成，問什麼都能答' },
                    ].map(f => (
                        <div key={f.title} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <f.icon className="w-5 h-5 text-slate-400 mb-2" />
                            <p className="text-[12px] font-black text-slate-600">{f.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{f.desc}</p>
                        </div>
                    ))}
                </div>

                <motion.button 
                    onClick={() => window.location.href = '/#pricing'} 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-8 py-3 rounded-2xl bg-slate-800 text-white font-black text-sm shadow-xl"
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
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <Database className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            AI 智庫管理中心
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-600 text-[9px] font-black tracking-widest uppercase">Company Edition</span>
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">為 [{currentBot?.channelName || '此店長'}] 訓練專屬知識</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                    <span className="text-slate-400">已使用席位:</span>
                    <span className={isLimitReached ? "text-red-500" : "text-emerald-600"}>
                        {documents.length} / {MAX_FILES} 份
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 📤 Upload Zone */}
                <div className="lg:col-span-5 space-y-6">
                    <div className={cn(
                        "relative p-10 rounded-[32px] border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-4 group",
                        isLimitReached 
                            ? "bg-slate-50 border-slate-200 opacity-60" 
                            : "bg-emerald-50/10 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50/30"
                    )}>
                        <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center">
                            <FileText className={isLimitReached ? "text-slate-300" : "text-emerald-500"} />
                        </div>
                        <div>
                            <p className="font-black text-slate-700">上傳 AI 學習文件</p>
                            <p className="text-xs text-slate-400 mt-1">僅支援 PDF, DOCX (單一檔案上限 5MB)</p>
                        </div>

                        {!isLimitReached ? (
                            <label className="cursor-pointer">
                                <span className="mt-2 inline-block px-6 py-2.5 bg-emerald-500 text-white text-xs font-black rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                                    選擇檔案
                                </span>
                                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} />
                            </label>
                        ) : (
                            <p className="text-xs text-red-500 font-bold mt-2 flex items-center gap-1.5">
                                <X className="w-3 h-3" /> 席位已額滿，請移除舊檔
                            </p>
                        )}
                    </div>

                    <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 text-left">
                        <div className="flex items-center gap-2 text-amber-700 font-black text-xs mb-2">
                            <Globe className="w-4 h-4" /> 爬取網頁內容 (開發中)
                        </div>
                        <p className="text-xs text-amber-600/70 font-medium leading-relaxed">
                            未來將支援直接貼入官網網址，AI 將自動定期爬取並更新知識庫內容。
                        </p>
                    </div>
                </div>

                {/* 📜 Document List */}
                <div className="lg:col-span-7 space-y-4 text-left">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">當前知識庫資料夾</p>
                    {documents.length > 0 ? (
                        documents.map((doc) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={doc.id} 
                                className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800">{doc.name}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] font-bold text-slate-400">{doc.size}</span>
                                            {doc.status === 'ready' ? (
                                                <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> 深度學習完成
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black text-blue-500 flex items-center gap-1 animate-pulse">
                                                    <RefreshCw className="w-3 h-3 animate-spin" /> AI 正在閱讀中...
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => removeDoc(doc.id)}
                                    title="移除文件"
                                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-12 border-2 border-dotted border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-center opacity-50">
                            <Database className="w-8 h-8 text-slate-300 mb-2" />
                            <p className="text-xs font-bold text-slate-400">尚無學習資料，請從左側上傳</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import { cn } from '@/lib/utils';
import { RefreshCw, X } from 'lucide-react';
