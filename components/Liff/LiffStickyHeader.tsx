"use client";

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLiff } from './LiffProvider';
import { UserCheck } from 'lucide-react';

interface LiffStickyHeaderProps {
  logoUrl: string;
  scrollRef: React.RefObject<HTMLDivElement>;
}

const LiffStickyHeader = ({ logoUrl, scrollRef }: LiffStickyHeaderProps) => {
  const { profile, isLoggedIn } = useLiff();
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start 500px", "start 50px"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -300]);
  
  return (
    <motion.div 
      style={{ y }}
      className="fixed top-0 left-0 w-full z-[100] pointer-events-none"
    >
      {/* 👤 會員身分 Chips (Top Right) */}
      {isLoggedIn && profile && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 right-6 pointer-events-auto"
        >
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-sm">
            <div className="relative">
                <img 
                    src={profile.pictureUrl || "/placeholder-avatar.png"} 
                    alt="User" 
                    className="w-6 h-6 rounded-full border border-emerald-500/30"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
            </div>
            <span className="text-xs font-black text-slate-800 truncate max-w-[80px]">
                {profile.displayName}
            </span>
          </div>
        </motion.div>
      )}

      <div className="w-full flex items-center justify-center pt-[25px]">
        <div className="w-full px-8 flex flex-col items-center justify-center gap-4 pointer-events-auto relative z-[101]">
          <img src={logoUrl} alt="AI Logo" className="w-[76px] h-[76px] min-w-[76px] object-contain drop-shadow-md relative z-[102] block" />
          <h1 className="text-[43px] font-black tracking-tighter shrink-0 leading-none text-center">
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
