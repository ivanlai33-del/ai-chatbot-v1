"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Lock, Save, Plus, Trash2, ShoppingBag, MessageSquare, ClipboardList, Brain, RefreshCw, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LINE_GREEN } from '@/lib/chat-constants';

interface ChatAdminViewProps {
    botId: string;
    mgmtToken: string;
    adminBotData: any;
    products: any[];
    faqList: any[];
    orders: any[];
    onSaveBrain: (prompt: string) => void;
    onAddProduct: (product: any) => void;
    onDeleteProduct: (id: string) => void;
    onAddFaq: (faq: any) => void;
    onDeleteFaq: (id: string) => void;
}

export const ChatAdminView: React.FC<ChatAdminViewProps> = ({
    botId,
    adminBotData,
    products,
    faqList,
    orders,
    onSaveBrain,
    onAddProduct,
    onDeleteProduct,
    onAddFaq,
    onDeleteFaq
}) => {
    const [activeTab, setActiveTab] = useState<'brain' | 'products' | 'faq' | 'orders'>('brain');
    const [brainPrompt, setBrainPrompt] = useState(adminBotData?.prompt || "");
    const [showUpsell, setShowUpsell] = useState(false);

    // Local states for adding new items
    const [newProduct, setNewProduct] = useState({ name: '', price: '', stock_quantity: '', purchase_url: '' });
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

    return (
        <div className="space-y-6">
            {/* Admin Tabs */}
            <div className="flex border-b border-slate-200">
                {(['brain', 'products', 'faq', 'orders'] as const).map((tab) => {
                    const isLocked = false; // Add logic if needed
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 py-3 text-[12px] font-black transition-all border-b-2 flex items-center justify-center gap-1.5",
                                activeTab === tab ? "text-green-600 border-green-500" : "border-transparent text-slate-400"
                            )}
                            style={activeTab === tab ? { borderBottomColor: LINE_GREEN, color: LINE_GREEN } : {}}
                        >
                            {tab === 'brain' ? <Brain className="w-4 h-4" /> : tab === 'products' ? <ShoppingBag className="w-4 h-4" /> : tab === 'faq' ? <MessageSquare className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
                            <span className="hidden sm:inline">
                                {tab === 'brain' ? 'AI 大腦' : tab === 'products' ? '商品/課程' : tab === 'faq' ? '知識庫' : '訂單'}
                            </span>
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'brain' && (
                    <motion.div
                        key="brain"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">店長人格與指示 (Prompt)</label>
                            <textarea
                                value={brainPrompt}
                                onChange={(e) => setBrainPrompt(e.target.value)}
                                className="w-full h-48 p-4 rounded-xl border border-slate-100 bg-white text-[14px] focus:ring-2 focus:ring-green-500 outline-none resize-none font-medium leading-relaxed"
                            />
                        </div>
                        <button
                            onClick={() => onSaveBrain(brainPrompt)}
                            className="w-full py-3 text-white rounded-xl font-black text-[15px] flex items-center justify-center gap-2 shadow-lg"
                            style={{ backgroundColor: LINE_GREEN }}
                        >
                            <Save className="w-4 h-4" /> 儲存大腦設定
                        </button>
                    </motion.div>
                )}

                {activeTab === 'products' && (
                    <motion.div
                        key="products"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Product List */}
                        <div className="grid grid-cols-1 gap-3">
                            {products.map(p => (
                                <div key={p.id} className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between shadow-sm">
                                    <div>
                                        <div className="font-bold text-slate-800">{p.name}</div>
                                        <div className="text-xs text-slate-400 font-medium">${p.price} · 庫存: {p.stock_quantity}</div>
                                    </div>
                                    <button onClick={() => onDeleteProduct(p.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Product Form */}
                        <div className="p-5 border-2 border-dashed border-slate-200 rounded-2xl space-y-4">
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">新增商品項目</div>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    placeholder="商品名稱"
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                                    className="p-3 bg-white border border-slate-100 rounded-lg text-sm"
                                />
                                <input
                                    placeholder="價格"
                                    type="number"
                                    value={newProduct.price}
                                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                                    className="p-3 bg-white border border-slate-100 rounded-lg text-sm"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    onAddProduct(newProduct);
                                    setNewProduct({ name: '', price: '', stock_quantity: '', purchase_url: '' });
                                }}
                                className="w-full py-3 bg-slate-800 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> 加入商店
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Add more tabs FAQ and Orders similarly if needed */}
            </AnimatePresence>
        </div>
    );
};
