'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useBotList() {
    const [bots, setBots] = useState<any[]>([]);
    const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
    const [isLoadingBots, setIsLoadingBots] = useState(true);

    const fetchBots = useCallback(async () => {
        setIsLoadingBots(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const authHeader = session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {};
            const res = await fetch('/api/line/list', { headers: { ...authHeader } as any });
            const data = await res.json();
            
            if (data.success && data.bots.length > 0) {
                setBots(data.bots);
                // Default to first active bot or most recent if not already set
                const firstActive = data.bots.find((b: any) => b.status === 'active') || data.bots[0];
                return { bots: data.bots, defaultBotId: firstActive.id };
            }
            return { bots: [], defaultBotId: 'empty-0' };
        } catch (err) {
            console.error('Fetch bots error:', err);
            return { bots: [], defaultBotId: 'empty-0' };
        } finally {
            setIsLoadingBots(false);
        }
    }, []);

    useEffect(() => {
        fetchBots().then(({ defaultBotId }) => {
            if (defaultBotId) setSelectedBotId(defaultBotId);
        });
    }, [fetchBots]);

    return {
        bots,
        selectedBotId,
        setSelectedBotId,
        isLoadingBots,
        refreshBots: fetchBots
    };
}
