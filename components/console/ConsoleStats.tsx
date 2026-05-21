'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
interface ConsoleStatsProps {
    stats: any[];
}

export default function ConsoleStats({ stats }: ConsoleStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-all group"
                >
                    <div className="flex items-start justify-between">
                        <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", stat.color)}>
                            <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{stat.trend}</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                        <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
