'use client';

import { motion } from 'framer-motion';
import { Lock, Database, FileText, Globe, CheckCircle2 } from 'lucide-react';

interface RAGTabProps {
    planLevel: number;
    bots: any[];
    selectedBotId: string | null;
}

export default function RAGTab({ planLevel, bots, selectedBotId }: RAGTabProps) {
    if (planLevel < 2) {
        return (
            <div className="py-16 flex flex-col items-center justify-center text-center px-10">
                <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                    <Lock className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">PDF / 網頁深度學習 (RAG) 尚未開通</h3>
                <p className="text-slate-500 max-w-sm mb-6 leading-relaxed">
                    此功能目前僅限於 <span className="text-amber-600 font-bold">Company 旗艦版</span> 用戶使用，升級後可讓 AI 自動讀懂您的型錄、說明書與官網內容。
                </p>

                {/* 功能預覽 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mb-8 text-left">
                    {[
                        { icon: FileText, title: '上傳 PDF 型錄', desc: '商品型錄、服務說明書、價格表' },
                        { icon: Globe, title: '貼入網頁網址', desc: '官網、菜單、房型介紹頁' },
                        { icon: Database, title: 'AI 自動學習', desc: '讀取完成，問什麼都能答' },
                    ].map(f => (
                        <div key={f.title} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <f.icon className="w-5 h-5 text-slate-400 mb-2" />
                            <p className="text-[12px] font-black text-slate-600">{f.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{f.desc}</p>
                        </div>
                    ))}
                </div>

                <motion.button 
                    onClick={() => window.location.href = '/#pricing'} 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-8 py-3 rounded-2xl bg-slate-800 text-white font-black text-sm shadow-xl"
                >
                    了解升級方案 →
                </motion.button>
            </div>
        );
    }

    const currentBot = bots.find(b => b.id === selectedBotId);

    return (
        <div className="py-12 flex flex-col items-center justify-center text-center px-10">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mb-6 border border-blue-100">
                <Database className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-black text-slate-800">PDF / 網頁知識上傳</h3>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-600 text-[10px] font-black tracking-wider">BETA</span>
            </div>
            <p className="text-slate-500 max-w-sm mb-2 leading-relaxed">
                您可以為 <span className="font-bold text-slate-700">[{currentBot?.channelName || '此店長'}]</span> 上傳專屬文件，AI 將自動學習內容後回答相關問題。
            </p>
            <p className="text-[12px] text-amber-600 font-bold mb-8">🚧 此功能正在開發中，即將推出完整上傳體驗</p>

            {/* 即將推出功能說明 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mb-8 text-left w-full">
                {[
                    '上傳 PDF（型錄、說明書、價格表）',
                    '貼入網址讓 AI 自動爬取學習',
                    '查看已學習文件清單',
                    '設定文件有效期（過期自動停用）',
                ].map(item => (
                    <div key={item} className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-[12px] font-bold text-blue-700">{item}</p>
                    </div>
                ))}
            </div>

            <button disabled className="px-8 py-3 rounded-2xl bg-blue-200 text-blue-400 font-black text-sm cursor-not-allowed">
                + 上傳 PDF / 網址（即將開放）
            </button>
        </div>
    );
}
