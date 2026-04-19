'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            // 延遲顯示，減少進站時的干擾
            const timer = setTimeout(() => setIsVisible(true), 15000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'accepted');
        setIsVisible(false);
        // 觸發自定義事件，讓 VisitorTracker 知道可以開始工作了
        window.dispatchEvent(new Event('cookie_consent_updated'));
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[420px] z-[9999]"
                >
                    <div className="relative overflow-hidden group">
                        {/* Glassmorphism Background */}
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl" />
                        
                        {/* Content */}
                        <div className="relative p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                    <ShieldCheck className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-[17px] font-bold text-slate-800 tracking-tight mb-1">
                                            隱私與數據偏好
                                        </h3>
                                        <button 
                                            onClick={() => setIsVisible(false)}
                                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                                        此網站使用 Cookie 來提升您的體驗並優化 AI 店長的回覆精準度。您可以選擇接受或管理您的偏好。
                                    </p>
                                    
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleAccept}
                                            className="flex-1 px-4 py-2.5 bg-slate-900 text-white text-[13px] font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                                        >
                                            同意並繼續
                                        </button>
                                        <button
                                            onClick={handleDecline}
                                            className="px-4 py-2.5 text-slate-600 text-[13px] font-medium rounded-xl hover:bg-slate-100 transition-all active:scale-95 border border-slate-200"
                                        >
                                            拒絕全部
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subtle interactive accent */}
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-30" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
