import React from 'react';
import { Bot, CheckCircle2, Circle, Loader2, Sparkles, ShieldCheck, Key, MoveRight, Star, LogIn, ChevronRight, RefreshCw } from 'lucide-react';
import { BrowserGuide, ProjectSelector, TabSync } from './VisualGuides';

interface AIGuideChatProps {
    messages: { role: 'user' | 'ai'; content: string }[];
    collected?: { id?: boolean; sec?: boolean; bot?: boolean; tok?: boolean };
    syncStatus?: 'waiting' | 'syncing' | 'success' | 'error' | 'automated';
    renderBookmarkButton?: () => React.ReactNode;
    botName?: string;
}

export default function AIGuideChat({ messages, collected, syncStatus, renderBookmarkButton, botName }: AIGuideChatProps) {
    const hasBasic = collected?.id && collected?.sec;
    const hasToken = collected?.tok;
    const isBookmarkDone = syncStatus === 'automated' || syncStatus === 'success';
    const isActive = syncStatus === 'success';
    const isAutomated = syncStatus === 'automated';

    const getStatusLabel = () => {
        if (isActive) return { label: '已開通', color: 'bg-emerald-500', text: 'text-emerald-500', shadow: 'shadow-emerald-200' };
        if (syncStatus === 'automated') return { label: '待手動驗證', color: 'bg-blue-500', text: 'text-blue-500', shadow: 'shadow-blue-200' };
        if (hasBasic && hasToken) return { label: '等待驗證', color: 'bg-cyan-500', text: 'text-cyan-500', shadow: 'shadow-cyan-200' };
        if (hasBasic || hasToken) return { label: '開通中', color: 'bg-amber-500', text: 'text-amber-500', shadow: 'shadow-amber-200' };
        return { label: '未開通', color: 'bg-slate-300', text: 'text-slate-400', shadow: '' };
    };

    const status = getStatusLabel();
    const [activeBrowser, setActiveBrowser] = React.useState<'chrome' | 'safari' | 'edge'>('chrome');

    return (
        <div className="w-full xl:w-[400px] xl:shrink-0 flex flex-col gap-4 xl:sticky xl:top-[84px] transition-all">
            <div className="flex flex-col overflow-hidden rounded-[5px] shadow-2xl border border-slate-200 bg-white min-h-fit group">
                
                {/* --- Integrated Steps (NEW) --- */}

                {!isActive && (
                    <div className="bg-slate-50/50 border-b border-slate-100">
                        <div className="p-6 space-y-8">
                                               <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
                                    <h4 className="text-[22px] font-black text-slate-800 tracking-tight leading-none uppercase">自動同步指引</h4>
                                </div>
                                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-[5px] space-y-3 relative overflow-hidden group/tip">
                                    <div className="absolute top-0 right-0 p-1 bg-blue-100/50 rounded-bl-[5px] text-[8px] font-black text-blue-600 uppercase tracking-widest opacity-50">Shared Mode Active</div>
                                    <p className="text-[12px] text-blue-800 font-bold leading-relaxed pr-8">
                                        您好！我是您的串接助手 🤖 因為 LINE 的安全性設計，金鑰（Secret 與 Access Token）分佈在兩個不同的分頁。請分別進入「Basic Settings」與「Messaging API」頁面後各點擊一次同步書籤，系統就會自動幫您集齊所有資料囉！
                                    </p>
                                    <div className="pt-2 border-t border-blue-100/50 space-y-2">
                                        <p className="text-[11px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                                            <Star className="w-3 h-3 fill-blue-600" />
                                            智慧書籤的三大超能力：
                                        </p>
                                        <ul className="text-[11px] text-blue-700/80 font-bold space-y-1.5 list-disc pl-4">
                                            <li><span className="text-blue-800">全店通用</span>：一組書籤即可搞定帳務下所有店長，無須重複拖曳。</li>
                                            <li><span className="text-blue-800">批次辨識</span>：進入 LINE 總覽頁點擊一次，可自動掃描並建立多個店長。</li>
                                            <li><span className="text-blue-800">跨頁收集</span>：在不同分頁點擊書籤，系統會「聰明合併」各分頁收集到的資料。</li>
                                        </ul>
                                    </div>
                                </div>
                             </div>

                             {/* Step 1: Bookmarklet */}
                             <div className="space-y-4">
                                 <div className="flex items-start gap-3">
                                     <div className="w-6 h-6 rounded-lg bg-sky-500 text-white flex items-center justify-center font-black text-[12px] shrink-0">1</div>
                                     <div>
                                         <p className="text-[14px] font-black text-slate-700">準備您的智慧同步書籤</p>
                                         <p className="text-[11px] text-slate-400 font-medium mt-0.5">請將按鈕用滑鼠按住不放，直接拖曳到您瀏覽器最上方的書籤列（收藏夾）中。</p>
                                     </div>
                                 </div>
                                 
                                 <div className="flex flex-col gap-3 pl-9">
                                     <div className="flex gap-1.5">
                                         {(['chrome', 'safari', 'edge'] as const).map(b => (
                                             <button key={b} onClick={() => setActiveBrowser(b)}
                                                 className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight transition-all border-2 ${
                                                     activeBrowser === b ? 'bg-sky-500 text-white border-sky-500 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                                                 }`}>
                                                 {b}
                                             </button>
                                         ))}
                                     </div>
                                     <div className="scale-90 origin-left">
                                         {renderBookmarkButton ? renderBookmarkButton() : <div className="h-[50px] bg-slate-100 rounded-2xl animate-pulse" />}
                                     </div>
                                     <div className="scale-95 origin-left">
                                         <BrowserGuide type={activeBrowser} />
                                     </div>
                                 </div>
                             </div>

                             {/* Step 2: Login Console */}
                             <div className="space-y-4">
                                 <div className="flex items-start gap-3">
                                     <div className="w-6 h-6 rounded-[5px] bg-green-500 text-white flex items-center justify-center font-black text-[12px] shrink-0">2</div>
                                     <div>
                                         <p className="text-[14px] font-black text-slate-700">進入 LINE Developers 控制台</p>
                                         <p className="text-[11px] text-slate-400 font-medium mt-0.5">點擊下方按鈕前往登入，並進入您想要串接的 Channel (Messaging API) 視窗。</p>
                                     </div>
                                 </div>
                                 <div className="pl-9 space-y-2">
                                     <motion.a href="https://developers.line.biz/console/" target="_blank" rel="noopener noreferrer"
                                         whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                         className="w-full py-4 rounded-[5px] font-black text-[14px] text-white flex items-center justify-center gap-2 shadow-lg transition-all"
                                         style={{ background: 'linear-gradient(135deg, #06C755 0%, #05b34c 100%)' }}>
                                         <LogIn className="w-4 h-4" />
                                         前往 LINE 控制台
                                     </motion.a>
                                     <ProjectSelector />
                                 </div>
                             </div>

                             {/* Step 3: Tab Sync */}
                             <div className="space-y-4">
                                 <div className="flex items-start gap-3">
                                     <div className="w-6 h-6 rounded-[5px] bg-blue-500 text-white flex items-center justify-center font-black text-[12px] shrink-0">3</div>
                                     <div>
                                         <p className="text-[14px] font-black text-slate-700">執行同步與自動填入</p>
                                         <div className="text-[11px] text-slate-500 font-medium space-y-1 mt-1">
                                            <p>A. 請確保在 LINE 後台已分別開啟 「Basic Settings」 與 「Messaging API」 兩個分頁。</p>
                                            <p>B. 各點擊一次同步書籤，系統偵測成功後會自動填寫 Webhook 並完成開通！</p>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="pl-9 scale-95 origin-left">
                                     <TabSync />
                                 </div>
                             </div>
                        </div>
                    </div>
                )}

                {/* --- Chat Content --- */}
                <div className="flex-1 overflow-y-auto p-6 pb-[10px] space-y-5 custom-scrollbar">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[88%] px-4 py-3.5 rounded-[22px] text-[13.5px] leading-relaxed relative ${
                                msg.role === 'user' 
                                    ? 'bg-emerald-600 text-white shadow-md' 
                                    : 'bg-slate-50 text-slate-700 border border-slate-100 font-bold shadow-sm'
                            }`}>
                                {msg.content}
                                {msg.role === 'ai' && i === messages.length - 1 && syncStatus === 'syncing' && (
                                    <div className="absolute -bottom-1 -right-1">
                                        <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                     {isAutomated && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="p-5 rounded-[5px] bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100/50 flex flex-col gap-4 shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-[5px] bg-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                                    <ShieldCheck className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-[14px] font-black text-blue-900 leading-none">等待手動驗證</p>
                                    <p className="text-[11px] font-bold text-blue-600 mt-1">請在 LINE 後台點擊 Verify 按鈕</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => window.location.reload()}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-[5px] text-[13px] font-black shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 group"
                            >
                                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                                重新檢查連線狀態
                            </button>
                        </motion.div>
                    )}
                    {isActive && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="p-5 rounded-[5px] bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100/50 flex flex-col gap-4 shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-[5px] bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200 animate-bounce">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-[14px] font-black text-emerald-900 leading-none">同步任務完成！</p>
                                    <p className="text-[11px] font-bold text-emerald-600 mt-1">您的 AI 店長已準備就緒</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => window.location.href = '/dashboard'}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[5px] text-[13px] font-black shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 group"
                            >
                                回到儀表板
                                <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Add Framer Motion for some nice effects
import { motion } from 'framer-motion';
