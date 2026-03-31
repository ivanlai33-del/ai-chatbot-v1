import { 
    LayoutDashboard, 
    MessageSquare, 
    Brain, 
    Calendar, 
    BarChart3, 
    Settings,
    Users,
    CheckCircle2
} from 'lucide-react';

export const CONSOLE_NAV_ITEMS = [
    { id: 'dashboard', label: '戰情儀表板', icon: LayoutDashboard },
    { id: 'chat', label: '即時對話流', icon: MessageSquare },
    { id: 'brain', label: '店長智庫', icon: Brain },
    { id: 'crm', label: '客戶與預約', icon: Calendar },
    { id: 'analytics', label: '數據報表', icon: BarChart3 },
    { id: 'settings', label: '系統設定', icon: Settings },
];

export const CONSOLE_STATS = [
    { label: '今日總對話', value: '128', icon: MessageSquare, trend: '+12%', color: 'from-blue-500 to-indigo-600' },
    { label: '新增加好友', value: '34', icon: Users, trend: '+5%', color: 'from-emerald-500 to-teal-600' },
    { label: '預約攔截', value: '12', icon: Calendar, trend: '穩定', color: 'from-amber-500 to-orange-600' },
    { label: 'AI 回覆率', value: '98.5%', icon: CheckCircle2, trend: '+1.2%', color: 'from-purple-500 to-pink-600' },
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
