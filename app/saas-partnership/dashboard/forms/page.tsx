"use client";

import React, { useState, useEffect } from 'react';
import { 
    ClipboardList, Sparkles, Plus, 
    Type, Phone, Mail, Trash2, 
    ChevronLeft, MoreVertical, X,
    Wand2, Save, Send, Image as ImageIcon, Smartphone, Layout,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { usePartner } from '@/context/PartnerContext';

interface FormField {
    id: string;
    type: 'text' | 'phone' | 'email';
    label: string;
    placeholder: string;
}

export default function FormsFactoryPage() {
    const { activeOA } = usePartner();
    const [fields, setFields] = useState<FormField[]>([
        { id: '1', type: 'text', label: '您的姓名', placeholder: '請輸入姓名' },
        { id: '2', type: 'phone', label: '聯絡電話', placeholder: '請輸入手機號碼' }
    ]);
    const [formName, setFormName] = useState('未命名表單');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchForm() {
            if (!activeOA) return;
            setIsLoading(true);
            try {
                const { data } = await supabase
                    .from('liff_apps')
                    .select('*')
                    .eq('oa_id', activeOA.id)
                    .eq('name', 'Main_Data_Form') // For demo, we target a specific form name
                    .maybeSingle();
                
                if (data && data.config?.fields) {
                    setFields(data.config.fields);
                    setFormName(data.config.name || '已儲存的表單');
                }
            } catch (err) {
                console.error('Error fetching form:', err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchForm();
    }, [activeOA]);

    const handleSaveForm = async () => {
        if (!activeOA) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('liff_apps')
                .upsert({
                    oa_id: activeOA.id,
                    name: 'Main_Data_Form', // Reserved name for primary form
                    config: {
                        name: formName,
                        fields: fields
                    },
                    updated_at: new Date().toISOString()
                }, { onConflict: 'oa_id, name' });
            
            if (error) throw error;
            alert('表單架構已同步至 AGI 智庫！');
        } catch (err) {
            console.error('Error saving form:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const addField = (type: 'text' | 'phone' | 'email') => {
        const newField: FormField = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            label: type === 'text' ? '新文字欄位' : (type === 'phone' ? '聯絡電話' : '電子郵件'),
            placeholder: `請輸入${type === 'text' ? '內容' : (type === 'phone' ? '手機號碼' : '郵件地址')}`
        };
        setFields([...fields, newField]);
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const updateField = (id: string, label: string) => {
        setFields(fields.map(f => f.id === id ? { ...f, label } : f));
    };

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
                {/* Left: Configuration Area */}
                <div className="flex-1 space-y-10">
                    <header className="mb-12">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                                    <ClipboardList className="w-10 h-10 text-[#06C755]" />
                                    表單設計工廠
                                </h1>
                                <p className="mt-2 font-medium text-slate-500">建立多功能名單收集表單、報名表與問卷功能</p>
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    onClick={handleSaveForm}
                                    disabled={isSaving}
                                    className="px-6 py-3 bg-white/50 backdrop-blur-md rounded-2xl font-bold text-slate-600 border border-white shadow-sm transition-all hover:bg-white disabled:opacity-50"
                                >
                                    {isSaving ? '同步中...' : '儲存表單'}
                                </button>
                                <button className="px-6 py-3 bg-gradient-to-br from-[#06C755] to-[#05A044] text-white rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-[#06C755]/20 hover:scale-105 active:scale-95 transition-all">
                                    <Send className="w-4 h-4" /> 發布至 LINE
                                </button>
                            </div>
                        </div>
                    </header>

                    {isLoading ? (
                        <div className="p-20 text-center animate-pulse text-slate-300 font-bold">正在讀取表單架構記錄...</div>
                    ) : (
                        <>
                            {/* Step 1: AI Visual Enhancement */}
                            <div className="bg-white/30 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#06C755]/5 rounded-full -mr-16 -mt-16 group-hover:bg-[#06C755]/10 transition-all"></div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-8 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#06C755]" /> AI 視覺強化 (HEADER & CTA)
                                </h3>
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="p-6 bg-white/60 rounded-3xl border border-white shadow-inner">
                                        <span className="text-[10px] font-black text-slate-400 uppercase mb-4 block">AI 主視覺建議</span>
                                        <div className="aspect-video bg-slate-100/50 rounded-2xl flex items-center justify-center border border-dashed border-slate-200">
                                            <ImageIcon className="w-8 h-8 text-slate-300" />
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white/60 rounded-3xl border border-white shadow-inner">
                                        <span className="text-[10px] font-black text-slate-400 uppercase mb-4 block">AI 按鈕文案建議</span>
                                        <div className="h-full flex items-center">
                                            <div className="w-full py-4 bg-emerald-50 text-emerald-600 rounded-xl text-center text-xs font-black border border-emerald-100">
                                                立即領取專屬優惠
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full py-4 bg-gradient-to-r from-[#06C755] to-[#05A044] text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-[#06C755]/20 hover:scale-[1.01] transition-all">
                                    <Wand2 className="w-5 h-5" /> 根據品牌 DNA 自動美化表單
                                </button>
                            </div>

                            {/* Step 2: Field Configuration */}
                            <div className="bg-white/30 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-10 shadow-sm">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="space-y-1">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                            <Layout className="w-4 h-4 text-[#06C755]" /> 表單欄位配置
                                        </h3>
                                        <input 
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            className="bg-transparent border-none p-0 text-slate-400 text-[10px] font-bold focus:ring-0"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => addField('text')} className="p-2 bg-white/60 hover:bg-white rounded-lg border border-white shadow-sm transition-all" title="新增文字欄位"><Type className="w-4 h-4 text-slate-600" /></button>
                                        <button onClick={() => addField('phone')} className="p-2 bg-white/60 hover:bg-white rounded-lg border border-white shadow-sm transition-all" title="新增電話欄位"><Phone className="w-4 h-4 text-slate-600" /></button>
                                        <button onClick={() => addField('email')} className="p-2 bg-white/60 hover:bg-white rounded-lg border border-white shadow-sm transition-all" title="新增郵件欄位"><Mail className="w-4 h-4 text-slate-600" /></button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <AnimatePresence mode="popLayout">
                                        {fields.map((field) => (
                                            <motion.div 
                                                key={field.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="p-6 bg-white/60 rounded-3xl border border-white shadow-sm flex items-center gap-6 group hover:bg-white transition-all"
                                            >
                                                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                                    {field.type === 'text' && <Type className="w-5 h-5 text-emerald-600" />}
                                                    {field.type === 'phone' && <Phone className="w-5 h-5 text-emerald-600" />}
                                                    {field.type === 'email' && <Mail className="w-5 h-5 text-emerald-600" />}
                                                </div>
                                                <div className="flex-1">
                                                    <input 
                                                        type="text" 
                                                        value={field.label}
                                                        onChange={(e) => updateField(field.id, e.target.value)}
                                                        className="w-full bg-transparent border-none text-sm font-black text-slate-800 focus:ring-0 p-0"
                                                    />
                                                    <div className="mt-1 h-8 bg-slate-100/50 rounded-xl border border-slate-100 flex items-center px-3">
                                                        <span className="text-[10px] text-slate-400 font-medium">{field.placeholder}</span>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => removeField(field.id)}
                                                    className="p-2 text-slate-300 hover:text-pink-500 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Right: Phone Preview Area */}
                <div className="lg:w-[400px] flex justify-center items-start pt-20">
                    <div className="relative group origin-top scale-[1.15]">
                        {/* LINE Window Simulator */}
                        <div className="w-[280px] h-[560px] bg-[#ebebeb] rounded-[3rem] border-[6px] border-white/50 shadow-2xl relative overflow-hidden flex flex-col">
                            {/* LINE App Header (In-app Browser) */}
                            <div className="h-14 bg-gradient-to-r from-[#06C755] to-[#05A044] text-white flex items-center px-4 justify-between pt-4 shadow-md">
                                <div className="flex items-center gap-3">
                                    <X className="w-5 h-5 opacity-60" />
                                    <span className="text-sm font-bold truncate max-w-[140px]">{formName}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs opacity-60">•••</span>
                                </div>
                            </div>

                            {/* Form Content Area */}
                            <div className="flex-1 overflow-y-auto bg-white">
                                {/* Form Header Image */}
                                <div className="aspect-video bg-emerald-50 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-[#06C755] to-transparent"></div>
                                    <ImageIcon className="w-10 h-10 text-emerald-200" />
                                </div>

                                {/* Form Fields */}
                                <div className="p-6 space-y-6">
                                    {fields.map(field => (
                                        <div key={field.id} className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-800">{field.label}</label>
                                            <div className="w-full px-4 py-3 bg-[#f8f9fa] border border-[#e9ecef] rounded-lg">
                                                <span className="text-xs text-slate-300">{field.placeholder}</span>
                                            </div>
                                        </div>
                                    ))}

                                    <button className="w-full py-3 bg-[#06C755] text-white rounded-lg font-black text-sm shadow-md mt-4">
                                        立即提交表單
                                    </button>

                                    <div className="py-8 text-center">
                                        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Powered by AI Chatbot OS</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <div className="px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-full text-[10px] font-black text-white/60 tracking-[0.2em] flex items-center gap-2">
                                <Smartphone className="w-3 h-3" /> MOBILE PREVIEW
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
