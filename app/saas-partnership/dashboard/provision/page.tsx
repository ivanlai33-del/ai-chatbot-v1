"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BrainCircuit, CheckCircle2, ShieldCheck, 
    Settings2, Zap, Link2, Copy, Eye, EyeOff,
    RefreshCw, Server, Bot, Plus, Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePartner } from '@/context/PartnerContext';

import ProvisionIdentityStep from '@/components/PartnerDashboard/Provision/ProvisionIdentityStep';
import ProvisionBrainStep from '@/components/PartnerDashboard/Provision/ProvisionBrainStep';
import ProvisionDeployStep from '@/components/PartnerDashboard/Provision/ProvisionDeployStep';
import ProvisionSuccessStep from '@/components/PartnerDashboard/Provision/ProvisionSuccessStep';
import AgenticConfigPreview from '@/components/PartnerDashboard/Provision/AgenticConfigPreview';
import SaaSChatInterface from '@/components/SaaSChatInterface';

export default function ProvisionPage() {
    const { activeOA } = usePartner();
    const [activeTab, setActiveTab] = useState<'wizard' | 'connection'>('wizard');
    const [currentStep, setCurrentStep] = useState(0); 
    const [isSaving, setIsSaving] = useState(false);
    const [showToken, setShowToken] = useState(false);
    
    // Connection Data
    const [connectionData, setConnectionData] = useState({
        channel_id: '',
        channel_secret: '',
        channel_token: '',
        webhook_url: 'https://agi-bot-os.ycideas.com/api/webhook/line'
    });

    // Wizard Data
    const [botInfo, setBotInfo] = useState({ name: '', industry: '', systemPrompt: '' });
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deploymentData, setDeploymentData] = useState<any>(null);
    const [mode, setMode] = useState<'wizard' | 'agentic'>('wizard');
    const [proposedConfig, setProposedConfig] = useState<any>(null);

    useEffect(() => {
        if (activeOA) {
            setActiveTab('connection');
            fetchConnectionDetails();
        }
    }, [activeOA]);

    const fetchConnectionDetails = async () => {
        if (!activeOA) return;
        const { data } = await supabase
            .from('official_accounts')
            .select('*')
            .eq('id', activeOA.id)
            .maybeSingle();
        
        if (data) {
            setConnectionData({
                channel_id: data.channel_id || '',
                channel_secret: data.channel_secret || '',
                channel_token: data.channel_token || '',
                webhook_url: data.webhook_url || connectionData.webhook_url
            });
        }
    };

    const handleSaveConnection = async () => {
        if (!activeOA) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('official_accounts')
                .update({
                    channel_id: connectionData.channel_id,
                    channel_secret: connectionData.channel_secret,
                    channel_token: connectionData.channel_token,
                    updated_at: new Date().toISOString()
                })
                .eq('id', activeOA.id);
            
            if (error) throw error;
            alert('LINE 頻道連線設定已更新！');
        } catch (err) {
            console.error('Error saving connection:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const templates = [
        { id: 'fitness', name: '健身瑜珈', desc: '強調健康、課程預約、體驗方案', prompt: '你是一個專業的瑜珈館客服，語氣溫柔寧靜，主要目標是吸引客人預約體驗課。' },
        { id: 'beauty', name: '美容美髮', desc: '強調設計師作品、保養建議、價格透明', prompt: '你是一個時尚的美髮沙龍顧問，語氣親切專業，熟悉各種髮型與護理推薦。' },
        { id: 'fnb', name: '餐飲零售', desc: '強調菜單特色、促銷活動、訂位引導', prompt: '你是一個熱情的餐廳外場經理，說話俐落大方，熟知今日特餐並能引導客人線上訂位。' }
    ];

    return (
        <div className="min-h-full">
            <div className="flex h-full min-h-screen">
                <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
                    <header className="mb-12 flex justify-between items-start">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-black tracking-widest text-[#06C755] uppercase mb-4"
                            >
                                <Zap className="w-3 h-3" />
                                {activeTab === 'wizard' ? 'System Provisioning' : 'Channel Connectivity'}
                            </motion.div>
                            <motion.h1
                                className="text-3xl font-black text-slate-900 tracking-tight leading-tight"
                            >
                                {activeTab === 'wizard' ? '開通 AI 店長分身' : '帳號與頻道設定'}
                            </motion.h1>
                        </div>

                        <div className="flex bg-white/60 p-1 rounded-2xl border border-white shadow-sm">
                            <button 
                                onClick={() => setActiveTab('wizard')}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'wizard' ? 'bg-[#06C755] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Plus className="w-3 h-3 inline mr-1" /> 開通精靈
                            </button>
                            <button 
                                onClick={() => setActiveTab('connection')}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'connection' ? 'bg-[#06C755] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Settings2 className="w-3 h-3 inline mr-1" /> 連線管理
                            </button>
                        </div>
                    </header>

                    <div className="max-w-4xl">
                        <AnimatePresence mode="wait">
                            {activeTab === 'wizard' ? (
                                <div key="wizard" className="space-y-8">
                                    <div className="flex gap-4 mb-8 p-1.5 bg-slate-100 rounded-2xl w-fit">
                                        <button onClick={() => setMode('wizard')} className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${mode === 'wizard' ? 'bg-white text-[#06C755] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>導引模式</button>
                                        <button onClick={() => setMode('agentic')} className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${mode === 'agentic' ? 'bg-white text-[#06C755] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>AI 智能模式</button>
                                    </div>
                                    
                                    {mode === 'agentic' ? (
                                        <AgenticConfigPreview config={proposedConfig} onDeploy={() => {}} isDeploying={false} />
                                    ) : currentStep === 0 ? (
                                        <ProvisionIdentityStep name={botInfo.name} onNameChange={(name) => setBotInfo({ ...botInfo, name })} onNext={() => setCurrentStep(1)} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
                                    ) : currentStep === 1 ? (
                                        <ProvisionBrainStep templates={templates} industry={botInfo.industry} systemPrompt={botInfo.systemPrompt} onTemplateSelect={(id, prompt) => setBotInfo({ ...botInfo, industry: id, systemPrompt: prompt })} onPromptChange={(prompt) => setBotInfo({ ...botInfo, systemPrompt: prompt })} onNext={() => setCurrentStep(2)} onBack={() => setCurrentStep(0)} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
                                    ) : currentStep === 2 ? (
                                        <ProvisionDeployStep botName={botInfo.name} onDeploy={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} isSubmitting={isSubmitting} />
                                    ) : (
                                        <ProvisionSuccessStep botName={botInfo.name} onReturnToDashboard={() => window.location.href = '/saas-partnership/dashboard'} />
                                    )}
                                </div>
                            ) : (
                                <motion.div 
                                    key="connection"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    {/* Webhook Section */}
                                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#06C755] opacity-10 blur-[100px] group-hover:opacity-20 transition-opacity" />
                                        <div className="relative z-10 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#06C755]/20 flex items-center justify-center border border-[#06C755]/30">
                                                        <Server className="w-5 h-5 text-[#06C755]" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-black tracking-tight">Webhook 調度網址</h3>
                                                        <p className="text-xs text-slate-400 font-bold">請將此網址貼回 LINE Developers 控制台</p>
                                                    </div>
                                                </div>
                                                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black transition-all border border-white/10">驗證連線狀態</button>
                                            </div>
                                            <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5 group-hover:border-[#06C755]/30 transition-all">
                                                <code className="flex-1 font-mono text-sm text-emerald-400 truncate">{connectionData.webhook_url}</code>
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"><Copy className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* API Configuration */}
                                    <div className="bg-white/40 backdrop-blur-3xl border border-white rounded-[2.5rem] p-10 shadow-sm space-y-10">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-3">
                                                <Link2 className="w-5 h-5 text-[#06C755]" /> Messaging API 配置
                                            </h3>
                                            <button 
                                                onClick={handleSaveConnection}
                                                disabled={isSaving}
                                                className="px-6 py-2.5 bg-[#06C755] text-white rounded-xl text-[11px] font-black shadow-lg shadow-[#06C755]/20 hover:scale-105 transition-all disabled:opacity-50"
                                            >
                                                {isSaving ? '儲存中...' : '更新金鑰設定'}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Channel ID</label>
                                                <input 
                                                    type="text" 
                                                    value={connectionData.channel_id}
                                                    onChange={(e) => setConnectionData({...connectionData, channel_id: e.target.value})}
                                                    placeholder="16XXXXXXXX"
                                                    className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 ring-[#06C755]/20 transition-all" 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Channel Secret</label>
                                                <div className="relative">
                                                    <input 
                                                        type={showToken ? "text" : "password"} 
                                                        value={connectionData.channel_secret}
                                                        onChange={(e) => setConnectionData({...connectionData, channel_secret: e.target.value})}
                                                        className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 ring-[#06C755]/20 transition-all pr-12" 
                                                    />
                                                    <button onClick={() => setShowToken(!showToken)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                                                        {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Channel Access Token (Long-lived)</label>
                                                <textarea 
                                                    value={connectionData.channel_token}
                                                    onChange={(e) => setConnectionData({...connectionData, channel_token: e.target.value})}
                                                    rows={4}
                                                    className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-xs font-mono font-bold outline-none focus:ring-2 ring-[#06C755]/20 transition-all" 
                                                />
                                            </div>
                                        </div>

                                        <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-2xl flex gap-4">
                                            <Info className="w-5 h-5 text-amber-500 shrink-0" />
                                            <p className="text-xs text-amber-700 leading-relaxed font-medium">
                                                更新金鑰後，系統將自動重啟 AGI 監聽服務。這可能導致約 5-10 秒的 Webhook 響應延遲，請在非高峰時段進行更新。
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="hidden lg:block w-[400px] xl:w-[480px] bg-transparent backdrop-blur-sm border-l border-white/20">
                    <SaaSChatInterface
                        storeName={activeOA?.name || botInfo.name || "未命名店鋪"}
                        isMaster={false}
                        isSaaS={true}
                        focusedField={focusedField}
                        currentStep={currentStep}
                        isProvisioning={activeTab === 'wizard'}
                        pageContext="provision"
                    />
                </div>
            </div>
        </div>
    );
}
