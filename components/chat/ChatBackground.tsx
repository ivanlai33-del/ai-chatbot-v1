'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DigitalBackground = dynamic(() => import('../DigitalBackground'), { ssr: false });

interface ChatBackgroundProps {
    bgPath: string;
}

export default function ChatBackground({ bgPath }: ChatBackgroundProps) {
    return (
        <>
            <div className="absolute inset-0 z-0">
                <img src={bgPath} className="w-full h-full object-cover" alt="Background" />
            </div>
            <div className="absolute inset-0 z-[1]">
                <DigitalBackground />
            </div>
        </>
    );
}
