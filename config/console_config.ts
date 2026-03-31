import { 
    LayoutDashboard, 
    MessageSquare, 
    Brain, 
    Calendar, 
    BarChart3, 
    Settings,
    Users,
    CheckCircle2,
    CreditCard,
    Zap,
    TrendingUp,
    PieChart
} from 'lucide-react';

export const PLATFORM_NAV_ITEMS = [
    { id: 'dashboard', label: '營運動察', icon: LayoutDashboard },
    { id: 'users', label: '用戶管理', icon: Users },
    { id: 'billing', label: '金流報表', icon: CreditCard },
    { id: 'api_usage', label: 'API 監控', icon: Zap },
];

export const PERSONAL_NAV_ITEMS = [
    { id: 'dashboard', label: '店務概況', icon: LayoutDashboard },
    { id: 'chat', label: '即時對話', icon: MessageSquare },
    { id: 'leads', label: '成功名單', icon: CheckCircle2 },
    { id: 'analytics', label: '數據分佈', icon: PieChart },
];

export const PLATFORM_STATS = [
    { label: '本月預計營收', value: '$45,800', icon: LayoutDashboard, trend: '+28%', color: 'from-emerald-400 to-teal-600' },
    { label: '正式開通店長', value: '12', icon: Users, trend: '+2', color: 'from-blue-500 to-indigo-600' },
    { label: '潛在營運線索', value: '45', icon: CheckCircle2, trend: '+12', color: 'from-amber-400 to-orange-600' },
    { label: 'API 營運成本比', value: '18.2%', icon: BarChart3, trend: '-2%', color: 'from-purple-500 to-pink-600' },
];

export const PERSONAL_STATS = [
    { label: '成功推動留資', value: '28', icon: Users, trend: '+12 位', color: 'from-emerald-400 to-emerald-600' },
    { label: 'AI 代勞訊息數', value: '1,245', icon: MessageSquare, trend: '+15.2%', color: 'from-indigo-400 to-indigo-600' },
    { label: '節省客服工時', value: '18.5 小時', icon: Settings, trend: '穩定', color: 'from-amber-400 to-amber-600' },
    { label: '機器人聽不懂', value: '3 筆', icon: CheckCircle2, trend: '-2 筆', color: 'from-red-400 to-rose-600' },
];

export const LIVE_FEED_MOCK = [
    { 
        id: '1',
        visitor: '訪客 #3829', 
        time: '2分鐘前', 
        content: '「請問這組沙發還有現貨嗎？運費怎麼算？」',
        aiResponse: '目前還有 3 組現貨喔！北部免運費，其他地區約 500-800 元...'
    },
    { 
        id: '2',
        visitor: '訪客 #3830', 
        time: '5分鐘前', 
        content: '「我想預約明天的美甲課程」',
        aiResponse: '好的！目前明天下午 2 點還有空位，請問要幫您保留嗎？'
    },
    { 
        id: '3',
        visitor: '訪客 #3831', 
        time: '12分鐘前', 
        content: '「請問有開發票嗎？」',
        aiResponse: '有的，我們提供電子發票與二聯/三聯式手寫發票。'
    }
];

export const POPULAR_FAQS = ['店內營業時間', '退換貨規則', '分店導覽'];
