"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SaaSChatInterface from '@/components/SaaSChatInterface';
import SaaSLoginModal from '@/components/SaaSLoginModal';
import SaasHero from '@/components/saas/SaasHero';
import SaasFeatures from '@/components/saas/SaasFeatures';
import SaasPricingPlan from '@/components/saas/SaasPricingPlan';

export default function SaaSPage() {
    const router = useRouter();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);

    const handlePurchaseFlow = (plan: any) => {
        setSelectedPlan(plan);
        setIsLoginModalOpen(true);
    };

    const handleLoginSuccess = (plan: any) => {
        setIsLoginModalOpen(false);
        router.push(`/saas-partnership/dashboard/subscribe?plan=${plan.slots || 'enterprise'}`);
    };

    return (
        <main className="h-screen w-full bg-[#0f172a] flex flex-col md:flex-row overflow-hidden relative selection:bg-emerald-500/30">
            {/* Global Scrollbar Style */}
            <style jsx global>{`
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #475569;
                }
            `}</style>

            {/* Main Column: Vision, Features & Pricing */}
            <div className="flex-1 h-screen overflow-y-auto custom-scrollbar bg-[#0f172a] px-8 md:px-12 lg:px-20 pt-12 pb-24 relative">
                <div className="max-w-5xl mx-auto space-y-20 relative z-10">
                    <SaasHero />
                    <SaasFeatures />
                    <SaasPricingPlan onPurchase={handlePurchaseFlow} />

                    <div className="pt-12 pb-8 border-t border-slate-800/50 text-center">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] opacity-80">
                            Securely processed by Global AI Network | Developer Enterprise Billing
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column: AI Consultant Chat - Specialized Minimalist UI */}
            <div className="w-full md:w-[450px] h-screen border-l border-slate-800/50 shrink-0">
                <SaaSChatInterface pageContext="landing" />
            </div>

            {/* Login Modal Overlay */}
            <SaaSLoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                planDetails={selectedPlan}
                onSuccess={handleLoginSuccess}
            />
        </main>
    );
}
