'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, RefreshCw, Star, Tablet, Copy, CheckCircle2 } from 'lucide-react';
import { BrowserGuide, ProjectSelector, TabSync } from './VisualGuides';

interface BookmarkletZoneProps {
    activeBrowser: 'chrome' | 'safari' | 'edge';
    setActiveBrowser: (b: 'chrome' | 'safari' | 'edge') => void;
    renderButton: () => React.ReactNode;
}

export const BookmarkletZone = ({
    activeBrowser,
    setActiveBrowser,
    renderButton
}: BookmarkletZoneProps) => (
    <div className="flex flex-col gap-8">
        {/* 📱 iPad / 平板電腦極簡設定指引 */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-[32px] p-6 text-white shadow-xl space-y-4 border border-indigo-500/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/20 rounded-2xl text-indigo-300">
                        <Tablet className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-base font-black text-white tracking-tight">📱 iPad / 平板電腦 Safari 極簡設定指南</h4>
                        <p className="text-[11px] text-slate-300 font-medium">iPad Safari 不支援滑鼠拖拽，請照以下 3 步極簡完成書籤設定：</p>
                    </div>
                </div>
                <span className="text-[10px] font-black bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full border border-indigo-400/30">
                    iPadOS 100% 相容
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5 hover:bg-white/10 transition-all">
                    <div className="text-amber-400 font-black text-xs flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[10px] font-black">1</span>
                        <span>任意新增一個書籤</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                        在 iPad Safari 點擊分享 ➔【加入書籤】，名稱填寫「🔗 一鍵串接 LINE」。
                    </p>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5 hover:bg-white/10 transition-all">
                    <div className="text-amber-400 font-black text-xs flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[10px]">2</span>
                        <span>複製專用腳本網址</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                        在下方【一鍵擷取】按鈕上長按複製連結、或點擊複製腳本代碼。
                    </p>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5 hover:bg-white/10 transition-all">
                    <div className="text-amber-400 font-black text-xs flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[10px]">3</span>
                        <span>貼上腳本並儲存</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                        在 Safari 書籤選單點【編輯】，將剛建立書籤的 URL 全選貼上替代！
                    </p>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[40px] p-8 pb-[10px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col relative overflow-hidden h-[580px]">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-sky-500" />
                
                {/* Batch Sync Tip */}
                <div className="mb-6 p-4 bg-sky-50 border border-sky-100 rounded-3xl flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <Star className="w-5 h-5 text-sky-500 fill-sky-200" />
                    </div>
                    <div>
                        <div className="text-[12px] font-black text-sky-700">專家小技巧：批次自動建立</div>
                        <p className="text-[10px] text-sky-600/80 font-medium">在 LINE 「Channel 列表頁」點擊書籤，可一次匯入多個店長！</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-2">
                     <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black text-xl">1</div>
                     <h4 className="font-black text-slate-800 text-xl tracking-tight">確認您的瀏覽器環境</h4>
                </div>
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed mb-6">
                    請確認您的瀏覽器已開啟「書籤列」(如有需要請按 Ctrl+Shift+B 或 Cmd+Shift+B)。
                </p>
                <div className="mt-auto py-2 flex flex-col items-center">
                    <div className="w-full">
                        <BrowserGuide type={activeBrowser} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[40px] p-8 pb-[10px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col relative overflow-hidden h-[580px]">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500" />
                <div className="flex items-center gap-4 mb-2">
                     <div className="w-10 h-10 rounded-2xl bg-green-500 text-white flex items-center justify-center font-black text-xl">2</div>
                     <h4 className="font-black text-slate-800 text-xl tracking-tight">登入 LINE 控制台</h4>
                </div>
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed font-bold text-green-600 mb-4">
                    登入後請選擇你的專案，並且移動到畫面下方。
                </p>
                <div className="flex-1 flex flex-col items-stretch justify-center">
                    <motion.a href="https://developers.line.biz/console/" target="_blank" rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="w-full py-6 rounded-[24px] font-black text-xl text-white flex items-center justify-center gap-3 shadow-xl transition-all"
                        style={{ background: 'linear-gradient(135deg, #06C755 0%, #05b34c 100%)' }}>
                        <LogIn className="w-6 h-6" />
                        登入 LINE 控制台
                    </motion.a>
                    <ProjectSelector />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="bg-white rounded-[40px] p-8 pb-[10px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col relative overflow-hidden h-[580px]">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500" />
                <div className="flex items-center gap-4 mb-2">
                     <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-black text-xl">3</div>
                     <h4 className="font-black text-slate-800 text-xl tracking-tight">分別在兩個分頁點擊書籤</h4>
                </div>
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed mb-4">
                    系統會自動記住您收集到的資料。請在看到 <b>Messaging API</b> 頁面與 <b>Basic Settings</b> 頁面時各點一下書籤，集齊後會自動開始同步。
                </p>
                <TabSync />
            </div>

            <div className="bg-white rounded-[40px] p-8 pb-[10px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col relative overflow-hidden h-[580px]">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-400" />
                <div className="flex items-center gap-4 mb-2">
                     <div className="w-10 h-10 rounded-2xl bg-blue-400 text-white flex items-center justify-center font-black text-xl">4</div>
                     <h4 className="font-black text-slate-800 text-xl tracking-tight">回到本頁確認結果</h4>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                    <div className="w-20 h-20 rounded-[32px] bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
                        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
                    </div>
                    <div className="text-center space-y-2">
                        <div className="text-[14px] font-black text-slate-500 uppercase tracking-[0.2em]">正在等待連線指令...</div>
                        <p className="text-[12px] text-slate-400 max-w-[200px] mx-auto font-medium">請點擊上方書籤完成資料集齊</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
