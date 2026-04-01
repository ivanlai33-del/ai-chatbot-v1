import React from 'react';
import { 
    LayoutDashboard, 
    Users, 
    Receipt, 
    MessageSquare, 
    Map, 
    ShieldCheck, 
    BarChart3,
    Activity,
    Settings,
    TrendingUp
} from 'lucide-react';

// Dynamic imports for widgets to ensure isolation and performance
import ConsoleAnalysisPanel from '@/components/console/ConsoleAnalysisPanel';
import SaaSSalesLeadsView from '@/components/console/SaaSSalesLeadsView';
import OwnerFeedbackView from '@/components/console/OwnerFeedbackView';
import BillingDashboardView from '@/components/console/BillingDashboardView';
import MarketIntelligenceView from '@/components/console/MarketIntelligenceView';

export interface ConsoleWidget {
    id: string;
    label: string;
    icon: any;
    component: React.ComponentType<{ onDataUpdate?: (data: any) => void }>;
    category: 'growth' | 'ops' | 'finance' | 'hq';
    status: 'stable' | 'beta' | 'new';
    description?: string;
}

export const WIDGET_REGISTRY: ConsoleWidget[] = [
    {
        id: 'dashboard',
        label: '總動態流',
        icon: Activity,
        component: ConsoleAnalysisPanel,
        category: 'hq',
        status: 'stable',
        description: '全平台實時監控與決策日誌'
    },
    {
        id: 'leads',
        label: '潛在客戶',
        icon: Users,
        component: SaaSSalesLeadsView,
        category: 'growth',
        status: 'stable',
        description: 'B2B 線索追蹤與自動評級'
    },
    {
        id: 'feedback',
        label: '客戶反饋',
        icon: MessageSquare,
        component: OwnerFeedbackView,
        category: 'ops',
        status: 'stable',
        description: 'AI 自動診斷與問題處理流'
    },
    {
        id: 'billing',
        label: '財務營運',
        icon: Receipt,
        component: BillingDashboardView,
        category: 'finance',
        status: 'stable',
        description: '營收轉化與訂閱狀態監測'
    },
    {
        id: 'market',
        label: '市場情報',
        icon: Map,
        component: MarketIntelligenceView,
        category: 'growth',
        status: 'new',
        description: '全台區域熱區與數位沙漠分佈'
    }
];

// Helper to get widget by ID
export const getWidget = (id: string) => WIDGET_REGISTRY.find(w => w.id === id);
