import { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Bot, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap, Users, MessageSquare } from 'lucide-react';

interface ReferralPageProps {
    params: {
        code: string;
    };
}

// 🌐 動態生成優化 SEO & OpenGraph 社交卡片標籤
export async function generateMetadata({ params }: ReferralPageProps): Promise<Metadata> {
    const code = params.code ? params.code.toUpperCase() : 'SHOP-8888';
    
    return {
        title: `您的同行朋友推薦您體驗 AI 店長 — 24H 自動化接單與智能客服`,
        description: `收到同行的好友推薦邀請！開通專屬 AI 店長，為您的 LINE 官方帳號提供 24 小時自動化客服、導購與預約服務。限時體驗 $199/月！`,
        keywords: ['AI店長', 'LINE官方帳號自動化', 'LINE客服機器人', '自動接單', '分眾行銷', '推薦優惠'],
        openGraph: {
            title: `🎁 同行好友邀請您體驗 AI 店長 (推薦碼: ${code})`,
            description: `為您的 LINE 官方帳號裝上 24H 自動接單大腦！自動記憶顧客偏好、提升 20% 二次回購率。`,
            url: `https://bot.ycideas.com/r/${code}`,
            siteName: 'AI 店長智能自動化平台',
            images: [
                {
                    url: 'https://bot.ycideas.com/og-referral-banner.png',
                    width: 1200,
                    height: 630,
                    alt: 'AI 店長好友推薦禮遇',
                },
            ],
            locale: 'zh_TW',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `🎁 同行好友邀請您體驗 AI 店長 (推薦碼: ${code})`,
            description: `24H 全時段自動接單客服，每月僅需 $199！`,
            images: ['https://bot.ycideas.com/og-referral-banner.png'],
        },
    };
}

export default async function ReferralLandingPage({ params }: ReferralPageProps) {
    const code = params.code ? params.code.toUpperCase() : 'SHOP-8888';

    // 1. 寫入 Cookie 記錄推薦碼 (有效期 30 天)
    try {
        const cookieStore = cookies();
        cookieStore.set('referral_code', code, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 天
            sameSite: 'lax',
        });

        // 2. 累加點擊次數 (非同步背景執行，不卡頁面載入)
        (async () => {
            try {
                const { data: existing } = await supabase
                    .from('referral_codes')
                    .select('clicks_count')
                    .eq('code', code)
                    .maybeSingle();

                if (existing) {
                    await supabase
                        .from('referral_codes')
                        .update({ clicks_count: (existing.clicks_count || 0) + 1 })
                        .eq('code', code);
                }
            } catch (err) {
                console.error('[Referral Click Counter Error]', err);
            }
        })();
    } catch (e) {
        console.error('[Referral Cookie Error]', e);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/20 flex flex-col items-center justify-center p-4 sm:p-6 md:p-12 relative overflow-hidden">
            {/* 背景科技光輝球體 */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

            <main className="max-w-3xl w-full relative z-10 space-y-8">
                {/* 頂部 LOGO 與標籤 */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm font-black tracking-wider shadow-sm">
                        <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                        🎁 專屬好友推薦禮遇 · 推薦碼 [{code}]
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        您的同行好友邀請您體驗 <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                            AI 店長 24H 自動化客服大腦
                        </span>
                    </h1>
                    <p className="text-slate-600 font-bold text-base sm:text-lg max-w-xl mx-auto">
                        不用再苦等小編回覆！為您的 LINE 官方帳號裝上 AI 自動接單分身，秒回 FAQ、導購熱門商品並自動記住顧客喜好。
                    </p>
                </div>

                {/* 核心價值特色卡片 */}
                <div className="bg-white/80 backdrop-blur-xl border border-emerald-500/20 rounded-[32px] p-8 sm:p-10 shadow-2xl shadow-emerald-500/10 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-emerald-50/60 border border-emerald-200/50 p-6 rounded-2xl space-y-2 text-center sm:text-left">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center mx-auto sm:mx-0 shadow-md shadow-emerald-500/20">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-slate-900 text-base">24H 零秒回覆</h3>
                            <p className="text-xs text-slate-500 font-bold">常問問題、營業時間、價目表秒回，絕不漏接顧客訊息。</p>
                        </div>

                        <div className="bg-cyan-50/60 border border-cyan-200/50 p-6 rounded-2xl space-y-2 text-center sm:text-left">
                            <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center mx-auto sm:mx-0 shadow-md shadow-cyan-600/20">
                                <Users className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-slate-900 text-base">自動記憶顧客喜好</h3>
                            <p className="text-xs text-slate-500 font-bold">自動貼標籤，記住顧客過敏原與偏好，二次回購率提升 20%。</p>
                        </div>

                        <div className="bg-teal-50/60 border border-teal-200/50 p-6 rounded-2xl space-y-2 text-center sm:text-left">
                            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center mx-auto sm:mx-0 shadow-md shadow-teal-600/20">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-slate-900 text-base">每月僅需 $199</h3>
                            <p className="text-xs text-slate-500 font-bold">無合約綁定、無隱藏費用，隨時開通或暫停服務。</p>
                        </div>
                    </div>

                    {/* 行動呼籲 CTA */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="space-y-1 text-center sm:text-left">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">優惠方案</p>
                            <p className="text-2xl font-black text-slate-900">
                                NT$ 199 <span className="text-xs text-slate-500 font-normal">/ 月 (好友專屬特惠價)</span>
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                            <Link
                                href="/saas-partnership/dashboard/subscribe"
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white font-black rounded-2xl text-base shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Sparkles className="w-5 h-5 text-amber-300" />
                                立刻開通 AI 店長 ($199/月)
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 底部信任標語 */}
                <div className="text-center text-xs font-bold text-slate-400 space-y-2">
                    <p className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        已幫助超過 1,000+ 門市與線上品牌升級智慧 LINE 接單大腦
                    </p>
                    <p>© 2026 AI 店長智能平台. All rights reserved.</p>
                </div>
            </main>
        </div>
    );
}
