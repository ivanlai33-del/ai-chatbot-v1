'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Phone, CheckCircle2, AlertCircle, Sparkles, ChevronRight, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function LiffBookingPage() {
    const [botId, setBotId] = useState<string>('00000000-0000-0000-0000-000000000001');
    const [selectedDate, setSelectedDate] = useState<string>('2026-07-24');
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<string>('標準門市預約服務');
    const [customerName, setCustomerName] = useState<string>('');
    const [customerPhone, setCustomerPhone] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [lineUserId, setLineUserId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [availability, setAvailability] = useState<any>(null);
    const [successBooking, setSuccessBooking] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 日期清單 (未來 5 天)
    const dateOptions = [
        { date: '2026-07-24', label: '7/24 (五)' },
        { date: '2026-07-25', label: '7/25 (六)' },
        { date: '2026-07-26', label: '7/26 (日)' },
        { date: '2026-07-27', label: '7/27 (一)' },
        { date: '2026-07-28', label: '7/28 (二)' },
    ];

    useEffect(() => {
        // 從 URL 抓取 botId
        const params = new URLSearchParams(window.location.search);
        const bId = params.get('botId') || '00000000-0000-0000-0000-000000000001';
        const uid = params.get('userId') || localStorage.getItem('line_user_id') || 'LINE_USER_DEMO_99';
        const uname = params.get('userName') || localStorage.getItem('line_user_name') || '';
        
        setBotId(bId);
        setLineUserId(uid);
        if (uname) setCustomerName(uname);

        fetchAvailability(bId, selectedDate);
    }, [selectedDate]);

    const fetchAvailability = async (targetBotId: string, targetDate: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/bot/${targetBotId}/booking?date=${targetDate}`);
            const data = await res.json();
            if (data.success) {
                setAvailability(data.availability);
            }
        } catch (err) {
            console.error('[Fetch Availability Error]', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        if (!selectedTime) {
            setErrorMsg('請選擇預約時間');
            return;
        }
        if (!customerName || !customerPhone) {
            setErrorMsg('請填寫姓名與聯絡電話');
            return;
        }

        setSubmitting(true);
        setErrorMsg(null);

        try {
            const res = await fetch(`/api/bot/${botId}/booking`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceName: selectedService,
                    bookingDate: selectedDate,
                    startTime: selectedTime,
                    endTime: `${parseInt(selectedTime.split(':')[0]) + 1}:00`,
                    lineUserId: lineUserId || 'LINE_GUEST_USER',
                    customerName,
                    customerPhone,
                    note
                })
            });

            const data = await res.json();
            if (data.success) {
                setSuccessBooking(data.booking);
            } else {
                setErrorMsg(data.error || '預約失敗，請稍後再試');
            }
        } catch (err: any) {
            console.error('[Confirm Booking Error]', err);
            setErrorMsg('預約發生異常，請重試');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-emerald-500/20 p-4 sm:p-6 flex flex-col items-center justify-center font-sans">
            <div className="max-w-md w-full bg-white/90 backdrop-blur-2xl rounded-[32px] border border-slate-200/80 shadow-2xl p-6 md:p-8 space-y-6 text-slate-800 relative overflow-hidden">
                
                {/* 背景綠光 */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

                {/* 標頭 Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 leading-tight">門市線上互動預約</h1>
                            <p className="text-[11px] font-bold text-slate-400">點擊綠燈時段 · 0.1 秒極速鎖定</p>
                        </div>
                    </div>
                </div>

                {successBooking ? (
                    /* 🥳 預約成功畫面 */
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-6">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900">🎉 預約成功！</h2>
                            <p className="text-xs font-bold text-slate-500">已為您保留此預約，預約資料已同步發送至 LINE</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left text-xs space-y-2 font-bold">
                            <p className="flex justify-between"><span className="text-slate-400">預約日期：</span><span className="text-slate-900 font-black">{successBooking.booking_date}</span></p>
                            <p className="flex justify-between"><span className="text-slate-400">預約時間：</span><span className="text-emerald-600 font-black text-sm">{successBooking.start_time}</span></p>
                            <p className="flex justify-between"><span className="text-slate-400">預約項目：</span><span className="text-slate-900">{successBooking.service_name}</span></p>
                            <p className="flex justify-between"><span className="text-slate-400">預約姓名：</span><span className="text-slate-900">{successBooking.customer_name}</span></p>
                            <p className="flex justify-between"><span className="text-slate-400">聯絡電話：</span><span className="text-slate-900">{successBooking.customer_phone}</span></p>
                        </div>

                        <p className="text-[11px] text-slate-400 font-medium">行前一天系統將自動發送 LINE 提醒卡片，期待您的光臨！</p>
                    </motion.div>
                ) : (
                    /* 📋 預約流程表單 */
                    <div className="space-y-6">

                        {/* 1. 選擇日期 */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                選擇預約日期
                            </label>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                {dateOptions.map(d => (
                                    <button
                                        key={d.date}
                                        onClick={() => { setSelectedDate(d.date); setSelectedTime(null); }}
                                        className={`px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all ${
                                            selectedDate === d.date
                                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 scale-105'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. 選擇時段矩陣 */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                    選擇預約時段 (時段狀態矩陣)
                                </label>
                                <span className="text-[10px] text-slate-400 font-bold">🟢 可預約 ｜ 🔴 已滿</span>
                            </div>

                            {loading ? (
                                <div className="py-8 text-center text-xs text-slate-400 font-bold">載入最新時段空位中...</div>
                            ) : availability?.isFull ? (
                                /* 溫柔致歉提示 */
                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold leading-relaxed space-y-2">
                                    <div className="flex items-center gap-1.5 font-black text-amber-900">
                                        <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0" />
                                        店長溫馨提醒：
                                    </div>
                                    <p>{availability.apologyRecommendation}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2.5">
                                    {availability?.slots?.map((s: any) => (
                                        <button
                                            key={s.time}
                                            disabled={!s.isAvailable}
                                            onClick={() => setSelectedTime(s.time)}
                                            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                                                !s.isAvailable
                                                    ? 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed text-slate-400'
                                                    : selectedTime === s.time
                                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-500/20 scale-105'
                                                    : 'bg-white border-slate-200 hover:border-emerald-400 text-slate-800'
                                            }`}
                                        >
                                            <span className="text-sm font-black">{s.time}</span>
                                            <span className={`text-[10px] font-black ${
                                                !s.isAvailable ? 'text-slate-400' : selectedTime === s.time ? 'text-white' : 'text-emerald-600'
                                            }`}>
                                                {s.isAvailable ? '🟢 可預約' : '🔴 已約滿'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 3. 顧客基本資料 */}
                        <div className="space-y-3 pt-2 border-t border-slate-100">
                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                                    <User className="w-3.5 h-3.5 text-emerald-600" />
                                    預約顧客姓名
                                </label>
                                <input
                                    type="text"
                                    placeholder="例：王小美"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                    聯絡電話
                                </label>
                                <input
                                    type="tel"
                                    placeholder="例：0912345678"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        {errorMsg && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {errorMsg}
                            </div>
                        )}

                        {/* 4. 送出預約按鈕 */}
                        <button
                            onClick={handleConfirmBooking}
                            disabled={submitting || availability?.isFull}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white font-black rounded-2xl text-sm shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <ShieldCheck className="w-4 h-4 text-amber-300" />
                            {submitting ? '鎖定中...' : '確認鎖定時段並預約'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
