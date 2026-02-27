import ChatInterface from '@/components/ChatInterface';

import Link from 'next/link';
import { Rocket, ChevronRight } from 'lucide-react';

export default function Home() {
    return (
        <main className="min-h-screen bg-[#f8fafc] relative">
            <ChatInterface />

            {/* SaaS Partnership Link - Bottom Right Green Area */}
            <Link
                href="/saas-partnership"
                className="fixed bottom-6 right-8 flex items-center gap-4 transition-all group z-50 scale-[1.3] origin-bottom-right hover:scale-[1.43] hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(34,197,94,0.3)]"
            >
                <div className="text-right">
                    <p className="text-[8px] font-bold text-white/60 group-hover:text-white transition-colors uppercase tracking-[0.2em]">Partner Program</p>
                    <p className="text-sm font-black text-white leading-tight">SaaS系統商 | 開發者</p>
                </div>
                <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all backdrop-blur-sm border border-emerald-500/20 shadow-sm">
                    <ChevronRight className="w-6 h-6" />
                </div>
            </Link>
        </main>
    );
}
