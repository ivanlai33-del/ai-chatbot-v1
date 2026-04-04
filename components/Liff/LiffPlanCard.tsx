"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

interface LiffPlanCardProps {
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
  onSelect: () => void;
}

export default function LiffPlanCard({
  name,
  price,
  originalPrice,
  period,
  description,
  features,
  icon,
  color,
  popular,
  onSelect
}: LiffPlanCardProps) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-white/40 border-emerald-500/30 ring-1 ring-emerald-500/10',
    amber: 'bg-white/40 border-emerald-500/30 ring-1 ring-emerald-500/10',
    indigo: 'bg-white/40 border-emerald-500/30 ring-1 ring-emerald-500/10',
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={`relative p-6 rounded-[2rem] border ${colorMap[color] || colorMap.indigo} backdrop-blur-xl shadow-lg mb-4 overflow-hidden group`}
      onClick={onSelect}
    >
      {popular && (
        <div className="absolute top-0 right-0 p-8 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-600`}>
          {icon}
        </div>
        {popular && (
          <span className={`px-3 py-1 text-white text-xs font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-md bg-gradient-to-r ${
            color === 'emerald' ? 'from-emerald-500 to-green-600' : 
            color === 'amber' ? 'from-orange-500 to-amber-600' : 
            'from-blue-500 to-indigo-600'
          }`}>
            <Sparkles className="w-3 h-3" />
            建議方案
          </span>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-3xl font-black text-slate-900 mb-1">{name}</h3>
        <p className="text-base text-slate-600 font-bold leading-relaxed">{description}</p>
      </div>

      <div className="flex items-baseline gap-2 mb-6">
        <span className={`text-[42px] font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${
          color === 'emerald' ? 'from-emerald-600 to-green-600' : 
          color === 'amber' ? 'from-orange-600 to-amber-600' : 
          'from-blue-600 to-indigo-600'
        }`}>
          NT$ {price}
        </span>
        <span className="text-base text-slate-500 font-bold uppercase">{period}</span>
        {originalPrice && (
          <span className="text-base text-slate-400 line-through ml-1 decoration-red-500/50">
            ${originalPrice}
          </span>
        )}
      </div>

      <div className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-3 text-base text-slate-700 font-bold">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-emerald-500/10`}>
              <Check className="w-3 h-3 text-emerald-600" />
            </div>
            {feature}
          </div>
        ))}
      </div>

      <button className={`w-full py-4 text-white rounded-2xl font-black text-base shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${
        color === 'emerald' ? 'from-emerald-500 to-green-600' : 
        color === 'amber' ? 'from-orange-500 to-amber-600' : 
        'from-blue-500 to-indigo-600'
      }`}>
        立即開通Ai智能店長
      </button>
    </motion.div>
  );
}
