"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Loader2, ArrowRight, Bot } from 'lucide-react';

interface SaaSLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    planDetails: any;
    onSuccess: (plan: any) => void;
}

export default function SaaSLoginModal({ isOpen, onClose, planDetails, onSuccess }: SaaSLoginModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate network request
        setTimeout(() => {
            setIsLoading(false);
            onSuccess(planDetails);
        }, 1200);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header Details */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-emerald-400"></div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl border border-indigo-500/30 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">登入開發者帳號</h2>
                                    <p className="text-xs text-slate-400 font-medium">請先登入以配置 {planDetails?.name || '專屬'} 權限</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-1">Email 信箱</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="developer@company.com"
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-2xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center px-1 ml-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">密碼</label>
                                        <a href="#" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">忘記密碼？</a>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-2xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            驗證中...
                                        </>
                                    ) : (
                                        <>
                                            登入並繼續結帳
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-xs text-slate-400 font-medium">還沒有帳號？ <a href="#" className="font-bold text-indigo-400 hover:text-indigo-300">立即註冊</a></p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
