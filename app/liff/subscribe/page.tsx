"use client";

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, AlertTriangle } from 'lucide-react';
import { getPricingPlans } from '@/config/landing_config';
import LiffPlanCard from '@/components/Liff/LiffPlanCard';
import { useLiff } from '@/components/Liff/LiffProvider';
import LiffHero from '@/components/Liff/LiffHero';
import LiffFeatureGrid from '@/components/Liff/LiffFeatureGrid';
import LiffScrollVideo from '@/components/Liff/LiffScrollVideo';
import LiffStickyHeader from '@/components/Liff/LiffStickyHeader';

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
        <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Loading AI Master...</p>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="bg-transparent selection:bg-emerald-500/30">
      <div className="relative w-full min-h-screen">
        {/* 🚀 Phase 1: Hero (Initially at the top 50px, then scrolls up) */}
        <div className="min-h-screen pt-[50px] relative">
          <LiffHero logoUrl={logoUrl} />
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center opacity-40">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Scroll to Explore</p>
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
                 <p className="text-xs font-bold text-amber-600">
                    對話試用進度: {trialMessagesUsed}/10 - 店長已休眠，請開通專屬方案
                 </p>
             </div>
          </div>

          <div className="text-center mb-[24px]">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">
              立即開通您的專屬方案
            </h2>
            <p className="text-slate-600 font-bold mb-8 text-sm">
              首 500 名早鳥永久優惠進行中
              <br />
              目前僅剩少數席次！
            </p>

            {/* Billing Toggle (Adaptive for light) */}
            <div className="flex items-center justify-center gap-4 mb-[10px]">
              <div className="bg-slate-100/80 border border-slate-200 p-1 rounded-2xl backdrop-blur-md flex shadow-sm">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                    billingCycle === 'monthly' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-600"
                  }`}
                >
                  月費方案
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
                    billingCycle === 'yearly' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-600"
                  }`}
                >
                  年費更划算 🔥
                </button>
              </div>
            </div>
          </div>

            <div className="space-y-6 max-w-lg mx-auto mb-[30px]">
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
                    onSelect={() => {
                      if (plan.name.includes('個人') && activeBotsCount > 1) {
                        setShowDowngradeAlert(true);
                        return;
                      }
                      alert(`即將為您開通：${plan.name}\n金額：NT$ ${plan.price}`);
                    }}
                  />
                </motion.div>
              ))}
            </div>
        </section>

        {/* 🎬 Final Footer Stop - 15px from plans, 5px from bottom */}
        <footer className="w-full pt-0 pb-[5px] text-center relative z-20">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">
            © 2026 AI Store Manager. All Rights Reserved.
          </p>
        </footer>
      </div>

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
            <p className="text-slate-600 text-sm font-bold leading-relaxed mb-6">
              您目前共啟用了 <span className="text-emerald-500 text-lg mx-1">{activeBotsCount}</span> 位 AI 店長。<br/><br/>
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
