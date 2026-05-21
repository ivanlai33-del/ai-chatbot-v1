"use client";

import React from 'react';
import { Inter } from 'next/font/google';
import { LiffProvider } from '@/components/Liff/LiffProvider';
import VisitorTracker from '@/components/VisitorTracker';

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
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Background glows removed for original color fidelity */}
        </div>
        
        {/* LIFF SDK script */}
        <script src="https://static.line-scdn.net/liff/edge/2/sdk.js" async></script>
        
        <main className="relative z-10 max-w-md mx-auto min-h-screen">
          {children}
          <VisitorTracker />
        </main>
      </div>
    </LiffProvider>
  );
}
