'use client';

import { motion } from 'framer-motion';
import { Home, Zap, Crown, User, LogOut } from 'lucide-react';
import Image from 'next/image';

interface TopNavProps {
    userName: string;
    userPicture: string;
    planLevel: number;
    planConfig: any;
    onLogout: () => void;
}

export default function TopNav({ 
    userName, 
    userPicture, 
    planLevel, 
    planConfig, 
    onLogout 
}: TopNavProps) {
    const plan = planConfig[planLevel as 0 | 1 | 2];
    const PlanIcon = plan.icon;

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl shadow-sm border-b border-slate-200/60">
            <div className="px-6 md:px-[100px] py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                    <div className="w-[43.2px] h-[43.2px] relative">
                        <Image src="/Lai Logo_4.svg" alt="Lai Logo" fill className="object-contain" />
                    </div>
                    <div>
                        <span className="font-black text-[19.2px] tracking-tight text-slate-800">AI 店長後台</span>
                        <span className="ml-2 text-[14.4px] text-slate-400">Member Dashboard</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 mr-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => window.location.href = '/'}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-all text-[13px] font-bold border border-transparent hover:border-slate-200"
                        >
                            <Home className="w-3.5 h-3.5" />
                            回首頁
                        </motion.button>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${plan.badge}`}>
                        {PlanIcon && <PlanIcon className={`w-3.5 h-3.5 ${plan.color}`} />}
                        <span className={plan.color}>{plan.label}</span>
                    </div>
                    <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                        {userPicture ? (
                            <img src={userPicture} alt={userName} className="w-8 h-8 rounded-full border-2 border-emerald-400/60" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <span className="text-sm text-slate-600 font-medium hidden sm:block">{userName}</span>
                    </div>
                    <button
                        onClick={onLogout}
                        className="p-2 rounded-xl hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-600" title="登出"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}
