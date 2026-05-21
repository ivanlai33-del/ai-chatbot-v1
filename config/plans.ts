/**
 * LINE 智能店長 Pro - 官方產品方案總綱
 * 這裡是全站產品、定價、功能的單一事實來源 (Single Source of Truth)
 */

export type PlanFeature = {
    text: string;
    included: boolean;
};

export type PricingPlan = {
    id: string;
    level: number;
    name: string;
    tagline: string;
    price: {
        monthly: number;
        yearly: number;
    };
    description: string;
    features: PlanFeature[];
    buttonText: string;
    highlight?: boolean;
};

export const OFFICIAL_PLANS: PricingPlan[] = [
    {
        id: 'free',
        level: 0,
        name: '體驗店長版',
        tagline: '適合 0-1 啟動及功能測試',
        price: { monthly: 0, yearly: 0 },
        description: '讓您體驗 AI 與 LINE 結合的強大威力。',
        buttonText: '立即試用',
        features: [
            { text: 'AI 自然對話接客', included: true },
            { text: '三分鐘閃電開通', included: true },
            { text: '基礎 FAQ 學習', included: true },
            { text: '每秒 1 次併發處理', included: true },
            { text: '專屬智庫 (Dojo) 錄音訓練', included: false },
            { text: 'PDF 深度技術讀盤', included: false },
        ]
    },
    {
        id: 'lite',
        level: 1,
        name: '個人店長版 (Pro)',
        tagline: '適合個人工作室與小型店家',
        price: { monthly: 499, yearly: 4990 },
        description: '解除對話限制，讓 AI 成為您的全職分身。',
        buttonText: '早鳥訂閱',
        highlight: true,
        features: [
            { text: 'AI 自然對話接客', included: true },
            { text: '三分鐘閃電開通', included: true },
            { text: '基礎 FAQ 學習', included: true },
            { text: '每秒 10 次併發處理', included: true },
            { text: '專屬智庫 (Dojo) 錄音訓練', included: true },
            { text: 'PDF 深度技術讀盤', included: false },
        ]
    },
    {
        id: 'premium',
        level: 2,
        name: '公司強力店長版 (Enterprise)',
        tagline: '追求極致商業轉化與知識庫',
        price: { monthly: 1199, yearly: 11990 },
        description: '搭載 AI 旗艦大腦，支援深度文件與多通路商務。',
        buttonText: '極速升級',
        features: [
            { text: 'AI 自然對話接客 (GPT-4o 旗艦腦)', included: true },
            { text: '三分鐘閃電開通', included: true },
            { text: '無限次併發處理', included: true },
            { text: '專屬智庫 (Dojo) 錄音訓練', included: true },
            { text: 'PDF 深度技術讀盤 (專家模式)', included: true },
            { text: '多通路 (FB/IG) 預計 Q3 優先權', included: true },
        ]
    }
];

export const getPlanByLevel = (level: number) => OFFICIAL_PLANS.find(p => p.level === level) || OFFICIAL_PLANS[0];
