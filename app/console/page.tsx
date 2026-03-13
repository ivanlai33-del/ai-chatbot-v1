"use client";

import React, { useEffect, useState } from 'react';
import AICommandConsole from '@/components/AICommandConsole';
import { useRouter } from 'next/navigation';

export default function ConsolePage() {
    const [lineId, setLineId] = useState<string | null>(null);
    const [lineName, setLineName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Try to get from localStorage first (set by callback redirect)
        const savedId = localStorage.getItem('line_user_id');
        const savedName = localStorage.getItem('line_user_name');

        if (savedId) {
            setLineId(savedId);
            setLineName(savedName || '老闆');
            setLoading(false);
        } else {
            // If no ID, redirect back to home or login
            // For now, let's redirect to the home page chat
            router.push('/');
        }
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0f172a]">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <AICommandConsole 
            lineUserId={lineId!} 
            lineUserName={lineName!} 
        />
    );
}
