'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * useSectionTracker Hook
 * 監聽網頁中帶有 id 的 section 或 內容區塊。
 * 當使用者滑過並停留超過 2 秒，將該區塊 ID 紀錄為「已閱讀內容」。
 */
export function useSectionTracker() {
    const [viewedSections, setViewedSections] = useState<string[]>([]);
    const timersRef = useRef<Record<string, NodeJS.Timeout>>({});

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5, // 至少 50% 可見才算進入
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const sectionId = entry.target.id;
                if (!sectionId) return;

                if (entry.isIntersecting) {
                    // 開始計時：如果停留超過 2000ms 則記錄
                    if (!timersRef.current[sectionId] && !viewedSections.includes(sectionId)) {
                        timersRef.current[sectionId] = setTimeout(() => {
                            setViewedSections((prev) => {
                                if (prev.includes(sectionId)) return prev;
                                return [...prev, sectionId];
                            });
                        }, 2000);
                    }
                } else {
                    // 離開視窗：取消計時
                    if (timersRef.current[sectionId]) {
                        clearTimeout(timersRef.current[sectionId]);
                        delete timersRef.current[sectionId];
                    }
                }
            });
        }, observerOptions);

        // 監控所有帶有 id 的 section
        const sections = document.querySelectorAll('section[id], div[data-track-section]');
        sections.forEach((section) => observer.observe(section));

        return () => {
            observer.disconnect();
            Object.values(timersRef.current).forEach(clearTimeout);
        };
    }, [viewedSections]);

    return viewedSections;
}
