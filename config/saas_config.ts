import { Zap, ShieldCheck, Globe, Layers } from 'lucide-react';

export const SAAS_HERO_CONFIG = {
    tag: {
        icon: Layers,
        text: 'B2B API & Toolkit'
    },
    title: '為主機增添 AI 大腦',
    highlight: '軟體開發商專屬代理人',
    description: '專為 POS 系統商、CRM 平台與接案團隊打造的 API 批發方案。只需持有一組 Partner Token，即可一鍵賦予您的系統自動化 AI 應答與智能導購能力。',
    backLink: {
        text: '返回個人／公司版',
        href: '/'
    },
    dashboardLink: {
        text: '管理後臺登入',
        href: '/saas-partnership/dashboard'
    }
};

export const SAAS_FEATURES = [
    {
        icon: Zap,
        title: 'Single API Key',
        description: '核發專屬 Partner Token，透過單一金鑰程式化管理旗下數百位商家的機器人席次，無須個別設定。'
    },
    {
        icon: ShieldCheck,
        title: 'Tenant Isolation',
        description: '子帳號與加盟主的對話數據、銷售報表完全隔離，符合系統商開發合規標準，保障商家商業機密。'
    },
    {
        icon: Globe,
        title: 'Webhook Ready',
        description: '即時雙向資料同步，輕鬆將 AI 收集到的客戶意圖與訂單狀態，推送回您現有的 CRM 或進銷存系統。'
    }
];

export interface SaaSPlan {
    name: string;
    slots: number | null;
    price: string;
    popular?: boolean;
    desc: string;
    features: string[];
}

export const SAAS_PLANS: SaaSPlan[] = [
    {
        name: 'SaaS 試水溫', slots: 20, price: '5,500',
        desc: '適合小型接案團隊初期整合測試。',
        features: ['20 個終端機器人AI店長席位', '基礎 API 存取權限', '共用環境部署', '社群技術支援']
    },
    {
        name: '成長方案', slots: 50, price: '16,000', popular: true,
        desc: '主力推廣方案，包含產業模版庫同步配置。',
        features: ['50 個終端機器人AI店長席位', '無限制 API 調用額度', '專屬 Technical PM 支援', '全產業模板庫 One-Click Sync']
    },
    {
        name: '企業不限席位', price: '專案報價', slots: null,
        desc: '為百店以上的超大型系統商提供完整授權。',
        features: ['無限量機器人AI店長席位配置', '支援獨立地端部署 (On-Premise)', '完整白牌 (White-label) UI 授權', 'SLA 99.9% 級別企業保障']
    }
];
