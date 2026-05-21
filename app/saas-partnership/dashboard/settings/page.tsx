"use client";

import React, { useState } from 'react';
import { 
    User, Mail, ShieldCheck, Zap, 
    Send, Plus, Trash2, CheckCircle2,
    Lock, Users, Settings as SettingsIcon,
    Star, Crown, ShieldAlert, Building2,
    Fingerprint, Globe, KeyRound, Sparkles,
    Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePartner, ORG_ID } from '@/context/PartnerContext';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
    const { partner } = usePartner();
    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState('editor');
    const [isInviting, setIsInviting] = useState(false);
    const [inviteSuccess, setInviteSuccess] = useState(false);
    
    // 公司資料狀態
    const [companyName, setCompanyName] = useState(partner?.companyName || '');
    const [taxId, setTaxId] = useState(partner?.taxId || '');
    const [website, setWebsite] = useState(partner?.website || '');
    const [address, setAddress] = useState(partner?.address || '');
    const [phone, setPhone] = useState(partner?.phone || '');
    const [aiKey, setAiKey] = useState('');
    const [isSavingOrg, setIsSavingOrg] = useState(false);

    const handleSaveOrg = async () => {
        setIsSavingOrg(true);
        try {
            const { error } = await supabase
                .from('organizations')
                .update({
                    name: companyName,
                    tax_id: taxId,
                    website: website,
                    address: address,
                    phone: phone
                })
                .eq('id', ORG_ID);
            
            if (error) throw error;
            alert('公司基本資料已更新！');
        } catch (err) {
            console.error('Update Org Error:', err);
            alert('更新失敗，請檢查資料庫連線。');
        } finally {
            setIsSavingOrg(false);
        }
    };

    const roles = [
        { id: 'admin', label: '副店長 (Admin)', desc: '具備除刪除帳號外的所有管理權限', icon: Crown, color: 'text-amber-500' },
        { id: 'editor', label: '執行小編 (Editor)', desc: '可操作素材工廠、活動推播與圖文選單', icon: Star, color: 'text-indigo-500' },
        { id: 'analyst', label: '數據分析師 (Analyst)', desc: '僅能查看報表中心與問卷數據', icon: ShieldCheck, color: 'text-emerald-500' },
    ];

    const handleInvite = () => {
        if (!email) return;
        setIsInviting(true);
        setTimeout(() => {
            setIsInviting(false);
            setInviteSuccess(true);
            setEmail('');
            setTimeout(() => setInviteSuccess(false), 3000);
        }, 1500);
    };

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12 pb-32">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#06C755] to-[#05A044] rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
                        <SettingsIcon className="w-8 h-8" />
                    </div>
                    帳戶與權限設定
                </h1>
                <p className="mt-3 text-slate-500 font-medium">管理您的公司資料、AI 店長金鑰以及團隊協作權限。</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Col: Profile & Company Basics (4 cols) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* User Profile */}
                    <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">當前登入身份</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#06C755] to-[#05A044] text-white flex items-center justify-center text-xl font-black shadow-xl">
                                {partner?.userName?.substring(0, 1) || 'A'}
                            </div>
                            <div>
                                <p className="font-black text-slate-900 text-lg">{partner?.userName || '指揮官'}</p>
                                <p className="text-xs text-slate-400 font-bold">{partner?.current_plan || 'PRO'} 方案</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-500 uppercase">帳號角色</span>
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded uppercase tracking-tighter">{partner?.userRole || 'Owner'}</span>
                            </div>
                        </div>
                    </section>

                    {/* Company Information */}
                    <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                        <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> 公司基本資料
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">公司全稱</label>
                                <input 
                                    type="text" 
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#06C755]/10 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">統一編號 (Tax ID)</label>
                                <input 
                                    type="text" 
                                    placeholder="8 碼數字"
                                    value={taxId}
                                    onChange={(e) => setTaxId(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#06C755]/10 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">官方網站</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-4 w-4 h-4 text-slate-300" />
                                    <input 
                                        type="text" 
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 pl-12 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#06C755]/10 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">公司地址</label>
                                <input 
                                    type="text" 
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="公司通訊地址"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#06C755]/10 transition-all"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={handleSaveOrg}
                            disabled={isSavingOrg}
                            className="w-full py-3 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-xl text-[10px] font-black hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                        >
                            {isSavingOrg ? '更新中...' : '更新公司資料'}
                        </button>
                    </section>
                </div>

                {/* Right Col: Team & AI Settings (8 cols) */}
                <div className="lg:col-span-8 space-y-12">
                    {/* AI Manager Center (Switched to High-Contrast White Glassmorphism) */}
                    <section className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#06C755]/5 blur-[100px] rounded-full -mr-32 -mt-32 transition-all group-hover:bg-[#06C755]/10" />
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-[#06C755] to-[#05A044] rounded-2xl text-white shadow-lg">
                                    <Fingerprint className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">AI 店長核心金鑰</h3>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">AGI MANAGER AI CREDENTIALS</p>
                                </div>
                            </div>
                            <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                                GPT-4o Active
                            </div>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="space-y-4">
                                <div className="flex justify-between px-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OpenAI API Key (公司專屬)</label>
                                    <span className="text-[10px] font-black text-emerald-600 uppercase cursor-pointer hover:underline">如何獲取金鑰？</span>
                                </div>
                                <div className="relative">
                                    <KeyRound className="absolute left-6 top-5 w-5 h-5 text-slate-300" />
                                    <input 
                                        type="password"
                                        value={aiKey}
                                        onChange={(e) => setAiKey(e.target.value)}
                                        placeholder="sk-................................................"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-[1.8rem] py-5 pl-16 pr-6 text-sm font-mono text-emerald-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755]/20 focus:bg-white transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4 hover:bg-emerald-50/50 transition-colors">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#06C755] shadow-sm">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900">模型版本</p>
                                        <p className="text-[10px] text-slate-400 font-bold">GPT-4o (推薦使用)</p>
                                    </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4 hover:bg-indigo-50/50 transition-colors">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-400 shadow-sm">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900">視覺生成</p>
                                        <p className="text-[10px] text-slate-400 font-bold">DALL-E 3 Enabled</p>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/30">
                                <ShieldCheck className="w-5 h-5" /> 儲存並驗證 AI 大腦連線
                            </button>
                        </div>
                    </section>

                    {/* Team Permission Delegation */}
                    <section className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -ml-16 -mt-16" />
                        <div className="flex items-center gap-4 mb-10 relative z-10">
                            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">權限分派中心</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Team Delegation & Access Control</p>
                            </div>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">1. 輸入受邀者郵件</label>
                                <div className="relative group">
                                    <Mail className="absolute left-6 top-4 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                    <input 
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="partner@example.com"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">2. 選擇分派角色身份</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {roles.map((role) => (
                                        <button 
                                            key={role.id}
                                            onClick={() => setSelectedRole(role.id)}
                                            className={`p-6 rounded-3xl border text-left transition-all relative overflow-hidden group ${selectedRole === role.id ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-600/5' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                        >
                                            <role.icon className={`w-6 h-6 mb-4 ${role.color}`} />
                                            <p className="text-xs font-black text-slate-900 mb-1">{role.label}</p>
                                            <p className="text-[9px] text-slate-400 font-bold leading-tight line-clamp-2">{role.desc}</p>
                                            {selectedRole === role.id && <CheckCircle2 className="absolute top-4 right-4 w-4 h-4 text-indigo-600" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleInvite}
                                disabled={isInviting || inviteSuccess}
                                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl ${inviteSuccess ? 'bg-emerald-500 text-white' : 'bg-gradient-to-br from-[#06C755] to-[#05A044] text-white hover:scale-[1.02] shadow-emerald-500/20'}`}
                            >
                                {isInviting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : inviteSuccess ? "邀請信件已寄出" : "寄送權限邀請信"}
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
