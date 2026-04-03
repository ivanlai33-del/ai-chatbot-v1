'use client';

import { useState, useEffect } from 'react';
import SEOMetadata from '@/components/landing/SEOMetadata';
import HeroSection from '@/components/landing/HeroSection';
import PricingModal from '@/components/landing/PricingModal';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingFooter from '@/components/landing/LandingFooter';
import { getPricingPlans, landingJsonLd } from '@/config/landing_config';

export default function Home() {
    const [showPricing, setShowPricing] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    // Check for login session
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
        <main className="relative min-h-screen w-full bg-[#0F172A] font-sans overflow-x-hidden">
            <SEOMetadata jsonLd={landingJsonLd} />
            
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

            <LandingFeatures />

            <PricingModal 
                isOpen={showPricing}
                onClose={() => setShowPricing(false)}
                billingCycle={billingCycle}
                setBillingCycle={setBillingCycle}
                plans={pricingPlans}
                onAction={handleAction}
            />
            
            <LandingFooter variant="desktop" />
        </main>
    );
}
