'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface ConnectSuccessProps {
    connectionData: any;
    onBackToHub: () => void;
}

export default function ConnectSuccess({ connectionData, onBackToHub }: ConnectSuccessProps) {
    return (
        <motion.div 
            key="success" 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-[40px] shadow-xl border border-slate-200 space-y-6 max-w-2xl mx-auto mt-20"
        >
            <div className="w-24 h-24 bg-emerald-100 rounded-[32px] flex items-center justify-center border-2 border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">完成串接！</h2>
            <p className="text-slate-500 font-medium">您的機器人 [{connectionData?.channel_name || connectionData?.botBasicId}] 已成功連線。</p>
            <div className="flex gap-4">
                <button 
                    onClick={onBackToHub} 
                    className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black transition-colors"
                >
                    返回清單
                </button>
                <button 
                    onClick={() => window.location.href = '/dashboard'} 
                    className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black shadow-lg transition-all"
                >
                    前往店長設定
                </button>
            </div>
        </motion.div>
    );
}
