'use client';

import React from 'react';
import { ChatAdminView } from './ChatAdminView';

interface ChatAdminOverlayProps {
    isVisible: boolean;
    onClose: () => void;
    botId: string;
    mgmtToken: string;
    adminBotData: any;
}

export default function ChatAdminOverlay({
    isVisible,
    onClose,
    botId,
    mgmtToken,
    adminBotData
}: ChatAdminOverlayProps) {
    if (!isVisible || !adminBotData) return null;

    return (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-xl z-30 p-8 overflow-y-auto">
            <ChatAdminView 
                botId={botId}
                mgmtToken={mgmtToken}
                adminBotData={adminBotData}
                products={[]} 
                faqList={[]}
                orders={[]}
                onSaveBrain={() => {}}
                onAddProduct={() => {}}
                onDeleteProduct={() => {}}
                onAddFaq={() => {}}
                onDeleteFaq={() => {}}
            />
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
                ✕ 關閉管理
            </button>
        </div>
    );
}
