'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UnifiedBillingView from '@/components/dashboard/UnifiedBillingView';
import { CreditCard } from 'lucide-react';
import { globalLogout } from '@/lib/auth-utils';

export default function BillingPage() {
    const [userData, setUserData] = useState<{
        name: string;
        picture: string;
        id: string;
        plan: number;
        billingCycle: 'monthly' | 'yearly';
    }>({ name: 'Guest', picture: '', id: '', plan: 0, billingCycle: 'monthly' });
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    useEffect(() => {
        const getCookie = (name: string) => {
            const match = typeof document !== 'undefined'
                ? document.cookie.split('; ').find(r => r.startsWith(name + '='))
                : null;
            return match ? decodeURIComponent(match.split('=')[1]) : '';
        };

        const id = getCookie('line_user_id') || localStorage.getItem('line_user_id') || '';
        const name = getCookie('line_user_name') || localStorage.getItem('line_user_name') || 'Guest';
        const picture = getCookie('line_user_picture') || localStorage.getItem('line_user_picture') || '';

        if (!id) {
            window.location.href = '/?require_login=true';
            return;
        }

        // 特定管理員 ID 強制設為旗艦版
        const forcePlan = (id === 'Ud8b8dd79162387a80b2b5a4aba20f604') ? 6 : 0;

        setUserData({ name, picture, id, plan: forcePlan, billingCycle: forcePlan === 6 ? 'yearly' : 'monthly' });
        setIsLoadingAuth(false);

        fetch(`/api/platform/user?lineUserId=${id}&t=${Date.now()}`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.user) {
                    setUserData(prev => ({
                        ...prev,
                        plan: data.user.plan_level ?? forcePlan,
                        billingCycle: data.user.billing_cycle || (forcePlan === 6 ? 'yearly' : 'monthly'),
                    }));
                }
            })
            .catch(err => console.error('Billing fetch error:', err));
    }, []);

    const handleLogout = () => {
        globalLogout();
        window.location.href = '/';
    };

    if (isLoadingAuth) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">身分驗證中...</p>
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
            <div className="p-8 md:p-12 animate-in fade-in duration-700">
                <header className="mb-10 pl-[240px]">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">帳單與訂閱管理</h1>
                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5" />
                        Manage your premium identity and payments
                    </p>
                </header>
                <UnifiedBillingView />
            </div>
        </DashboardLayout>
    );
}
