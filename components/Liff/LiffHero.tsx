"use client";

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, ShieldCheck, Cpu, ArrowUpRight, Play } from 'lucide-react';
import { useLiff } from './LiffProvider';

interface LiffHeroProps {
  logoUrl: string;
}

const LiffHero = ({ logoUrl }: LiffHeroProps) => {
  const { profile, isLoggedIn } = useLiff();
  const [activeEngineMode, setActiveEngineMode] = useState<'liff' | 'flex' | 'deck'>('liff');
  const contentRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ["start 200px", "start 0px"]
  });

  // Fly out to the sides as it approaches the top
  const xLeft = useTransform(scrollYProgress, [0, 1], [0, -1000]);
  const xRight = useTransform(scrollYProgress, [0, 1], [0, 1000]);
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0]);

  return (
    <section className="text-center px-6 relative pt-44 pb-20 z-30 selection:bg-[#06C755]/20">
      <motion.div ref={contentRef} style={{ opacity }} className="max-w-4xl mx-auto space-y-8">
        
        {/* 🌟 Open Design Engine Live Badge */}
        <motion.div 
          style={{ x: xRight }}
          className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/80 backdrop-blur-2xl border border-[#06C755]/30 shadow-xl shadow-[#06C755]/10 mt-[500px]"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#06C755] to-[#05A044] flex items-center justify-center text-white shadow-sm animate-pulse">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-black text-slate-800 tracking-wider">
            POWERED BY <span className="text-[#06C755]">OPEN DESIGN ENGINE</span> ⚡
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#06C755]/10 text-[#06C755] text-[10px] font-black uppercase tracking-widest">
            v0.8.0
          </span>
        </motion.div>

        {/* 👑 Main Title */}
        <motion.h2
          style={{ x: xLeft }}
          className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.2]"
        >
          {isLoggedIn && profile ? (
            <>歡迎登入，<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06C755] via-[#05A044] to-[#01B956]">{profile.displayName}</span></>
          ) : (
            <>為老闆量身打造的 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06C755] via-[#05A044] to-[#01B956]">AI</span> 智能金牌店長</>
          )}
        </motion.h2>

        {/* 💡 Subtitle / Value Prop */}
        <motion.p 
          style={{ x: xRight }}
          className="text-slate-600 text-sm md:text-base font-bold leading-relaxed max-w-2xl mx-auto"
        >
          搭載業界最先進的 <span className="text-[#06C755] underline decoration-2 underline-offset-4">Open Design 視覺底層引擎</span> 與 Scrapling 爬蟲大腦。
          <br />
          在您休息時自動接待顧客、精準比對全網行情，並為客戶即時生成顧問級專屬提案與微型官網。
        </motion.p>

        {/* 🚀 Interactive Design Engine Mode Selector (Simulating Open Design capabilities) */}
        <motion.div 
          style={{ x: xLeft }}
          className="pt-4 max-w-lg mx-auto"
        >
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3">
            體驗 AI 店長即時串流渲染能力 (Interactive Sandbox)
          </p>
          <div className="bg-white/80 backdrop-blur-2xl p-1.5 rounded-2xl border border-white shadow-xl flex gap-1">
            {[
              { id: 'liff', name: 'LIFF 門市官網', icon: Sparkles },
              { id: 'flex', name: '數位優惠推播', icon: Wand2 },
              { id: 'deck', name: '雜誌級提案 Deck', icon: ShieldCheck }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveEngineMode(mode.id as any)}
                className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeEngineMode === mode.id 
                    ? 'bg-gradient-to-r from-[#06C755] to-[#05A044] text-white shadow-lg shadow-[#06C755]/25 scale-[1.02]' 
                    : 'text-slate-600 hover:bg-slate-100/50'
                }`}
              >
                <mode.icon className="w-3.5 h-3.5" />
                {mode.name}
              </button>
            ))}
          </div>

          {/* Sandbox Simulated Output Window */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeEngineMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-6 bg-slate-900/90 backdrop-blur-3xl rounded-[2rem] border border-white/20 text-left shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#06C755] via-teal-400 to-emerald-500" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    [Open Design v0.8.0] Streaming Artifact
                  </span>
                </div>
                <span className="text-[10px] font-black text-slate-500 bg-white/10 px-2 py-0.5 rounded">
                  {activeEngineMode === 'liff' ? 'HTML5/CSS' : activeEngineMode === 'flex' ? 'LINE Flex JSON' : 'Guizang PPTX'}
                </span>
              </div>

              {activeEngineMode === 'liff' && (
                <div className="space-y-3">
                  <p className="text-xs text-white font-bold leading-relaxed">
                    ✨ <span className="text-emerald-400 font-black">AI 智能門市微型網頁</span> 已生成！整合 RAG 知識庫與 71 款品牌級 HSL 色票系統。
                  </p>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-300">https://liff.line.me/2009108137-demo</span>
                    <button className="px-3 py-1 bg-emerald-500 text-white font-black text-[10px] rounded-lg shadow hover:bg-emerald-600 transition-colors flex items-center gap-1">
                      沙盒預覽 <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {activeEngineMode === 'flex' && (
                <div className="space-y-3">
                  <p className="text-xs text-white font-bold leading-relaxed">
                    🎯 <span className="text-emerald-400 font-black">午夜自動化行銷推播</span> 準備就緒！精準追蹤轉換率並動態發送個人化折價券。
                  </p>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[78%] shadow-[0_0_8px_rgba(6,199,85,0.8)]" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>轉換預估: +28.4%</span>
                    <span>狀態: 待機發送中</span>
                  </div>
                </div>
              )}

              {activeEngineMode === 'deck' && (
                <div className="space-y-3">
                  <p className="text-xs text-white font-bold leading-relaxed">
                    👑 <span className="text-emerald-400 font-black">雜誌級客戶專屬提案 Deck</span> 渲染完成！內建 5 維度自我審查與反 Slop 清單。
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 p-2 bg-white/5 rounded-lg border border-white/10 text-center">
                      <span className="text-[10px] font-black text-slate-400 block">排版規範</span>
                      <span className="text-xs font-black text-emerald-400">Guizang PPT</span>
                    </div>
                    <div className="flex-1 p-2 bg-white/5 rounded-lg border border-white/10 text-center">
                      <span className="text-[10px] font-black text-slate-400 block">色彩系統</span>
                      <span className="text-xs font-black text-emerald-400">Bento Luxury</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* 💎 Bottom Stat Badges */}
        <motion.div 
          style={{ x: xRight }}
          className="pt-6 flex flex-wrap items-center justify-center gap-6 opacity-80 pointer-events-none"
        >
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white shadow-sm">
            <span className="text-lg font-black text-slate-900">19+</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">專業生成技能</span>
          </div>
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white shadow-sm">
            <span className="text-lg font-black text-[#06C755]">71 款</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">品牌級設計系統</span>
          </div>
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white shadow-sm">
            <span className="text-lg font-black text-slate-900">100%</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">沙盒隔離渲染</span>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default LiffHero;
