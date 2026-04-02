import { CheckCircle2, Copy, Globe } from 'lucide-react';
import { useState } from 'react';

interface ManualSyncPanelProps {
    manualData: {
        channelId: string;
        channelSecret: string;
        channelAccessToken: string;
        botBasicId: string;
    };
    webhookUrl?: string;
    setManualData: (data: any) => void;
    handleManualSubmit: () => void;
    isSubmitting: boolean;
}

export default function ManualSyncPanel({ 
    manualData, 
    webhookUrl,
    setManualData, 
    handleManualSubmit, 
    isSubmitting 
}: ManualSyncPanelProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!webhookUrl) return;
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* --- Block 1: Basic settings --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col">
                    <label className="text-[13px] font-black text-slate-800 uppercase tracking-tight mb-2 px-1">1. Channel ID</label>
                    <input 
                        type="text"
                        placeholder="10位數數字" 
                        value={manualData.channelId}
                        onChange={e => setManualData({ ...manualData, channelId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-[5px] px-5 py-3.5 text-sm font-bold text-slate-700 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-[13px] font-black text-slate-800 uppercase tracking-tight mb-2 px-1">2. Channel Secret</label>
                    <input 
                        type="password" 
                        value={manualData.channelSecret}
                        onChange={e => setManualData({ ...manualData, channelSecret: e.target.value })}
                        placeholder="32位數金鑰"
                        className="w-full bg-slate-50 border border-slate-200 rounded-[5px] px-5 py-3.5 text-sm font-bold text-slate-700 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                    />
                </div>
            </div>

            {/* --- Block 2: Bot Basic ID --- */}
            <div className="flex flex-col">
                <label className="text-[13px] font-black text-slate-800 uppercase tracking-tight mb-2 px-1">3. Bot Basic ID</label>
                <input 
                    type="text"
                    placeholder="@開始的ID" 
                    value={manualData.botBasicId}
                    onChange={e => setManualData({ ...manualData, botBasicId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[5px] px-5 py-3.5 text-sm font-bold text-slate-700 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                />
            </div>

            {/* --- Block 3: Access Token --- */}
            <div className="flex flex-col">
                <label className="text-[13px] font-black text-slate-800 uppercase tracking-tight mb-2 px-1">4. Channel Access Token</label>
                <textarea 
                    value={manualData.channelAccessToken}
                    onChange={e => setManualData({ ...manualData, channelAccessToken: e.target.value })}
                    placeholder="Issue 產出的長字串金鑰"
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[5px] px-5 py-3.5 text-sm font-bold text-slate-700 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal resize-none leading-relaxed"
                />
            </div>

            {/* --- Block 4: Webhook Toggle --- */}
            <div>
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <label className="text-[13px] font-black text-slate-800 uppercase tracking-tight">5. Use Webhook</label>
                        <div className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] text-slate-400 font-bold">?</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-black text-emerald-600">請按此切換至 『ON』</span>
                        <div className="w-10 h-5 bg-emerald-500 rounded-full relative shadow-inner cursor-pointer">
                            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-md" />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Block 5: Webhook URL --- */}
            <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[13px] font-black text-slate-800 uppercase tracking-tight">6. Webhook URL</label>
                    <button 
                        onClick={handleCopy}
                        className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100"
                    >
                        {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? '已復制' : '點此復制'}
                    </button>
                </div>
                
                <div className="relative group">
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-[5px] px-5 py-3 text-[13px] font-bold text-slate-500 break-all pr-12">
                        {webhookUrl || '正在產出網址...'}
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                        <Globe className="w-4 h-4" />
                    </div>
                </div>

                <div className="px-1">
                    <p className="text-[10px] font-bold text-slate-400 leading-tight">
                        💡 請將此段網址貼上並點擊下方 Verify 驗證。
                    </p>
                </div>
            </div>
        </div>
    );
}
