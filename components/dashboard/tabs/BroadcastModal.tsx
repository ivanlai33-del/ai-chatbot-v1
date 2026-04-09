import { useState } from 'react';
import { X, Send, Sparkles, Filter } from 'lucide-react';

interface BroadcastModalProps {
    isOpen: boolean;
    onClose: () => void;
    botId: string;
    availableTags: string[];
    onSendSuccess?: () => void;
}

export default function BroadcastModal({ isOpen, onClose, botId, availableTags, onSendSuccess }: BroadcastModalProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [campaignContext, setCampaignContext] = useState('');
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);

    if (!isOpen) return null;

    const toggleTag = (t: string) => {
        setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
    };

    const handleGenerateMessage = async () => {
        if (!campaignContext) return alert('請輸入活動大綱');
        setIsGenerating(true);
        try {
            const res = await fetch('/api/chat/write-copy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: campaignContext,
                    targetAudience: selectedTags.length > 0 ? selectedTags.join(', ') : '所有顧客'
                })
            });
            const data = await res.json();
            if (data.message) {
                setGeneratedMessage(data.message);
            }
        } catch (e: any) {
            console.error(e);
            alert('AI 文案生成失敗');
        }
        setIsGenerating(false);
    };

    const handleSend = async () => {
        if (!generatedMessage) return alert('請確認推播文案');
        if (!confirm(`確定要針對 ${selectedTags.length > 0 ? selectedTags.join(', ') : '所有人'} 發送推播嗎？這將會消耗您的 LINE 官方帳號訊息額度。`)) return;

        setIsSending(true);
        try {
            const res = await fetch('/api/line/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    botId,
                    tags: selectedTags,
                    message: generatedMessage
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(`推播成功發送給 ${data.sentCount} 位顧客！`);
                onSendSuccess?.();
                onClose();
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            alert('發送失敗: ' + err.message);
        }
        setIsSending(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[24px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-[24px] flex items-center justify-center">
                            <Send className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">一鍵 AI 分眾推播</h2>
                            <p className="text-xs text-slate-500">精準投遞給目標受眾，大幅提升轉換率</p>
                        </div>
                    </div>
                    <button onClick={onClose} title="關閉" aria-label="關閉對話框" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-[24px] transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Step 1: Select Tags */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Filter className="w-4 h-4 text-slate-500" />
                            <h3 className="font-bold text-sm text-slate-700">步驟 1：選擇目標客群標籤 (單選或多選)</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.length === 0 ? (
                                <p className="text-sm text-slate-400">目前沒有可用的客群標籤</p>
                            ) : (
                                availableTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1.5 rounded-[24px] text-sm font-bold border transition-colors ${selectedTags.includes(tag) ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'}`}
                                    >
                                        #{tag}
                                    </button>
                                ))
                            )}
                        </div>
                        {selectedTags.length === 0 && availableTags.length > 0 && <p className="text-xs text-slate-400 mt-2">未選擇將預設推播給「所有有建檔互動的客戶」</p>}
                    </div>

                    {/* Step 2: Input Intent */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-slate-500" />
                            <h3 className="font-bold text-sm text-slate-700">步驟 2：告訴 AI 推播的核心目的</h3>
                        </div>
                        <textarea
                            className="w-full border border-slate-200 rounded-[24px] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                            rows={3}
                            placeholder="例如：母親節檔期全面 8 折，針對這群客人推薦精華液套組，語氣要溫柔促銷..."
                            value={campaignContext}
                            onChange={(e) => setCampaignContext(e.target.value)}
                        />
                        <button 
                            className="mt-2 text-[15px] bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-black py-4 px-4 rounded-[24px] flex items-center justify-center gap-2 w-full transition shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                            onClick={handleGenerateMessage}
                            disabled={isGenerating || !campaignContext}
                        >
                            {isGenerating ? 'AI 正在撰寫中...' : '讓 AI 生成吸睛推播文案'}
                        </button>
                    </div>

                    {/* Step 3: Review Message */}
                    <div className="p-4 bg-yellow-50/50 border border-yellow-100 rounded-[24px]">
                        <h3 className="font-bold text-sm text-slate-700 mb-2">預覽即將發送的文字</h3>
                        <textarea
                            className="w-full bg-white border border-slate-200 rounded-[24px] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                            rows={5}
                            placeholder="AI 構思的文案會顯示在這裡，您也可以手動修改..."
                            value={generatedMessage}
                            onChange={(e) => setGeneratedMessage(e.target.value)}
                        />
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 font-bold text-slate-500 hover:text-slate-800 transition">
                        取消
                    </button>
                    <button 
                        onClick={handleSend}
                        disabled={isSending || !generatedMessage}
                        className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-[24px] shadow-md transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSending ? '發送中...' : '確認無誤，立刻發送'}
                    </button>
                </div>
            </div>
        </div>
    );
}
