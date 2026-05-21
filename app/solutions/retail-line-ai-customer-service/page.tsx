import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, Star, Zap, MessageCircle, Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: '零售品牌 LINE AI 客服機器人｜自動回覆商品、尺寸、出貨與導購問題',
    description: '專為服飾、選物、電商品牌與零售店家打造的 LINE AI 客服機器人。可自動回覆商品資訊、尺寸、顏色、價格、出貨與退換貨問題，讓 LINE 官方帳號成為 24 小時導購與客服入口。',
    keywords: ['零售LINE客服', '服飾AI機器人', '電商LINE自動回覆', '商品查詢AI', '庫存查詢機器人', 'AI智能店長零售'],
    openGraph: {
        title: '零售品牌 LINE AI 客服機器人｜自動回覆商品、尺寸、出貨與導購問題',
        description: '24H 自動回覆庫存、尺寸、出貨狀態，讓 LINE 成為您的自動導購入口。',
        url: 'https://bot.ycideas.com/solutions/retail-line-ai-customer-service',
        images: [{ url: '/images/seo/seo-solutions.jpg', width: 1200, height: 630 }],
    },
};

const features = [
    { icon: MessageCircle, title: '商品資訊即時查詢', desc: '顧客問尺寸、顏色、材質，AI 直接回覆詳細說明，不再讓顧客久等您上線。' },
    { icon: Clock, title: '庫存狀態即時回應', desc: '顧客問「M 號黑色還有嗎？」AI 依照您的庫存資訊即時回應，大幅降低詢問到下單的摩擦。' },
    { icon: Zap, title: '出貨進度查詢', desc: '顧客問「我的包裹出了沒？」AI 協助說明出貨時間與查詢方式，減少客服壓力。' },
    { icon: Star, title: '退換貨說明', desc: '統一、清楚的退換貨政策說明，讓顧客了解流程，減少誤解與客訴。' },
    { icon: CheckCircle, title: '尺寸建議導購', desc: 'AI 依顧客描述推薦合適尺寸，降低因尺寸問題導致的退貨率。' },
    { icon: ArrowRight, title: '活動優惠推播', desc: '結合 LINE 廣播，AI 說明促銷活動規則，讓折扣活動發揮最大效益。' },
];

const useCases = [
    { q: '服飾品牌老闆問：每天都要回「這件有沒有 S 號」「可以換貨嗎」，一個人根本忙不過來？', a: 'AI 可以自動回覆庫存查詢和退換貨說明，您只需要處理需要特別判斷的特殊案例。' },
    { q: '選物店老闆問：IG 廣告導流過來問 LINE，但我沒辦法即時回覆，客人就跑了？', a: 'AI 在您無法即時回覆時自動接待，介紹商品、回答問題，讓顧客的購買意願不因等待而降溫。' },
    { q: '電商賣家問：出貨後顧客一直問到了沒，怎麼辦？', a: '您可以設定出貨後的標準說明，AI 自動回覆物流查詢方式，大幅減少重複詢問的處理時間。' },
];

export default function RetailSolutionPage() {
    return (
        <main className="min-h-screen bg-[#020617] text-white font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 px-6 py-4 border-b border-white/10 bg-[#020617]/80 backdrop-blur-md">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:border-emerald-500 transition-all">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold">返回首頁</span>
                    </Link>
                    <Link href="/saas-partnership" className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full text-sm font-black transition-all hover:scale-105">
                        立即開始使用
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.1)_0%,transparent_60%)]" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-6">
                        Retail &amp; E-commerce
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">
                        零售品牌專用<br /><span className="text-emerald-400">LINE AI 客服與導購機器人</span>
                    </h1>
                    <p className="text-slate-300 text-xl font-bold max-w-2xl mb-10 leading-relaxed">
                        專為服飾、選物、電商品牌打造。自動回覆商品、庫存、出貨與退換貨，讓 LINE 成為您的 24 小時導購入口。
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/saas-partnership" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white py-4 px-8 rounded-2xl font-black text-lg transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                            <Zap className="w-5 h-5" />免費試用 14 天
                        </Link>
                    </div>
                </div>
            </section>

            {/* Image */}
            <section className="px-6 pb-16">
                <div className="max-w-5xl mx-auto">
                    <div className="relative rounded-3xl overflow-hidden aspect-video border border-white/10">
                        <Image src="/sv-03.jpg" alt="零售品牌 LINE AI 客服" fill className="object-cover" sizes="(max-width: 768px) 100vw, 80vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6 bg-slate-950/50 border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-center mb-4">零售業專屬功能</h2>
                    <p className="text-slate-400 text-center mb-16 font-medium">從詢問到導購，全程 AI 輔助</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map(f => (
                            <div key={f.title} className="p-7 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/30 transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-colors">
                                    <f.icon className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-black text-white mb-3">{f.title}</h3>
                                <p className="text-slate-400 font-medium leading-relaxed text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-black text-center mb-16">零售老闆最常問的問題</h2>
                    <div className="space-y-6">
                        {useCases.map((uc, i) => (
                            <div key={i} className="p-7 rounded-2xl bg-slate-900/60 border border-white/10">
                                <p className="text-emerald-400 font-black mb-3">💬 {uc.q}</p>
                                <p className="text-slate-300 font-medium leading-relaxed">{uc.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 border-t border-white/5 bg-slate-950/30">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-black mb-4">讓 LINE 成為您的 24 小時導購員</h2>
                    <p className="text-slate-300 font-bold mb-10">3 分鐘開通，立即提升回覆率與成交率。</p>
                    <Link href="/saas-partnership" className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white py-4 px-10 rounded-2xl font-black text-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                        免費開始使用 <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
