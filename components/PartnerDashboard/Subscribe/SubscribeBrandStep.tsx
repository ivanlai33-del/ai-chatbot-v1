"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';

interface SubscribeBrandStepProps {
    brandName: string;
    industry: string;
    onBrandNameChange: (name: string) => void;
    onIndustryChange: (industry: string) => void;
    onNext: () => void;
    onFocus?: (field: string) => void;
    onBlur?: () => void;
}

export default function SubscribeBrandStep({
    brandName,
    industry,
    onBrandNameChange,
    onIndustryChange,
    onNext,
    onFocus,
    onBlur
}: SubscribeBrandStepProps) {
    return (
        <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
        >
            <div className="flex items-center gap-4 text-sm font-bold border-b border-slate-700/50 pb-6">
                <div className="flex items-center gap-2 text-indigo-400">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">1</span>
                    品牌基本資料
                </div>
                <div className="w-12 h-px bg-slate-700"></div>
                <div className="flex items-center gap-2 text-slate-500">
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">2</span>
                    支付與開通
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">夥伴/廠商名稱</label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="例如：瑜珈大師系統"
                            value={brandName}
                            onChange={(e) => onBrandNameChange(e.target.value)}
                            onFocus={() => onFocus?.('brandName')}
                            onBlur={onBlur}
                            className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                        />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">產業別</label>
                    <select
                        title="選擇產業"
                        value={industry}
                        onChange={(e) => onIndustryChange(e.target.value)}
                        onFocus={() => onFocus?.('industry')}
                        onBlur={onBlur}
                        className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl py-4 px-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors appearance-none"
                    >
                        <option value="" disabled>請選擇產業</option>
                        <option value="beauty">美容美髮 (Beauty & Salon)</option>
                        <option value="fitness">健身瑜珈 (Fitness & Yoga)</option>
                        <option value="fnb">餐飲零售 (F&B & Retail)</option>
                        <option value="education">補教教育 (Education)</option>
                    </select>
                </div>
            </div>

            <div className="pt-6">
                <button
                    onClick={onNext}
                    disabled={!brandName || !industry}
                    className="w-full md:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/30"
                >
                    下一步：結帳開通
                </button>
            </div>
        </motion.div>
    );
}
