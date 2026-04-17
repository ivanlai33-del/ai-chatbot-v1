"use client";

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, AlertTriangle, ShieldCheck, Lock, Webhook, Fingerprint } from 'lucide-react';
import { getPricingPlans } from '@/config/landing_config';
import LiffPlanCard from '@/components/Liff/LiffPlanCard';
import { useLiff } from '@/components/Liff/LiffProvider';
import LiffHero from '@/components/Liff/LiffHero';
import LiffFeatureGrid from '@/components/Liff/LiffFeatureGrid';
import LiffScrollSequence from '@/components/Liff/LiffScrollVideo';
import LiffStickyHeader from '@/components/Liff/LiffStickyHeader';
import LandingFooter from '@/components/landing/LandingFooter';

import { PLAN_PAYMENT_LINKS } from '@/lib/chat-constants';

export default function LiffSubscribePage() {
  const { profile, isLoading, activeBotsCount = 5, trialMessagesUsed = 10 } = useLiff();
  const [showDowngradeAlert, setShowDowngradeAlert] = useState(false);
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly');
  const plans = getPricingPlans(billingCycle);
  const logoUrl = "/Lai%20Logo_3.svg";
  
  const pageRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-base font-black text-slate-500 uppercase tracking-widest">Loading AI Master...</p>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="bg-transparent selection:bg-emerald-500/30">
      <LiffScrollSequence 
         frameFolder="/line-liff" 
         frameCount={40} 
         prefix="ezgif-frame-" 
         extension="jpg"
      >
        {/* 🚀 Phase 1: Hero (Initially at the top 50px, then scrolls up) */}
        <div className="min-h-screen pt-[50px] relative">
          <LiffHero logoUrl={logoUrl} />
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center opacity-40">
            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Scroll to Explore</p>
            <div className="w-[1px] h-12 bg-gradient-to-b from-emerald-500 to-transparent mx-auto" />
          </div>
        </div>

        {/* 🎥 Phase 2: Features Storyboard */}
        
        <LiffFeatureGrid />

        {/* 🚀 Phase 3: Pricing Plans (Final Destination) */}
        <section ref={pricingRef} id="pricing" className="px-6 pt-0 mt-[-4px] relative">
          
          {/* PLG Trial Status Badge */}
          <div className="flex justify-center mb-6">
             <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                 <p className="text-sm font-bold text-amber-600">
                    對話試用進度: {trialMessagesUsed}/10 - 店長已休眠，請開通專屬方案
                 </p>
             </div>
          </div>

          <div className="text-center mb-[24px]">
            <h2 className="text-[42px] font-black text-slate-900 mb-4 tracking-tighter">
              立即開通您的專屬方案
            </h2>
            <p className="text-slate-600 font-bold mb-8 text-base">
              首 500 名早鳥永久優惠進行中
              <br />
              目前僅剩少數席次！
            </p>

            {/* Billing Toggle (Adaptive for light) */}
            <div className="flex items-center justify-center gap-4 mb-[10px]">
              <div className="bg-slate-100/80 border border-slate-200 p-1 rounded-2xl backdrop-blur-md flex shadow-sm">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2.5 rounded-xl text-base font-black transition-all ${
                    billingCycle === 'monthly' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-600"
                  }`}
                >
                  月費方案
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-2.5 rounded-xl text-base font-black transition-all flex items-center gap-2 ${
                    billingCycle === 'yearly' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-600"
                  }`}
                >
                  年費更划算 🔥
                </button>
              </div>
            </div>
          </div>

            <div className="space-y-6 max-w-lg mx-auto mb-[20px]">
              {plans.map((plan: any, idx) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: idx * 0.1 }}
                >
                    <LiffPlanCard
                        name={plan.name}
                        price={plan.price}
                        originalPrice={plan.originalPrice}
                        period={plan.period}
                        description={plan.description}
                        features={plan.features}
                        icon={plan.icon}
                        color={plan.color}
                        popular={plan.popular}
                        onSelect={async () => {
                          // 🔐 身份守衛：確認 LIFF 已取得 Profile 才允許進入付費
                          if (!profile?.userId) {
                            alert('請先完成 LINE 登入驗證，系統才能記錄您的訂閱身份。\n\n請關閉後重新從 LINE 打開此頁面。');
                            return;
                          }
                          if (plan.name.includes('個人') && activeBotsCount > 1) {
                            setShowDowngradeAlert(true);
                            return;
                          }

                          // 🚀 執行藍新金流串接
                          try {
                            const res = await fetch(`/api/payment/checkout?t=${Date.now()}`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                planId: plan.id,
                                cycle: billingCycle,
                                lineUserId: profile.userId // 傳入 LIFF 取得的真實 ID
                              })
                            });
                            
                            const result = await res.json();
                            
                            if (!result.success) {
                              alert(`金流初始化失敗: ${result.error}`);
                              return;
                            }

                            const { MerchantID, TradeInfo, TradeSha, Version, TimeStamp, RespondType, TargetUrl } = result.data;

                            // 動態產生 HTML Form 並提交至藍新
                            const form = document.createElement('form');
                            form.method = 'POST';
                            form.action = TargetUrl;

                            const fields = { MerchantID, TradeInfo, TradeSha, Version, TimeStamp, RespondType };
                            Object.entries(fields).forEach(([key, value]) => {
                                const input = document.createElement('input');
                                input.type = 'hidden';
                                input.name = key;
                                input.value = value as string;
                                form.appendChild(input);
                            });

                            document.body.appendChild(form);
                            form.submit();
                          } catch (err) {
                            console.error("LIFF Checkout error:", err);
                            alert("金流啟動失敗，請稍後再試。");
                          }
                        }}
                      />
                </motion.div>
              ))}
            </div>

          {/* 🛡️ Enterprise Security Badge (Centered Emerald Version) */}
          <div className="mb-[40px] mx-auto max-w-lg">
            <div className="backdrop-blur-2xl rounded-[40px] p-8 bg-gradient-to-br from-[#058a40]/60 via-[#01142F]/80 to-[#1e3a8a]/40 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
              
              {/* 背景浮水巨大金屬盾牌 (35% 透明度 - 翡翠綠) */}
              <div className="absolute -bottom-16 -right-12 opacity-[35%] pointer-events-none transform rotate-12">
                <ShieldCheck className="w-80 h-80 text-emerald-500" />
              </div>
              
              <div className="flex flex-col items-center gap-3 mb-10 relative z-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <ShieldCheck className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                </div>
                <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-400 to-teal-400 font-black text-3xl tracking-tighter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                  企業級四大資安防護
                </h3>
              </div>
              
              <div className="space-y-8 relative z-10">
                {[
                  { icon: Lock, title: "加密無痕串接", desc: "金鑰 0.1 秒極速銷毀，駭客無門" },
                  { icon: AlertTriangle, title: "防刷爆擋流閘門", desc: "金融級限流 (Rate Limiting) 死守預算" },
                  { icon: Webhook, title: "AI 防暴走護盾", desc: "嚴格商業道德黑名單，絕不惹麻煩" },
                  { icon: Fingerprint, title: "官方指紋防偽系統", desc: "底層 100% 封殺釣魚網頁與假造流量" }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center group cursor-default">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                        <item.icon className="w-4 h-4 text-emerald-400" />
                      </div>
                      <h4 className="text-white font-bold text-lg tracking-tight">{item.title}</h4>
                    </div>
                    <p className="text-white/50 text-base font-medium leading-relaxed max-w-[280px]">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 🎬 Final Footer Stop - 15px from plans, 5px from bottom */}
        <LandingFooter isLight={true} variant="mobile" />
      </LiffScrollSequence>

      {/* 🚀 Sticky Brand Header (Moved to bottom of DOM for highest stacking priority) */}
      <LiffStickyHeader logoUrl={logoUrl} scrollRef={pricingRef} />

      {/* 🛑 PLG Downgrade Protective Modal */}
      {showDowngradeAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 text-center max-w-sm w-full shadow-2xl border border-slate-100"
          >
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">無法解鎖此特惠方案</h3>
            <p className="text-slate-600 text-base font-bold leading-relaxed mb-6">
              您目前共啟用了 <span className="text-emerald-500 text-xl mx-1">{activeBotsCount}</span> 位 AI 店長。<br/><br/>
              個人版僅提供 1 位店長額度。<br/>若要購買此方案，請先至管理後台刪除多餘的店長。
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDowngradeAlert(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-black hover:bg-slate-200 transition-colors"
              >
                我知道了
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
