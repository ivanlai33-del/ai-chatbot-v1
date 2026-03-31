'use client';

import { Send, Copy } from 'lucide-react';

interface RemoteInvitePanelProps {
    remoteLink: string;
}

export default function RemoteInvitePanel({ remoteLink }: RemoteInvitePanelProps) {
    return (
        <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-20 h-20 rounded-3xl bg-purple-50 flex items-center justify-center mx-auto mb-2 border border-purple-100 shadow-inner">
                <Send className="w-10 h-10 text-purple-500" />
            </div>
            <div className="text-center">
                <h3 className="text-xl font-black mb-2 text-slate-800">協助客戶／家人同步</h3>
                <p className="text-sm text-slate-400 max-w-[400px] mx-auto leading-relaxed">
                    如果您沒有對方的帳號權限，請將此專屬連結傳給對方。對方點擊後即可安全地上傳金鑰至您的儀表板。
                </p>
            </div>

            <div className="p-8 bg-slate-50 border border-slate-200/60 rounded-[32px] space-y-4 shadow-sm">
                <div className="p-4 bg-white border border-slate-200 rounded-2xl break-all text-[11px] font-mono text-slate-500 shadow-inner">
                    {remoteLink}
                </div>
                <button 
                    onClick={() => {
                        navigator.clipboard.writeText(remoteLink);
                        alert('已複製連結');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-black shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
                >
                    <Copy className="w-4 h-4" /> 複製專屬同步連結
                </button>
            </div>
        </div>
    );
}
