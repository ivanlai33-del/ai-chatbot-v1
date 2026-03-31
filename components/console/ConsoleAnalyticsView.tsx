'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, PieChart, Layers, ArrowUpRight } from 'lucide-react';

// --- 👋 1. Mock Data ---
const INDUSTRY_DATA = [
  { name: '美業工作室', value: 38, color: '#f472b6' },
  { name: '餐飲零售', value: 34, color: '#fbbf24' },
  { name: '房地產代銷', value: 28, color: '#22d3ee' },
];

const TABLE_DATA = [
  { id: '#4912', company: 'Beauty Hub', industry: 'Beauty', status: 'Active', plan: 'Pro', time: '2 mins ago' },
  { id: '#4911', company: 'FoodCo', industry: 'Food', status: 'Pending', plan: 'Lite', time: '5 mins ago' },
  { id: '#4910', company: 'EstatePro', industry: 'Real Estate', status: 'Active', plan: 'Enterprise', time: '12 mins ago' },
];

// --- 📈 2. Pure SVG K-Line Line Chart ---
const SVGLineChart = () => (
  <div className="relative w-full h-[220px] bg-slate-900/40 rounded-3xl border border-slate-700/50 p-6 overflow-hidden">
    <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Platform Growth (K-Line)</h4>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+24.8% MAU</span>
        </div>
    </div>
    <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
      {/* Grid Lines */}
      <line x1="0" y1="130" x2="400" y2="130" stroke="#334155" strokeDasharray="4 4" />
      <line x1="0" y1="90" x2="400" y2="90" stroke="#334155" strokeDasharray="4 4" />
      <line x1="0" y1="50" x2="400" y2="50" stroke="#334155" strokeDasharray="4 4" />
      
      {/* The Line - Animated with Framer Motion */}
      <motion.path
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        d="M0,120 C40,110 80,130 120,90 C160,50 200,80 240,60 C280,40 320,50 360,20 L400,10"
        fill="none"
        stroke="#10b981"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Area Glow */}
      <motion.path 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ delay: 1, duration: 1 }}
        d="M0,120 C40,110 80,130 120,90 C160,50 200,80 240,60 C280,40 320,50 360,20 L400,10 L400,150 L0,150 Z"
        fill="#10b981"
      />
      
      {/* Data Points */}
      {[120, 90, 60, 20].map((y, i) => (
          <motion.circle 
            key={i}
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 + (i*0.2) }}
            cx={i * 120} cy={y} r="4" fill="#34d399" className="shadow-lg shadow-emerald-500/50"
          />
      ))}
    </svg>
  </div>
);

// --- 🍕 3. Pure SVG Pie Chart ---
const SVGPieChart = () => (
    <div className="bg-slate-900/40 rounded-3xl border border-slate-700/50 p-6">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Revenue by Industry</h4>
        <div className="flex items-center gap-8">
            <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {/* Pink - Beauty (38%) */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f472b6" strokeWidth="12" strokeDasharray="95.5 155.5" strokeDashoffset="0" />
                    {/* Yellow - Food (34%) */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fbbf24" strokeWidth="12" strokeDasharray="85.4 165.6" strokeDashoffset="-95.5" />
                    {/* Cyan - Real Estate (28%) */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22d3ee" strokeWidth="12" strokeDasharray="70.3 180.7" strokeDashoffset="-180.9" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-[10px] font-black text-slate-500">TOTAL</span>
                    <span className="text-sm font-black text-white">$45k</span>
                </div>
            </div>
            <div className="space-y-3 flex-1">
                {INDUSTRY_DATA.map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-[11px] font-bold text-slate-400">{item.name}</span>
                        </div>
                        <span className="text-[11px] font-black text-white">{item.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// --- 🌲 4. Strategy Tree (Funnel) ---
const FunnelTree = () => (
    <div className="bg-slate-900/40 rounded-3xl border border-slate-700/50 p-6 flex flex-col justify-center h-full">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">User Funnel Conversion</h4>
        <div className="relative space-y-6">
            <div className="flex flex-col items-center gap-6">
                {/* Stage 1 */}
                <div className="px-6 py-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl w-48 text-center relative z-10">
                    <p className="text-[9px] font-black text-indigo-400 uppercase mb-0.5">Signed Up</p>
                    <p className="text-lg font-black text-white">10,500</p>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-indigo-500/30" />
                </div>
                
                {/* Stage 2 */}
                <div className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl w-40 text-center relative z-10">
                    <p className="text-[9px] font-black text-emerald-400 uppercase mb-0.5">Synced & Live</p>
                    <p className="text-lg font-black text-white">8,210</p>
                    <div className="absolute top-[-10px] right-[-40px] text-[10px] font-black text-emerald-500 bg-emerald-500/20 px-2 py-0.5 rounded-full">78.2% CVR</div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-emerald-500/30" />
                </div>

                {/* Stage 3 */}
                <div className="px-6 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl w-32 text-center relative z-10">
                    <p className="text-[9px] font-black text-amber-400 uppercase mb-0.5">Subscribed</p>
                    <p className="text-lg font-black text-white">1,290</p>
                    <div className="absolute top-[-10px] right-[-40px] text-[10px] font-black text-amber-500 bg-amber-500/20 px-2 py-0.5 rounded-full">15.7% CVR</div>
                </div>
            </div>
        </div>
    </div>
);

// --- 🏢 5. Large Audit Table ---
const AuditTable = () => (
    <div className="bg-slate-900/40 rounded-3xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Recent Platform Activity</h4>
            <button className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-all">Export Report</button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
                <thead>
                    <tr className="border-b border-slate-700/30">
                        <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">ID</th>
                        <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">Company / Owner</th>
                        <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">Industry</th>
                        <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">Time</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/20">
                    {TABLE_DATA.map(item => (
                        <tr key={item.id} className="hover:bg-slate-800/20 transition-all">
                            <td className="px-6 py-4 font-mono text-slate-500">{item.id}</td>
                            <td className="px-6 py-4 font-black text-slate-200">{item.company}</td>
                            <td className="px-6 py-4 text-slate-400">{item.industry}</td>
                            <td className="px-6 py-4">
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full font-black text-[9px] uppercase tracking-tighter",
                                    item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                )}>{item.status}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{item.time}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default function ConsoleAnalyticsView() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Top Grid: K-Line & Industry */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                    <SVGLineChart />
                </div>
                <div>
                    <SVGPieChart />
                </div>
            </div>

            {/* Middle Grid: Funnel & Audit Log */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div>
                    <FunnelTree />
                </div>
                <div className="xl:col-span-2">
                    <AuditTable />
                </div>
            </div>
        </div>
    );
}

// Utility to handle classes without clsx if needed, but we have it
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
