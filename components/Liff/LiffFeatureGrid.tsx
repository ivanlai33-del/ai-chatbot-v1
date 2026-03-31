"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  BrainCircuit, 
  Zap, 
  MessageCircleCode, 
  BarChart3, 
  Fingerprint, 
  ShieldCheck 
} from 'lucide-react';

const features = [
  {
    icon: BrainCircuit,
    title: "老闆不再心累",
    desc: "AI 自動精準理解客戶各種要求，不再出現罐頭式死板回訊，讓客情更深厚。",
    gradient: "from-purple-500 to-indigo-600",
    shadow: "shadow-purple-200"
  },
  {
    icon: Zap,
    title: "免去重複教育",
    desc: "直接餵食 PDF 或 網頁連結，AI 自主學習專業知識，秒變金牌店員。",
    gradient: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-100"
  },
  {
    icon: MessageCircleCode,
    title: "午夜也在賺錢",
    desc: "24 小時不間斷自動成交，不遺漏任何午夜訂單，讓您的 LINE 變身超級業務員。",
    gradient: "from-blue-400 to-indigo-500",
    shadow: "shadow-blue-100"
  },
  {
    icon: BarChart3,
    title: "掌握賺錢密碼",
    desc: "精準分析客戶意圖與轉單路徑，透過數據科學掌握回頭客，營收倍數成長。",
    gradient: "from-orange-400 to-amber-500",
    shadow: "shadow-orange-100"
  },
  {
    icon: Fingerprint,
    title: "塑造專業形象",
    desc: "自定義品牌風格與講話口吻，AI 講話跟你一樣內行，建立深厚顧客信任。",
    gradient: "from-pink-400 to-rose-500",
    shadow: "shadow-pink-100"
  },
  {
    icon: ShieldCheck,
    title: "守護商業機密",
    desc: "頂級企業級加密技術，確保所有專業知識庫與客戶資料滴水不漏。",
    gradient: "from-cyan-400 to-sky-500",
    shadow: "shadow-cyan-100"
  }
];

const FeatureCard = ({ feature, index }: { feature: any, index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 175px", "start -25px"]
  });

  const isLeft = index % 2 === 0;
  // Fly out to sides when approaching header (approx 100px-300px from top)
  const x = useTransform(scrollYProgress, [0, 1], [0, isLeft ? -1000 : 1000]);
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0.8]);

  return (
    <motion.div
      ref={cardRef}
      style={{ x, opacity, scale }}
      className="relative p-6 rounded-[32px] bg-white/70 border border-slate-200/60 backdrop-blur-xl flex items-center gap-6 shadow-xl ring-1 ring-black/[0.03]"
    >
      {/* 🧩 Patterned Icon Box */}
      <div className={`w-20 h-20 shrink-0 rounded-[24px] bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg ${feature.shadow} relative overflow-hidden group`}>
        {/* Decorative inner pattern shapes */}
        <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-white/20 rounded-full blur-xl" />
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-black/10 rounded-full blur-lg" />
        
        <feature.icon className="w-10 h-10 text-white relative z-10 drop-shadow-sm" strokeWidth={2.5} />
      </div>
      
      {/* Content Section */}
      <div className="min-w-0 text-left">
        <h3 className="text-xl font-black text-slate-900 mb-1.5 tracking-tight leading-tight">
          {feature.title}
        </h3>
        <p className="text-xs text-slate-600 font-bold leading-relaxed">
          {feature.desc}
        </p>
      </div>
    </motion.div>
  );
};

const LiffFeatureGrid = () => {
  return (
    <section className="px-6 py-12">
      {/* Spacer to give room before first card */}
      <div className="h-10 pointer-events-none" />

      <div className="grid grid-cols-1 gap-6">
        {features.map((f, idx) => (
          <FeatureCard key={f.title} feature={f} index={idx} />
        ))}
      </div>
    </section>
  );
};

export default LiffFeatureGrid;
