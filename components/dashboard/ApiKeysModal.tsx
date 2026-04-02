'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, ShieldCheck, AlertCircle, Copy, Check, Save } from 'lucide-react';

interface ApiKeysModalProps {
    isOpen: boolean;
    onClose: () => void;
    botId: string;
    botName: string;
}

export default function ApiKeysModal({ isOpen, onClose, botId, botName }: ApiKeysModalProps) {
    const [keys, setKeys] = useState({ channel_secret: '', channel_access_token: '', bot_basic_id: '' });
    const [isSynced, setIsSynced] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showCopyMsg, setShowCopyMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && botId) {
            fetchKeys();
        }
    }, [isOpen, botId]);

    const fetchKeys = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/line/keys?botId=${botId}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setKeys(data);
            if (data.channel_secret || data.channel_access_token) {
                setIsSynced(true);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const res = await fetch('/api/line/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botId, ...keys }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setShowCopyMsg(type);
        setTimeout(() => setShowCopyMsg(null), 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <Key className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-[17px] font-black text-slate-800 leading-tight">進階 API 金鑰設定</h3>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{botName}</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                            title="關閉"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-7 space-y-6">
                        {error && (
                            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-[13px] font-bold text-red-600 leading-relaxed">{error}</p>
                            </div>
                        )}

                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div className="text-[12px] font-bold text-amber-700 leading-relaxed">
                                這些金鑰是與 LINE 官方通訊的核心憑證。請小心保管，切勿洩漏給他人。
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-3">
                                <div className="w-8 h-8 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
                                <p className="text-[12px] font-bold text-slate-400">讀取中...</p>
                            </div>
                        ) : (
                            <>
                                {isSynced && (
                                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 mb-5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <div className="text-[12px] font-black text-emerald-700">已自動從書籤同步最新資料</div>
                                    </div>
                                )}

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Bot Basic ID</label>
                                        <input
                                            type="text"
                                            value={keys.bot_basic_id}
                                            onChange={e => setKeys(prev => ({ ...prev, bot_basic_id: e.target.value }))}
                                            placeholder="@..."
                                            className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-[13px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2 px-1">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Channel Secret</label>
                                            <button 
                                                onClick={() => copyToClipboard(keys.channel_secret, 'secret')}
                                                className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 hover:underline"
                                            >
                                                {showCopyMsg === 'secret' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                {showCopyMsg === 'secret' ? '已復制' : '點此復制'}
                                            </button>
                                        </div>
                                        <input
                                            type="password"
                                            value={keys.channel_secret}
                                            onChange={e => setKeys(prev => ({ ...prev, channel_secret: e.target.value }))}
                                            placeholder="LINE Developers 取得的引導字串"
                                            className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-[13px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 transition-all font-mono"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2 px-1">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Channel Access Token</label>
                                            <button 
                                                onClick={() => copyToClipboard(keys.channel_access_token, 'token')}
                                                className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 hover:underline"
                                            >
                                                {showCopyMsg === 'token' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                {showCopyMsg === 'token' ? '已復制' : '點此復制'}
                                            </button>
                                        </div>
                                        <textarea
                                            value={keys.channel_access_token}
                                            onChange={e => setKeys(prev => ({ ...prev, channel_access_token: e.target.value }))}
                                            placeholder="長度約 170+ 字元的權杖"
                                            rows={4}
                                            className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-[13px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 transition-all font-mono resize-none leading-relaxed"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-slate-500 hover:bg-slate-200 transition-all"
                        >
                            取消
                        </button>
                        <button
                            disabled={isLoading || isSaving}
                            onClick={handleSave}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-black text-white shadow-lg transition-all ${
                                isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 active:scale-95'
                            }`}
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {isSaving ? '儲存中...' : '儲存變更'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
