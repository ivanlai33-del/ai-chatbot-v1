'use client';

import { useEffect, useRef, useState } from 'react';
import { useSectionTracker } from '@/hooks/useSectionTracker';
import { useLiff } from '@/components/Liff/LiffProvider';

export default function VisitorTracker() {
    const trackedRef = useRef(false);
    const viewedSections = useSectionTracker();
    const { profile } = useLiff();

    const startTimeRef = useRef<number>(Date.now());
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const handleConsentUpdate = () => {
            trackVisitor();
        };

        window.addEventListener('cookie_consent_updated', handleConsentUpdate);

        // 縮短延遲執行，確保能抓到快速過客 (500ms)
        const timer = setTimeout(() => {
            const consent = localStorage.getItem('cookie_consent');
            if (consent === 'accepted' || profile?.userId) {
                trackVisitor();
            }
        }, 500);

        // 停留時間心跳監聽 (每 10 秒發送一次更新)
        const heartbeat = setInterval(() => {
            if (localStorage.getItem('cookie_consent') === 'accepted') {
                const currentDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setDuration(currentDuration);
                updateBehavior(currentDuration);
            }
        }, 10000);

        return () => {
            window.removeEventListener('cookie_consent_updated', handleConsentUpdate);
            clearTimeout(timer);
            clearInterval(heartbeat);
        };
    }, [profile]);

    // 當看過的區塊更新時，同步更新
    useEffect(() => {
        if (viewedSections.length > 0) {
            updateBehavior(duration);
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
                    country: geo.country_name || 'Unknown', // 加入國家欄位
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
                    browser: navigator.userAgent.split(' ')[0],
                    os: navigator.platform,
                    device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
                    liff_user_id: profile?.userId || null,
                    content_tags: viewedSections,
                    duration: 0 // 初始停留時間
                })
            });
        } catch (e) {
            console.warn("Visitor Tracking Suppressed:", e);
        }
    };

    const updateBehavior = async (currentDuration: number) => {
        try {
            await fetch('/api/platform/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visitor_id: getFingerprint(),
                    session_id: window.name,
                    content_tags: viewedSections,
                    duration: currentDuration // 更新停留時間
                })
            });
        } catch (e) {}
    };

    return null; // Silent component
}
