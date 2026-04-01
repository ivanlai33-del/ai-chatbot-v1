'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Clock, User, CheckCircle2, AlertCircle, ShoppingCart, Zap, ArrowUpRight } from 'lucide-react';

const CHAT_STREAM_DATA = [
    { id: '1', store: '台北旗艦店', botName: 'AI小美', status: 'active', visitor: '訪客 #8210', time: '剛才', lastMsg: '我想看明天的美甲預約時段', intent: 'booking', sentiment: 'positive' },
    { id: '2', store: '台中分店', botName: 'AI店長', status: 'captured', visitor: '陳先生', time: '2分鐘前', lastMsg: '電話是 0912-345-XXX，幫我留位置', intent: 'lead_captured', sentiment: 'neutral' },
    { id: '3', store: '高雄門市', botName: 'AI客服', status: 'idle', visitor: '王小姐', time: '5分鐘前', lastMsg: '請問洗髮精還有現貨嗎', intent: 'inquiry', sentiment: 'neutral' },
    { id: '4', store: '台北旗艦店', botName: 'AI小美', status: 'error', visitor: '訪客 #8212', time: '12分鐘前', lastMsg: '能不能幫我轉接本人？', intent: 'intervention_requested', sentiment: 'negative' },
];

export default function ChatStreamView() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Live Activity Wall */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-slate-900/40 rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/60">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0f172a] animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white tracking-widest uppercase">全站即時聊天總覽</h3>
                                <p className="text-[10px] text-slate-500 font-bold mt-1">目前有 5 位 AI 店長正在與 12 位訪客對話中</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="hidden sm:flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">目前 AI 回覆率</p>
                                    <p className="text-sm font-black text-emerald-400">98.5%</p>
                                </div>
                                <div className="w-12 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center px-1">
                                    <div className="w-4 h-4 bg-emerald-400 rounded-full ml-auto shadow-sm" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        {CHAT_STREAM_DATA.map((chat, i) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={chat.id} 
                                className="group p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                                        chat.status === 'active' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
                                        chat.status === 'captured' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                        'bg-slate-800 border-slate-700 text-slate-500'
                                    }`}>
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-slate-200">{chat.visitor}</span>
                                            <span className="text-[9px] px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded-full font-bold uppercase tracking-widest">{chat.store}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 italic">「{chat.lastMsg}」</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Zap className="w-3 h-3 text-indigo-400" />
                                            <span className="text-[10px] font-bold text-indigo-300">由 {chat.botName} 分身回覆中</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-700/50 md:justify-end w-full md:w-auto">
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 justify-end mb-1">
                                            {chat.intent === 'booking' && <span className="bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest uppercase flex items-center gap-1"><ShoppingCart className="w-3 h-3" /> 預約諮詢</span>}
                                            {chat.intent === 'lead_captured' && <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 成功領資</span>}
                                            {chat.intent === 'intervention_requested' && <span className="bg-rose-500/20 text-rose-500 px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest uppercase flex items-center gap-1"><AlertCircle className="w-3 h-3" /> 請求介入</span>}
                                        </div>
                                        <div className="flex items-center gap-2 justify-end">
                                            <Clock className="w-3 h-3 text-slate-600" />
                                            <span className="text-[10px] text-slate-500 font-bold">{chat.time}</span>
                                        </div>
                                    </div>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-indigo-500 hover:text-white hover:border-indigo-400 transition-all text-[11px] font-black">
                                        查看對話 <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
