"use client";

import React, { useState } from 'react';
import { useChatInterface } from '@/hooks/useChatInterface';
import { ChatHeader } from './chat/ChatHeader';
import { ChatInput } from './chat/ChatInput';
import { RobotAvatar } from './chat/RobotAvatar';
import { PricingWidget, CheckoutWidget, SuccessWidget, HubPreviewWidget } from './chat/ChatWidgets';
import { CHAT_CONFIG } from '@/config/chat_config';

// Modular Components
import ChatBackground from './chat/ChatBackground';
import ChatMessageList from './chat/ChatMessageList';
import ChatAdminOverlay from './chat/ChatAdminOverlay';
import ChatWebViewOverlay from './chat/ChatWebViewOverlay';

export default function ChatInterface({ isMaster = false, isSaaS = false, initialType = null }: { isMaster?: boolean, isSaaS?: boolean, initialType?: string | null }) {
    const {
        messages,
        setMessages,
        inputValue,
        setInputValue,
        isTyping,
        billingCycle,
        setBillingCycle,
        selectedPlan,
        setSelectedPlan,
        lineUserId,
        lineUserName,
        lineUserPicture,
        botId,
        mgmtToken,
        isAdminView,
        setIsAdminView,
        adminBotData,
        viewMode,
        setViewMode,
        activeWebViewUrl,
        setActiveWebViewUrl,
        randomBgPath,
        randomBotPath,
        planLevel,
        handleSend,
        initiateLineLogin,
        handleLogout,
        handlePaymentSuccess,
        addAiMessage,
        placeholder
    } = useChatInterface(initialType);

    const renderWidgets = (m: any) => (
        <>
            {m.type === 'pricing' && (
                <PricingWidget 
                    billingCycle={billingCycle}
                    onToggleBilling={setBillingCycle}
                    onSelectPlan={(name, price) => {
                        setSelectedPlan({ name, price });
                        addAiMessage(`您選擇了 **${name}** (${price})。請問老闆怎麼稱呼？或是直接點擊下方 LINE 登入快速完成身分綁定：`, 'checkout');
                    }}
                    lineUserId={lineUserId}
                    initiateLineLogin={initiateLineLogin}
                />
            )}

            {m.type === 'checkout' && (
                <CheckoutWidget 
                    selectedPlan={selectedPlan}
                    billingCycle={billingCycle}
                    onPayment={() => {
                        const level = selectedPlan.name.includes('Startup') ? 1 : 2;
                        handlePaymentSuccess(level);
                    }}
                    lineGreen="#06C755"
                />
            )}

            {m.type === 'success' && (
                <SuccessWidget 
                    botId={botId || 'demo'}
                    mgmtToken={mgmtToken || 'demo'}
                    isAdminView={isAdminView}
                    onAdminLogin={() => setIsAdminView(true)}
                />
            )}

            {(m.type === 'hub_preview' || m.type === 'dojo_preview') && (
                <HubPreviewWidget 
                    onEnterHub={() => {
                        if (lineUserId) {
                             // 與 Header 的個人頭像卡片邏輯對齊：直接跳轉到後台管理系統
                             window.location.href = '/dashboard';
                        } else {
                             // 若完全未登入，才引導 LINE 登入
                             initiateLineLogin();
                        }
                    }}
                />
            )}
        </>
    );

    return (
        <div className="relative h-screen w-full flex flex-col overflow-hidden font-sans selection:bg-[#06C755]/30">
            <ChatBackground bgPath={randomBgPath} />

            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-12 overflow-hidden pointer-events-none relative z-10">
                <div 
                    className="relative w-full h-full flex flex-col pointer-events-auto max-w-[750px]"
                >
                    <div 
                        className="w-full h-full flex flex-col bg-white/95 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.3)] overflow-hidden border border-white/40 backdrop-blur-sm rounded-[48px]"
                    >
                        <ChatHeader 
                            lineUserId={lineUserId}
                            lineUserName={lineUserName}
                            lineUserPicture={lineUserPicture}
                            planLevel={planLevel}
                            initiateLineLogin={initiateLineLogin}
                            onLogout={handleLogout}
                            onUpgrade={handlePaymentSuccess}
                            onReset={() => setMessages([])}
                        />

                        <main className="flex-1 overflow-hidden flex flex-col relative">
                            <ChatMessageList 
                                messages={messages}
                                isTyping={isTyping}
                                lineUserPicture={lineUserPicture}
                                initiateLineLogin={initiateLineLogin}
                                setInputValue={setInputValue}
                                setActiveWebViewUrl={setActiveWebViewUrl}
                                setViewMode={setViewMode}
                                renderWidgets={renderWidgets}
                            />

                            <ChatAdminOverlay 
                                isVisible={isAdminView}
                                onClose={() => setIsAdminView(false)}
                                botId={botId || ''}
                                mgmtToken={mgmtToken || ''}
                                adminBotData={adminBotData}
                            />
                        </main>

                        <ChatInput 
                            value={inputValue}
                            onChange={setInputValue}
                            onSend={handleSend}
                            isTyping={isTyping}
                            placeholder={placeholder}
                        />
                    </div>

                    <RobotAvatar 
                        isTyping={isTyping}
                        isSaaS={isSaaS}
                        botPath={randomBotPath}
                        onClick={() => {}}
                        className={CHAT_CONFIG.robot.desktop}
                    />

                    <RobotAvatar 
                        isTyping={isTyping}
                        isSaaS={isSaaS}
                        botPath={randomBotPath}
                        onClick={() => {}}
                        className={CHAT_CONFIG.robot.mobile}
                    />
                </div>
            </div>

            <ChatWebViewOverlay 
                url={activeWebViewUrl}
                onClose={() => setViewMode('chat')}
            />
        </div>
    );
}
