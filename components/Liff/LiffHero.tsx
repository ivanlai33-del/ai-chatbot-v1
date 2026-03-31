"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LayoutDashboard, MessageSquareText } from 'lucide-react';

interface LiffHeroProps {
  logoUrl: string;
}

const LiffHero = ({ logoUrl }: LiffHeroProps) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 175px", "start -225px"]
  });

  // Fly out to the sides as it approaches the top
  const xLeft = useTransform(scrollYProgress, [0, 1], [0, -1000]);
  const xRight = useTransform(scrollYProgress, [0, 1], [0, 1000]);
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0]);

  return (
    <section ref={targetRef} className="text-center px-6 relative pt-52 pb-20 z-30">
      <motion.div style={{ opacity }}>
        <motion.h2
          style={{ x: xLeft }}
          className="text-[29px] font-black text-slate-800 mb-[9px] tracking-tight mt-[525px]"
        >
          老闆們最愛的 <span className="text-emerald-600">AI</span> 智能店長
        </motion.h2>

        <motion.div 
          style={{ x: xRight }}
          className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-[24px] border-emerald-200"
        >
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
            Empowering Your Business Success
          </p>
        </motion.div>

        <motion.p 
          style={{ x: xRight }}
          className="text-slate-600 text-base font-bold leading-relaxed max-w-sm mx-auto mb-0"
        >
          讓 AI 成為您的金牌業務，在您休息時自動接單、優化轉化，助您輕鬆擴張事業版圖。
          <br />
          讓每一則訊息都成為成交的機會。
        </motion.p>

        <motion.div 
          style={{ x: xLeft }}
          className="mt-[18px] flex items-center justify-center gap-6 opacity-60 pointer-events-none"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-800">Scale Faster</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-800">Support Automated</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-800">Conversion Boost</span>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default LiffHero;
