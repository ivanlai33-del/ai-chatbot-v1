'use client';

import React from 'react';
import { Mail, ShieldCheck, CreditCard, LifeBuoy } from 'lucide-react';

export default function LandingFooter() {
    return (
        <footer className="bg-slate-950 border-t border-white/5 py-20 px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-slate-400">
                
                {/* 📞 客服聯絡資訊 (藍新第2點) */}
                <div className="space-y-4">
                    <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-500" />
                        客服聯絡資訊
                    </h3>
                    <div className="text-sm space-y-3 leading-relaxed">
                        <p>官方客服信箱：<span className="text-white select-all font-bold tracking-tight">info@ycideas.com</span></p>
                        <div className="pt-2 border-t border-white/5 space-y-2">
                            <p className="text-xs text-slate-500 font-black uppercase tracking-widest">LINE 專屬通道</p>
                            <p>🤖 AI 客服：<span className="text-emerald-400 font-bold whitespace-nowrap">@967iypui</span></p>
                            <p>👤 真人專員：<span className="text-indigo-400 font-bold whitespace-nowrap">ivanlai33</span></p>
                            <p className="text-[10px] text-slate-600 font-bold italic">服務、合作、開發、洽詢</p>
                        </div>
                    </div>
                </div>

                {/* 💳 收費模式說明 (藍新第3點) */}
                <div className="space-y-4">
                    <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-indigo-500" />
                        付費方案說明
                    </h3>
                    <div className="text-sm space-y-2 leading-relaxed">
                        <p>本平台採「訂閱制 (SaaS)」收費模式</p>
                        <p>個人店長版：$499 / 月 (或 $5,489 / 年)</p>
                        <p>強力店長版：$1,199 / 月 (或 $13,189 / 年)</p>
                        <p>年費方案包含「買 11 個月贈 1 個月」優惠</p>
                    </div>
                </div>

                {/* 🛡️ 退款與定額政策 (藍新第4點) */}
                <div className="space-y-4">
                    <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-rose-500" />
                        退款與終止政策
                    </h3>
                    <div className="text-sm space-y-2 leading-relaxed">
                        <p>數位服務開通後，除不可抗力因素外，恕不提供退款。</p>
                        <p>用戶可隨時於後台取消次月續訂，服務將持續至該帳單週期結束。</p>
                        <p>若有異常扣款，請於 7 日內聯繫客服處理。</p>
                    </div>
                </div>

                {/* 🏪 商店資訊 */}
                <div className="space-y-4">
                    <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
                        <LifeBuoy className="w-4 h-4 text-blue-500" />
                        商務合作
                    </h3>
                    <div className="text-sm space-y-2 leading-relaxed">
                        <p>© 2026 iVan AI 智能店長 Pro</p>
                        <p>由 YC Ideas 數位轉型實驗室 運作</p>
                        <p>提供企業級 AI 解決方案與數位自動化顧問</p>
                    </div>
                </div>

            </div>

            <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs font-medium text-slate-600 uppercase tracking-widest">
                    本網站交易資料由 藍新金流 NEWEBPAY 提供 256-bit SSL 加密安全保護
                </p>
                <div className="flex gap-6 text-xs font-bold text-slate-500">
                    <a href="#" className="hover:text-white transition-colors">服務條款</a>
                    <a href="#" className="hover:text-white transition-colors">隱私權政策</a>
                    <a href="#" className="hover:text-white transition-colors">免責聲明</a>
                </div>
            </div>
        </footer>
    );
}
