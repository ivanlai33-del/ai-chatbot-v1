'use client';

import React, { useState } from 'react';
import { Mail, ShieldCheck, CreditCard, LifeBuoy, X, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { PRICING_PLANS } from '@/lib/config/pricing';

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: React.ReactNode;
}

const LegalModal = ({ isOpen, onClose, title, content }: LegalModalProps) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                >
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-lg font-black text-white">{title}</h2>
                        <button onClick={onClose} title="關閉" className="p-2 rounded-full hover:bg-white/5 text-slate-500"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="p-6 overflow-y-auto text-slate-400 text-sm leading-relaxed space-y-4 font-medium">
                        {content}
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

interface LandingFooterProps {
    isLight?: boolean;
    variant?: 'desktop' | 'mobile' | 'auto';
}

export default function LandingFooter({ isLight = false, variant = 'auto' }: LandingFooterProps) {
    const [modal, setModal] = useState<{ open: boolean; title: string; content: React.ReactNode }>({
        open: false, title: '', content: null
    });

    const isMobileLayout = variant === 'mobile';
    const isDesktopLayout = variant === 'desktop';

    const textPrimary = isLight ? 'text-slate-900' : 'text-white';
    const textSecondary = isLight ? 'text-slate-500' : 'text-slate-200';
    const borderColor = isLight ? 'border-slate-800/10' : 'border-white/20';
    const brandColor = isLight ? 'text-emerald-700' : 'text-emerald-400';
    const brandBg = isLight ? 'bg-emerald-500/15' : 'bg-emerald-500/10';

    const openLegal = (type: 'tos' | 'privacy' | 'disclaimer') => {
        const configs = {
            tos: { 
                title: '服務條款 (Terms of Service)', 
                content: (
                    <div className="space-y-6">
                        <section><h4 className="font-bold text-white mb-2 text-base">一、服務受理與同意</h4><p>歡迎您使用由 YC Ideas (以下簡稱「本公司」) 營運之「AI 智能店長」服務。當您開始使用本服務時，即表示您已同意接受本服務條款之所有內容。</p></section>
                        <section><h4 className="font-bold text-white mb-2 text-base">二、服務範圍與 AI 特性</h4><p>本公司係基於大語言模型技術提供之 AI 銷售輔助系統，用戶瞭解 AI 生成結果之準確性與參考性。</p></section>
                        <section><h4 className="font-bold text-white mb-2 text-base">三、訂閱制規範</h4><p>本服務採預付訂閱制，用戶可隨時於管理後台取消次月續訂。服務將延續至結算週期屆滿且不退還已支付費用。</p></section>
                        <section><h4 className="font-bold text-white mb-2 text-base">四、不適用鑑賞期</h4><p>依據準則，本數位內容一經點選開通即完成履行，恕不適用七天鑑賞期退貨規則。</p></section>
                    </div>
                ) 
            },
            privacy: { 
                title: '隱私權政策 (Privacy Policy)', 
                content: (
                    <div className="space-y-6">
                        <section><h4 className="font-bold text-white mb-2 text-base">一、個人資料蒐集</h4><p>我們將蒐集您的 LINE 顯示名稱、頭像、LINE UID 及對話內容日誌，僅用於優化 AI 模型回覆之準確度與客服查詢。</p></section>
                        <section><h4 className="font-bold text-white mb-2 text-base">二、資安防護與加密</h4><p>所有交易資料與 API 金鑰皆經由 256-bit SSL 加密處理。密碼存儲採不可逆雜湊算法，確保數據安全性。</p></section>
                    </div>
                ) 
            },
            disclaimer: { 
                title: '免責聲明 (Disclaimer)', 
                content: (
                    <div className="space-y-6">
                        <section><h4 className="font-bold text-white mb-2 text-base">一、AI 生成回覆之責任</h4><p>本服務 AI 店長回覆僅供商業建議參考。對於信賴該資訊而產生之損害，本公司不負法律賠償責任。</p></section>
                        <section><h4 className="font-bold text-white mb-2 text-base">二、外部平臺依賴性</h4><p>如因 LINE 官方伺服器維護或全球網路故障導致服務中斷，本公司概不負責。</p></section>
                    </div>
                ) 
            }
        };
        setModal({ open: true, ...configs[type] });
    };

    // 電腦版順序：聯絡資訊 > 方案說明 > 退款政策 > 營運單位
    const sections = [
        {
            id: 'contact',
            icon: Mail,
            title: '客服聯絡資訊',
            content: (
                <div className={`space-y-3 text-[15px] ${textSecondary}`}>
                    <p className="font-medium">官方客服信箱：<span className={`${textPrimary} font-black underline decoration-emerald-500/20`}>info@ycideas.com</span></p>
                    <div className="space-y-1">
                         <p className="text-xs opacity-50 uppercase font-black tracking-widest mb-1.5">LINE 專屬通道</p>
                        <p className="flex items-center gap-2">🤖 AI 客服：<span className="text-emerald-400 font-bold tracking-tight">@967iypui</span></p>
                        <p className="flex items-center gap-2">👤 真人專員：<span className="text-blue-400 font-bold">ivanlai33</span></p>
                        <p className="text-xs opacity-40 mt-1 italic italic">服務、合作、開發、洽詢</p>
                    </div>
                </div>
            )
        },
        {
            id: 'solutions',
            icon: Target,
            title: '產業別解決方案',
            content: (
                <div className={`space-y-2 text-[15px] ${textSecondary}`}>
                    <Link href="/solutions/beauty-line-ai-customer-service" className="block hover:text-emerald-400 transition-colors">美容產業專用 AI 客服</Link>
                    <Link href="/solutions/retail-line-ai-customer-service" className="block hover:text-emerald-400 transition-colors">零售品牌專用 AI 導購</Link>
                    <Link href="/solutions/restaurant-line-ai-assistant" className="block hover:text-emerald-400 transition-colors">餐飲業專用 AI 接單</Link>
                    <p className="text-[11px] opacity-40 mt-4 uppercase font-black tracking-widest leading-loose">
                        專為中小企業打造的<br />LINE 官方帳號數位轉型方案
                    </p>
                </div>
            )
        },
        {
            id: 'pricing',
            icon: CreditCard,
            title: '付費方案說明',
            content: (
                <div className={`space-y-2 text-[15px] ${textSecondary} leading-relaxed`}>
                    <p className="mb-2">本平台採「訂閱制 (SaaS)」收費模式</p>
                    <div className="space-y-1.5 grayscale-[0.3]">
                        {[
                            PRICING_PLANS.starter, 
                            PRICING_PLANS.solo, 
                            PRICING_PLANS.growth, 
                            PRICING_PLANS.chain, 
                            PRICING_PLANS.flagship_lite, 
                            PRICING_PLANS.flagship_pro
                        ].map((p) => (
                            <p key={p.id} className="flex justify-between items-center gap-4">
                                <span className="font-bold shrink-0">{p.name}：</span>
                                <span className={`${textPrimary} font-black text-right`}>
                                    ${p.pricing.monthly.toLocaleString()}{p.pricing.isStartingPrice ? ' 起' : ''} / 月
                                </span>
                            </p>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'refund',
            icon: ShieldCheck,
            title: '退款與終止政策',
            content: (
                <div className={`space-y-4 text-[15px] ${textSecondary} leading-relaxed`}>
                    <p>數位服務開通後，除不可抗力因素外，恕不提供退款。</p>
                    <p>用戶可隨時於後台取消次月續訂，服務將持續至該帳單週期結束。</p>
                     <p className="text-[13px] opacity-70">若有異常扣款，請於 7 日內聯繫客服處理。</p>
                </div>
            )
        },
        {
            id: 'operator',
            icon: LifeBuoy,
            title: '營運單位',
            content: (
                <div className={`space-y-2 text-[15px] ${textSecondary}`}>
                    <p className="font-bold">© 2026 您的專屬AI智能店長</p>
                     <p className={`${textPrimary} font-black text-lg tracking-tight`}>YC Ideas 奕暢創新工作室</p>
                    <p className="text-xs uppercase font-black tracking-widest border-l border-white/20 pl-2">AI 數位服務開發 運作</p>
                </div>
            )
        }
    ];

    return (
        <footer className={`relative z-20 w-full pt-20 pb-16 px-6 ${isDesktopLayout ? 'bg-gradient-to-br from-[#058a40]/30 via-[#01142F]/60 to-[#1e3a8a]/40 border-t border-white/20 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]' : 'bg-transparent'}`}>
            <LegalModal isOpen={modal.open} onClose={() => setModal({ ...modal, open: false })} title={modal.title} content={modal.content} />
            
            <div className={`mx-auto ${isMobileLayout ? 'max-w-xl flex flex-col space-y-12' : 'max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8'}`}>
                {sections.map((section) => (
                    <div key={section.id} className={`${isMobileLayout ? 'border-b border-white/10 pb-12 last:border-0' : 'space-y-5'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-9 h-9 rounded-xl ${brandBg} flex items-center justify-center border ${isLight ? 'border-emerald-500/20' : 'border-white/10'}`}>
                                <section.icon className={`w-4.5 h-4.5 ${brandColor}`} />
                            </div>
                             <h3 className={`${textPrimary} font-black text-lg tracking-[0.1em]`}>{section.title}</h3>
                        </div>
                        <div className="pl-0">
                            {section.content}
                        </div>
                    </div>
                ))}
            </div>

            <div className={`mt-16 pt-10 ${isDesktopLayout ? '' : `border-t ${borderColor}`} border-white/5`}>
                <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-6">
                     <p className={`text-xs font-black ${isLight ? 'text-slate-400' : 'text-slate-200'} uppercase tracking-[0.3em] text-center leading-relaxed`}>
                        本網站交易資料由 藍新金流 NEWEBPAY 提供 256-BIT SSL 加密安全保護
                    </p>
                     <div className={`flex flex-row justify-center gap-10 text-[15px] font-black ${isLight ? 'text-slate-500' : 'text-slate-500/80'}`}>
                        <button onClick={() => openLegal('tos')} className="hover:text-emerald-400 underline underline-offset-4 decoration-white/10 transition-all">服務條款</button>
                        <button onClick={() => openLegal('privacy')} className="hover:text-emerald-400 underline underline-offset-4 decoration-white/10 transition-all">隱私權政策</button>
                        <button onClick={() => openLegal('disclaimer')} className="hover:text-emerald-400 underline underline-offset-4 decoration-white/10 transition-all">免責聲明</button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
