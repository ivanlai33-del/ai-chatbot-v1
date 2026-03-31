"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, CheckCircle2, XCircle } from 'lucide-react';

interface Faq {
    id: string;
    question: string;
    answer: string;
}

interface KnowledgeFaqListProps {
    faqs: Faq[];
    onEdit: (faq: Faq) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
    isModalOpen: boolean;
    onCloseModal: () => void;
    onSaveFaq: () => void;
    newFaq: { question: string; answer: string };
    setNewFaq: (faq: { question: string; answer: string }) => void;
    editingId: string | null;
    saving: boolean;
}

export default function KnowledgeFaqList({
    faqs,
    onEdit,
    onDelete,
    onAdd,
    isModalOpen,
    onCloseModal,
    onSaveFaq,
    newFaq,
    setNewFaq,
    editingId,
    saving
}: KnowledgeFaqListProps) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight mb-1">FAQ 知識訓練集</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Question & Answer Pairs</p>
                </div>
                <button 
                    onClick={onAdd} 
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-2xl font-black text-sm transition-all"
                >
                    <PlusCircle className="w-4 h-4" />新增知識點
                </button>
            </div>
            <div className="bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-slate-700/50">
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">問題</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">回答</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {faqs.length > 0 ? faqs.map((faq, idx) => (
                            <tr key={faq.id} className="group hover:bg-slate-700/20 transition-all">
                                <td className="px-8 py-5 text-sm font-bold text-white max-w-[200px] truncate">{faq.question}</td>
                                <td className="px-8 py-5 text-sm text-slate-400 font-medium max-w-[300px] truncate">{faq.answer}</td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center justify-end gap-4">
                                        <button 
                                            onClick={() => onEdit(faq)} 
                                            className="text-xs font-black text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-widest"
                                        >
                                            編輯
                                        </button>
                                        <button 
                                            onClick={() => onDelete(faq.id)} 
                                            className="text-xs font-black text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-widest"
                                        >
                                            刪除
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={3} className="px-8 py-10 text-center text-slate-500 text-sm font-bold">目前尚無知識點，請點擊上方按鈕新增。</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* FAQ Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0f172a]/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl"
                        >
                            <h3 className="text-2xl font-black text-white mb-6">{editingId ? '編輯知識點' : '新增知識點'}</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">問題</label>
                                    <input 
                                        type="text" 
                                        placeholder="例如：你們的退貨政策是什麼？" 
                                        value={newFaq.question} 
                                        onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })} 
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">回答</label>
                                    <textarea 
                                        placeholder="提供準確且簡潔的回答，供 AI 參考。" 
                                        value={newFaq.answer} 
                                        onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })} 
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-sm text-white h-32 focus:outline-none focus:border-indigo-500 transition-all resize-none" 
                                    />
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <button 
                                        onClick={onCloseModal} 
                                        className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-2xl font-black text-sm transition-all"
                                    >
                                        取消
                                    </button>
                                    <button 
                                        onClick={onSaveFaq} 
                                        disabled={saving} 
                                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/30"
                                    >
                                        {saving ? '儲存中...' : (editingId ? '儲存變更' : '立即新增')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
