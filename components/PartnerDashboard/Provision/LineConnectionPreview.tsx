"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Link2, ShieldCheck, Info, 
    CheckCircle2, ExternalLink,
    AlertCircle, Lock
} from 'lucide-react';

interface LineConnectionPreviewProps {
    config: {
        channelSecret: string;
        accessToken: string;
        basicId: string;
    };
    onConnect: () => void;
    isConnecting: boolean;
}

export default function LineConnectionPreview({ config, onConnect, isConnecting }: LineConnectionPreviewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-2xl border border-indigo-100 rounded-[2.5rem] p-10 shadow-2xl max-w-lg w-full"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#06C755]/10 flex items-center justify-center text-[#06C755]">
                    <Link2 className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">偵測到串接憑證</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">LINE Developers Integration</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldCheck className="w-12 h-12 text-[#06C755]" />
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Basic ID</p>
                            <p className="text-lg font-black text-slate-800">{config.basicId || '未偵測到'}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Lock className="w-3 h-3" /> Channel Secret
                                </p>
                                <p className="text-xs font-mono bg-white p-2 rounded-lg border border-slate-100 text-slate-600 truncate">
                                    {config.channelSecret.substring(0, 8)}****************{config.channelSecret.slice(-4)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
                        請確認 Webhook URL 已在 LINE Developers 控制台設定完成，否則 AI 將無法接收訊息。
                    </p>
                </div>
            </div>

            <button
                onClick={onConnect}
                disabled={isConnecting}
                className="w-full mt-8 py-5 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-[#06C755]/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
                {isConnecting ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <CheckCircle2 className="w-5 h-5" /> 
                        確認串接並啟動服務
                    </>
                )}
            </button>
            
            <p className="text-center mt-6 text-[10px] font-bold text-slate-400 flex items-center justify-center gap-2">
                <ShieldCheck className="w-3 h-3" />
                憑證將採用 AES-256 加密儲存，確保資安無虞
            </p>
        </motion.div>
    );
}
