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
            <div className="fixed inset-0 pointer-events-none -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
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
            <ScenarioShowcase />

            <LandingFeatures />

            <CustomerReviews />

            <LandingSEOContent />

            <PricingComparison />

            <FAQSection />

            <PricingModal 
                isOpen={showPricing}
                onClose={() => setShowPricing(false)}
                billingCycle={billingCycle}
                setBillingCycle={setBillingCycle}
                plans={pricingPlans}
                onAction={handleAction}
            />
            
            <LandingFooter variant="desktop" />
        </div>
    );
}
