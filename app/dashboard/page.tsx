'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AISandboxChat from '@/components/dashboard/AISandboxChat';
import BrandDNATab from '@/components/dashboard/tabs/BrandDNATab';
import DojoTab from '@/components/dashboard/tabs/DojoTab';
import OfferingsTab from '@/components/dashboard/tabs/OfferingsTab';
import FAQTab from '@/components/dashboard/tabs/FAQTab';
import LogicTab from '@/components/dashboard/tabs/LogicTab';
import ContactTab from '@/components/dashboard/tabs/ContactTab';
import RAGTab from '@/components/dashboard/tabs/RAGTab';
import AudienceTab from '@/components/dashboard/tabs/AudienceTab';
import KnowledgeBasePanel from '@/components/dashboard/KnowledgeBasePanel';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ApiKeysModal from '@/components/dashboard/ApiKeysModal';

// Hooks & Config
import { useBotList } from '@/hooks/useBotList';
import { useDashboardConfig } from '@/hooks/useDashboardConfig';
import { DASHBOARD_TABS, DashboardTabId } from '@/config/dashboard_config';

import { StoreConfig } from '@/lib/chat-types';

import { globalLogout } from '@/lib/auth-utils';

export default function DashboardPage() {
    const [userName, setUserName] = useState('');
    const [userPicture, setUserPicture] = useState('');
    const [planLevel, setPlanLevel] = useState(0);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [activeTab, setActiveTab ] = useState<DashboardTabId>('brand');
    const [showApiKeysModal, setShowApiKeysModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    // Business Logic Hooks
    const { bots, selectedBotId, setSelectedBotId } = useBotList();
    const { config, setConfig, isSaving, isDirty, saveSuccess, handleSave } = useDashboardConfig(selectedBotId);

    const selectedBot = bots.find(b => b.id === selectedBotId);
    const [lineUserId, setLineUserId] = useState('');

    useEffect(() => {
        const getCookie = (name: string) => {
            const match = typeof document !== 'undefined' ? document.cookie.split('; ').find(r => r.startsWith(name + '=')) : null;
            return match ? decodeURIComponent(match.split('=')[1]) : '';
        };
        const uid = getCookie('line_user_id') || localStorage.getItem('line_user_id') || '';
        
        // 🛡️ 鋼鐵守衛：沒登入直接踢走
        if (!uid) {
            console.warn("Unauthorized access - Redirecting to home");
            window.location.href = '/?require_login=true';
            return;
        }

        // 🛠️ 滾動守衛：強制頁面回到頂部，避免重新整理時的滑動問題
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);

        setLineUserId(uid);
        setIsLoadingAuth(false);
        setUserName(getCookie('line_user_name') || localStorage.getItem('line_user_name') || '會員');
        setUserPicture(getCookie('line_user_picture') || localStorage.getItem('line_user_picture') || '');
        
        // Fetch plan and other data
        fetch(`/api/platform/user?lineUserId=${uid}`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.user) {
                    setPlanLevel(data.user.plan_level || 0);
                    setBillingCycle(data.user.billing_cycle || 'monthly');
                }
            })
            .catch(err => console.error("Sync Error:", err));
    }, []);

    // 🛑 在驗證完成前，不透露任何內容
    if (isLoadingAuth) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">身分驗證中...</p>
                </div>
            </div>
        );
    }

    const logout = () => {
        globalLogout();
        window.location.href = '/';
    };

    return (
        <DashboardLayout
            userName={userName}
            userPicture={userPicture}
            lineUserId={lineUserId}
            planLevel={planLevel}
            billingCycle={billingCycle}
            onLogout={logout}
            sidebar={
                <AISandboxChat 
                    bots={bots} 
                    selectedBotId={selectedBotId} 
                    setSelectedBotId={setSelectedBotId}
                    planLevel={planLevel} 
                    config={config} 
                    onOpenSettings={() => setShowApiKeysModal(true)}
                    onDeleteBot={() => setShowDeleteConfirm(true)}
                />
            }
        >
            <KnowledgeBasePanel
                config={config}
                planLevel={planLevel}
                bots={bots}
                selectedBotId={selectedBotId}
                setSelectedBotId={setSelectedBotId}
                handleSave={handleSave}
                isSaving={isSaving}
                saveSuccess={saveSuccess}
                isDirty={isDirty}
                tabs={DASHBOARD_TABS}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenSettings={() => setShowApiKeysModal(true)}
                showDeleteConfirm={showDeleteConfirm}
                setShowDeleteConfirm={setShowDeleteConfirm}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                        className="space-y-5"
                    >
                        {activeTab === 'brand' && <BrandDNATab config={config} setConfig={setConfig} planLevel={planLevel} />}
                        {activeTab === 'dojo' && <DojoTab config={config} setConfig={setConfig} planLevel={planLevel} onSave={handleSave} isSaving={isSaving} />}
                        {activeTab === 'offerings' && <OfferingsTab config={config} setConfig={setConfig} />}
                        {activeTab === 'faq' && <FAQTab config={config} setConfig={setConfig} />}
                        {activeTab === 'logic' && <LogicTab config={config} setConfig={setConfig} />}
                        {activeTab === 'contact' && <ContactTab config={config} setConfig={setConfig} />}
                        {activeTab === 'rag' && <RAGTab planLevel={planLevel} bots={bots} selectedBotId={selectedBotId} />}
                        {activeTab === 'audience' && <AudienceTab botId={selectedBotId} planLevel={planLevel} />}
                    </motion.div>
                </AnimatePresence>
            </KnowledgeBasePanel>

            <ApiKeysModal 
                isOpen={showApiKeysModal}
                onClose={() => setShowApiKeysModal(false)}
                botId={selectedBotId || ''}
                botName={selectedBot?.channelName || selectedBot?.channel_name || '未命名店長'}
            />
        </DashboardLayout>
    );
}


