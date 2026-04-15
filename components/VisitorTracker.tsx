'use client';

import { useEffect, useRef } from 'react';
import { useSectionTracker } from '@/hooks/useSectionTracker';
import { useLiff } from '@/components/Liff/LiffProvider';

export default function VisitorTracker() {
    const trackedRef = useRef(false);
    const viewedSections = useSectionTracker();
    const { profile } = useLiff();

    useEffect(() => {
        const handleConsentUpdate = () => {
            trackVisitor();
        };

        window.addEventListener('cookie_consent_updated', handleConsentUpdate);

        // 延遲執行，確保不影響首頁載入效能
        const timer = setTimeout(() => {
            const consent = localStorage.getItem('cookie_consent');
            if (consent === 'accepted' || profile?.userId) {
                trackVisitor();
            }
        }, 3000);

        return () => {
            window.removeEventListener('cookie_consent_updated', handleConsentUpdate);
            clearTimeout(timer);
        };
    }, [profile]);

    // 當看過的區塊更新時，同步更新（設定一個簡單的 Throttle 避免過度頻繁寫入）
    useEffect(() => {
        if (viewedSections.length > 0) {
            const timer = setTimeout(() => {
                updateBehavior();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [viewedSections]);

    const getFingerprint = () => {
        if (typeof window === 'undefined') return null;
        let vid = localStorage.getItem('visitor_id');
        if (!vid) {
            vid = crypto.randomUUID();
            localStorage.setItem('visitor_id', vid);
        }
        return vid;
    };

    const trackVisitor = async () => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const vid = getFingerprint();
            
            // 1. Get Geo-IP data
            const geoRes = await fetch('https://ipapi.co/json/');
            const geo = await geoRes.json();
            
            // 2. Push to our platform logs
            await fetch('/api/platform/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ip: geo.ip || 'Unknown',
                    city: geo.city || 'Unknown',
                    district: geo.region || 'Unknown',
                    isp: geo.org || 'Unknown',
                    referer: document.referrer || 'Direct',
                    visitor_id: vid,
                    session_id: window.name || (window.name = crypto.randomUUID()),
                    utm_source: urlParams.get('utm_source'),
                    utm_medium: urlParams.get('utm_medium'),
                    utm_campaign: urlParams.get('utm_campaign'),
                    utm_content: urlParams.get('utm_content'),
                    utm_term: urlParams.get('utm_term'),
                    page_url: window.location.href,
                    page_title: document.title,
                    browser: navigator.userAgent.split(' ')[0], // Simple parser
                    os: navigator.platform,
                    device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
                    liff_user_id: profile?.userId || null,
                    content_tags: viewedSections
                })
            });
        } catch (e) {
            console.warn("Visitor Tracking Suppressed:", e);
        }
    };

    const updateBehavior = async () => {
        // 僅更新行為標籤，減少 API 負擔
        try {
            await fetch('/api/platform/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visitor_id: getFingerprint(),
                    session_id: window.name,
                    content_tags: viewedSections,
                    // 其他欄位在後端可選擇忽略或更新
                })
            });
        } catch (e) {}
    };

    return null; // Silent component
}
