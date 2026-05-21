"use client";

import React, { useState, useEffect } from 'react';
import { 
    Ticket, Plus, Search, Filter, 
    Calendar, Tag, Users, ArrowUpRight,
    Clock, CheckCircle2, AlertCircle, Trash2,
    Edit3, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { usePartner } from '@/context/PartnerContext';

export default function CouponsPage() {
    const { activeOA } = usePartner();
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        async function fetchCoupons() {
            if (!activeOA) return;
            setLoading(true);
            try {
                const { data } = await supabase
                    .from('coupons')
                    .select('*')
                    .eq('oa_id', activeOA.id)
                    .order('created_at', { ascending: false });
                
                if (data) setCoupons(data);
            } catch (err) {
                console.error('Error fetching coupons:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchCoupons();
    }, [activeOA]);

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                        <div className="p-3 bg-pink-500 rounded-2xl shadow-lg shadow-pink-500/20 text-white">
                            <Ticket className="w-8 h-8" />
                        </div>
                        優惠券中心
                    </h1>
                    <p className="mt-3 text-slate-500 font-medium">建立行銷誘因、設定折扣規則與追蹤核銷成效。</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-pink-500/20"
                >
                    <Plus className="w-4 h-4" /> 建立新優惠
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">本月已核銷總數</p>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-slate-900">{coupons.reduce((sum, c) => sum + (c.used_count || 0), 0)}</span>
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +12%</span>
                    </div>
                </div>
                <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">進行中活動</p>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-slate-900">{coupons.filter(c => new Date(c.end_at) > new Date()).length}</span>
                        <span className="px-2 py-1 bg-emerald-50 text-[#06C755] text-[8px] font-black rounded uppercase">Active</span>
                    </div>
                </div>
                <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">平均轉換率</p>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-slate-900">18.5%</span>
                        <span className="text-xs font-bold text-slate-400 italic">高於產業均值</span>
                    </div>
                </div>
            </div>

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center animate-pulse text-slate-300 font-black tracking-widest">正在載入行銷積木數據...</div>
                ) : coupons.length > 0 ? (
                    coupons.map((coupon) => (
                        <div key={coupon.id} className="bg-white/60 backdrop-blur-xl border border-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group relative">
                            {/* Ticket Notch Effect */}
                            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#ebebeb] rounded-full -translate-y-1/2 border-r border-white/40"></div>
                            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#ebebeb] rounded-full -translate-y-1/2 border-l border-white/40"></div>
                            
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${coupon.type === 'discount' ? 'bg-pink-500' : 'bg-amber-500'}`}>
                                        <Tag className="w-6 h-6" />
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${new Date(coupon.end_at) > new Date() ? 'bg-emerald-50 text-[#06C755]' : 'bg-slate-100 text-slate-400'}`}>
                                            {new Date(coupon.end_at) > new Date() ? 'Valid' : 'Expired'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-black text-slate-900 mb-1">{coupon.name}</h3>
                                    <p className="text-xs text-slate-500 font-bold flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {new Date(coupon.start_at).toLocaleDateString()} - {new Date(coupon.end_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">已領取 / 總量</p>
                                        <p className="text-sm font-black text-slate-900">{coupon.used_count} <span className="text-slate-300">/</span> {coupon.stock === -1 ? '∞' : coupon.stock}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-all"><Edit3 className="w-4 h-4" /></button>
                                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-pink-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 bg-white/20 rounded-[3rem] border border-dashed border-white/40 text-center space-y-4">
                         <div className="w-16 h-16 bg-white/40 rounded-full flex items-center justify-center mx-auto text-slate-300">
                            <Info className="w-8 h-8" />
                        </div>
                        <p className="text-slate-400 font-black italic">尚未建立任何促銷優惠券</p>
                    </div>
                )}
            </div>
        </div>
    );
}
