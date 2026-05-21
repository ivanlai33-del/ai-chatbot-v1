'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqs = [
    {
        q: 'AI 智能店長需要自己申請 OpenAI API Key 嗎？',
        a: '不需要。AI 智能店長 Pro 採用 SaaS 模式，店家不必自行處理複雜的 API 串接或模型設定，就能快速開通 LINE 官方帳號 AI 客服。'
    },
    {
        q: '可以教 AI 認識我的商品與服務內容嗎？',
        a: '可以。您可以整理官網、商品介紹、價目表、常見問題、PDF 文件或店內說明，系統會把這些資訊轉成 AI 可使用的知識內容，讓回覆更貼近您的品牌與商品。'
    },
    {
        q: 'LINE AI 客服可以回覆哪些問題？',
        a: '常見像是價格、規格、商品差異、營業時間、地址、預約方式、運費、付款方式、活動內容與初步購買引導，都很適合交給 AI 先處理。'
    },
    {
        q: '如果 AI 不會回答，可以轉給真人嗎？',
        a: '可以。實務上最好的做法不是讓 AI 取代所有客服，而是由 AI 處理高重複問題，再把需要成交、客訴、特殊案例或人工判斷的對話交給真人。'
    },
    {
        q: '適合哪些產業導入？',
        a: '特別適合美容、零售、餐飲、預約型服務、課程顧問與其他高度依賴 LINE 官方帳號接客的中小企業。'
    },
    {
        q: '導入 LINE 官方帳號 AI 客服要多久？',
        a: '若資料齊全，導入速度通常會比傳統客製開發快很多，因為 SaaS 型工具能先從標準化功能快速上線，再逐步優化知識內容與對話流程。'
    },
    {
        q: 'AI 智能店長和 LINE 內建 AI 聊天機器人有什麼不同？',
        a: 'LINE 官方帳號近年已推出內建 AI 聊天機器人功能。若店家需要更完整的品牌語氣調整、知識庫管理、導購流程與方案彈性，通常會考慮 AI 智能店長 Pro。'
    },
    {
        q: '中小企業適合先怎麼開始？',
        a: '最好的做法是先鎖定最常見、最重複、最耗時的客服問題，先從小規模試辦開始，驗證能否減少訊息處理時間、提高回覆率，再逐步擴充。'
    }
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 px-6 bg-slate-900/50 relative overflow-hidden">
            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div 
                    initial={{ opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                        常見問題 <span className="text-blue-400">FAQ</span>
                    </h2>
                    <p className="text-slate-200 text-xl font-bold">
                        關於 LINE 官方帳號 AI 客服，您想知道的都在這裡
                    </p>
                </motion.div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 1, y: 0 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className="group border border-white/5 rounded-3xl bg-slate-800/40 backdrop-blur-xl overflow-hidden transition-all hover:border-white/10"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-6 md:p-8 text-left transition-colors"
                            >
                                <h3 className="text-lg md:text-xl font-bold text-white pr-8 flex items-start gap-4">
                                    <HelpCircle className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                                    {faq.q}
                                </h3>
                                <div className="shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                    {openIndex === i ? (
                                        <Minus className="w-5 h-5 text-white" />
                                    ) : (
                                        <Plus className="w-5 h-5 text-white" />
                                    )}
                                </div>
                            </button>
                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <div className="px-6 md:px-8 pb-8 pt-0">
                                            <div className="pl-10 text-slate-200 text-lg leading-relaxed font-bold">
                                                {faq.a}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
