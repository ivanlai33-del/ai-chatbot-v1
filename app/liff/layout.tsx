"use client";

import React from 'react';
import { Inter } from 'next/font/google';
import { LiffProvider } from '@/components/Liff/LiffProvider';

const inter = Inter({ subsets: ['latin'] });

export default function LiffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || "";

  return (
    <LiffProvider liffId={liffId}>
      <div className={`${inter.className} min-h-screen bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30 overflow-x-hidden`}>
        {/* LIFF specific background effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Optional Background Image - Un-comment and replace URL below to use a custom background */}
          {/* 
          <div 
            className="absolute inset-0 bg-no-repeat bg-center bg-cover opacity-20"
            style={{ backgroundImage: 'url("https://your-image-url.jpg")' }} 
          />
          */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
        </div>
        
        {/* LIFF SDK script */}
        <script src="https://static.line-scdn.net/liff/edge/2/sdk.js" async></script>
        
        <main className="relative z-10 max-w-md mx-auto min-h-screen">
          {children}
        </main>
      </div>
    </LiffProvider>
  );
}
