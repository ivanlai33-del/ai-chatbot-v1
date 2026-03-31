'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AISandboxChat from '@/components/dashboard/AISandboxChat';
import BrandDNATab from '@/components/dashboard/tabs/BrandDNATab';
import OfferingsTab from '@/components/dashboard/tabs/OfferingsTab';
import FAQTab from '@/components/dashboard/tabs/FAQTab';
import LogicTab from '@/components/dashboard/tabs/LogicTab';
import ContactTab from '@/components/dashboard/tabs/ContactTab';
import RAGTab from '@/components/dashboard/tabs/RAGTab';
import KnowledgeBasePanel from '@/components/dashboard/KnowledgeBasePanel';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ApiKeysModal from '@/components/dashboard/ApiKeysModal';

// Hooks & Config
import { useBotList } from '@/hooks/useBotList';
import { useDashboardConfig } from '@/hooks/useDashboardConfig';
import { DASHBOARD_TABS, DashboardTabId } from '@/config/dashboard_config';

import { StoreConfig } from '@/lib/chat-types';

export default function DashboardPage() {
    const [userName, setUserName] = useState('');
    const [userPicture, setUserPicture] = useState('');
    const [planLevel, setPlanLevel] = useState(0);
    const [activeTab, setActiveTab ] = useState<DashboardTabId>('brand');
    const [showApiKeysModal, setShowApiKeysModal] = useState(false);

    // Business Logic Hooks
    const { bots, selectedBotId, setSelectedBotId } = useBotList();
    const { config, setConfig, isSaving, isDirty, saveSuccess, handleSave } = useDashboardConfig(selectedBotId);

    const selectedBot = bots.find(b => b.id === selectedBotId);

    useEffect(() => {
        const getCookie = (name: string) => {
            const match = document.cookie.split('; ').find(r => r.startsWith(name + '='));
            return match ? decodeURIComponent(match.split('=')[1]) : '';
        };
        setUserName(getCookie('line_user_name') || '會員');
        setUserPicture(getCookie('line_user_picture') || '');
        setPlanLevel(parseInt(getCookie('plan_level') || '0'));
    }, []);

    const logout = () => {
        document.cookie = 'line_user_id=; max-age=0; path=/'; 
        window.location.href = '/';
    };

    return (
        <DashboardLayout
            userName={userName}
            userPicture={userPicture}
            planLevel={planLevel}
            onLogout={logout}
            sidebar={
                <AISandboxChat 
                    bots={bots} 
                    selectedBotId={selectedBotId} 
                    planLevel={planLevel} 
                    config={config} 
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
                        {activeTab === 'brand' && <BrandDNATab config={config} setConfig={setConfig} />}
                        {activeTab === 'offerings' && <OfferingsTab config={config} setConfig={setConfig} />}
                        {activeTab === 'faq' && <FAQTab config={config} setConfig={setConfig} />}
                        {activeTab === 'logic' && <LogicTab config={config} setConfig={setConfig} />}
                        {activeTab === 'contact' && <ContactTab config={config} setConfig={setConfig} />}
                        {activeTab === 'rag' && <RAGTab planLevel={planLevel} bots={bots} selectedBotId={selectedBotId} />}
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


