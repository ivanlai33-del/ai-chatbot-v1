'use client';

import { useEffect, useRef } from 'react';

export default function VisitorTracker() {
    const trackedRef = useRef(false);

    useEffect(() => {
        if (trackedRef.current) return;
        trackedRef.current = true;

        const trackVisitor = async () => {
            try {
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
                        referer: document.referrer || 'Direct'
                    })
                });
            } catch (e) {
                console.error("Visitor Tracking Error:", e);
            }
        };

        trackVisitor();
    }, []);

    return null; // Silent component
}
