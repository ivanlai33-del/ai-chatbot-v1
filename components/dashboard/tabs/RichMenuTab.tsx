import React, { useState, useRef, useEffect } from 'react';
import { 
    Wand2, Save, Type, Palette, AlignLeft, Upload, Tag, 
    AlertCircle, Loader2, ImageIcon, Download, CheckCircle2, Send, ChevronRight, X, Link, MessageSquare, 
    Zap, Calendar, Copy, Repeat, MousePointer2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const TEMPLATES = [
    { 
        id: '1-3', 
        name: '旗艦型 (1大3小)', 
        grids: ['1', '2', '3', '4'],
        layout: (
            <div className="flex flex-col gap-0.5 w-16 h-10 rounded-md overflow-hidden border border-emerald-200 shadow-sm bg-white">
                <div className="h-[60%] bg-emerald-500/20 flex items-center justify-center text-[10px] font-black text-emerald-600">1</div>
                <div className="flex-1 flex gap-0.5">
                    <div className="flex-1 bg-emerald-500/10 flex items-center justify-center text-[8px] font-black text-emerald-600">2</div>
                    <div className="flex-1 bg-emerald-500/10 flex items-center justify-center text-[8px] font-black text-emerald-600">3</div>
                    <div className="flex-1 bg-emerald-500/10 flex items-center justify-center text-[8px] font-black text-emerald-600">4</div>
                </div>
            </div>
        )
    },
    { 
        id: '6-grid', 
        name: '經典版 (6等分)', 
        grids: ['1', '2', '3', '4', '5', '6'],
        layout: (
            <div className="grid grid-cols-3 grid-rows-2 gap-0.5 w-16 h-10 rounded-md overflow-hidden border border-emerald-200 shadow-sm bg-white">
                {[1,2,3,4,5,6].map(i => <div key={i} className="bg-emerald-500/10 flex items-center justify-center text-[10px] font-black text-emerald-600">{i}</div>)}
            </div>
        )
    },
    { 
        id: 'compact-3', 
        name: '緊湊型 (3等分)', 
        grids: ['1', '2', '3'],
        layout: (
            <div className="grid grid-cols-3 gap-0.5 w-16 h-5 rounded-md overflow-hidden border border-emerald-200 shadow-sm bg-white">
                {[1,2,3].map(i => <div key={i} className="bg-emerald-500/10 flex items-center justify-center text-[8px] font-black text-emerald-600">{i}</div>)}
            </div>
        )
    },
];

const ACTION_TYPES = [
    { id: 'uri', name: '開啟網頁', icon: <Link className="w-3 h-3" />, color: 'text-blue-500' },
    { id: 'message', name: '傳送文字', icon: <MessageSquare className="w-3 h-3" />, color: 'text-emerald-500' },
    { id: 'postback', name: '隱藏回傳 (AI)', icon: <Zap className="w-3 h-3" />, color: 'text-amber-500' },
    { id: 'datetimepicker', name: '時間預約', icon: <Calendar className="w-3 h-3" />, color: 'text-rose-500' },
    { id: 'clipboard', name: '複製文字', icon: <Copy className="w-3 h-3" />, color: 'text-purple-500' },
    { id: 'richmenuswitch', name: '切換選單', icon: <Repeat className="w-3 h-3" />, color: 'text-indigo-500' },
];

export default function RichMenuTab({ config, setConfig, planLevel, botId }: any) {
    const [mode, setMode] = useState<'ai' | 'upload'>('ai');
    const [activeTemplate, setActiveTemplate] = useState('1-3');
    const [menuMeta, setMenuMeta] = useState({ name: '', startDate: '', endDate: '' });
    
    // 初始化按鈕設定
    const [buttonSettings, setButtonSettings] = useState<any[]>(
        Array(6).fill(null).map(() => ({ 
            type: 'uri', 
            label: '', 
            value: '', 
            data: '', // 用於 Postback 或 DatetimePicker
            mode: 'datetime', // 用於 DatetimePicker: date, time, datetime
            richMenuAliasId: '' // 用於切換選單
        }))
    );

    const [aiForm, setAiForm] = useState({ content: '', style: '', buttons: '' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishResult, setPublishResult] = useState<{ success: boolean; message: string } | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentTemplate = TEMPLATES.find(t => t.id === activeTemplate) || TEMPLATES[0];

    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `rich-menu-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const compressImage = (base64Str: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d')!;
                canvas.width = 2500;
                canvas.height = activeTemplate === 'compact-3' ? 843 : 1686;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            const rawBase64 = event.target?.result as string;
            const compressed = await compressImage(rawBase64);
            setGeneratedImage(compressed);
        };
        reader.readAsDataURL(file);
    };

    const handleGenerate = async () => {
        if (!aiForm.content || !aiForm.style) {
            alert('請填寫畫面主題與風格描述');
            return;
        }
        setIsGenerating(true);
        setGeneratedImage(null);
        try {
            const res = await fetch('/api/rich-menu/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: aiForm.content,
                    style: aiForm.style,
                    buttons: aiForm.buttons,
                    layout: activeTemplate,
                    userId: 'Ud8b8dd79162387a80b2b5a4aba20f604',
                }),
            });
            const data = await res.json();
            if (data.success) {
                setGeneratedImage(data.imageUrl);
            } else {
                alert(data.error || '生成失敗');
            }
        } catch (err) {
            alert('網路錯誤，請稍後再試');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePublish = async () => {
        if (!generatedImage) return;
        setIsPublishing(true);
        setPublishResult(null);
        try {
            let finalImage = generatedImage;
            if (generatedImage.startsWith('data:image')) {
                finalImage = await compressImage(generatedImage);
            }

            // 轉換為完整的 LINE API actions 格式
            const actions = buttonSettings.slice(0, currentTemplate.grids.length).map(btn => {
                switch(btn.type) {
                    case 'uri':
                        return { type: 'uri', label: btn.label || '開啟網頁', uri: btn.value };
                    case 'message':
                        return { type: 'message', label: btn.label || '傳送文字', text: btn.value };
                    case 'postback':
                        return { type: 'postback', label: btn.label || '指令', data: btn.data || btn.value, displayText: btn.value };
                    case 'datetimepicker':
                        return { type: 'datetimepicker', label: btn.label || '選擇時間', data: btn.data || 'datetime_booking', mode: btn.mode || 'datetime' };
                    case 'clipboard':
                        return { type: 'clipboard', label: btn.label || '複製', clipboardText: btn.value };
                    case 'richmenuswitch':
                        return { type: 'richmenuswitch', label: btn.label || '切換', richMenuAliasId: btn.richMenuAliasId, data: btn.data || 'switch' };
                    default:
                        return { type: 'message', text: '按鈕' };
                }
            });

            const res = await fetch('/api/rich-menu/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    botId,
                    imageUrl: finalImage,
                    layout: activeTemplate,
                    actions: actions,
                    menuName: menuMeta.name || '圖文選單',
                }),
            });
            const data = await res.json();
            setPublishResult({ success: data.success, message: data.message || '操作完成' });
        } catch (err: any) {
            setPublishResult({ success: false, message: '傳輸失敗，圖片體積可能過大' });
        } finally {
            setIsPublishing(false);
        }
    };

    const updateButton = (idx: number, field: string, value: string) => {
        const newSettings = [...buttonSettings];
        newSettings[idx] = { ...newSettings[idx], [field]: value };
        setButtonSettings(newSettings);
    };

    return (
        <div className="flex flex-col gap-4 animate-in fade-in duration-700 pb-12">
            
            {/* 頂部工具列 */}
            <div className="flex items-end justify-between gap-4">
                <div className="flex flex-wrap gap-3">
                    {TEMPLATES.map((t) => (
                        <button 
                            key={t.id} 
                            onClick={() => { setActiveTemplate(t.id); setGeneratedImage(null); }} 
                            className={`flex flex-col items-center gap-2 p-3 rounded-[20px] border-2 transition-all duration-300 ${activeTemplate === t.id ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                        >
                            {t.layout}
                            <span className={`text-[10px] font-black ${activeTemplate === t.id ? 'text-emerald-600' : 'text-slate-400'}`}>{t.name}</span>
                        </button>
                    ))}
                </div>
                <div className="flex items-end gap-3">
                    <div className="flex gap-2 p-1 bg-slate-100/50 rounded-2xl w-fit">
                        <button onClick={() => setMode('ai')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${mode === 'ai' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}><Wand2 className="w-3.5 h-3.5" /> AI 設計模式</button>
                        <button onClick={() => setMode('upload')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${mode === 'upload' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}><Upload className="w-3.5 h-3.5" /> 手動上傳</button>
                    </div>
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing || !generatedImage}
                        className={`px-8 py-3 rounded-full font-black text-sm transition-all shadow-xl flex items-center gap-2 ${
                            generatedImage
                                ? 'bg-gradient-to-r from-emerald-600 to-cyan-700 text-white hover:scale-105 shadow-emerald-500/30'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        } disabled:opacity-70`}
                    >
                        {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {isPublishing ? '發佈中...' : '發佈至 LINE'}
                    </button>
                </div>
            </div>

            {/* 排程設定 */}
            <div className="px-2 py-2 flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-800 font-black text-sm shrink-0">
                    <Tag className="w-4 h-4 text-emerald-500" /> 選單排程設定
                </div>
                <div className="flex-1 grid grid-cols-3 gap-3">
                    <input type="text" value={menuMeta.name} onChange={(e) => setMenuMeta({ ...menuMeta, name: e.target.value })} placeholder="選單識別名稱" className="w-full bg-white/60 border border-slate-100 rounded-xl px-4 py-2 text-[12px] font-bold focus:bg-white transition-all outline-none" />
                    <input type="date" value={menuMeta.startDate} onChange={(e) => setMenuMeta({ ...menuMeta, startDate: e.target.value })} className="w-full bg-white/60 border border-slate-100 rounded-xl px-4 py-2 text-[12px] font-bold focus:bg-white transition-all outline-none" />
                    <input type="date" value={menuMeta.endDate} onChange={(e) => setMenuMeta({ ...menuMeta, endDate: e.target.value })} className="w-full bg-white/60 border border-slate-100 rounded-xl px-4 py-2 text-[12px] font-bold focus:bg-white transition-all outline-none" />
                </div>
            </div>

            {/* 主要區域 */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                {mode === 'ai' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div className="space-y-4">
                            <div className="bg-emerald-50/50 p-6 rounded-[32px] border border-emerald-100/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-9 h-9 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg"><Wand2 className="w-5 h-5 text-white" /></div>
                                    <div><h3 className="text-md font-black text-slate-800 leading-none">AI 視覺設計師</h3><p className="text-[9px] text-emerald-600 font-bold mt-1">Smart Design Engine</p></div>
                                </div>
                                <div className="space-y-4">
                                    <textarea value={aiForm.content} onChange={(e) => setAiForm({ ...aiForm, content: e.target.value })} placeholder="描述您想要的畫面..." className="w-full h-24 bg-white border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all" />
                                    <input type="text" value={aiForm.style} onChange={(e) => setAiForm({ ...aiForm, style: e.target.value })} placeholder="風格：馬卡龍色系、現代極簡..." className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-emerald-500 outline-none" />
                                    <input type="text" value={aiForm.buttons} onChange={(e) => setAiForm({ ...aiForm, buttons: e.target.value })} placeholder="按鈕：左邊官網、右邊預約、底部選單..." className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-2.5 text-[12px] font-bold focus:border-emerald-500 outline-none" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 h-full">
                            <div 
                                className="relative w-full overflow-hidden rounded-[32px] border-4 border-white shadow-2xl bg-slate-100/50 flex items-center justify-center transition-all duration-500 min-h-[260px]"
                                style={{ aspectRatio: activeTemplate === 'compact-3' ? '2500/843' : '2500/1686' }}
                            >
                                {generatedImage ? (
                                    <div className="relative group w-full h-full">
                                        <img src={generatedImage} className="w-full h-full object-cover" alt="Generated Preview" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4 backdrop-blur-sm">
                                            <button onClick={handleDownload} className="p-4 bg-white text-slate-900 rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl"><Download className="w-6 h-6" /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 text-slate-300">
                                        <div className="w-16 h-16 rounded-full bg-slate-200/50 flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                        <div className="font-black text-sm tracking-widest">{isGenerating ? 'AI 正在全力繪製中...' : '預覽視窗 (等待生成)'}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="py-16 flex flex-col items-center justify-center border-4 border-dashed border-slate-50 rounded-[40px] hover:bg-slate-50 cursor-pointer">
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                        <Upload className="w-12 h-12 text-slate-200 mb-4" />
                        <h4 className="text-lg font-black text-slate-800">手動上傳自訂底圖</h4>
                    </div>
                )}
            </div>

            {/* 按鈕進階設定區 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentTemplate.grids.map((gridId, idx) => {
                    const btn = buttonSettings[idx];
                    return (
                        <div key={gridId} className={`bg-white p-5 rounded-[28px] border-2 border-slate-100 hover:border-emerald-200 transition-all shadow-sm ${activeTemplate === '1-3' && idx === 0 ? 'md:col-span-2 lg:col-span-3' : 'col-span-1'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-black flex items-center justify-center text-xs shadow-md shadow-emerald-500/20">{gridId}</div>
                                <select 
                                    value={btn.type}
                                    onChange={(e) => updateButton(idx, 'type', e.target.value)}
                                    className="bg-slate-50 text-slate-700 text-[10px] font-black px-3 py-1.5 rounded-xl border-none focus:ring-1 focus:ring-emerald-500 outline-none"
                                >
                                    {ACTION_TYPES.map(at => <option key={at.id} value={at.id}>{at.name}</option>)}
                                </select>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 ml-1 flex items-center gap-1.5 tracking-wider"><Type className="w-3 h-3" /> 按鈕標籤 (輔助顯示)</label>
                                    <input type="text" value={btn.label} onChange={(e) => updateButton(idx, 'label', e.target.value)} placeholder="例如：預約服務" className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-3 py-2 text-xs font-bold focus:bg-white focus:border-emerald-500 transition-all outline-none" />
                                </div>

                                {/* 動態顯示對應輸入框 */}
                                {btn.type === 'datetimepicker' ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 ml-1 tracking-wider">選擇模式</label>
                                            <select value={btn.mode} onChange={(e) => updateButton(idx, 'mode', e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-3 py-2 text-xs font-bold outline-none">
                                                <option value="datetime">日期與時間</option>
                                                <option value="date">僅日期</option>
                                                <option value="time">僅時間</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 ml-1 tracking-wider">回傳 Data</label>
                                            <input type="text" value={btn.data} onChange={(e) => updateButton(idx, 'data', e.target.value)} placeholder="appointment_id=123" className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                                        </div>
                                    </div>
                                ) : btn.type === 'richmenuswitch' ? (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 ml-1 tracking-wider">選單別名 ID (Alias ID)</label>
                                        <input type="text" value={btn.richMenuAliasId} onChange={(e) => updateButton(idx, 'richMenuAliasId', e.target.value)} placeholder="輸入目標選單的別名" className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-3 py-2 text-xs font-bold focus:border-emerald-500 outline-none" />
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 ml-1 flex items-center gap-1.5 tracking-wider">
                                            {ACTION_TYPES.find(a => a.id === btn.type)?.icon} 動作內容 (Value / URL)
                                        </label>
                                        <input type="text" value={btn.value} onChange={(e) => updateButton(idx, 'value', e.target.value)} placeholder={btn.type === 'uri' ? "https://..." : "請輸入內容"} className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-3 py-2 text-xs font-bold focus:bg-white focus:border-emerald-500 transition-all outline-none" />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-2 text-center">
                <button onClick={handleGenerate} disabled={isGenerating || !aiForm.content} className={`w-full max-w-xl mx-auto h-14 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${isGenerating || !aiForm.content ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-white hover:scale-[1.02] active:scale-95 shadow-emerald-500/30'}`}>
                    {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wand2 className="w-6 h-6" />}
                    {isGenerating ? '正在繪製設計...' : '生成圖文選單底圖'}
                </button>
                <p className="text-[10px] font-bold text-slate-400 mt-3 flex items-center justify-center gap-2"><AlertCircle className="w-3.5 h-3.5 text-amber-500" /> 每次生成扣除 <span className="text-rose-500 font-black">100</span> 點額度</p>
            </div>

            {publishResult && (
                <div className={`fixed bottom-10 right-10 z-50 flex items-center gap-4 px-8 py-5 rounded-[24px] font-black text-md shadow-2xl animate-in slide-in-from-bottom-5 ${publishResult.success ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    {publishResult.success ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    {publishResult.message}
                    <button onClick={() => setPublishResult(null)} className="ml-4 opacity-50 hover:opacity-100"><X className="w-5 h-5" /></button>
                </div>
            )}
        </div>
    );
}
