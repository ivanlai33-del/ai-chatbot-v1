'use client';

import ChatInterface from '@/components/ChatInterface';
import VisitorTracker from '@/components/VisitorTracker';
import { Rocket } from 'lucide-react';

export default function ChatPage() {
    return (
        <main className="min-h-screen relative">
            <VisitorTracker />
            <ChatInterface />
            
            {/* SaaS Partnership - Coming Soon / Inquiry Only */}
            <div className="fixed bottom-6 right-8 flex items-center gap-4 transition-all z-50 scale-[1.3] origin-bottom-right opacity-80">
                <div className="text-right">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Partner Program</p>
                    <p className="text-sm font-black text-slate-800 leading-tight">SaaS 夥伴 | 代理招募中</p>
                    <p className="text-[10px] text-emerald-600 font-bold mt-0.5">請洽客服信箱洽詢</p>
                </div>
                <div className="bg-slate-200 p-2.5 rounded-xl text-slate-400 border border-slate-300 shadow-sm">
                    <Rocket className="w-6 h-6" />
                </div>
            </div>
        </main>
    );
}
