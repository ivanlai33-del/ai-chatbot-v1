'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldX, ShieldCheck, AlertTriangle, Search, 
    RefreshCw, Ban, Unlock, Filter, User,
    Clock, TrendingUp, ChevronDown
} from 'lucide-react';

interface PlatformUser {
    line_user_id: string;
    display_name: string | null;
    plan_level: number;
    is_banned: boolean;
    ban_reason: string | null;
    created_at: string;
    last_login_at: string | null;
    risk_score: number | null;
}

interface BanModalState {
    isOpen: boolean;
    user: PlatformUser | null;
    action: 'ban' | 'unban' | 'warn';
}

const PLAN_LABELS: Record<number, { label: string; color: string }> = {
    0: { label: '免費會員', color: 'text-slate-400 bg-slate-800' },
    1: { label: 'Pro 個人版', color: 'text-emerald-400 bg-emerald-950' },
    2: { label: '強力版', color: 'text-amber-400 bg-amber-950' },
};

const RISK_CONFIG = (score: number) => {
    if (score >= 75) return { label: '高風險', color: 'text-red-400 bg-red-950', bar: 'bg-red-500' };
    if (score >= 40) return { label: '中風險', color: 'text-amber-400 bg-amber-950', bar: 'bg-amber-500' };
    return { label: '正常', color: 'text-emerald-400 bg-emerald-950', bar: 'bg-emerald-500' };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function BlacklistPanel({ onDataUpdate }: { onDataUpdate?: (data: unknown) => void }) {
    const [users, setUsers] = useState<PlatformUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'banned' | 'active'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [modal, setModal] = useState<BanModalState>({ isOpen: false, user: null, action: 'ban' });
    const [banReason, setBanReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/blacklist?filter=${filter}`);
            const data = await res.json();
            if (data.success) setUsers(data.users);
            else showToast(data.error || '讀取失敗', 'error');
        } catch {
            showToast('網路連線失敗', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleAction = async () => {
        if (!modal.user) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/admin/blacklist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: modal.action,
                    lineUserId: modal.user.line_user_id,
                    reason: banReason || undefined
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message, 'success');
                setModal({ isOpen: false, user: null, action: 'ban' });
                setBanReason('');
                fetchUsers();
            } else {
                showToast(data.error || '操作失敗', 'error');
            }
        } catch {
            showToast('網路錯誤', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredUsers = users.filter(u => {
        if (!searchQuery) return true;
        return (
            u.line_user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.display_name || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const stats = {
        total: users.length,
        banned: users.filter(u => u.is_banned).length,
        highRisk: users.filter(u => (u.risk_score || 0) >= 75).length,
        active: users.filter(u => !u.is_banned).length,
    };

    const openModal = (user: PlatformUser, action: 'ban' | 'unban' | 'warn') => {
        setModal({ isOpen: true, user, action });
        setBanReason('');
    };

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: '全部用戶', value: stats.total, icon: User, color: 'text-slate-300', bg: 'bg-slate-800/50' },
                    { label: '正常運作', value: stats.active, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-950/50' },
                    { label: '已停權', value: stats.banned, icon: Ban, color: 'text-red-400', bg: 'bg-red-950/50' },
                    { label: '高風險警戒', value: stats.highRisk, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-950/50' },
                ].map((stat) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`${stat.bg} border border-white/5 rounded-2xl p-5 flex items-center gap-4`}
                    >
                        <div className={`p-2.5 rounded-xl bg-white/5`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white">{stat.value}</p>
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="搜尋 LINE ID 或顯示名稱..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-900/80 border border-white/5 rounded-2xl text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none transition-colors"
                    />
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center gap-2 bg-slate-900/80 border border-white/5 rounded-2xl p-1.5">
                    {(['all', 'active', 'banned'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                filter === f ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {f === 'all' ? '全部' : f === 'active' ? '正常' : '已停權'}
                        </button>
                    ))}
                </div>

                <button
                    onClick={fetchUsers}
                    aria-label="重新整理用戶清單"
                    className="p-3 bg-slate-900/80 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* User Table */}
            <div className="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-white/5">
                    {['用戶身份', '方案', '風險指標', '狀態', '操作'].map(h => (
                        <div key={h} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600">
                            <Filter className="w-3 h-3" />
                            {h}
                        </div>
                    ))}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-600">
                        <ShieldX className="w-12 h-12" />
                        <p className="text-sm font-bold">沒有符合的用戶記錄</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {filteredUsers.map((user, idx) => {
                            const risk = RISK_CONFIG(user.risk_score || 0);
                            const plan = PLAN_LABELS[user.plan_level] || PLAN_LABELS[0];
                            return (
                                <motion.div
                                    key={user.line_user_id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className={`grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 hover:bg-white/2 transition-colors ${
                                        user.is_banned ? 'opacity-60 bg-red-950/10' : ''
                                    }`}
                                >
                                    {/* 用戶身份 */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${user.is_banned ? 'bg-red-950' : 'bg-indigo-950'}`}>
                                            {user.is_banned
                                                ? <ShieldX className="w-4 h-4 text-red-400" />
                                                : <User className="w-4 h-4 text-indigo-400" />
                                            }
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-white truncate">
                                                {user.display_name || '未設定名稱'}
                                            </p>
                                            <p className="text-[10px] text-slate-600 font-mono truncate">{user.line_user_id}</p>
                                            {user.ban_reason && (
                                                <p className="text-[10px] text-red-400/80 truncate mt-0.5">🛑 {user.ban_reason}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* 方案 */}
                                    <div className="flex items-center">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${plan.color}`}>
                                            {plan.label}
                                        </span>
                                    </div>

                                    {/* 風險指標 */}
                                    <div className="flex flex-col justify-center gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${risk.color}`}>{risk.label}</span>
                                            <span className="text-[10px] text-slate-500">{user.risk_score ?? 0}/100</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                            <div
                                                className={`h-full ${risk.bar} rounded-full transition-all`}
                                                data-width={Math.min(user.risk_score || 0, 100)}
                                                ref={el => { if (el) el.style.width = `${Math.min(user.risk_score || 0, 100)}%`; }}
                                            />
                                        </div>
                                    </div>

                                    {/* 狀態 */}
                                    <div className="flex flex-col justify-center gap-1">
                                        {user.is_banned ? (
                                            <span className="flex items-center gap-1.5 text-[11px] font-black text-red-400">
                                                <Ban className="w-3 h-3" /> 已停權
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-[11px] font-black text-emerald-400">
                                                <ShieldCheck className="w-3 h-3" /> 正常
                                            </span>
                                        )}
                                        {user.last_login_at && (
                                            <span className="flex items-center gap-1 text-[9px] text-slate-600">
                                                <Clock className="w-2.5 h-2.5" />
                                                {new Date(user.last_login_at).toLocaleDateString('zh-TW')}
                                            </span>
                                        )}
                                    </div>

                                    {/* 操作按鈕 */}
                                    <div className="flex items-center gap-2">
                                        {!user.is_banned ? (
                                            <>
                                                <button
                                                    onClick={() => openModal(user, 'warn')}
                                                    title="警告（+25風險值）"
                                                    className="p-2 rounded-xl bg-amber-950/50 text-amber-400 hover:bg-amber-900/60 transition-all"
                                                >
                                                    <AlertTriangle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openModal(user, 'ban')}
                                                    title="立即停權"
                                                    className="p-2 rounded-xl bg-red-950/50 text-red-400 hover:bg-red-900/60 transition-all"
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => openModal(user, 'unban')}
                                                title="解除停權"
                                                className="p-2 rounded-xl bg-emerald-950/50 text-emerald-400 hover:bg-emerald-900/60 transition-all"
                                            >
                                                <Unlock className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Action Modal */}
            <AnimatePresence>
                {modal.isOpen && modal.user && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setModal({ isOpen: false, user: null, action: 'ban' })}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 10 }}
                            className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto ${
                                modal.action === 'ban' ? 'bg-red-950' :
                                modal.action === 'unban' ? 'bg-emerald-950' : 'bg-amber-950'
                            }`}>
                                {modal.action === 'ban' && <Ban className="w-7 h-7 text-red-400" />}
                                {modal.action === 'unban' && <Unlock className="w-7 h-7 text-emerald-400" />}
                                {modal.action === 'warn' && <AlertTriangle className="w-7 h-7 text-amber-400" />}
                            </div>

                            <h2 className="text-xl font-black text-white text-center mb-1">
                                {modal.action === 'ban' ? '🛑 確定停權此帳號？' :
                                 modal.action === 'unban' ? '✅ 解除帳號停權？' : '⚠️ 發出資安警告？'}
                            </h2>
                            <p className="text-sm text-slate-500 text-center mb-6">
                                {modal.user.display_name || '未設定名稱'} 
                                <span className="block text-[11px] font-mono mt-1 text-slate-600">{modal.user.line_user_id}</span>
                            </p>

                            {modal.action !== 'unban' && (
                                <div className="mb-6">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
                                        {modal.action === 'ban' ? '停權原因（可選）' : '警告原因（可選）'}
                                    </label>
                                    <textarea
                                        value={banReason}
                                        onChange={e => setBanReason(e.target.value)}
                                        placeholder={modal.action === 'ban' ? '例：多次嘗試越權存取、惡意洗版...' : '例：短時間內異常頻繁請求...'}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none resize-none"
                                    />
                                </div>
                            )}

                            {modal.action === 'warn' && (
                                <div className="mb-6 flex items-start gap-3 p-4 bg-amber-950/30 border border-amber-500/20 rounded-2xl">
                                    <TrendingUp className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-amber-300/80">
                                        此操作將增加 <strong>+25 風險值</strong>。當風險值達到 100 時，系統將<strong>自動永久停權</strong>該帳號。
                                        目前風險值：{modal.user.risk_score ?? 0}/100
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setModal({ isOpen: false, user: null, action: 'ban' })}
                                    className="flex-1 py-3 rounded-2xl bg-white/5 text-slate-300 text-sm font-black hover:bg-white/10 transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleAction}
                                    disabled={isSubmitting}
                                    className={`flex-1 py-3 rounded-2xl text-white text-sm font-black transition-all ${
                                        modal.action === 'ban' ? 'bg-red-500 hover:bg-red-600' :
                                        modal.action === 'unban' ? 'bg-emerald-500 hover:bg-emerald-600' :
                                        'bg-amber-500 hover:bg-amber-600'
                                    } disabled:opacity-50`}
                                >
                                    {isSubmitting ? '執行中...' : 
                                        modal.action === 'ban' ? '🛑 確認停權' :
                                        modal.action === 'unban' ? '✅ 確認解封' : '⚠️ 確認警告'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-2xl text-sm font-black text-white shadow-2xl z-[999] ${
                            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
                        }`}
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Extra bottom space for scroll */}
            <div className="h-12" />
        </div>
    );
}
