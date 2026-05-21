"use client";

import React, { useEffect, useState } from 'react';
import AICommandConsole from '@/components/AICommandConsole';
import { useRouter } from 'next/navigation';

export default function ConsolePage() {
    const [lineId, setLineId] = useState<string | null>(null);
    const [lineName, setLineName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
        const savedId = localStorage.getItem('line_user_id') || (typeof document !== 'undefined' ? document.cookie.split('; ').find(r => r.startsWith('line_user_id='))?.split('=')[1] : null);
        const savedName = localStorage.getItem('line_user_name');
        
        const ADMIN_ID = "Ud8b8dd79162387a80b2b5a4aba20f604";

        if (savedId === ADMIN_ID) {
            setLineId(savedId);
            setLineName(savedName || 'iVan 老闆');
            setLoading(false);
        } else {
            console.warn("Unauthorized access attempt to Console.");
            router.push('/');
        }
    }, [router]);

    if (!isMounted || loading) {
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
