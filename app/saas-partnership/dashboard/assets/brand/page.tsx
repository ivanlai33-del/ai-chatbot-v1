"use client";

import React from 'react';
import BrandDNAEditor from '@/components/PartnerDashboard/Intel/BrandDNAEditor';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function BrandPage() {
    const botId = '57c7dc31-dd4d-49ee-b09b-f7eb7cf94c61'; 

    return (
        <div className="p-8 min-h-full">
            <div className="max-w-5xl mx-auto">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 mb-8 uppercase tracking-widest">
                    <Link href="/saas-partnership/dashboard/assets" className="hover:text-indigo-600 transition-all">店長智庫</Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-900">品牌 DNA 規範</span>
                </nav>

                <div className="mb-12">
                    <BrandDNAEditor botId={botId} />
                </div>

                {/* Quick Guidance */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 flex gap-6 items-start shadow-sm">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
                        <Sparkles className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h4 className="text-slate-900 font-bold mb-2 text-lg">為什麼要設定品牌 DNA？</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            設定好的顏色、風格與過濾詞，將會自動注入到全系統的 AI 產線中。
                            當您在建立「預約積木」或「選單積木」時，AI 會自動選用您的品牌色並遵循此處定義的風格進行設計。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
