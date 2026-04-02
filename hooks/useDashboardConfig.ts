'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { StoreConfig } from '@/lib/chat-types';

const DEFAULT_CONFIG: StoreConfig = {
    brand_dna: { 
        name: '', 
        tone: '親切專業', 
        tone_prompt: '您是一位親切且專業的店長，請用溫暖且有耐心的語氣回答客人的問題，並在適當的時候提供專業建議。',
        tagline: '',
        introduction: '',
        services: '',
        industry: '',
        target_audience: '',
        welcome_message: '',
        closing_phrase: '',
        forbidden_topics: '賭博、詐騙、色情、暴力行為、非法毒品、政治爭議、宗教衝突、競品攻擊、種族歧視、虛假與誤導性資訊、個資洩漏',
        human_trigger_keywords: '',
    },
    offerings: [{ name: '', price: '', description: '', size: '', url: '', ai_context: '', category: '', duration: '', target_audience_item: '', customization_note: '', caution_note: '', booking_url: '' }],
    faq_base: [{ q: '', a: '', tags: [] }],
    logic_rules: '',
    contact_info: { 
        line_id: '', phone: '', hours: '', platforms: [], branches: [],
        map_url: '', foodpanda_url: '', ubereats_url: '', parking_info: '',
        instagram: '', facebook: '', booking_method: '', closed_days: '',
    },
    completion_pct: 0,
};

export function useDashboardConfig(selectedBotId: string | null) {
    const [config, setConfigRaw] = useState<StoreConfig>(DEFAULT_CONFIG);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Wrapper that marks dirty on any user change
    const setConfig = useCallback((updater: any) => {
        setConfigRaw(updater);
        setIsDirty(true);
    }, []);

    const fetchConfig = useCallback(async (botId: string) => {
        try {
            const url = `/api/member/store-config?botId=${botId}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (data.config) {
                    setConfigRaw({
                        ...DEFAULT_CONFIG,
                        ...data.config,
                        brand_dna: { ...DEFAULT_CONFIG.brand_dna, ...data.config.brand_dna },
                        contact_info: { ...DEFAULT_CONFIG.contact_info, ...data.config.contact_info }
                    });
                } else {
                    setConfigRaw(DEFAULT_CONFIG);
                }
                setIsDirty(false);
            }
        } catch { /* silently fail */ }
    }, []);

    useEffect(() => {
        if (selectedBotId) {
            fetchConfig(selectedBotId);
        }
    }, [selectedBotId, fetchConfig]);

    // ── Completion Progress Calculation ──
    const completionPct = useMemo(() => {
        let totalPoints = 0;
        let earnedPoints = 0;

        // Brand DNA (8 points — added industry + welcome_message + target_audience)
        totalPoints += 8;
        if (config.brand_dna.name) earnedPoints += 1;
        if (config.brand_dna.tagline) earnedPoints += 1;
        if (config.brand_dna.introduction) earnedPoints += 1;
        if (config.brand_dna.services) earnedPoints += 1;
        if (config.brand_dna.tone_prompt) earnedPoints += 1;
        if (config.brand_dna.industry) earnedPoints += 1;
        if (config.brand_dna.welcome_message) earnedPoints += 1;
        if (config.brand_dna.target_audience) earnedPoints += 1;

        // Offerings (Max 5 points)
        totalPoints += 5;
        const validOfferings = config.offerings.filter(o => o.name && o.description);
        earnedPoints += Math.min(5, validOfferings.length * 2.5);

        // FAQ (Max 5 points)
        totalPoints += 5;
        const validFAQ = config.faq_base.filter(f => f.q && f.a);
        earnedPoints += Math.min(5, validFAQ.length * 2.5);

        // Logic Rules (5 points)
        totalPoints += 5;
        if (config.logic_rules.length > 20) earnedPoints += 5;
        else if (config.logic_rules.length > 0) earnedPoints += 2;

        // Contact Info (7 points — added map_url + booking_method + closed_days + instagram/facebook)
        totalPoints += 7;
        if (config.contact_info?.line_id) earnedPoints += 1;
        if (config.contact_info?.phone) earnedPoints += 1;
        if (config.contact_info?.hours) earnedPoints += 1;
        if (config.contact_info?.platforms?.length && config.contact_info.platforms.length > 0) earnedPoints += 1;
        if (config.contact_info?.branches?.length && config.contact_info.branches.length > 0) earnedPoints += 1;
        if (config.contact_info?.map_url) earnedPoints += 1;
        if (config.contact_info?.booking_method) earnedPoints += 1;

        return Math.round((earnedPoints / totalPoints) * 100);
    }, [config]);


    const handleSave = async () => {
        if (!selectedBotId) {
            alert('請先選擇或串接 LINE 官方帳號');
            return;
        }
        setIsSaving(true);
        try {
            await fetch('/api/member/store-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...config, botId: selectedBotId, completion_pct: completionPct }),
            });
            setSaveSuccess(true);
            setIsDirty(false);
            setTimeout(() => setSaveSuccess(false), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    return {
        config: { ...config, completion_pct: completionPct },
        setConfig,
        isSaving,
        isDirty,
        saveSuccess,
        handleSave,
        refreshConfig: () => selectedBotId && fetchConfig(selectedBotId)
    };
}
