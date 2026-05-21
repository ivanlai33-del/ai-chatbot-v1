"use client";

import React from 'react';
import ContactDetail from '@/components/PartnerDashboard/CRM/ContactDetail';
import Link from 'next/link';

export default function ContactPage({ params }: { params: { id: string } }) {
    return (
        <div className="p-8 min-h-full">
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 mb-8 uppercase tracking-widest">
                    <Link href="/saas-partnership/dashboard/crm" className="hover:text-[#06C755] transition-all">CRM 聯絡人中心</Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-900">客戶詳情</span>
                </nav>

                <ContactDetail contactId={params.id} />
            </div>
        </div>
    );
}
