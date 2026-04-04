'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UnifiedBillingView from '@/components/dashboard/UnifiedBillingView';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';

import { globalLogout } from '@/lib/auth-utils';

export default function BillingPage() {
    const [userData, setUserData] = useState<{name: string, picture: string, id: string, plan: number, billingCycle: 'monthly' | 'yearly'}>({
        name: 'Guest',
        picture: '',
        id: '',
        plan: 0,
        billingCycle: 'monthly'
    });
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    useEffect(() => {
        const getCookie = (name: string) => {
            const match = typeof document !== 'undefined' ? document.cookie.split('; ').find(r => r.startsWith(name + '=')) : null;
            return match ? decodeURIComponent(match.split('=')[1]) : '';
        };

        const id = getCookie('line_user_id') || localStorage.getItem('line_user_id') || '';
        const name = getCookie('line_user_name') || localStorage.getItem('line_user_name') || 'Guest';
        const picture = getCookie('line_user_picture') || localStorage.getItem('line_user_picture') || '';

        if (!id) {
            console.warn("Unauthorized access - Redirecting to home");
            window.location.href = '/?require_login=true';
            return;
        }

        setUserData({
            name,
            picture,
            id,
            plan: 0,
            billingCycle: 'monthly'
        });
        setIsLoadingAuth(false);
        
        fetch(`/api/platform/user?lineUserId=${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.user) {
                    setUserData(prev => ({
                        ...prev,
                        plan: data.user.plan_level || 0,
                        billingCycle: data.user.billing_cycle || 'monthly'
                    }));
                }
            })
            .catch(err => console.error("Sync Error:", err));
    }, []);

    const handleLogout = () => {
        globalLogout();
        window.location.href = '/';
    };

    if (isLoadingAuth) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">身分驗證中...</p>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout
            userName={userData.name}
            userPicture={userData.picture}
            lineUserId={userData.id}
            planLevel={userData.plan}
            billingCycle={userData.billingCycle}
            onLogout={handleLogout}
        >
            <div className="p-8 md:p-12">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">帳單與訂閱管理</h1>
                        <p className="text-slate-500 font-bold mt-2 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                            <CreditCard className="w-3.5 h-3.5" />
                            Manage your premium identity and payments
                        </p>
                    </div>
                </header>

                <UnifiedBillingView />
            </div>
        </DashboardLayout>
    );
}
