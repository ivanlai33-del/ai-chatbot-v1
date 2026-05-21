"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, ShieldCheck, ArrowRight, Mail, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function PartnerLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // Check if this user is a partner
            const { data: partnerData, error: partnerError } = await supabase
                .from('partners')
                .select('id')
                .eq('contact_email', email)
                .single();

            if (partnerError || !partnerData) {
                await supabase.auth.signOut();
                throw new Error('此帳號不具備合作夥伴權限');
            }

            // Redirect to partner dashboard
            window.location.href = '/saas-partnership/dashboard';
        } catch (err: any) {
            setError(err.message || '登入失敗，請檢查您的憑證');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#06C755]/5 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-16 h-16 bg-[#06C755] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#06C755]/20 mb-6 group cursor-pointer">
                        <Image src="/lai_logo_3.svg" alt="Logo" width={32} height={32} className="brightness-0 invert group-hover:scale-110 transition-transform" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">SaaS 合作夥伴門戶</h1>
                    <p className="text-slate-500 font-medium text-sm">Orchestrating AGI Infrastructure</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-slate-200/50">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-3"
                            >
                                <ShieldCheck className="w-4 h-4 shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">合作夥伴信箱</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#06C755] transition-colors" />
                                <input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="partner@example.com"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-[#06C755]/30 focus:bg-white transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">認證密碼</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#06C755] transition-colors" />
                                <input 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-[#06C755]/30 focus:bg-white transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-2xl py-4 font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#06C755]/20 disabled:opacity-50"
                        >
                            {loading ? "驗證中..." : "進入合作夥伴總覽"}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">忘記密碼？</span>
                        <Link href="/saas-partnership/register" className="text-xs font-black text-[#06C755] hover:underline">
                            申請成為合作夥伴
                        </Link>
                    </div>
                </div>

                {/* Footer Info */}
                <p className="mt-10 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                    Secure Partner Protocol v2.4<br />
                    Powered by AGI Orchestration Engine
                </p>
            </motion.div>
        </div>
    );
}
