import { Zap, Crown } from 'lucide-react';

export const PLAN_CONFIG = {
    0: { 
        label: '免費體驗', 
        icon: null, 
        color: 'text-slate-600', 
        badge: 'bg-slate-100 border border-slate-300', 
        glow: '' 
    },
    1: { 
        label: 'Lite 個人版', 
        icon: Zap, 
        color: 'text-emerald-700', 
        badge: 'bg-emerald-50 border border-emerald-300', 
        glow: '' 
    },
    2: { 
        label: 'Company 旗艦版', 
        icon: Crown, 
        color: 'text-amber-700', 
        badge: 'bg-amber-50 border border-amber-300', 
        glow: '' 
    },
};

export const DASHBOARD_TABS = [
    { id: 'brand', label: '品牌 DNA', emoji: '✨' },
    { id: 'dojo', label: '即時下指令', emoji: '📢' },
    { id: 'offerings', label: '商品/服務', emoji: '🛍️' },
    { id: 'faq', label: '常見問題', emoji: '💬' },
    { id: 'logic', label: '引導規則', emoji: '🧠' },
    { id: 'contact', label: '聯絡窗口', emoji: '📞' },
    { id: 'rag', label: 'PDF / 網頁學習', emoji: '📖' },
    { id: 'audience', label: 'CRM 分眾行銷', emoji: '👥' }
] as const;

export type DashboardTabId = typeof DASHBOARD_TABS[number]['id'];
