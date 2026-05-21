'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bot, Share2, Shield, Zap, CheckCircle2, Copy } from 'lucide-react';

function RemoteSyncContent() {
    const searchParams = useSearchParams();
    const setupToken = searchParams.get('t');
    const inviterName = searchParams.get('u') || '您的合作夥伴';
    const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

    const bookmarkletCode = `javascript:(function(){var d=document,s=d.createElement('script');s.src='${appUrl}/api/line/script?t=${setupToken}&d=${encodeURIComponent(appUrl)}';d.body.appendChild(s);})();`;

    return (
        <div className="min-h-screen bg-[#0f172a] text-white selection:bg-blue-500/30 font-sans">
            {/* Background Ambient Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 max-w-2xl mx-auto px-6 py-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-2xl shadow-blue-500/20">
                        <Bot className="w-10 h-10 text-blue-400" />
                    </div>
                    
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">
                            LINE AI 店長 <span className="text-blue-400">遠端串接助手</span>
                        </h1>
                        <p className="text-slate-400 font-medium">
                            <span className="text-white font-bold">{inviterName}</span> 邀請您將 LINE 官方帳號對接至 AI 管理系統
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-8">
                        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl text-left">
                            <Zap className="w-6 h-6 text-yellow-400 mb-3" />
                            <h3 className="font-bold mb-1">快速自動同步</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">無需交出密碼，兩秒鐘內安全抓取串接必備的金鑰與資訊。</p>
                        </div>
                        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl text-left">
                            <Shield className="w-6 h-6 text-emerald-400 mb-3" />
                            <h3 className="font-bold mb-1">隱私安全保護</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">僅讀取串接所需之 ID 與 Secret，不會存取任何對話私隱紀錄。</p>
                        </div>
                    </div>

                    <div className="w-full bg-blue-600/10 border border-blue-500/20 rounded-[32px] p-8 mt-6">
                        <h2 className="text-lg font-black mb-6 flex items-center justify-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-500 text-[12px] flex items-center justify-center">1</span>
                            安裝同步按鈕
                        </h2>
                        
                        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                            請將下方的藍色按鈕 <span className="text-blue-400 font-bold">「按住並拖移」</span> 到您的瀏覽器書籤列：
                        </p>

                        <a
                            href={bookmarkletCode}
                            onClick={(e) => e.preventDefault()}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/30 cursor-move active:scale-95 translate-y-0 hover:-translate-y-1"
                        >
                            <Zap className="w-5 h-5 fill-current" />
                            AI店長設定專用書籤
                        </a>

                        <div className="mt-8 pt-8 border-t border-blue-500/10">
                            <h2 className="text-lg font-black mb-4 flex items-center justify-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-500 text-[12px] flex items-center justify-center">2</span>
                                前往 LINE 後台執行
                            </h2>
                            <p className="text-sm text-slate-400 mb-6">
                                進入 LINE Developers Console，點擊剛才儲存的書籤即可完成同步。
                            </p>
                            <button
                                onClick={() => window.open('https://developers.line.biz/console/', '_blank')}
                                className="text-blue-400 text-sm font-bold flex items-center gap-2 mx-auto hover:underline"
                            >
                                打開 LINE Developers 後台 <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-12 text-slate-500 text-[11px] font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        此連結由 AI Chatbot 系統自動產出，具有時效安全性。
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

export default function RemoteSyncPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        }>
            <RemoteSyncContent />
        </Suspense>
    );
}
