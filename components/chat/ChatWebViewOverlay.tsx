'use client';

import React from 'react';

interface ChatWebViewOverlayProps {
    url: string | null;
    onClose: () => void;
}

export default function ChatWebViewOverlay({ url, onClose }: ChatWebViewOverlayProps) {
    if (!url) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-10">
            <div className="bg-white w-full h-full rounded-[32px] overflow-hidden shadow-2xl flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <span className="font-bold text-sm truncate">{url}</span>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full">✕</button>
                </div>
                <iframe src={url} className="flex-1 w-full" title="WebView" />
            </div>
        </div>
    );
}
