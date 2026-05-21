"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Save, Copy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export const PointerCursor = React.memo(({ x, y, isActive = false }: { x: string, y: string, isActive?: boolean }) => {
    if (!isActive) return null;
    return (
        <motion.div
            initial={{ opacity: 0, x: 20, y: 20 }}
            animate={{
                opacity: [0, 1, 1, 1, 0, 0],
                x: [20, 0, 0, 0, 20, 20],
                y: [20, 0, 0, 0, 20, 20],
                scale: [1, 1, 0.8, 1, 1, 1]
            }}
            transition={{
                duration: 2.5,
                repeat: Infinity,
                times: [0, 0.2, 0.4, 0.5, 0.7, 1],
                ease: "easeInOut"
            }}
            className="absolute z-10 w-6 h-6 pointer-events-none drop-shadow-md origin-top-left"
            style={{ left: x, top: y }}
        >
            <svg viewBox="0 0 24 24" className="w-full h-full text-[#06C755] fill-white stroke-[#06C755] stroke-2">
                <path d="M5.5 3l13.5 13.5-5.5 1.5 3 4-2.5 2-3.5-4.5-5 3.5z" />
            </svg>
            <motion.div
                animate={{ scale: [1, 2.5, 2.5], opacity: [0, 0.5, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, times: [0, 0.4, 0.6] }}
                className="absolute left-[-2px] top-[-2px] w-4 h-4 rounded-full bg-[#06C755]/40"
            />
        </motion.div>
    );
});
PointerCursor.displayName = 'PointerCursor';

export const PointerSequenceStep3 = React.memo(({ isActive = false }: { isActive?: boolean }) => {
    if (!isActive) return null;
    return (
        <motion.div
            initial={{ opacity: 0, x: 50, y: 70 }}
            animate={{
                opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                x: [50, 35, 35, 165, 165, 80, 80, -200, -200, -200, -200, 50, 50],
                y: [70, 45, 45, 45, 45, 90, 90, 180, 180, 260, 260, 70, 70],
                scale: [1, 1, 0.7, 1, 0.7, 1, 1, 1, 0.7, 1, 0.7, 1, 1]
            }}
            transition={{
                duration: 7,
                repeat: Infinity,
                times: [0, 0.1, 0.15, 0.25, 0.3, 0.45, 0.5, 0.65, 0.7, 0.85, 0.9, 0.95, 1],
                ease: "easeInOut"
            }}
            className="absolute top-0 left-0 z-20 w-6 h-6 pointer-events-none drop-shadow-md origin-top-left"
        >
            <svg viewBox="0 0 24 24" className="w-full h-full text-[#06C755] fill-white stroke-[#06C755] stroke-2">
                <path d="M5.5 3l13.5 13.5-5.5 1.5 3 4-2.5 2-3.5-4.5-5 3.5z" />
            </svg>
            <motion.div
                animate={{ scale: [1, 2.5, 2.5, 1, 2.5, 2.5, 1, 1, 2.5, 2.5, 1, 1, 1], opacity: [0, 0.5, 0, 0, 0.5, 0, 0, 0, 0.5, 0, 0, 0, 0] }}
                transition={{ duration: 7, repeat: Infinity, times: [0, 0.1, 0.15, 0.25, 0.3, 0.45, 0.5, 0.65, 0.7, 0.85, 0.9, 0.95, 1] }}
                className="absolute left-[-2px] top-[-2px] w-4 h-4 rounded-full bg-[#06C755]/40"
            />
        </motion.div>
    );
});
PointerSequenceStep3.displayName = 'PointerSequenceStep3';

export const PointerSequenceWebhook = React.memo(({ isActive = false }: { isActive?: boolean }) => {
    if (!isActive) return null;
    return (
        <motion.div
            initial={{ opacity: 0, x: -200, y: 0 }}
            animate={{
                opacity: [0, 1, 1, 1, 1, 1, 1, 1, 0],
                x: [-200, -200, -200, 130, 130, 280, 280, -200, -200],
                y: [0, -100, -100, 47, 47, 47, 47, -100, -100],
                scale: [1, 1, 0.7, 1, 0.7, 1, 0.7, 1, 1]
            }}
            transition={{
                duration: 6,
                repeat: Infinity,
                times: [0, 0.1, 0.2, 0.35, 0.45, 0.6, 0.7, 0.9, 1],
                ease: "easeInOut"
            }}
            className="absolute top-0 left-0 z-20 w-6 h-6 pointer-events-none drop-shadow-md origin-top-left"
        >
            <svg viewBox="0 0 24 24" className="w-full h-full text-[#06C755] fill-white stroke-[#06C755] stroke-2">
                <path d="M5.5 3l13.5 13.5-5.5 1.5 3 4-2.5 2-3.5-4.5-5 3.5z" />
            </svg>
            <motion.div
                animate={{ scale: [1, 1, 2.5, 1, 2.5, 1, 2.5, 1, 1], opacity: [0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0] }}
                transition={{ duration: 6, repeat: Infinity, times: [0, 0.1, 0.2, 0.35, 0.45, 0.6, 0.7, 0.9, 1] }}
                className="absolute left-[-2px] top-[-2px] w-4 h-4 rounded-full bg-[#06C755]/40"
            />
        </motion.div>
    );
});
PointerSequenceWebhook.displayName = 'PointerSequenceWebhook';

export const MockLineUI = React.memo(({ step, isActive = false }: { step: number, isActive?: boolean }) => (
    <div className="relative w-full max-w-[320px] mx-auto bg-white border border-zinc-200 rounded-2xl overflow-visible shadow-sm font-sans text-xs">
        <div className="p-4 space-y-3">
            {step === 0 && (
                <div className="flex flex-col items-center justify-center space-y-4 py-2">
                    <div className="px-4 py-2 border border-[#06C755] text-[#06C755] rounded-full text-[10px] font-bold flex items-center gap-2">
                        <code className="text-[8px]">{'</>'}</code> developers.line.biz / LINE Developers
                    </div>
                    <div className="relative px-6 py-2 bg-[#06C755] text-white rounded-full font-bold text-[12px] shadow-sm">
                        Log in to Console
                        <PointerCursor x="70%" y="40%" isActive={isActive} />
                    </div>
                </div>
            )}
            {step === 1 && (
                <div className="space-y-3 py-1">
                    <div className="text-zinc-800 font-bold text-[10px]">Recently visited channel</div>
                    <div className="relative p-3 border border-zinc-200 rounded-lg flex flex-col items-center gap-2 shadow-sm relative">
                        <div className="w-8 h-8 bg-green-50 rounded-md border border-green-200 flex items-center justify-center text-green-600">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="font-bold text-zinc-800 text-[11px]">你的商店</div>
                        <div className="text-[8px] text-zinc-400">💬 Messaging API</div>
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-green-500 text-white rounded font-bold text-[7px]">Admin</div>
                        <PointerCursor x="85%" y="65%" isActive={isActive} />
                    </div>
                </div>
            )}
            {step === 2 && (
                <div className="space-y-3 py-1">
                    <div className="text-zinc-500 text-[9px] font-bold">TOP &gt; 你的商店</div>
                    <div className="flex gap-4 border-b border-zinc-200 px-1">
                        <div className="pb-1 border-b-[3px] border-[#06C755] text-zinc-900 font-bold text-[10px]">Basic settings</div>
                        <div className="pb-1 text-zinc-400 font-bold text-[10px]">Messaging API</div>
                    </div>
                    <div className="relative flex items-center gap-2 mt-4 inline-block">
                        <div className="px-3 py-1.5 border border-zinc-300 rounded text-zinc-500 font-mono text-[9px] bg-zinc-50 flex items-center gap-4">
                            <span className="text-zinc-400">Channel secret</span>
                            <span className="font-bold text-zinc-700">1688****************1688</span>
                            <Save className="w-3 h-3 text-zinc-400" />
                        </div>
                        <PointerCursor x="90%" y="20%" isActive={isActive} />
                    </div>
                    <div className="text-[9px] font-bold text-zinc-800 mt-1 pl-1">請將此欄位copy到👆</div>
                </div>
            )}
            {step === 3 && (
                <div className="space-y-3 py-1">
                    <div className="text-zinc-500 text-[9px] font-bold">TOP &gt; 你的商店</div>
                    <div className="flex gap-4 border-b border-zinc-200 px-1">
                        <div className="pb-1 text-zinc-400 font-bold text-[10px]">Basic settings</div>
                        <div className="pb-1 border-b-[3px] border-[#06C755] text-zinc-900 font-bold text-[10px]">Messaging API</div>
                    </div>
                    <div className="relative p-3 border border-zinc-200 rounded-lg mt-4 bg-zinc-50 h-[96px] overflow-visible">
                        <div className="text-zinc-800 font-bold text-[10px] mb-2">Channel access token</div>
                        <motion.div
                            animate={isActive ? { opacity: [1, 1, 0, 0, 0, 0, 1] } : { opacity: 1 }}
                            transition={{ duration: 7, repeat: Infinity, times: [0, 0.15, 0.20, 0.9, 0.95, 0.98, 1], ease: "linear" }}
                            className="absolute px-4 py-1.5 bg-zinc-800 text-white rounded w-max text-[9px] font-bold top-[35px] left-[12px]"
                        >
                            Issue
                        </motion.div>
                        <motion.div
                            animate={isActive ? { opacity: [0, 0, 1, 1, 0, 0, 0] } : { opacity: 0 }}
                            transition={{ duration: 7, repeat: Infinity, times: [0, 0.15, 0.20, 0.8, 0.85, 1, 1], ease: "linear" }}
                            className="absolute flex items-center gap-2 top-[35px] left-[12px]"
                        >
                            <div className="px-2 py-1 border border-zinc-300 rounded text-zinc-500 font-mono text-[9px] bg-white w-[130px] truncate leading-tight">
                                eyJhb...
                            </div>
                            <div className="p-1 border border-zinc-200 rounded text-zinc-400 bg-white shadow-sm flex items-center justify-center">
                                <Copy className="w-3 h-3" />
                            </div>
                        </motion.div>
                        <PointerSequenceStep3 isActive={isActive} />
                    </div>
                    <div className="relative text-[9px] font-bold text-zinc-800 mt-1 pl-1">
                        請將此欄位copy到👆
                        <motion.div
                            animate={isActive ? { opacity: [0, 0, 1, 1, 0, 0] } : { opacity: 0 }}
                            transition={{ duration: 7, repeat: Infinity, times: [0, 0.55, 0.6, 0.85, 0.9, 1] }}
                            className="absolute top-[-25px] left-[80px] px-2 py-1 bg-zinc-800 text-white text-[8px] font-bold rounded shadow-lg whitespace-nowrap z-30"
                        >
                            Copied!
                        </motion.div>
                    </div>
                </div>
            )}
            {step === 4 && (
                <div className="space-y-3 py-1">
                    <div className="text-zinc-500 text-[9px] font-bold">TOP &gt; 你的商店 &gt; Messaging API</div>
                    <div className="relative p-3 border border-zinc-200 rounded-lg bg-zinc-50 min-h-[96px] overflow-visible">
                        <div className="text-zinc-800 font-bold text-[10px] mb-2">Webhook URL</div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="px-2 py-1 border border-zinc-300 rounded text-zinc-400 font-mono text-[9px] bg-white flex-1 truncate">
                                    <motion.span
                                        animate={isActive ? { opacity: [0, 0, 1, 1] } : { opacity: 0 }}
                                        transition={{ duration: 6, repeat: Infinity, times: [0, 0.45, 0.50, 1] }}
                                    >
                                        https://your-domain.com/api/webhook...
                                    </motion.span>
                                </div>
                                <div className="px-3 py-1.5 bg-zinc-800 text-white rounded text-[9px] font-bold opacity-50">Verify</div>
                            </div>
                            <motion.div
                                animate={isActive ? { opacity: [0, 0, 0, 1, 1, 1, 0] } : { opacity: 0 }}
                                transition={{ duration: 6, repeat: Infinity, times: [0, 0.7, 0.75, 0.8, 0.85, 0.9, 1] }}
                                className="flex items-center gap-1 text-[#06C755] font-black text-[10px]"
                            >
                                <Sparkles className="w-3 h-3" />
                                <span>Success (通過)</span>
                            </motion.div>
                        </div>
                        <PointerSequenceWebhook isActive={isActive} />
                    </div>
                </div>
            )}
            {step === 5 && (
                <div className="space-y-3 py-1">
                    <div className="text-zinc-500 text-[9px] font-bold">回應設定 (Response settings)</div>
                    <div className="space-y-2">
                        {[
                            { label: "回應模式 (Response mode)", value: "聊天機器人 (Bot)", active: true },
                            { label: "加入好友歡迎訊息 (Greeting message)", value: "停用 (Disabled)", active: false },
                            { label: "自動回應訊息 (Auto-response)", value: "停用 (Disabled)", active: false },
                            { label: "Webhook", value: "啟用 (Enabled)", active: true }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                                <span className="text-[9px] font-bold text-zinc-600">{item.label}</span>
                                <div className={cn(
                                    "px-2 py-1 rounded text-[8px] font-black",
                                    item.active ? "bg-green-100 text-[#06C755]" : "bg-zinc-200 text-zinc-500"
                                )}>
                                    {item.active ? "ON" : "OFF"}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
));
MockLineUI.displayName = 'MockLineUI';
