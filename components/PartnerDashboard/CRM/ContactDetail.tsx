"use client";

import React, { useEffect, useState } from 'react';
import { 
    User, Mail, Phone, Tag, Calendar, 
    MessageSquare, FormInput, CreditCard, 
    Clock, ChevronRight, Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ContactDetailProps {
    contactId: string;
}

export default function ContactDetail({ contactId }: ContactDetailProps) {
    const [contact, setContact] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            // 1. 抓取聯絡人主檔
            const { data: contactData } = await supabase
                .from('contacts')
                .select('*')
                .eq('id', contactId)
                .single();
            
            setContact(contactData);

            // 2. 抓取該聯絡人的所有事件軌跡
            const { data: eventData } = await supabase
                .from('events')
                .select('*')
                .eq('actor_id', contactId)
                .order('created_at', { ascending: false });

            setEvents(eventData || []);
            setLoading(false);
        }

        if (contactId) fetchData();
    }, [contactId]);

    if (loading) return <div className="p-8 text-slate-400 animate-pulse">正在載入客資主檔...</div>;
    if (!contact) return <div className="p-8 text-red-400">找不到該聯絡人資料。</div>;

    return (
        <div className="space-y-6">
            {/* Header: Basic Info Card */}
            <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                
                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-500/20 shrink-0">
                        {contact.avatar_url ? (
                            <img src={contact.avatar_url} alt={contact.name} className="w-full h-full object-cover rounded-3xl" />
                        ) : (
                            <User className="w-10 h-10 text-white" />
                        )}
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="text-3xl font-black text-white">{contact.name || '未命名客戶'}</h1>
                            <p className="text-slate-400 text-sm font-medium mt-1">LINE UID: {contact.line_user_id}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-2 text-slate-300">
                                <Mail className="w-4 h-4 text-indigo-400" />
                                {contact.email || '尚未提供 Email'}
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <Phone className="w-4 h-4 text-emerald-400" />
                                {contact.phone || '尚未提供電話'}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            {contact.tags?.map((tag: string) => (
                                <span key={tag} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold">
                                    #{tag}
                                </span>
                            )) || <span className="text-slate-500 text-xs italic">尚未貼上標籤</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Custom Fields & Metadata */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-500">
                            <Activity className="w-4 h-4" /> 擴充資料 (Custom Fields)
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(contact.custom_fields || {}).length > 0 ? (
                                Object.entries(contact.custom_fields).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                                        <span className="text-slate-400 text-xs font-bold">{key}</span>
                                        <span className="text-white text-sm">{String(value)}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-slate-500 text-xs italic">暫無擴充資料</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Event Timeline (The Magic of Event Bus) */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 h-full">
                        <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-500">
                            <Clock className="w-4 h-4" /> 互動軌跡時光軸 (Event Timeline)
                        </h3>
                        
                        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/50 before:via-slate-800 before:to-transparent">
                            {events.length > 0 ? (
                                events.map((event) => (
                                    <div key={event.id} className="relative flex items-center justify-between gap-6 pl-12 group">
                                        {/* Dot */}
                                        <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 border-2 border-indigo-500 shadow-lg shadow-indigo-500/20 z-10 transition-all group-hover:scale-110">
                                            {event.event_name.includes('form') && <FormInput className="w-4 h-4 text-indigo-400" />}
                                            {event.event_name.includes('booking') && <Calendar className="w-4 h-4 text-emerald-400" />}
                                            {event.event_name.includes('order') && <CreditCard className="w-4 h-4 text-amber-400" />}
                                            {event.event_name.includes('contact') && <User className="w-4 h-4 text-purple-400" />}
                                            {!['form', 'booking', 'order', 'contact'].some(k => event.event_name.includes(k)) && <Activity className="w-4 h-4 text-slate-400" />}
                                        </div>

                                        <div className="flex-1 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 transition-all">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-white font-bold text-sm uppercase">{event.event_name}</span>
                                                <span className="text-slate-500 text-[10px] font-mono">
                                                    {new Date(event.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="text-slate-400 text-xs">
                                                {/* 動態呈現 Payload 關鍵資訊 */}
                                                {event.event_name === 'booking.created' && `預約了 ${event.payload?.service_type} (${event.payload?.requested_date})`}
                                                {event.event_name === 'contact.updated' && `更新了欄位: ${event.payload?.updated_fields?.join(', ')}`}
                                                {!['booking.created', 'contact.updated'].includes(event.event_name) && JSON.stringify(event.payload)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 text-slate-600">
                                    此聯絡人目前尚無互動事件紀錄。
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
