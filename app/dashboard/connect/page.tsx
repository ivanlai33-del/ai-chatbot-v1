'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCw, Star, MoveRight, Key, Bot, ShieldCheck, CheckCircle2, Sparkles, Loader2, LogIn, ArrowLeft } from 'lucide-react';
import ConnectLayout from '@/components/dashboard/connect/ConnectLayout';

// Hooks
import { useSyncSession } from '@/hooks/useSyncSession';
import { supabase } from '@/lib/supabase';

// Shared Components
import ManualSyncPanel from '@/components/dashboard/connect/ManualSyncPanel';
import AIGuideChat from '@/components/dashboard/connect/AIGuideChat';
import ConnectionStatusDashboard from '@/components/dashboard/connect/ConnectionStatusDashboard';
import ConnectSuccess from '@/components/dashboard/connect/ConnectSuccess';

interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
}

function LineConnectPageContent() {
    const searchParams = useSearchParams();
    const isNewAction = searchParams.get('action') === 'new';

    const [view, setView] = useState<'sync' | 'success'>('sync');
    const [manualData, setManualData] = useState({ channelId: '', channelSecret: '', channelAccessToken: '', botBasicId: '' });
    const [botInfo, setBotInfo] = useState<{ id: string, name: string } | null>(null);
    const [extraCollected, setExtraCollected] = useState({ id: false, sec: false, tok: false, bot: false });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const isStartingRef = React.useRef(false);

    const {
        setupToken,
        configId,
        syncStatus,
        bookmarkletHref,
        connectionData,
        fetchSetupSession,
        setConnectionData,
        collected
    } = useSyncSession();

    useEffect(() => {
        supabase.auth.getUser()
            .then(({ data }) => {
                setUser(data.user);
            })
            .finally(() => {
                setAuthLoading(false);
            });
    }, []);

    // ⚡ Auto-Fill from Bookmarklet Draft Logic 
    useEffect(() => {
        const urlBotId = searchParams.get('botId');
        async function loadData() {
            let targetBotId = urlBotId;
            if (!targetBotId && user) {
                const { data: latest } = await supabase
                    .from('bots')
                    .select('id, store_name')
                    .eq('owner_line_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();
                if (latest) targetBotId = latest.id;
            }

            if (targetBotId) {
                fetch(`/api/line/keys?botId=${targetBotId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && !data.error) {
                            setManualData({
                                channelId: data.channel_id || '', 
                                channelSecret: data.channel_secret || '',
                                channelAccessToken: data.channel_access_token || '',
                                botBasicId: data.bot_basic_id || '',
                            });
                            setExtraCollected({ id: !!data.channel_id, sec: !!data.channel_secret, tok: !!data.channel_access_token, bot: !!data.bot_basic_id });
                        }
                    });

                supabase.from('bots').select('store_name').eq('id', targetBotId).single()
                    .then(({ data }) => {
                        if (data) setBotInfo({ id: targetBotId, name: data.store_name });
                    });
            }
        }
        if (!authLoading && user) loadData();
    }, [searchParams, user, authLoading]);

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleStartSetup = useCallback(async (botId?: string) => {
        if (isStartingRef.current) return;
        isStartingRef.current = true;
        setError(null);
        try {
            const res = await fetchSetupSession(botId);
            if (res.success) setView('sync');
            else setError(res.error || '無法取得連線金鑰');
        } finally {
            isStartingRef.current = false;
        }
    }, [fetchSetupSession]);

    useEffect(() => {
        if (view === 'sync' && !authLoading && !setupToken && !error) {
            const botId = searchParams.get('botId');
            handleStartSetup(botId || undefined);
            if (isNewAction) {
                window.history.replaceState({}, '', '/dashboard/connect');
            }
        }
    }, [view, authLoading, setupToken, error, isNewAction, searchParams, handleStartSetup]);

    useEffect(() => {
        const hasBasic = (collected?.id || extraCollected.id) && (collected?.sec || extraCollected.sec);
        const hasToken = (collected?.tok || extraCollected.tok);

        if (syncStatus === 'success') {
            setChatMessages([{ role: 'ai', content: '🎉 恭喜！同步已完成！您的店長已成功與 LINE 連接！' }]);
        } else if (syncStatus === 'automated') {
             setChatMessages([{ role: 'ai', content: '⚡ 偵測到自動同步！請務必回到 LINE Developers 點擊【Verify】測試合法性。' }]);
        } else if (syncStatus === 'error') {
            setChatMessages([{ role: 'ai', content: '⚠️ 權杖過期 (E302)。請移除舊書籤並重新拖曳新書籤。' }]);
        } else if (hasBasic && !hasToken) {
            setChatMessages([{ role: 'ai', content: '✅ 已捕捉到基本設定。請至 Messaging API 分頁點擊 Issue 權仗後再次點擊書籤。' }]);
        }
    }, [collected, syncStatus, extraCollected]);

    const handleManualSubmit = async () => {
        const hasAll = manualData.channelId && manualData.channelSecret && manualData.channelAccessToken && manualData.botBasicId;
        if (!hasAll) { alert('請填寫所有必要欄位'); return; }
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/line/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ setupToken, ...manualData, isManual: true })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || '同步失敗');
            setConnectionData(data.config || manualData);
            setView('success');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderBookmarkletButton = () => {
        if (authLoading || !setupToken) return <div className="animate-pulse h-12 bg-slate-200 rounded-xl" />;
        return (
            <motion.a 
                href={bookmarkletHref}
                className="w-full py-5 rounded-[24px] font-black text-xl text-white flex items-center justify-center gap-3 shadow-xl bg-gradient-to-r from-sky-400 to-blue-600">
                <Star className="w-6 h-6 fill-white" />
                ✨ AI店長設定專用書籤
            </motion.a>
        );
    };

    const isReadyToSubmit = (collected?.id || extraCollected.id) && (collected?.sec || extraCollected.sec) && (collected?.tok || extraCollected.tok);

    return (
        <ConnectLayout 
            onBack={() => window.location.href = '/dashboard'}
            title="串接您的 AI 店長"
            hideHeaderBack={true}
        >
            <AnimatePresence mode="wait">
                {view === 'sync' ? (
                    <div className="flex flex-col gap-0">
                        {/* --- NEW REPOSITIONED BACK BUTTON --- */}
                        <div className="mb-3 px-1">
                            <button 
                                onClick={() => window.location.href = '/dashboard'}
                                className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-all font-bold text-[13px] bg-white hover:bg-slate-50 px-4 py-2 rounded-[5px] border border-slate-200 shadow-sm"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                返回
                            </button>
                        </div>
                        
                        {/* --- TOP HEADER DASHBOARD (SLIM VERSION) --- */}
                        <div className="bg-white rounded-[5px] shadow-lg border border-slate-200 overflow-hidden mb-2">
                            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                <div className="p-3 flex items-center gap-4 min-w-[220px]">
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                                        <Bot className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-[16px] font-black text-slate-800 leading-tight">串接進度</h3>
                                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                            {botInfo?.name ? `正在設定「${botInfo.name}」` : '正在偵測店家...'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 p-3 flex items-center justify-center bg-slate-50/20">
                                    <div className="flex items-center gap-6 lg:gap-14">
                                        <div className={`flex flex-col items-center gap-0.5 ${extraCollected.id && extraCollected.sec ? 'text-emerald-500' : 'text-slate-300'}`}>
                                            <ShieldCheck className="w-4 h-4" />
                                            <span className="text-[9px] font-bold">基本資料</span>
                                        </div>
                                        <div className="w-8 h-[1px] bg-slate-200" />
                                        <div className={`flex flex-col items-center gap-0.5 ${extraCollected.tok ? 'text-emerald-500' : 'text-slate-300'}`}>
                                            <Key className="w-4 h-4" />
                                            <span className="text-[9px] font-bold">API 金鑰</span>
                                        </div>
                                        <div className="w-8 h-[1px] bg-slate-200" />
                                        <div className={`flex flex-col items-center gap-0.5 ${syncStatus === 'automated' ? 'text-blue-500' : 'text-slate-300'}`}>
                                            <Star className="w-4 h-4" />
                                            <span className="text-[9px] font-bold">書籤同步</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 min-w-[240px] bg-white flex flex-col justify-center gap-1 border-l border-slate-100">
                                    <button 
                                        onClick={handleManualSubmit}
                                        disabled={!isReadyToSubmit || isSubmitting}
                                        className={`w-full py-2.5 rounded-[5px] text-[13px] font-black shadow-lg transition-all flex items-center justify-center gap-2 ${
                                            isReadyToSubmit 
                                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-100 hover:scale-[1.02] active:scale-95' 
                                                : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                                        }`}
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (isReadyToSubmit ? '🚀 確認手動開通機器人' : '待偵測完成')}
                                    </button>
                                    {isReadyToSubmit && (
                                        <div className="flex items-center justify-center gap-1 animate-pulse text-orange-500">
                                            <p className="text-[8px] font-black uppercase tracking-tight">
                                                請確保 LINE 後台 Verify 已成功 💡
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col xl:flex-row gap-5 items-start">
                            <AIGuideChat 
                                messages={chatMessages} 
                                collected={collected}
                                syncStatus={syncStatus}
                                renderBookmarkButton={renderBookmarkletButton}
                                botName={botInfo?.name}
                            />

                            <div className="flex-1 w-full space-y-5">
                                <div className="bg-white p-6 pb-[20px] rounded-[5px] shadow-xl border border-slate-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex flex-col">
                                            <h3 className="text-[19px] font-black text-slate-800 tracking-tight leading-none mb-1">
                                                Line官方帳號店長金鑰
                                            </h3>
                                            <div className="flex items-center gap-2 mt-3">
                                                <button 
                                                    onClick={() => {
                                                        const botId = searchParams.get('botId') || botInfo?.id;
                                                        if (botId) {
                                                            fetch(`/api/line/keys?botId=${botId}`)
                                                                .then(res => res.json())
                                                                .then(data => {
                                                                    if (data && !data.error) {
                                                                        setManualData({
                                                                            channelId: data.channel_id || '',
                                                                            channelSecret: data.channel_secret || '',
                                                                            channelAccessToken: data.channel_access_token || '',
                                                                            botBasicId: data.bot_basic_id || '',
                                                                        });
                                                                        setExtraCollected({ id: !!data.channel_id, sec: !!data.channel_secret, tok: !!data.channel_access_token, bot: !!data.bot_basic_id });
                                                                    }
                                                                });
                                                        }
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-[10px] font-black transition-all"
                                                >
                                                    <RefreshCw className="w-3 h-3" />
                                                    重新偵測同步
                                                </button>
                                                <p className="text-[9px] text-slate-400 font-bold leading-tight">書籤結束後按此重整 💡</p>
                                            </div>
                                        </div>
                                    </div>

                                    <ManualSyncPanel 
                                        manualData={manualData} 
                                        webhookUrl={connectionData?.webhookUrl || (configId ? `${window.location.origin}/api/line/webhook/${configId}` : '')}
                                        setManualData={setManualData} 
                                        handleManualSubmit={handleManualSubmit} 
                                        isSubmitting={isSubmitting} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <ConnectSuccess 
                        connectionData={connectionData} 
                        onBackToHub={() => window.location.href = '/dashboard'} 
                    />
                )}
            </AnimatePresence>
        </ConnectLayout>
    );
}

export default function LineConnectPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LineConnectPageContent />
        </Suspense>
    );
}
