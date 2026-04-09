'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Database, FileText, CheckCircle2, RefreshCw, X, Upload, AlertCircle, Info } from 'lucide-react';

interface RAGTabProps {
    planLevel: number;
    bots: any[];
    selectedBotId: string | null;
}

const MAX_FILES = 5;
const MAX_SIZE_MB = 5;
const ALLOWED_EXTENSIONS = ['pdf', 'txt'];

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function RAGTab({ planLevel, bots, selectedBotId }: RAGTabProps) {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [userId, setUserId] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    // 取得 userId from cookie
    useEffect(() => {
        const getCookie = (name: string) => {
            const match = document.cookie.split('; ').find(r => r.startsWith(name + '='));
            return match ? decodeURIComponent(match.split('=')[1]) : '';
        };
        setUserId(getCookie('line_user_id') || localStorage.getItem('line_user_id') || '');
    }, []);

    useEffect(() => {
        if (selectedBotId && planLevel >= 2) fetchDocuments();
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [selectedBotId, planLevel]);

    const fetchDocuments = async () => {
        if (!selectedBotId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/rag/upload?botId=${selectedBotId}`);
            const data = await res.json();
            if (data.documents) setDocuments(data.documents);
        } catch {}
        setLoading(false);
    };

    // 輪詢等待 processing 狀態完成
    const startPolling = () => {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
            const res = await fetch(`/api/rag/upload?botId=${selectedBotId}`);
            const data = await res.json();
            if (data.documents) {
                setDocuments(data.documents);
                const stillProcessing = data.documents.some((d: any) => d.status === 'processing');
                if (!stillProcessing) {
                    clearInterval(pollRef.current!);
                    pollRef.current = null;
                }
            }
        }, 3000);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedBotId || !userId) return;

        setUploadError('');

        // 前端驗證
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            setUploadError(`僅支援 ${ALLOWED_EXTENSIONS.join('、')} 格式`);
            return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setUploadError(`檔案大小超過 ${MAX_SIZE_MB}MB 上限`);
            return;
        }
        if (documents.filter(d => d.status !== 'error').length >= MAX_FILES) {
            setUploadError(`每個店長最多 ${MAX_FILES} 份文件，請先刪除舊文件`);
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('botId', selectedBotId);
        formData.append('userId', userId);

        try {
            const res = await fetch('/api/rag/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) {
                setUploadError(data.error || '上傳失敗，請稍後再試');
            } else {
                await fetchDocuments();
                startPolling(); // 開始輪詢，等待 AI 學習完成
            }
        } catch {
            setUploadError('網路錯誤，請稍後再試');
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = async (docId: string) => {
        if (!confirm('確定要刪除此文件？刪除後 AI 將無法再使用其中的知識。')) return;
        try {
            await fetch(`/api/rag/upload?docId=${docId}`, { method: 'DELETE' });
            setDocuments(prev => prev.filter(d => d.id !== docId));
        } catch {
            alert('刪除失敗，請稍後再試');
        }
    };

    // ── 未升級封鎖畫面 ──────────────────────────────
    if (planLevel < 2) {
        return (
            <div className="py-16 flex flex-col items-center justify-center text-center px-10 bg-white/10 backdrop-blur-md rounded-[24px] shadow-sm">
                <div className="w-24 h-24 rounded-[24px] bg-white/60 flex items-center justify-center mb-8 shadow-2xl">
                    <Lock className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
                </div>
                <h3 className="text-[28px] font-black text-slate-900 mb-4">PDF / 網頁學習尚未開通</h3>
                <p className="text-[16px] text-slate-600 max-w-lg mb-8 font-bold leading-relaxed">
                    此功能限 <span className="text-emerald-600">旗艦版</span> 以上使用，升級後可讓 AI 自動讀懂您的型錄與說明書，精準回答客人問題。
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-sm mb-8 text-left">
                    {[
                        { icon: FileText, title: '上傳 PDF 型錄', desc: '商品型錄、服務說明、價格表' },
                        { icon: Database, title: 'AI 語意學習', desc: '向量搜尋，問什麼都能精準回答' },
                    ].map(f => (
                        <div key={f.title} className="p-4 rounded-[20px] bg-white border border-slate-100 flex items-start gap-3">
                            <f.icon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[12px] font-black text-slate-700">{f.title}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'billing' }))}
                    className="px-10 py-4 rounded-[16px] bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black text-[15px] shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                    立即升級解鎖 →
                </button>
            </div>
        );
    }

    const readyCount = documents.filter(d => d.status === 'ready').length;
    const isLimitReached = documents.filter(d => d.status !== 'error').length >= MAX_FILES;

    return (
        <div className="space-y-6">

            {/* 說明橫幅 */}
            <div className="flex items-start gap-4 p-5 rounded-[20px] bg-blue-50 border border-blue-200">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                    <p className="text-[13px] font-black text-blue-800 mb-1">📚 PDF 知識庫 — AI 向量語意學習</p>
                    <p className="text-[12px] text-blue-700 leading-relaxed">
                        上傳文件後，AI 會將內容切分成小段落並生成向量索引。當客人發問時，AI 會自動搜尋最相關的段落作為回答參考。
                        支援 <span className="font-black">PDF、TXT、DOCX</span>，單檔上限 <span className="font-black">5MB</span>，最多 <span className="font-black">5 份</span>。
                    </p>
                </div>
            </div>

            {/* 上傳錯誤提示 */}
            <AnimatePresence>
                {uploadError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 p-4 rounded-[16px] bg-red-50 border border-red-200"
                    >
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <p className="text-[13px] font-black text-red-700">{uploadError}</p>
                        <button onClick={() => setUploadError('')} className="ml-auto text-red-400 hover:text-red-600">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 上傳區 */}
                <div className="lg:col-span-5">
                    <label className={`relative flex flex-col items-center justify-center gap-6 p-10 rounded-[24px] border-2 border-dashed transition-all cursor-pointer group
                        ${isLimitReached
                            ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                            : uploading
                                ? 'border-cyan-400 bg-cyan-50 animate-pulse'
                                : 'border-emerald-300 bg-white/60 hover:border-emerald-400 hover:bg-white hover:shadow-lg'
                        }`}
                    >
                        <div className={`w-20 h-20 rounded-[20px] flex items-center justify-center shadow-md transition-transform group-hover:scale-105
                            ${uploading ? 'bg-cyan-100' : 'bg-white'}`}
                        >
                            {uploading
                                ? <RefreshCw className="w-9 h-9 text-cyan-500 animate-spin" />
                                : <Upload className="w-9 h-9 text-emerald-500" />
                            }
                        </div>

                        <div className="text-center">
                            <p className="text-[18px] font-black text-slate-900">
                                {uploading ? 'AI 正在學習中...' : isLimitReached ? '已達文件上限' : '點擊上傳文件'}
                            </p>
                            <p className="text-[12px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                                {uploading ? '分析中，請稍候' : 'PDF · TXT · DOCX · 最大 5MB'}
                            </p>
                        </div>

                        {/* 配額指示 */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-black
                            ${isLimitReached ? 'bg-red-100 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}
                        >
                            <div className={`w-2 h-2 rounded-full ${isLimitReached ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            {readyCount} / {MAX_FILES} 份已學習
                        </div>

                        {!isLimitReached && !uploading && (
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept=".pdf,.txt"
                                onChange={handleFileUpload}
                            />
                        )}
                    </label>

                    {/* 格式說明 */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {[
                            { ext: 'PDF', desc: '型錄、合約', color: 'text-red-600 bg-red-50' },
                            { ext: 'TXT', desc: 'Q&A、說明文字', color: 'text-slate-600 bg-slate-50' },
                        ].map(f => (
                            <div key={f.ext} className={`p-3 rounded-[14px] border ${f.color} text-center`}>
                                <p className="text-[13px] font-black">{f.ext}</p>
                                <p className="text-[10px] mt-0.5 opacity-70">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 文件清單 */}
                <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center justify-between px-1 mb-2">
                        <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">知識庫文件清單</p>
                        <button onClick={fetchDocuments} className="text-[11px] font-black text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5" /> 重新整理
                        </button>
                    </div>

                    {loading && documents.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-sm">載入中...</div>
                    ) : documents.length === 0 ? (
                        <div className="py-16 border-2 border-dashed border-slate-200 rounded-[24px] flex flex-col items-center justify-center text-center opacity-50">
                            <Database className="w-10 h-10 text-slate-300 mb-3" />
                            <p className="text-[14px] font-black text-slate-400">尚無文件，請從左側上傳</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {documents.map(doc => (
                                <motion.div
                                    key={doc.id}
                                    layout
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="p-5 rounded-[20px] bg-white border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all"
                                >
                                    {/* 檔案圖示 */}
                                    <div className="w-12 h-12 rounded-[14px] bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5 text-slate-400" />
                                    </div>

                                    {/* 文件資訊 */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] font-black text-slate-900 truncate">{doc.file_name}</p>
                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                            <span className="text-[11px] text-slate-400 font-bold uppercase">{doc.file_type}</span>
                                            <span className="text-[11px] text-slate-400">{formatBytes(doc.file_size)}</span>
                                            {doc.chunk_count > 0 && (
                                                <span className="text-[11px] text-slate-400">{doc.chunk_count} 個段落</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* 狀態 */}
                                    <div className="shrink-0 mr-2">
                                        {doc.status === 'ready' && (
                                            <span className="flex items-center gap-1.5 text-[11px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> 學習完成
                                            </span>
                                        )}
                                        {doc.status === 'processing' && (
                                            <span className="flex items-center gap-1.5 text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full animate-pulse">
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> AI 學習中
                                            </span>
                                        )}
                                        {doc.status === 'error' && (
                                            <span className="flex items-center gap-1.5 text-[11px] font-black text-red-500 bg-red-50 px-3 py-1.5 rounded-full" title={doc.error_message}>
                                                <AlertCircle className="w-3.5 h-3.5" /> 學習失敗
                                            </span>
                                        )}
                                    </div>

                                    {/* 刪除 */}
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-2 rounded-[12px] opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                        title="刪除此文件"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
