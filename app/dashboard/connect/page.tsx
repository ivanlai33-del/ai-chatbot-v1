'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCw, Star, MoveRight, Key } from 'lucide-react';
import ConnectLayout from '@/components/dashboard/connect/ConnectLayout';

// Modular Components
import ManualSyncPanel from '@/components/dashboard/connect/ManualSyncPanel';
import AIGuideChat from '@/components/dashboard/connect/AIGuideChat';
import ConnectionStatusDashboard from '@/components/dashboard/connect/ConnectionStatusDashboard';
import ConnectSuccess from '@/components/dashboard/connect/ConnectSuccess';

// Hooks
import { useSyncSession } from '@/hooks/useSyncSession';
import { supabase } from '@/lib/supabase';

interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
}



function LineConnectPageContent() {
    const searchParams = useSearchParams();
    const isNewAction = searchParams.get('action') === 'new';

    const [view, setView] = useState<'sync' | 'success'>('sync');
    const [activeBrowser, setActiveBrowser] = useState<'chrome' | 'safari' | 'edge'>('chrome');
    const [manualData, setManualData] = useState({ channelId: '', channelSecret: '', channelAccessToken: '', botBasicId: '' });
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

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

    const [error, setError] = useState<string | null>(null);

    const handleStartSetup = useCallback(async (botId?: string) => {
        if (isStartingRef.current) return;
        isStartingRef.current = true;
        setError(null);
        
        try {
            const res = await fetchSetupSession(botId);
            if (res.success) {
                setView('sync');
            } else {
                setError(res.error || '無法取得連線金鑰');
            }
        } finally {
            isStartingRef.current = false;
        }
    }, [fetchSetupSession]);

    useEffect(() => {
        // Proceed when auth check is done (even if user is null, we use mock fallback)
        if (view === 'sync' && !authLoading && !setupToken && !error) {
            const botId = searchParams.get('botId');
            handleStartSetup(botId || undefined);
            
            if (isNewAction) {
                window.history.replaceState({}, '', '/dashboard/connect');
            }
        }
    }, [view, authLoading, setupToken, error, isNewAction, searchParams, handleStartSetup]);

    // ✨ 互動式輔導串接機制 (Interactive Connection Guidance)
    useEffect(() => {
        if (!collected) return;
        
        const hasBasic = collected.id && collected.sec;
        const hasToken = collected.tok;

        if (syncStatus === 'success') {
            setChatMessages([
                { role: 'ai', content: '🎉 ✨ 恭喜！同步已圓滿完成！您的店長已成功與 LINE 連接，現在您可以回到儀表板開始使用了！' }
            ]);
        } else if (syncStatus === 'automated') {
             setChatMessages([
                { role: 'ai', content: '⚡ 「AI店長設定專用書籤」已為您完成自動設定！\n\n👉 最後一步：請回到 LINE Developers 視窗，點擊「Webhook URL」旁邊的【Verify】按鈕，看到 Success 即代表連線成功！完成後請點擊下方的「驗證連線」狀態。' }
            ]);
        } else if (hasBasic && !hasToken) {
            setChatMessages([
                { role: 'ai', content: '✅ 太棒了！我已經成功捕捉到您的「Basic Settings」資料 (Channel ID & Secret)。\n\n👉 下一步：請切換到「Messaging API」分頁，點擊底部的 Issue 發行金鑰，然後【再次點擊書籤】！' }
            ]);
        } else if (!hasBasic && hasToken) {
            setChatMessages([
                { role: 'ai', content: '✅ 我收到您的 Access Token 了！\n\n👉 下一步：請記得切換回「Basic Settings」分頁，【再次點擊書籤】來補齊 Channel ID 與 Secret 喔！' }
            ]);
        } else if (hasBasic && hasToken) {
            setChatMessages([
                { role: 'ai', content: '🎉 資料蒐集完整！正在與 LINE 伺服器進行最終的安全核對，請稍候...' }
            ]);
        }
    }, [collected, syncStatus]);

    const remoteLink = typeof window !== 'undefined' ? `${window.location.origin}/connect/remote?t=${setupToken}&u=${encodeURIComponent(user?.email?.split('@')[0] || 'AI店長用戶')}` : '';

    // 🔄 同步收集到的資料到手動填寫欄位 (Sync collected data to manual fields)
    useEffect(() => {
        if (connectionData) {
            setManualData({
                channelId: connectionData.channelId || manualData.channelId,
                channelSecret: connectionData.channelSecret || manualData.channelSecret,
                channelAccessToken: connectionData.channelAccessToken || manualData.channelAccessToken,
                botBasicId: connectionData.botBasicId || manualData.botBasicId,
            });
        }
    }, [connectionData]);

    const handleManualSubmit = async () => {
        if (!manualData.channelId || !manualData.channelSecret || !manualData.channelAccessToken || !manualData.botBasicId) {
            alert('請填寫所有必要欄位');
            return;
        }
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
        if (authLoading) {
            return (
                <div className="w-full py-5 rounded-[24px] font-black text-xl text-white flex items-center justify-center gap-3 shadow-xl bg-slate-300">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    正在確認登入服務...
                </div>
            );
        }

        if (error) {
            return (
                <div className="w-full p-6 bg-red-50 border-2 border-red-100 rounded-[24px] text-center space-y-4">
                    <p className="text-red-600 font-bold text-sm">{error}</p>
                    <button 
                        onClick={() => handleStartSetup(searchParams.get('botId') || undefined)}
                        className="px-6 py-2 bg-red-600 text-white rounded-full text-xs font-black hover:bg-red-700 transition-colors">
                        重新嘗試
                    </button>
                </div>
            );
        }

        if (!setupToken) {
            return (
                <div className="w-full py-5 rounded-[24px] font-black text-xl text-white flex items-center justify-center gap-3 shadow-xl bg-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    正在產生個人金鑰...
                </div>
            );
        }

        return (
            <div className="w-full flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="px-3 py-1 bg-sky-100 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-bounce">
                        ● 準備就緒！請拖曳 
                    </span>
                </div>
                <motion.a 
                    href={bookmarkletHref}
                    whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(56,189,248,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-5 rounded-[24px] font-black text-xl text-white flex items-center justify-center gap-3 shadow-xl shadow-sky-200/50"
                    style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #3182ce 100%)' }}>
                    <Star className="w-6 h-6 fill-white" />
                    ✨ AI店長設定專用書籤
                    <MoveRight className="w-6 h-6 opacity-40 ml-2 animate-pulse" />
                </motion.a>
            </div>
        );
    };

    return (
        <ConnectLayout 
            onBack={() => window.location.href = '/dashboard'}
            title="串接您的 AI 店長"
            rightContent={
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(remoteLink);
                            alert('已複製遠端同步連結，您可以傳給客戶或家人協助操作囉！');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-[13px] font-black shadow-lg shadow-purple-200 transition-all active:scale-95 group"
                    >
                        <Zap className="w-4 h-4 fill-white" />
                        遠端開通邀請
                    </button>
                </div>
            }
        >
            <AnimatePresence mode="wait">
                {view === 'sync' ? (
                    <div className="flex flex-col gap-0">
                        {/* 0. Top Horizontal Dashboard */}
                        <ConnectionStatusDashboard 
                            collected={collected}
                            syncStatus={syncStatus}
                            botName={connectionData?.channelName || (collected as any)?.botName}
                        />

                        <div className="flex flex-col xl:flex-row gap-8 items-start">
                            {/* 1. Dashboard & Auto-Sync (Left) */}
                            <AIGuideChat 
                                messages={chatMessages} 
                                collected={collected}
                                syncStatus={syncStatus}
                                renderBookmarkButton={renderBookmarkletButton}
                                botName={connectionData?.channelName || (collected as any)?.botName}
                            />

                            {/* 2. Manual Configuration (Right) */}
                            <div className="flex-1 w-full space-y-6">
                                <div className="bg-white p-8 pb-[10px] rounded-[5px] shadow-xl border border-slate-200">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                            <Key className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-[22px] font-black text-slate-800 tracking-tight leading-none mb-1">店長專屬金鑰</h3>
                                            <p className="text-xs text-slate-400 font-bold">（可手動填寫）| 若書籤同步失敗，請在此手動輸入資料</p>
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
        <React.Suspense fallback={<div>Loading...</div>}>
            <LineConnectPageContent />
        </React.Suspense>
    );
}

