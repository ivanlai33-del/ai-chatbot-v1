'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { generateLineSyncScript } from '@/app/dashboard/connect/sync-script';

export function useSyncSession(configIdInitial: string | null = null) {
    const [setupToken, setSetupToken] = useState<string | null>(null);
    const [configId, setConfigId] = useState<string | null>(configIdInitial);
    const [syncStatus, setSyncStatus] = useState<'waiting' | 'syncing' | 'success' | 'error' | 'automated'>('waiting');
    const [collected, setCollected] = useState({ id: false, sec: false, bot: false, tok: false });
    const [bookmarkletHref, setBookmarkletHref] = useState<string>('#');
    const [connectionData, setConnectionData] = useState<any>(null);

    const fetchSetupSession = async (resumeId?: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const headers: Record<string, string> = { 
                'Content-Type': 'application/json'
            };

            if (session) {
                headers['Authorization'] = `Bearer ${session.access_token}`;
            }

            const url = resumeId ? `/api/line/setup-session?resumeId=${resumeId}` : '/api/line/setup-session';
            const res = await fetch(url, { method: 'POST', headers });
            const data = await res.json();
            
            if (data.success) {
                setSetupToken(data.setupToken);
                setConfigId(data.configId);
                setSyncStatus('waiting');
                return { success: true, setupToken: data.setupToken, configId: data.configId };
            } else {
                return { success: false, error: data.message || data.error };
            }
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    // Polling logic
    useEffect(() => {
        let interval: any;
        if (configId && (syncStatus === 'waiting' || syncStatus === 'syncing')) {
            interval = setInterval(async () => {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

                    const res = await fetch(`/api/line/status?configId=${configId}`, { headers });
                    const data = await res.json();
                    
                    if (data.collected) setCollected(data.collected);
                    if (data.config) setConnectionData(data.config);
                    
                    if (data.status === 'active') {
                        setSyncStatus('success');
                        if (interval) clearInterval(interval);
                    } else if (data.status === 'automated') {
                        setSyncStatus('automated');
                    }
                } catch (err) {
                    console.error('Check status error:', err);
                }
            }, 2000);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [configId, syncStatus]);

    // Bookmarklet generation
    useEffect(() => {
        if (!setupToken || !configId) return;
        const currentDomain = window.location.origin;
        const webhookUrl = `${currentDomain}/api/line/webhook/${configId}`;
        setBookmarkletHref(generateLineSyncScript(setupToken, currentDomain, webhookUrl));
    }, [setupToken, configId]);

    return {
        setupToken,
        configId,
        syncStatus,
        collected,
        bookmarkletHref,
        connectionData,
        fetchSetupSession,
        setSyncStatus,
        setConnectionData
    };
}
