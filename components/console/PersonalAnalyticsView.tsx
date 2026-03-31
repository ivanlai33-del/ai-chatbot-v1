'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Target, ArrowRight, Phone, CheckCircle2, AlertCircle } from 'lucide-react';

// --- 🛠️ 1. Mock Data for Shop Owners ---
const SERVICE_HOTSPOTS = [
  { name: '美甲服務諮詢', value: 45, color: '#f472b6' },
  { name: '美睫預約', value: 30, color: '#fbbf24' },
  { name: '產品購買(精油)', value: 15, color: '#22d3ee' },
  { name: '營業資訊', value: 10, color: '#94a3b8' },
];

const LEAD_CRM_DATA = [
  { id: 'L829', name: '林小姐 (訪客 #3829)', store: '台北旗艦店', intent: '預約美甲', contact: '0912-345-678', score: 'High 🔥', time: '10 mins ago' },
  { id: 'L830', name: '陳先生 (訪客 #3830)', store: '台中分店', intent: '價格詢問', contact: '未留資料', score: 'Medium ⚡', time: '25 mins ago' },
  { id: 'L831', name: '王小姐 (訪客 #3831)', store: '高雄門市', intent: '產品購買', contact: '0988-777-666', score: 'Hot 💎', time: '1 hour ago' },
];

const BLIND_SPOTS = [
  { question: "「請問有提供到府美甲服務嗎？」", frequency: 12, impact: "High" },
  { question: "「可以帶寵物進店嗎？」", frequency: 8, impact: "Medium" },
];

// --- 📊 2. Service Distribution Chart (Pie) ---
const ServicePieChart = () => (
    <div className="bg-slate-900/40 rounded-3xl border border-slate-700/50 p-6 h-full">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Target className="w-4 h-4 text-pink-400" /> 顧客熱門諮詢分佈
        </h4>
        <div className="flex flex-col items-center justify-center h-[200px]">
             <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f472b6" strokeWidth="12" strokeDasharray="113.1 138.2" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fbbf24" strokeWidth="12" strokeDasharray="75.4 175.9" strokeDashoffset="-113.1" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22d3ee" strokeWidth="12" strokeDasharray="37.7 213.6" strokeDashoffset="-188.5" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#94a3b8" strokeWidth="12" strokeDasharray="25.1 226.2" strokeDashoffset="-226.2" />
            </svg>
            <div className="mt-6 w-full space-y-2">
                {SERVICE_HOTSPOTS.map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-[10px] font-bold text-slate-400">{item.name}</span>
                        </div>
                        <span className="text-[10px] font-black text-white">{item.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// --- 🤖 3. AI Blindspots (Immediate Value) ---
const AIBlindspotManager = () => (
    <div className="bg-slate-900/40 rounded-3xl border border-slate-700/50 p-6 h-full">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" /> AI 聽不懂的問題列表 (待優化)
        </h4>
        <div className="space-y-4">
            {BLIND_SPOTS.map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-between group hover:bg-rose-500/10 transition-all cursor-pointer">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-200">{item.question}</p>
                        <p className="text-[10px] text-slate-500">出現次數: <span className="text-rose-400 font-black">{item.frequency} 次</span></p>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 text-white text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all">
                        立即補入智庫
                    </button>
                </div>
            ))}
        </div>
    </div>
);

// --- 📁 4. Lead CRM Table (Master Table) ---
const LeadCRMTable = () => (
    <div className="bg-slate-900/40 rounded-3xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 成功領資名單 (Leads CRM)
            </h4>
            <button className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-[11px] font-black hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10">匯出至 Excel</button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
                <thead>
                    <tr className="bg-slate-900/20 border-b border-slate-700/50">
                        <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">顧客名稱</th>
                        <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">店鋪</th>
                        <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">意圖</th>
                        <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">聯絡方式</th>
                        <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">熱度分評</th>
                        <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">時間</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/20">
                    {LEAD_CRM_DATA.map(item => (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition-all group">
                            <td className="px-6 py-4 font-black text-slate-200">{item.name}</td>
                            <td className="px-6 py-4 text-slate-400">{item.store}</td>
                            <td className="px-6 py-4">
                                <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold">{item.intent}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Phone className="w-3 h-3 text-emerald-500" />
                                    <span className={item.contact === '未留資料' ? 'text-slate-600 italic' : ''}>{item.contact}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 font-black uppercase text-amber-500">{item.score}</td>
                            <td className="px-6 py-4 text-slate-500">{item.time}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default function PersonalAnalyticsView() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Row: AI Performance & Insight */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AIBlindspotManager />
                <ServicePieChart />
            </div>

            {/* Bottom Row: Full CRM Data */}
            <LeadCRMTable />
        </div>
    );
}
