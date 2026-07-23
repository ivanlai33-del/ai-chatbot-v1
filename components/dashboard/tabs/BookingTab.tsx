'use client';

import React, { useState, useEffect } from 'react';
import { 
    Calendar, Clock, User, Phone, CheckCircle2, AlertCircle, Plus, Trash2, Edit3, 
    Settings, ShieldCheck, Zap, Lock, Sparkles, RefreshCw, FileText, Check, HeartHandshake
} from 'lucide-react';

interface BookingTabProps {
    botId?: string;
    userPlanLevel?: number; // 0: trial, 1: starter ($199), 2: solo ($499+), 3: growth ($1299+)
}

export default function BookingTab({ botId = '00000000-0000-0000-0000-000000000001', userPlanLevel = 2 }: BookingTabProps) {
    const isUnlocked = userPlanLevel >= 2; // $499 solo 方案以上解鎖

    const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'services' | 'settings'>('schedule');
    const [bookings, setBookings] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([
        { id: '1', name: '手部凝膠美甲 / VIP諮詢', duration_minutes: 60, price: 1200 },
        { id: '2', name: '深層保養與維修檢查', duration_minutes: 90, price: 2500 },
    ]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('2026-07-24');

    // 門市預約規則設定
    const [slotInterval, setSlotInterval] = useState<number>(60);
    const [maxCapacity, setMaxCapacity] = useState<number>(1);
    const [newServiceName, setNewServiceName] = useState('');
    const [newServiceDuration, setNewServiceDuration] = useState(60);
    const [newServicePrice, setNewServicePrice] = useState(0);

    useEffect(() => {
        if (isUnlocked) {
            fetchBookingData();
        }
    }, [botId, isUnlocked, selectedDate]);

    const fetchBookingData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/bot/${botId}/booking?date=${selectedDate}`);
            const data = await res.json();
            if (data.success) {
                setBookings(data.bookings || []);
                if (data.services && data.services.length > 0) {
                    setServices(data.services);
                }
            }
        } catch (err) {
            console.error('[Fetch Admin Booking Data Error]', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddService = () => {
        if (!newServiceName) return;
        const newS = {
            id: Date.now().toString(),
            name: newServiceName,
            duration_minutes: newServiceDuration,
            price: newServicePrice
        };
        setServices([...services, newS]);
        setNewServiceName('');
        setNewServicePrice(0);
    };

    const handleDeleteService = (id: string) => {
        setServices(services.filter(s => s.id !== id));
    };

    // 🔒 若為 $199 方案以下，呈現質感專屬升級解鎖卡片 (Upsell Lock Card)
    if (!isUnlocked) {
        return (
            <div className="space-y-6 pt-4">
                <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-8 md:p-12 text-white border border-emerald-500/30 shadow-2xl space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                        <Lock className="w-8 h-8" />
                    </div>

                    <div className="space-y-3 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wider uppercase">
                            <Sparkles className="w-3.5 h-3.5" />
                            $499 單店主力方案專屬功能
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tight">升級解鎖【📅 全功能萬能預約排班積木】</h3>
                        <p className="text-slate-300 text-sm font-bold leading-relaxed">
                            支援美業、餐飲、維修、診所、理專與零售通用預約表單！顧客點擊 LINE 預約月曆，0.1 秒極速鎖定時段，自動發送行前提醒防放鳥！
                        </p>
                    </div>

                    <div className="pt-4 flex flex-wrap items-center gap-4">
                        <button 
                            onClick={() => window.location.href = '#pricing'}
                            className="px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white font-black rounded-2xl text-base shadow-xl shadow-emerald-500/30 hover:scale-105 transition-all"
                        >
                            🚀 升級至 $499 方案 (立即解鎖預約排班)
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pt-4">
            {/* 頂部功能選擇 */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                    <button
                        onClick={() => setActiveSubTab('schedule')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                            activeSubTab === 'schedule' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        🗓️ 門市預約總覽對帳表
                    </button>
                    <button
                        onClick={() => setActiveSubTab('services')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                            activeSubTab === 'services' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        💅 預約服務項目設定
                    </button>
                    <button
                        onClick={() => setActiveSubTab('settings')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                            activeSubTab === 'settings' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        ⚙️ 營業時間與規則設定
                    </button>
                </div>
            </div>

            {/* TAB 1: 🗓️ 門市預約對帳總覽 */}
            {activeSubTab === 'schedule' && (
                <div className="space-y-6">
                    <div className="relative overflow-hidden rounded-[32px] bg-white/80 backdrop-blur-xl border border-emerald-500/20 p-6 md:p-8 shadow-xl text-slate-800 space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-emerald-600" />
                                    門市預約排班總覽與對帳單
                                </h3>
                                <p className="text-xs font-bold text-slate-500 mt-1">實時檢視顧客預約狀態、聯絡電話與點擊紀錄</p>
                            </div>

                            <button onClick={fetchBookingData} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-xs flex items-center gap-1.5 transition">
                                <RefreshCw className="w-3.5 h-3.5" /> 重新整理
                            </button>
                        </div>

                        {/* 預約列表 */}
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black">
                                    <tr>
                                        <th className="px-6 py-4">預約日期與時間</th>
                                        <th className="px-6 py-4">顧客姓名 (LINE 暱稱)</th>
                                        <th className="px-6 py-4">聯絡電話</th>
                                        <th className="px-6 py-4">預約服務項目</th>
                                        <th className="px-6 py-4">狀態</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-bold">
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">載入預約對帳單中...</td></tr>
                                    ) : bookings.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">目前尚無預約紀錄。當顧客在 LINE 預約時會即時呈現於此！</td></tr>
                                    ) : (
                                        bookings.map((b) => (
                                            <tr key={b.id} className="hover:bg-slate-50/50 transition">
                                                <td className="px-6 py-4 text-emerald-600 font-black text-sm">
                                                    {b.booking_date} {b.start_time}
                                                </td>
                                                <td className="px-6 py-4 text-slate-900 font-black">
                                                    {b.customer_name}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {b.customer_phone}
                                                </td>
                                                <td className="px-6 py-4 text-slate-800">
                                                    {b.service_name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-full font-black text-[11px] inline-flex items-center gap-1">
                                                        🟢 已確認預約
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: 💅 預約服務項目設定 */}
            {activeSubTab === 'services' && (
                <div className="relative overflow-hidden rounded-[32px] bg-white/80 backdrop-blur-xl border border-emerald-500/20 p-6 md:p-8 shadow-xl text-slate-800 space-y-6">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        💅 萬能預約服務項目菜單
                    </h3>

                    {/* 新增服務項目 */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-black text-slate-700">+ 新增預約服務項目</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input
                                type="text"
                                placeholder="服務項目名稱 (例：手部凝膠美甲)"
                                value={newServiceName}
                                onChange={(e) => setNewServiceName(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
                            />
                            <input
                                type="number"
                                placeholder="所需時長 (分鐘, 例: 60)"
                                value={newServiceDuration}
                                onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
                            />
                            <input
                                type="number"
                                placeholder="價格 NTD (例: 1200)"
                                value={newServicePrice}
                                onChange={(e) => setNewServicePrice(Number(e.target.value))}
                                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
                            />
                        </div>
                        <button
                            onClick={handleAddService}
                            className="px-6 py-2.5 bg-emerald-600 text-white font-black rounded-xl text-xs shadow-md hover:bg-emerald-700 transition"
                        >
                            新增至項目清單
                        </button>
                    </div>

                    {/* 服務列表 */}
                    <div className="space-y-3">
                        {services.map((s) => (
                            <div key={s.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
                                <div>
                                    <h5 className="font-black text-slate-900 text-sm">{s.name}</h5>
                                    <p className="text-xs text-slate-400 font-bold">所需時長：{s.duration_minutes} 分鐘 ｜ 費用：${s.price} 元</p>
                                </div>
                                <button onClick={() => handleDeleteService(s.id)} className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1">
                                    <Trash2 className="w-4 h-4" /> 刪除
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 3: ⚙️ 營業時間與規則設定 */}
            {activeSubTab === 'settings' && (
                <div className="relative overflow-hidden rounded-[32px] bg-white/80 backdrop-blur-xl border border-emerald-500/20 p-6 md:p-8 shadow-xl text-slate-800 space-y-6">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        ⚙️ 門市營業時間與時段切分規則
                    </h3>

                    <div className="space-y-4 max-w-lg">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-700">預約時段切分間隔</label>
                            <select
                                value={slotInterval}
                                onChange={(e) => setSlotInterval(Number(e.target.value))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                            >
                                <option value={30}>30 分鐘 (適合診所、快速修剪)</option>
                                <option value={60}>60 分鐘 (適合美業、保養、顧問)</option>
                                <option value={90}>90 分鐘 (適合餐飲、深度SPA)</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-700">單一時段人數/名額上限</label>
                            <input
                                type="number"
                                value={maxCapacity}
                                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                                placeholder="預設 1 人 (美業/診所一對一)"
                            />
                        </div>

                        <button className="px-8 py-3 bg-emerald-600 text-white font-black rounded-xl text-xs shadow-md hover:bg-emerald-700 transition">
                            儲存規則設定
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
