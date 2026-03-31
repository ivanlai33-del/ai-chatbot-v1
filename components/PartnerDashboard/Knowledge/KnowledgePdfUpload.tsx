"use client";

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { FileUp, FileText, Trash2, Save } from 'lucide-react';

interface KnowledgePdfUploadProps {
    fileName: string;
    text: string;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSave: () => void;
    onRemove: () => void;
    saving: boolean;
}

export default function KnowledgePdfUpload({
    fileName,
    text,
    onUpload,
    onSave,
    onRemove,
    saving
}: KnowledgePdfUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <FileUp className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">文件上傳</h3>
                        <p className="text-slate-500 text-xs font-bold">上傳 PDF 型錄或說明書，AI 將從中學習並融入回答</p>
                    </div>
                </div>

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-600 hover:border-indigo-500/50 rounded-3xl p-12 text-center cursor-pointer transition-all group"
                >
                    <FileText className="w-12 h-12 text-slate-600 group-hover:text-indigo-500 mx-auto mb-4 transition-colors" />
                    <p className="text-slate-400 font-bold text-sm mb-2">
                        {fileName ? `📄 ${fileName}` : '點擊或拖曳上傳 PDF 文件'}
                    </p>
                    <p className="text-slate-600 text-xs">支援 PDF 格式 · 建議 100 頁以內</p>
                    <input 
                        ref={fileInputRef} 
                        type="file" 
                        accept=".pdf" 
                        title="上傳 PDF 文件"
                        aria-label="上傳 PDF 文件"
                        className="hidden" 
                        onChange={onUpload} 
                    />
                </div>

                {text && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
                        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">解析預覽（前 500 字）</p>
                            <p className="text-xs text-slate-400 font-mono leading-relaxed line-clamp-5">{text.slice(0, 500)}</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={onRemove} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-2xl font-black text-sm text-slate-300 flex items-center justify-center gap-2 transition-all">
                                <Trash2 className="w-4 h-4" /> 移除
                            </button>
                            <button onClick={onSave} disabled={saving} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all">
                                <Save className="w-4 h-4" /> {saving ? '匯入中...' : '匯入店長智庫'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
