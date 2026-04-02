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
    desc: "搭載最新 GPT-4o 引擎，精準拆解客戶語法中的隱含意圖。無論諮詢多複雜，AI 都能以極其自然且富有溫度的人類語感回覆，徹底擺脫傳統機器人的僵硬感。",
    gradient: "from-purple-500 to-indigo-600",
    shadow: "shadow-purple-200"
  },
  {
    icon: Zap,
    title: "免去重複教育",
    desc: "支持一鍵匯入 PDF 文件、官網連結或 CRM 資料。系統會將龐雜的產品手冊自動轉化為結構化的 AI 記憶庫，讓店長在 10 秒內掌握所有細節，化身無所不知的銷售專家。",
    gradient: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-100"
  },
  {
    icon: MessageCircleCode,
    title: "午夜也在賺錢",
    desc: "透過智慧引導腳本與個性化互動，在深夜時分也能精準捕獲潛在訂單。系統會主動發起購物邀約並追蹤轉換進度，將您的 LINE 官方帳號轉型為一台 365 天永不待機的自動成交機器。",
    gradient: "from-blue-400 to-indigo-500",
    shadow: "shadow-blue-100"
  },
  {
    icon: BarChart3,
    title: "掌握賺錢密碼",
    desc: "深入追蹤每一場對話後的轉換細節。透過 AI 對用戶標籤的自動分類，您可以清晰看見客戶群像與熱門諮詢痛點，用最科學的數據導向佈讀行銷策略，穩健推升品牌營收。",
    gradient: "from-orange-400 to-amber-500",
    shadow: "shadow-orange-100"
  },
  {
    icon: Fingerprint,
    title: "塑造專業形象",
    desc: "從親切問候到專業回覆，皆可由您親自調教 AI 的語言風格與特殊表情符號。讓機器人的對談內容完美咬合您的品牌調性，與客戶建立起難以取代的品牌忠誠度與深度連結。",
    gradient: "from-pink-400 to-rose-500",
    shadow: "shadow-pink-100"
  },
  {
    icon: ShieldCheck,
    title: "守護商業機密",
    desc: "採用銀行等級的 SSL 傳輸加密與多重防火牆隔離機制，嚴密護衛您的專業知識庫與顧客敏感個資。我們承諾數據定期銷毀，讓您在數位轉型的路上毫無後顧之憂，穩步經營每一筆生意。",
    gradient: "from-cyan-400 to-sky-500",
    shadow: "shadow-cyan-100"
  }
];

const FeatureCard = ({ feature, index }: { feature: any, index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 200px", "start 0px"]
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
