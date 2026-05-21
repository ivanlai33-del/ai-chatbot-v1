'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const reviews = [
    {
        name: '一人工作室老闆',
        industry: '美容美睫',
        comment: '原本每天要花 2 小時回覆重複的價目與預約問題，現在 AI 幫我處理了 9 成，我只要專心做客人就好，預約業績反而提升了。',
        stats: '客服排程減少 80%'
    },
    {
        name: '服飾選物品牌',
        industry: '電子商務',
        comment: '半夜的詢問原本都會等到隔天早上才回，現在 AI 店長 24 小時守候，連半夜 3 點的尺寸詢問都能即時成交！',
        stats: '夜間成交率成長 25%'
    },
    {
        name: '連鎖餐飲經營者',
        industry: '餐飲服務',
        comment: '尖峰時間店員根本沒空接電話或回 LINE，AI 同時幫我處理多位客人的營業資訊詢問，現場壓力減輕非常有感。',
        stats: '現場端漏訊率降至 0%'
    }
];

export default function CustomerReviews() {
    return (
        <section id="reviews" className="py-24 px-6 relative z-10 overflow-hidden bg-slate-900/40 backdrop-blur-xl border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <motion.div 
                    initial={{ opacity: 1 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                        老闆們的 <span className="text-emerald-400">實戰見證</span>
                    </h2>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="ml-2 text-white font-black text-lg">4.9 / 5</span>
                    </div>
                    <p className="text-white text-lg font-bold drop-shadow-md">基於 1000+ 位 LINE 官方帳號用戶的使用回饋</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((rev, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 1, y: 0 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-10 rounded-[40px] bg-white/10 border border-white/20 backdrop-blur-xl relative group flex flex-col justify-between shadow-2xl"
                        >
                            <Quote className="absolute top-8 right-8 w-12 h-12 text-white/10 group-hover:text-emerald-500/10 transition-colors" />
                            
                            <div className="space-y-6">
                                <p className="text-white text-lg leading-relaxed font-bold italic">
                                    「{rev.comment}」
                                </p>
                                
                                <div className="pt-6 border-t border-white/10">
                                    <div className="font-black text-white text-lg">{rev.name}</div>
                                    <div className="text-emerald-400 text-sm font-bold">{rev.industry}</div>
                                </div>
                            </div>

                            <div className="mt-8 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 inline-block text-center">
                                <span className="text-emerald-400 font-black text-sm uppercase tracking-widest">{rev.stats}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>


            </div>
        </section>
    );
}
