"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // 登入成功，導向至指揮中心
            router.push('/saas-partnership/dashboard');
        } catch (err: any) {
            setError(err.message || '登入失敗，請檢查帳號密碼');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center relative overflow-hidden font-sans">
            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#06C755]/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 relative z-10"
            >
                {/* Logo & Welcome */}
                <div className="text-center mb-10 space-y-4">
                    <div className="inline-flex w-24 h-24 rounded-full bg-white items-center justify-center shadow-2xl shadow-slate-200 mb-4 overflow-hidden relative">
                        <Image src="/lai_logo_8.svg" alt="Logo" fill className="object-cover" priority />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">AGI 指揮官平台</h1>
                    <p className="text-sm font-bold text-slate-400">請輸入您的合作夥伴帳號以啟動調動權限</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/70 backdrop-blur-2xl border-2 border-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-black text-rose-500 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">電子信箱</label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#06C755] transition-colors" />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    autoComplete="username"
                                    className="w-full bg-slate-50/50 border-2 border-transparent focus:border-[#06C755]/20 rounded-2xl py-5 pl-16 pr-6 text-sm font-bold text-slate-900 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">存取金鑰 (密碼)</label>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#06C755] transition-colors" />
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="w-full bg-slate-50/50 border-2 border-transparent focus:border-[#06C755]/20 rounded-2xl py-5 pl-16 pr-6 text-sm font-bold text-slate-900 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-[2rem] py-5 font-black text-sm shadow-xl shadow-[#06C755]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    進入指揮中心
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Links */}
                <div className="text-center mt-10 space-y-4">
                    <p className="text-xs font-bold text-slate-400">
                        忘記密碼？請聯繫 <span className="text-[#06C755] cursor-pointer hover:underline">系統管理員</span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
