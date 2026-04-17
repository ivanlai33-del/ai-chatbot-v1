'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Database, FileText, Globe, CheckCircle2, RefreshCw, X, Upload, AlertCircle, Info } from 'lucide-react';
import { getFeatureAccess, getRequiredPlanName, formatLimit } from '@/lib/feature-access';

interface RAGTabProps {
    planLevel: number;
    bots: any[];
    selectedBotId: string | null;
}

const MAX_SIZE_MB = 5;
const ALLOWED_EXTENSIONS = ['pdf', 'txt'];

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function RAGTab({ planLevel, bots, selectedBotId }: RAGTabProps) {
    const fa = getFeatureAccess(planLevel);
    const pdfLimit = fa.pdfLearning; // 0 = 關閉, -1 = 無限
    const webLimit = fa.webLearning;  // 0 = 關閉, -1 = 無限
    const isPdfLocked = pdfLimit === 0;
    const isWebLocked = webLimit === 0;

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
        if (selectedBotId && pdfLimit > 0) fetchDocuments();
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
        const maxFiles = pdfLimit === -1 ? 9999 : pdfLimit;
        if (documents.filter(d => d.status !== 'error').length >= maxFiles) {
            setUploadError(`此方案最多 ${formatLimit(pdfLimit)} 份文件，請先刪除舊文件`);
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

    // ── PDF 學習權限封鎖畫面 ──
    if (isPdfLocked) {
        return (
            <div className="py-16 flex flex-col items-center justify-center text-center px-10 bg-white/10 backdrop-blur-md rounded-[24px] shadow-sm">
                <div className="w-24 h-24 rounded-[24px] bg-white/60 flex items-center justify-center mb-8 shadow-2xl">
                    <Lock className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
                </div>
                <h3 className="text-[28px] font-black text-slate-900 mb-4">PDF / 網頁學習尚未開通</h3>
                <p className="text-[16px] text-slate-600 max-w-lg mb-8 font-bold leading-relaxed">
                    此功能限 <span className="text-emerald-600">{getRequiredPlanName('pdfLearning', 1)}</span> 以上使用，升級後可讓 AI 自動讀懂您的型錄與說明書，精準回答客人問題。
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

    const [webUrl, setWebUrl] = useState('');
    const [syncLoading, setSyncLoading] = useState(false);

    const handleWebSync = async () => {
        if (!webUrl || !selectedBotId) return;
        setUploadError('');
        setSyncLoading(true);

        try {
            const res = await fetch('/api/admin/crawler/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    botId: selectedBotId,
                    userId: userId,
                    targetUrl: webUrl
                })
            });
            const data = await res.json();
            if (!res.ok) {
                setUploadError(data.error || '同步失敗');
            } else {
                setWebUrl('');
                await fetchDocuments();
                startPolling(); // 開始輪詢狀態
            }
        } catch {
            setUploadError('網路錯誤，請稍後再試');
        } finally {
            setSyncLoading(false);
        }
    };

    const maxFiles = pdfLimit === -1 ? 9999 : pdfLimit;
    const readyCount = documents.filter(d => d.status === 'ready').length;
    const isLimitReached = documents.filter(d => d.status !== 'error').length >= maxFiles;

    return (
        <div className="space-y-6">

            {/* 說明橫幅 */}
            <div className="flex items-start gap-4 p-5 rounded-[20px] bg-blue-50 border border-blue-200">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                    <p className="text-[13px] font-black text-blue-800 mb-1">📚 店長智庫 — AI 向量語意學習</p>
                    <p className="text-[12px] text-blue-700 leading-relaxed">
                        上傳文件或同步網頁後，AI 會自動學習內容。
                        支援 <span className="font-black">PDF、TXT、網頁 URL</span>，單檔上限 <span className="font-black">{MAX_SIZE_MB}MB</span>。
                    </p>
                </div>
            </div>

            {/* 上傳與同步區 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <div className="lg:col-span-5 space-y-4">
                    {/* PDF 上傳卡片 */}
                    <label className={`relative flex flex-col items-center justify-center gap-6 p-8 rounded-[24px] border-2 border-dashed transition-all cursor-pointer group
                        ${isLimitReached ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed' : uploading ? 'border-cyan-400 bg-cyan-50 animate-pulse' : 'border-emerald-300 bg-white/60 hover:border-emerald-400 hover:bg-white hover:shadow-lg'}`}
                    >
                        <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center shadow-md transition-transform group-hover:scale-105 ${uploading ? 'bg-cyan-100' : 'bg-white'}`}>
                            {uploading ? <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" /> : <Upload className="w-8 h-8 text-emerald-500" />}
                        </div>
                        <div className="text-center">
                            <p className="text-[16px] font-black text-slate-900">{uploading ? 'AI 正在讀書...' : '點擊上傳 PDF / TXT'}</p>
                        </div>
                        {!isLimitReached && !uploading && <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.txt" onChange={handleFileUpload} />}
                    </label>

                    {/* 網頁同步卡片 */}
                    <div className={`p-6 rounded-[24px] border-2 transition-all ${isWebLocked ? 'bg-slate-50 border-slate-100' : 'bg-white/60 border-indigo-200 hover:shadow-lg'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isWebLocked ? 'bg-slate-200' : 'bg-indigo-100'}`}>
                                {isWebLocked ? <Lock className="w-5 h-5 text-slate-400" /> : <Globe className="w-5 h-5 text-indigo-600" />}
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900">網頁自動同步</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">輸入官網 URL 讓 AI 學習</p>
                            </div>
                        </div>

                        {isWebLocked ? (
                            <button onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'billing' }))} className="w-full py-3 rounded-xl bg-slate-200 text-slate-500 text-xs font-black hover:bg-indigo-500 hover:text-white transition-all">
                                升級方案解鎖功能 →
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <input 
                                    type="url" 
                                    placeholder="https://example.com"
                                    value={webUrl}
                                    onChange={(e) => setWebUrl(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                                <button 
                                    onClick={handleWebSync}
                                    disabled={syncLoading || !webUrl}
                                    className="w-full py-3 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                                >
                                    {syncLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                    {syncLoading ? '正在巡視網頁...' : '啟動同步'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 文件清單 */}
                <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center justify-between px-1 mb-2">
                        <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">已學習知識列表 ({readyCount} / {formatLimit(pdfLimit)})</p>
                        <button onClick={fetchDocuments} className="text-[11px] font-black text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5" /> 重新整理
                        </button>
                    </div>

                    {loading && documents.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-sm">載入中...</div>
                    ) : documents.length === 0 ? (
                        <div className="py-16 border-2 border-dashed border-slate-200 rounded-[24px] flex flex-col items-center justify-center text-center opacity-50">
                            <Database className="w-10 h-10 text-slate-300 mb-3" />
                            <p className="text-[14px] font-black text-slate-400">智庫尚無知識</p>
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
                                    className="p-4 rounded-[20px] bg-white border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                        {doc.file_type === 'web' ? <Globe className="w-4 h-4 text-indigo-500" /> : <FileText className="w-4 h-4 text-slate-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-black text-slate-900 truncate">{doc.file_name}</p>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{doc.file_type}</span>
                                            {doc.last_scraped_at && <span className="text-[10px] text-slate-400">同步於 {new Date(doc.last_scraped_at).toLocaleDateString()}</span>}
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-2">
                                        {doc.status === 'ready' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : doc.status === 'processing' ? <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                                        <button onClick={() => handleDelete(doc.id)} className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"><X className="w-4 h-4" /></button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
