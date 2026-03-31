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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* --- Basic settings Section --- */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[14px] font-black text-slate-800 uppercase tracking-tight px-1">Channel ID</label>
                        <input 
                            type="text"
                            placeholder="10位數數字" 
                            value={manualData.channelId}
                            onChange={e => setManualData({ ...manualData, channelId: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-[5px] px-5 py-4 text-sm font-bold text-slate-700 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[14px] font-black text-slate-800 uppercase tracking-tight px-1">Channel Secret</label>
                        <input 
                            type="password" 
                            value={manualData.channelSecret}
                            onChange={e => setManualData({ ...manualData, channelSecret: e.target.value })}
                            placeholder="32位數金鑰"
                            className="w-full bg-slate-50 border border-slate-200 rounded-[5px] px-5 py-4 text-sm font-bold text-slate-700 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                        />
                    </div>
                </div>
            </div>

            {/* --- Messaging API Section --- */}
            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-[14px] font-black text-slate-800 uppercase tracking-tight px-1">Bot Basic ID</label>
                    <input 
                        type="text"
                        placeholder="@開始的ID" 
                        value={manualData.botBasicId}
                        onChange={e => setManualData({ ...manualData, botBasicId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-[5px] px-5 py-4 text-sm font-bold text-slate-700 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[14px] font-black text-slate-800 uppercase tracking-tight px-1">Channel Access Token</label>
                    <textarea 
                        value={manualData.channelAccessToken}
                        onChange={e => setManualData({ ...manualData, channelAccessToken: e.target.value })}
                        placeholder="Issue 產出的長字串金鑰"
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-[5px] px-5 py-4 text-sm font-bold text-slate-700 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal resize-none leading-relaxed"
                    />
                </div>
            </div>

            {/* --- Webhook Section --- */}
            <div className="space-y-8 pt-4 border-t border-slate-100">
                {/* Use Webhook Header with LINE Toggle Mockup */}
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <label className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Use Webhook</label>
                        <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-bold">?</div>
                    </div>
                    {/* LINE Style Toggle Mockup */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-emerald-600">請切換到 『ON』</span>
                        <div className="w-12 h-6 bg-emerald-500 rounded-full relative shadow-inner">
                            <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md" />
                        </div>
                    </div>
                </div>

                {/* Webhook URL Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Webhook URL</label>
                        <button 
                            onClick={handleCopy}
                            className="text-[11px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm shadow-emerald-50"
                        >
                            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? '已復制網址' : '點此復制'}
                        </button>
                    </div>
                    
                    <div className="relative group">
                        <div className="w-full bg-white border-2 border-slate-200 rounded-[5px] px-6 py-5 text-sm font-bold text-slate-600 break-all pr-14 shadow-sm group-hover:border-emerald-300 transition-colors">
                            {webhookUrl || '正在產出對應網址...'}
                        </div>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
                            <Globe className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-amber-50 border-2 border-amber-100 rounded-[5px] p-6 mt-4">
                        <p className="text-[16px] md:text-[18px] font-black text-amber-800 text-center leading-relaxed">
                            💡 請將此段網址貼上至 LINE 控制台 Webhook URL 欄位，<br className="hidden md:block" />
                            並點擊下方 <span className="text-emerald-600 underline underline-offset-4">Verify</span> 驗證。
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-6">
                <button 
                    onClick={handleManualSubmit} 
                    disabled={isSubmitting}
                    className="w-full py-6 disabled:opacity-50 text-white rounded-[5px] text-xl font-black shadow-2xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] bg-gradient-to-br from-emerald-600 to-cyan-600"
                >
                    {isSubmitting ? '正在進行驗證...' : '確認手動開通機器人'}
                    <CheckCircle2 className="w-6 h-6 text-emerald-200" />
                </button>
            </div>
        </div>
    );
}
