'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const redirect = setTimeout(() => {
      window.location.href = '/dashboard/billing';
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 text-center border border-slate-100"
      >
        <div className="relative mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
            className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle2 className="w-12 h-12" />
          </motion.div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-1/2 -ml-12 w-24 h-24 border-2 border-dashed border-emerald-200 rounded-full"
          />
        </div>

        <h1 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">付款成功！</h1>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
          您的方案已成功開通。感謝您的訂閱，現在您可以開始使用完整的主力功能了。
        </p>

        <div className="bg-slate-50 rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold text-slate-600">方案更新作業中</span>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
            <span className="text-xs font-black text-slate-400">{countdown}s 後跳轉</span>
          </div>
        </div>

        <Link 
          href="/dashboard/billing"
          className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          立即回到帳務中心 <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
