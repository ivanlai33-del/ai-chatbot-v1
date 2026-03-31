import React from 'react';
import { Bot, CheckCircle2, ShieldCheck, Key, Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConnectionStatusDashboardProps {
    collected?: { id?: boolean; sec?: boolean; bot?: boolean; tok?: boolean };
    syncStatus?: 'waiting' | 'syncing' | 'success' | 'error' | 'automated';
    botName?: string;
}

export default function ConnectionStatusDashboard({ collected, syncStatus, botName }: ConnectionStatusDashboardProps) {
    const hasBasic = collected?.id && collected?.sec;
    const hasToken = collected?.tok;
    const isBookmarkDone = syncStatus === 'automated' || syncStatus === 'success';
    const isActive = syncStatus === 'success';

    const getStatusLabel = () => {
        if (isActive) return { label: '已開通', color: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' };
        if (syncStatus === 'automated') return { label: '待手動驗證', color: 'bg-blue-500', text: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' };
        if (hasBasic && hasToken) return { label: '待核對', color: 'bg-cyan-500', text: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-100' };
        if (hasBasic || hasToken) return { label: '資料收集成功', color: 'bg-amber-500', text: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' };
        return { label: '未開通', color: 'bg-slate-300', text: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200' };
    };

    const status = getStatusLabel();

    return (
        <div className="w-full bg-white border border-slate-200 rounded-[5px] shadow-xl overflow-hidden mb-8 sticky top-[84px] z-30">
            <div className="flex flex-col md:flex-row items-stretch">
                
                {/* 1. Bot Info Section */}
                <div className="p-6 md:p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 min-w-[280px]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-[5px] flex items-center justify-center transition-all ${isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-100'}`}>
                            <Bot className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        </div>
                        <div>
                            <h3 className="text-[20px] font-black text-slate-800 tracking-tight leading-none">串接狀態</h3>
                            <p className="text-[12px] font-bold text-slate-400 mt-1 truncate max-w-[180px]">
                                {botName || '正在載入店家資訊...'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Checkpoints Section (Horizontal Grid) */}
                <div className="flex-1 p-6 md:px-8 bg-slate-50/30 flex items-center">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                        {/* Part 1: Basic */}
                        <div className="flex items-center gap-4 group">
                            <div className={`w-10 h-10 rounded-[5px] flex items-center justify-center border transition-all ${hasBasic ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-100' : 'bg-white border-slate-200'}`}>
                                <ShieldCheck className={`w-5 h-5 ${hasBasic ? 'text-white' : 'text-slate-300'}`} />
                            </div>
                            <div>
                                <p className={`text-[10px] font-black uppercase tracking-wider ${hasBasic ? 'text-emerald-600' : 'text-slate-400'}`}>基本資料</p>
                                <p className={`text-[14px] font-black ${hasBasic ? 'text-slate-800' : 'text-slate-300'}`}>{hasBasic ? '已就緒' : '待提供'}</p>
                            </div>
                            {hasBasic && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto mr-4 hidden lg:block" />}
                        </div>

                        {/* Part 2: Token */}
                        <div className="flex items-center gap-4 group">
                            <div className={`w-10 h-10 rounded-[5px] flex items-center justify-center border transition-all ${hasToken ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-100' : 'bg-white border-slate-200'}`}>
                                <Key className={`w-5 h-5 ${hasToken ? 'text-white' : 'text-slate-300'}`} />
                            </div>
                            <div>
                                <p className={`text-[10px] font-black uppercase tracking-wider ${hasToken ? 'text-emerald-600' : 'text-slate-400'}`}>API 金鑰</p>
                                <p className={`text-[14px] font-black ${hasToken ? 'text-slate-800' : 'text-slate-300'}`}>{hasToken ? '已就緒' : '待提供'}</p>
                            </div>
                            {hasToken && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto mr-4 hidden lg:block" />}
                        </div>

                        {/* Part 3: Bookmark */}
                        <div className="flex items-center gap-4 group">
                            <div className={`w-10 h-10 rounded-[5px] flex items-center justify-center border transition-all ${isBookmarkDone ? 'bg-sky-500 border-sky-400 shadow-lg shadow-sky-100' : 'bg-white border-slate-200'}`}>
                                <Star className={`w-5 h-5 ${isBookmarkDone ? 'text-white' : 'text-slate-300'}`} />
                            </div>
                            <div>
                                <p className={`text-[10px] font-black uppercase tracking-wider ${isBookmarkDone ? 'text-sky-600' : 'text-slate-400'}`}>書籤同步</p>
                                <p className={`text-[14px] font-black ${isBookmarkDone ? 'text-slate-800' : 'text-slate-300'}`}>{isBookmarkDone ? '已同步' : '待觸發'}</p>
                            </div>
                            {isBookmarkDone && <CheckCircle2 className="w-4 h-4 text-sky-500 ml-auto mr-4 hidden lg:block" />}
                        </div>
                    </div>
                </div>

                {/* 3. Final Status Badge Section */}
                <div className={`p-6 md:p-8 flex items-center justify-center md:justify-end border-t md:border-t-0 md:border-l border-slate-100 min-w-[200px] ${status.bg}`}>
                    <div className="flex flex-col items-center md:items-end gap-1">
                        <div className={`px-5 py-2.5 rounded-[5px] border-2 shadow-sm flex items-center gap-3 transition-all ${status.border} bg-white`}>
                            <div className="relative">
                                <span className={`block w-2.5 h-2.5 rounded-full ${status.color}`} />
                                {!isActive && syncStatus !== 'error' && (
                                    <span className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${status.color} animate-ping`} />
                                )}
                            </div>
                            <span className={`text-[18px] font-black uppercase tracking-wider ${status.text}`}>{status.label}</span>
                        </div>
                        {isActive && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full mt-2">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Live Connection</span>
                            </div>
                        )}
                        {syncStatus === 'syncing' && (
                            <div className="flex items-center gap-2 mt-2">
                                <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                                <span className="text-[11px] font-bold text-blue-600">伺服器回應中...</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Progress Bar (Subtle) */}
            <div className="h-1 w-full bg-slate-100">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: isActive ? '100%' : syncStatus === 'automated' ? '90%' : hasBasic && hasToken ? '66%' : hasBasic || hasToken ? '33%' : '5%' }}
                    className={`h-full transition-all duration-1000 ${isActive ? 'bg-emerald-500' : isBookmarkDone ? 'bg-sky-500' : 'bg-amber-500'}`}
                />
            </div>
        </div>
    );
}
