'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UnifiedBillingView from '@/components/dashboard/UnifiedBillingView';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';

import { globalLogout } from '@/lib/auth-utils';

export default function BillingPage() {
    const [userData, setUserData] = useState<{name: string, picture: string, id: string, plan: number}>({
        name: 'Loading...',
        picture: '',
        id: '',
        plan: 0
    });

    useEffect(() => {
        const name = localStorage.getItem('line_user_name') || 'Guest';
        const picture = localStorage.getItem('line_user_picture') || '';
        const id = localStorage.getItem('line_user_id') || '';
        
        if (id) {
            fetch(`/api/platform/user?lineUserId=${id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.user) {
                        setUserData({
                            name,
                            picture,
                            id,
                            plan: data.user.plan_level || 0
                        });
                    }
                });
        }
    }, []);

    const handleLogout = () => {
        globalLogout();
        window.location.href = '/';
    };

    return (
        <DashboardLayout
            userName={userData.name}
            userPicture={userData.picture}
            lineUserId={userData.id}
            planLevel={userData.plan}
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
