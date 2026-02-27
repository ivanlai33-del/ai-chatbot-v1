"use client";

import React from 'react';
import { Users, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface SlotStatsProps {
    used: number;
    total: number;
    loading?: boolean;
}

export default function SlotStats({ used, total, loading }: SlotStatsProps) {
    const percentage = total > 0 ? (used / total) * 100 : 0;

    const stats = [
        { label: '已開通席位', value: loading ? '...' : used, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: '總可用席位', value: loading ? '...' : total, icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: '系統狀態', value: '運作正常', icon: Shield, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 bg-slate-800/40 rounded-[2rem] border border-slate-700/50 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-white">{stat.value}</p>
                        </div>
                    </div>
                    {stat.label === '已開通席位' && (
                        <div className="mt-4">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-tight">
                                <span>使用進度</span>
                                <span>{Math.round(percentage)}%</span>
                            </div>
                            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                />
                            </div>
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
