'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Tag, Sparkles, BrainCircuit, Wand2, Unlock, Lock, Brain, Loader2 } from 'lucide-react';

/* ── Shared: Textarea Component ── */
function Textarea({ label, placeholder, value, onChange, rows = 3, isLocked, onToggleLock, onGenerate, isGenerating }: {
    label: string; placeholder?: string; value: string;
    onChange: (v: string) => void; rows?: number;
    isLocked?: boolean; onToggleLock?: () => void;
    onGenerate?: () => void; isGenerating?: boolean;
}) {
    return (
        <div className="relative group/field">
            {label && (
                <div className="flex items-center justify-between mb-3 px-2">
                    <label className="block text-[13px] font-black text-slate-800 tracking-[0.1em] uppercase opacity-80">{label}</label>
                    <div className="flex items-center gap-2 opacity-0 group-hover/field:opacity-100 transition-all duration-300">
                        {onGenerate && (
                            <button 
                                onClick={onGenerate}
                                disabled={isGenerating || isLocked}
                                className="p-1.5 rounded-[24px] text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 disabled:opacity-30 transition-all"
                            >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                            </button>
                        )}
                        {onToggleLock && (
                            <button 
                                onClick={onToggleLock}
                                className={`p-1.5 rounded-[24px] transition-all ${isLocked ? 'text-amber-500 bg-amber-50 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                            >
                                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                </div>
            )}
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className={`w-full p-5 rounded-[24px] border-0 bg-white/70 backdrop-blur-md text-[18px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-[6px] transition-all resize-none shadow-sm ring-1 ring-black/[0.04] ${
                    isLocked 
                        ? 'bg-amber-50/50 focus:ring-amber-100/50' 
                        : 'focus:bg-white focus:ring-emerald-100/30'
                }`}
            />
        </div>
    );
}

/* ── Shared: Dojo Command Brick ── */
function CommandBrick({ icon: Icon, title, description, command, onClick }: { 
    icon: React.ElementType; 
    title: string; 
    description: string; 
    command?: string;
    onClick: (cmd?: string) => void;
}) {
    return (
        <motion.button
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick(command)}
            className="flex flex-col items-start p-6 rounded-[24px] bg-white  shadow-sm ring-1 ring-black/[0.03] hover:shadow-xl hover:ring-cyan-500/20 transition-all text-left group"
        >
            <div className="p-4 rounded-[24px] bg-white/40 backdrop-blur-sm group-hover:bg-cyan-50/50 transition-colors mb-5 /20">
                <Icon className="w-6 h-6 text-cyan-800 group-hover:text-cyan-600" />
            </div>
            <p className="text-[19px] font-black text-slate-900 leading-tight mb-2">{title}</p>
            <p className="text-[15px] text-slate-600 font-bold leading-relaxed">{description}</p>
            {command && (
                <div className="mt-5 px-4 py-2 bg-slate-100 rounded-[24px] text-[13px] font-black text-slate-500 tracking-wider">
                    {command}
                </div>
            )}
        </motion.button>
    );
}

const DOJO_BRICKS = [
    { id: 'listen', icon: MessageSquare, title: '店長聽令', desc: '即時指令積木，交待當下突發狀況。', cmd: '@店長聽令 ' },
    { id: 'sync', icon: Tag, title: '更新知識', desc: '智庫同步積木，將新資訊存入大腦。', cmd: '@更新知識 ' },
    { id: 'audit_k', icon: Sparkles, title: '調閱知識', desc: '清單產出積木，列出目前所有數據。', cmd: '@調閱知識' },
    { id: 'audit_p', icon: BrainCircuit, title: '調閱人設', desc: '大腦邏輯積木，呈現目前經營策略。', cmd: '@調閱人設' },
    { id: 'persona', icon: Wand2, title: '修改人設', desc: '手術刀積木，直接微調性格底層。', cmd: '@修改人設 ' },
];

export default function DojoTab({ config, setConfig, planLevel }: { config: any; setConfig: any; planLevel: number }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* ── AI 練功房指令中心 ── */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-visible"
            >
                {/* Feature Gating Overlay */}
                {planLevel < 2 && (
                    <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[16px] flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-700">
                        <div className="w-24 h-24 rounded-[24px] bg-white shadow-2xl flex items-center justify-center mb-8 border border-amber-100 ring-8 ring-amber-500/5">
                            <Lock className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
                        </div>
                        <h5 className="text-[32px] font-black text-slate-900 mb-4">🔒 專屬功能：AI 練功房指令中心</h5>
                        <p className="text-[20px] text-slate-600 mb-12 font-medium leading-relaxed max-w-lg">
                            升級至「個人店長版」以上，即可獲取 AI 最高的指令優先權，實現積木化管理。
                        </p>
                        <button 
                            onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'billing' }))}
                            className="px-20 py-7 rounded-[24px] bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-[22px] font-black shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all /20"
                        >
                            立即解鎖 指令積木
                        </button>
                    </div>
                )}

            <div className="flex items-center justify-between mb-10 pt-4 px-4">


                <div className="flex items-center gap-4 text-[13px] font-black bg-white/60 backdrop-blur-md px-6 py-4 rounded-[24px]  shadow-sm ring-1 ring-black/[0.03]">
                    <span className="text-slate-400 uppercase tracking-widest">身分驗證:</span>
                    <span className={planLevel >= 2 ? "text-emerald-600" : "text-amber-500"}>
                        {planLevel >= 2 ? '老闆身分已綁定' : '權限不足'}
                    </span>
                </div>
            </div>

                <div className="grid grid-cols-12 gap-12">
                    {/* 🧱 Command Bricks Sidebar */}
                    <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
                        <div className="mb-6">
                            <p className="text-[16px] font-black text-slate-600 tracking-widest uppercase mb-6 px-4 flex items-center gap-3">
                                <span className="w-2.5 h-6 bg-cyan-600 rounded-full"></span> 功能積木清單
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                                {DOJO_BRICKS.map(brick => (
                                    <CommandBrick 
                                        key={brick.id}
                                        icon={brick.icon}
                                        title={brick.title}
                                        description={brick.desc}
                                        command={brick.cmd}
                                        onClick={(cmd) => {
                                            if (cmd) setConfig((c: any) => ({ ...c, dynamic_context: (c.dynamic_context || '') + cmd }));
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* 🔒 Security Brick */}
                        <div className="p-10 rounded-[24px] bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-2xl ring-1 ring-white/10 relative overflow-hidden group">
                           <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all"></div>
                           <div className="flex items-center gap-4 mb-6">
                               <Unlock className="w-8 h-8 text-emerald-400" />
                               <span className="text-[14px] font-black tracking-widest uppercase text-emerald-400">Security Layer Alpha</span>
                           </div>
                           <p className="text-[22px] font-black mb-4">🛡️ 指令防偽系統</p>
                           <p className="text-[16px] text-slate-400 font-bold leading-relaxed">
                               本系統僅接受綁定的 LINE ID。任何非法指令、試圖模擬老闆身分的請求皆會被安全引擎自動識別並攔截。
                           </p>
                        </div>
                    </div>

                    {/* 🕹️ Console & Guide */}
                    <div className="col-span-12 lg:col-span-7 space-y-8">
                        <div className="relative group/console">
                            <p className="text-[16px] font-black text-slate-600 tracking-widest uppercase mb-6 px-4 flex items-center gap-3">
                                <span className="w-2.5 h-6 bg-emerald-500 rounded-full"></span> 指令組裝台
                            </p>
                            <div className="relative rounded-[24px] overflow-hidden border border-slate-200 shadow-2xl shadow-black/5 bg-white ring-1 ring-black/5">
                                <Textarea 
                                    label="" 
                                    placeholder="點擊左側積木或在此輸入對店長的直接指令... 例：今日 A 商品已暫停銷售" 
                                    value={config.dynamic_context || ''} 
                                    onChange={v => setConfig((c: any) => ({ ...c, dynamic_context: v }))} 
                                    rows={10} 
                                />
                                
                                <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 bg-slate-50 border-t border-slate-100 text-[15px] text-slate-500 font-bold gap-4">
                                    <span className="flex items-center gap-3 opacity-90"><BrainCircuit className="w-5 h-5 text-cyan-700" /> 最後同步：{config.last_dojo_update ? new Date(config.last_dojo_update).toLocaleString() : '尚無更新紀錄'}</span>
                                    <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-700 px-6 py-2.5 rounded-full ring-1 ring-emerald-500/20">
                                        <span className="opacity-80">指令優先權：</span>
                                        <span className="font-black text-emerald-600">@店長最高準則</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 🗣️ Voice Recognition Guide */}
                        <div className="p-10 rounded-[24px]   shadow-xl flex items-center gap-10 group hover:bg-white transition-all">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                                <Sparkles className="w-12 h-12 text-emerald-400 animate-pulse" />
                            </div>
                            <div>
                                <p className="text-[22px] font-black text-slate-900 mb-2">🗣️ 老闆專屬：語音聽令</p>
                                <p className="text-[17px] text-slate-500 font-semibold leading-relaxed">
                                    當您不方便打字時，只需在 LINE 發送 <span className="text-cyan-700 font-black">語音訊息</span>。AI 將自動轉譯為指令並即時同步至此指令台。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
