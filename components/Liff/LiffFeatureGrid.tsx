"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  BrainCircuit, 
  Zap, 
  MessageCircleCode, 
  BarChart3, 
  Fingerprint, 
  ShieldCheck,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

const features = [
  {
    icon: BrainCircuit,
    title: "老闆不再心累",
    desc: "搭載最新 GPT-4o 引擎，精準拆解客戶語法中的隱含意圖。無論諮詢多複雜，AI 都能以極其自然且富有溫度的人類語感回覆，徹底擺脫傳統機器人的僵硬感。",
    gradient: "from-purple-500 to-indigo-600",
    shadow: "shadow-purple-200",
    span: "md:col-span-2",
    badge: "AI Intent Engine"
  },
  {
    icon: Zap,
    title: "免去重複教育",
    desc: "支持一鍵匯入 PDF 文件、官網連結或 CRM 資料。系統會將龐雜的產品手冊自動轉化為結構化的 AI 記憶庫，讓店長化身無所不知的銷售專家。",
    gradient: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-100",
    span: "md:col-span-1",
    badge: "RAG Ingestion"
  },
  {
    icon: MessageCircleCode,
    title: "午夜也在賺錢",
    desc: "透過智慧引導腳本與個性化互動，在深夜時分也能精準捕獲潛在訂單。系統會主動發起購物邀約並追蹤轉換進度，打造永不待機的自動成交機器。",
    gradient: "from-blue-400 to-indigo-500",
    shadow: "shadow-blue-100",
    span: "md:col-span-1",
    badge: "24/7 Autopilot"
  },
  {
    icon: BarChart3,
    title: "掌握賺錢密碼",
    desc: "深入追蹤每一場對話後的轉換細節。透過 AI 對用戶標籤的自動分類，您可以清晰看見客戶群像與熱門諮詢痛點，用最科學的數據導向佈讀行銷策略。",
    gradient: "from-orange-400 to-amber-500",
    shadow: "shadow-orange-100",
    span: "md:col-span-2",
    badge: "BI Analytics"
  },
  {
    icon: Fingerprint,
    title: "塑造專業形象",
    desc: "從親切問候到專業回覆，皆可由您親自調教 AI 的語言風格與特殊表情符號。讓機器人的對談內容完美咬合您的品牌調性，建立深度品牌忠誠度。",
    gradient: "from-pink-400 to-rose-500",
    shadow: "shadow-pink-100",
    span: "md:col-span-2",
    badge: "Brand DNA Persona"
  },
  {
    icon: ShieldCheck,
    title: "守護商業機密",
    desc: "採用銀行等級的 SSL 傳輸加密與多重防火牆隔離機制，嚴密護衛您的專業知識庫與顧客敏感個資。我們承諾數據定期銷毀，讓您毫無後顧之憂。",
    gradient: "from-cyan-400 to-sky-500",
    shadow: "shadow-cyan-100",
    span: "md:col-span-1",
    badge: "Bank-Grade Security"
  }
];

const FeatureCard = ({ feature, index }: { feature: any, index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 250px", "start 0px"]
  });

  const isLeft = index % 2 === 0;
  const x = useTransform(scrollYProgress, [0, 1], [0, isLeft ? -800 : 800]);
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0.85]);

  return (
    <motion.div
      ref={cardRef}
      style={{ x, opacity, scale }}
      className={`relative p-8 rounded-[3rem] bg-white/70 border border-slate-200/60 backdrop-blur-3xl flex flex-col justify-between gap-8 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden ${feature.span}`}
    >
      {/* 🌟 Background Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className={`w-16 h-16 shrink-0 rounded-[2rem] bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg ${feature.shadow} group-hover:scale-110 transition-transform duration-500 relative`}>
          <div className="absolute inset-0 bg-white/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
          <feature.icon className="w-8 h-8 text-white relative z-10 drop-shadow-sm" strokeWidth={2.5} />
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/60 text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm group-hover:bg-[#06C755]/10 group-hover:text-[#06C755] group-hover:border-[#06C755]/30 transition-all">
          {feature.badge}
        </span>
      </div>
      
      {/* Content Section */}
      <div className="space-y-3 relative z-10">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 group-hover:text-[#06C755] transition-colors">
          {feature.title}
          <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </h3>
        <p className="text-xs md:text-sm text-slate-600 font-bold leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
          {feature.desc}
        </p>
      </div>

      {/* Bottom Open Design Micro-Indicator */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
        <span>[Open Design v0.8.0]</span>
        <span className="text-[#06C755] flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Live Render
        </span>
      </div>
    </motion.div>
  );
};

const LiffFeatureGrid = () => {
  return (
    <section className="px-6 py-12 max-w-6xl mx-auto">
      {/* Spacer */}
      <div className="h-10 pointer-events-none" />

      {/* 🌟 Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((f, idx) => (
          <FeatureCard key={f.title} feature={f} index={idx} />
        ))}
      </div>
    </section>
  );
};

export default LiffFeatureGrid;
