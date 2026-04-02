import { 
    LayoutDashboard, 
    BarChart3, 
    MessageSquare, 
    Users, 
    BrainCircuit, 
    LineChart, 
    Target, 
    HeartHandshake,
    Receipt
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic imports for better performance
const ConsoleAnalyticsView = dynamic(() => import('@/components/console/ConsoleAnalyticsView'), { ssr: false });
const SaaSSalesLeadsView = dynamic(() => import('@/components/console/SaaSSalesLeadsView'), { ssr: false });
const ChatStreamView = dynamic(() => import('@/components/console/ChatStreamView'), { ssr: false });
const ConsoleStrategicAdvisor = dynamic(() => import('@/components/console/ConsoleStrategicAdvisor'), { ssr: false });
const MarketIntelligenceView = dynamic(() => import('@/components/console/MarketIntelligenceView'), { ssr: false });
const BusinessCollaborationView = dynamic(() => import('@/components/console/BusinessCollaborationView'), { ssr: false });
const OwnerFeedbackView = dynamic(() => import('@/components/console/OwnerFeedbackView'), { ssr: false });
const BillingInvoicesView = dynamic(() => import('@/components/console/BillingInvoicesView'), { ssr: false });

export interface ConsoleWidget {
    id: string;
    label: string;
    icon: any;
    component: any;
    status: 'stable' | 'beta' | 'new';
    permission: 'admin' | 'owner';
}

export const WIDGET_REGISTRY: ConsoleWidget[] = [
    {
        id: 'dashboard',
        label: '營運指揮中心',
        icon: LayoutDashboard,
        component: ConsoleAnalyticsView,
        status: 'stable',
        permission: 'admin'
    },
    {
        id: 'leads',
        label: 'SaaS 業務開發',
        icon: Target,
        component: SaaSSalesLeadsView,
        status: 'stable',
        permission: 'admin'
    },
    {
        id: 'billing',
        label: '財務與發票',
        icon: Receipt,
        component: BillingInvoicesView,
        status: 'new',
        permission: 'admin'
    },
    {
        id: 'chatStream',
        label: '即時對話串流',
        icon: MessageSquare,
        component: ChatStreamView,
        status: 'beta',
        permission: 'admin'
    },
    {
        id: 'strategist',
        label: 'AI 戰略導師',
        icon: BrainCircuit,
        component: ConsoleStrategicAdvisor,
        status: 'stable',
        permission: 'admin'
    },
    {
        id: 'market',
        label: '市場競爭情報',
        icon: LineChart,
        component: MarketIntelligenceView,
        status: 'beta',
        permission: 'admin'
    },
    {
        id: 'partnerships',
        label: '商務協作中心',
        icon: HeartHandshake,
        component: BusinessCollaborationView,
        status: 'beta',
        permission: 'admin'
    },
    {
        id: 'feedback',
        label: '店長意見回饋',
        icon: Users,
        component: OwnerFeedbackView,
        status: 'stable',
        permission: 'admin'
    }
];
