'use client';

import { useState, useEffect } from 'react';
import HeroSection from '@/components/landing/HeroSection';
import PricingModal from '@/components/landing/PricingModal';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingFooter from '@/components/landing/LandingFooter';
import FAQSection from '@/components/landing/FAQSection';
import LandingSEOContent from '@/components/landing/LandingSEOContent';
import IndustryFit from '@/components/landing/IndustryFit';
import SolutionIndustryShowcase from '@/components/landing/SolutionIndustryShowcase';
import ScenarioShowcase from '@/components/landing/ScenarioShowcase';
import CustomerReviews from '@/components/landing/CustomerReviews';
import PricingComparison from '@/components/landing/PricingComparison';
import { getPricingPlans } from '@/config/landing_config';

interface LandingPageClientProps {
    isLoggedInInit: boolean;
}

export default function LandingPageClient({ isLoggedInInit }: LandingPageClientProps) {
    const [showPricing, setShowPricing] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [isLoggedIn, setIsLoggedIn] = useState(isLoggedInInit);
    
    // Check for login session on mount
    useEffect(() => {
        const cookies = document.cookie.split('; ');
        const lineId = cookies.find(c => c.startsWith('line_user_id='));
        if (lineId) setIsLoggedIn(true);
    }, []);

    const handleAction = () => {
        if (isLoggedIn) {
            window.location.href = '/dashboard';
        } else {
            window.location.href = '/api/auth/line';
        }
    };

    const handleOpenChat = () => {
        window.location.href = '/chat';
    };

    const pricingPlans = getPricingPlans(billingCycle);

    return (
        <div className="relative min-h-screen bg-[#020617] selection:bg-blue-500/30 overflow-x-hidden">
            {/* 🌌 Enhanced Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PScwIDAgMjAwIDIwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz4KICA8ZmlsdGVyIGlkPSdub2lzZUZpbHRlcic+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9J2ZyYWN0YWxOb2lzZScgYmFzZUZyZXF1ZW5jeT0nMC42NScgbnVtT2N0YXZlcz0nMycgc3RpdGNoVGlsZXM9J3N0aXRjaCcvPgogIDwvZmlsdGVyPgogIDxyZWN0IHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbHRlcj0ndXJsKCNub2lzZUZpbHRlciknLz4KPC9zdmc+')] opacity-[0.03]" />
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-20">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '4s' }} />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(37,99,235,0.05)_0%,rgba(2,6,23,0)_50%)]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.05)_0%,rgba(2,6,23,0)_50%)]" />
                {/* Global Darkener to ensure text pop */}
                <div className="absolute inset-0 bg-slate-950/40" />
            </div>
            <LandingHeader 
                isLoggedIn={isLoggedIn}
                onAction={handleAction}
                onOpenChat={handleOpenChat}
            />

            <HeroSection 
                isLoggedIn={isLoggedIn}
                onAction={handleAction}
                onOpenChat={handleOpenChat}
                onShowPricing={() => setShowPricing(true)}
            />

            {/* Downward Enhancement Layers */}
            <SolutionIndustryShowcase />
            <IndustryFit />
            <LandingFeatures />
            <ScenarioShowcase />

            <CustomerReviews />

            <LandingSEOContent />

            {/* 隱藏多方案比較表，全面導流至單一 199 方案的 PricingModal */}
            {/* <PricingComparison /> */}

            <FAQSection isLoggedIn={isLoggedIn} onAction={handleAction} />

            <PricingModal 
                isOpen={showPricing}
                onClose={() => setShowPricing(false)}
                billingCycle={billingCycle}
                setBillingCycle={setBillingCycle}
                plans={pricingPlans}
                onAction={handleAction}
            />
            
            <LandingFooter variant="desktop" />

            {/* 🚀 懸浮跟隨 (Sticky Floating) 登入/訂閱按鈕 */}
            <div className="fixed bottom-8 right-8 z-40">
                <button
                    onClick={handleAction}
                    className={`flex items-center gap-2 px-6 py-4 rounded-full font-black text-base shadow-2xl transition-all hover:scale-105 active:scale-95 text-white ${
                        isLoggedIn 
                            ? 'bg-slate-800 border border-white/20 hover:bg-slate-700 shadow-slate-900/40' 
                            : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                    }`}
                >
                    {isLoggedIn ? (
                        <span>👤 專屬會員後台 ➔</span>
                    ) : (
                        <span className="flex items-center gap-1.5 animate-pulse font-black">
                            <span className="text-yellow-300" style={{ fontSize: '2.5rem' }}>⚡️</span>
                            <span style={{ fontSize: '1.5rem' }}>立即訂閱 NT$</span>
                            <span className="text-yellow-300 font-extrabold" style={{ fontSize: '2.5rem' }}>199</span>
                            <span style={{ fontSize: '1.5rem' }}> ➔</span>
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
