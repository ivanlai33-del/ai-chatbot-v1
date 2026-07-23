'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ExternalLink, Search, Sparkles, Heart, ArrowUpRight, Phone, MessageSquare } from 'lucide-react';

export default function LiffCatalogPage() {
    const [botId, setBotId] = useState<string>('00000000-0000-0000-0000-000000000001');
    const [offerings, setOfferings] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // 預設示範菜單/商品資料
    const demoItems = [
        {
            name: '美甲手部保養 + 凝膠造型設計',
            price: '1,200',
            category: '美甲服務',
            description: '包含指緣保養、去角質與客製化法式凝膠造型設計。',
            url: 'https://shopee.tw',
            image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80'
        },
        {
            name: '招牌特級海陸雙拼主餐',
            price: '480',
            category: '熱銷主餐',
            description: '主廚嚴選安格斯黑牛排搭配新鮮大草蝦與季節溫沙拉。',
            url: 'https://inline.app',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
        },
        {
            name: '汽車 10,000 公里定期全車保養',
            price: '2,500',
            category: '維修服務',
            description: '包含全合成機油更換、胎壓檢測與 32 項安全配備健康檢查。',
            url: 'https://forms.google.com',
            image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80'
        },
        {
            name: 'VIP 退休資產配置與節稅諮詢',
            price: '免費諮詢',
            category: '理專諮詢',
            description: '一對一專屬理財顧問分析，為您量身打造多元資產配置。',
            url: 'https://line.me',
            image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80'
        }
    ];

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const bId = params.get('botId') || '00000000-0000-0000-0000-000000000001';
        setBotId(bId);

        fetchCatalog(bId);
    }, []);

    const fetchCatalog = async (targetBotId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/bot/${targetBotId}/booking?date=2026-07-24`);
            const data = await res.json();
            if (data.services && data.services.length > 0) {
                const formatted = data.services.map((s: any) => ({
                    name: s.name,
                    price: s.price > 0 ? `${s.price.toLocaleString()}` : '請洽詢',
                    description: s.description || '官方推薦熱銷項目',
                    url: 'https://line.me',
                    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80'
                }));
                setOfferings(formatted);
            } else {
                setOfferings(demoItems);
            }
        } catch (err) {
            setOfferings(demoItems);
        } finally {
            setLoading(false);
        }
    };

    const filteredOfferings = offerings.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-emerald-500/20 p-4 sm:p-6 flex flex-col items-center justify-start font-sans">
            <div className="max-w-md w-full space-y-6 text-slate-800">
                
                {/* 頂部標頭 Header */}
                <div className="bg-white/90 backdrop-blur-2xl rounded-[32px] p-6 border border-slate-200/80 shadow-xl space-y-4 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-slate-900 leading-tight">門市視覺微型 DM 目錄</h1>
                                <p className="text-[11px] font-bold text-slate-400">點擊項目可直接跳轉至店家官方賣場</p>
                            </div>
                        </div>
                    </div>

                    {/* 搜尋列 */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="搜尋服務或商品項目..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                        />
                    </div>
                </div>

                {/* 商品目錄清單 Grid */}
                {loading ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-bold">載入門市 DM 目錄中...</div>
                ) : filteredOfferings.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-bold">找不到相符的項目</div>
                ) : (
                    <div className="space-y-4">
                        {filteredOfferings.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-[28px] border border-slate-200/80 overflow-hidden shadow-lg hover:border-emerald-500/30 transition-all group"
                            >
                                {item.image && (
                                    <div className="h-44 w-full overflow-hidden relative">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute top-3 right-3 bg-slate-900/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-black">
                                            NT$ {item.price}
                                        </div>
                                    </div>
                                )}

                                <div className="p-5 space-y-3">
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{item.name}</h3>
                                        <p className="text-xs font-bold text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-[11px] font-black text-slate-400">官方正品 · 專屬優惠</span>
                                        <a
                                            href={item.url || 'https://line.me'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white font-black rounded-xl text-xs shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                                        >
                                            前往店家賣場購買
                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                <div className="text-center pt-2">
                    <p className="text-[11px] font-bold text-slate-400">
                        點擊按鈕將直接開啟店家官方指定之 7-11/蝦皮/官網賣場完成交易
                    </p>
                </div>
            </div>
        </div>
    );
}
