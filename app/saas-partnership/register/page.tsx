"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, ShieldCheck, ArrowRight, Mail, Lock, Building2, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function PartnerRegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Sign up user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: companyName, // Placeholder for user's real name
                        role: 'platform_user'
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('註冊失敗，請稍後再試');

            // 2. Create the Organization (The billing and data entity)
            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .insert({
                    name: companyName,
                    billing_email: email,
                    plan_id: 'starter'
                })
                .select()
                .single();

            if (orgError) throw orgError;

            // 3. Create Membership (Set the registrant as the Owner)
            const { error: memberError } = await supabase
                .from('memberships')
                .insert({
                    organization_id: orgData.id,
                    user_id: authData.user.id,
                    role: 'owner'
                });

            if (memberError) throw memberError;

            // 4. Legacy compatibility: Create partner record (optional, can be phased out)
            await supabase.from('partners').insert({
                name: companyName,
                contact_email: email,
                current_plan: 'Starter'
            });

            setSuccess(true);
            setTimeout(() => {
                window.location.href = '/saas-partnership/login';
            }, 3000);

        } catch (err: any) {
            setError(err.message || '註冊失敗，請檢查資料是否正確');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-md"
                >
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-10 h-10 text-[#06C755]" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4">申請提交成功！</h2>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                        您的合作夥伴帳號已建立。我們正在為您初始化 AGI 基礎設施，即將為您跳轉至登入頁面。
                    </p>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 3 }}
                            className="h-full bg-[#06C755]"
                        />
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-[#06C755]/5 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-16 h-16 bg-[#06C755] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#06C755]/20 mb-6">
                        <Image src="/lai_logo_3.svg" alt="Logo" width={32} height={32} className="brightness-0 invert" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">加入合作夥伴計畫</h1>
                    <p className="text-slate-500 font-medium text-sm">Empower Your Software with AI Brain</p>
                </div>

                {/* Register Card */}
                <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-slate-200/50">
                    <form onSubmit={handleRegister} className="space-y-5">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-3"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">公司或品牌名稱</label>
                            <div className="relative group">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#06C755] transition-colors" />
                                <input 
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="例如：萊特科技"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-[#06C755]/30 focus:bg-white transition-all"
                                    required
                                />
                            </div>
                        </div>

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
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">設定認證密碼</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#06C755] transition-colors" />
                                <input 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="至少 8 位字元"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-[#06C755]/30 focus:bg-white transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-2xl py-4 font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#06C755]/20 disabled:opacity-50 mt-4"
                        >
                            {loading ? "申請中..." : "提交合作夥伴申請"}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                        <span className="text-xs font-bold text-slate-400">已經是合作夥伴？ </span>
                        <Link href="/saas-partnership/login" className="text-xs font-black text-[#06C755] hover:underline">
                            立即登入
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

// Simple fallback icon for AlertCircle if missing from lucide
function AlertCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}
