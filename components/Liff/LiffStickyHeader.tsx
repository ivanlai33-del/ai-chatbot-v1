"use client";

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface LiffStickyHeaderProps {
  logoUrl: string;
  scrollRef: React.RefObject<HTMLDivElement>;
}

const LiffStickyHeader = ({ logoUrl, scrollRef }: LiffStickyHeaderProps) => {
  // We want to push the header UP when the pricing section hits the bottom of the header
  // Let's use the overall scroll progress or a specific range
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start 500px", "start 50px"]
  });

  // Push up 300px when pricing section touches (1:1 scroll sync)
  const y = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const opacity = useTransform(scrollYProgress, [0.4, 0.8], [1, 0]);

  return (
    <motion.div 
      style={{ y }}
      className="fixed top-0 left-0 w-full z-[100] pointer-events-none"
    >
      <div className="w-full flex items-center justify-center pt-[55px]">
        <div className="w-full px-8 py-5 flex items-center justify-center gap-8 pointer-events-auto relative z-[101]">
          <img src={logoUrl} alt="AI Logo" className="w-[94px] h-[94px] min-w-[94px] object-contain drop-shadow-md relative z-[102] block" />
          <h1 className="text-[61px] font-black tracking-tighter shrink-0 leading-none">
            <span className="text-slate-900">AI </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-green-600 to-indigo-600">
              智能店長
            </span>
          </h1>
        </div>
      </div>
    </motion.div>
  );
};

export default LiffStickyHeader;
