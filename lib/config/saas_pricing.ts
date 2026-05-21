/**
 * ============================================================
 * 🏢 SAAS PARTNER PRICING CONFIG — SaaS 合作夥伴定價體系
 * ============================================================
 * 
 * 針對「開發商/軟體商/大型連鎖品牌」設計的批發式定價。
 * 與一般的「單店 AI 店長」定價邏輯完全不同，
 * 重點在於「席位包 (Slots)」與「平台管理權限」。
 */

export type PartnerPlanId = 'partner_startup' | 'partner_growth' | 'partner_enterprise';

export interface SaaSChartingPlan {
    id: PartnerPlanId;
    name: string;
    emoji: string;
    tagline: string;
    slots: number;             // 包含的 AI 店長席位數
    price: {
        monthly: number;       // 月費 (NT$)
        annual: number;        // 年付優惠價
        perSlotCost: number;   // 平均單一席位成本 (計算展示用)
    };
    features: string[];
    color: string;
    badge?: string;
}

export const SAAS_PARTNER_PLANS: Record<PartnerPlanId, SaaSChartingPlan> = {
    partner_startup: {
        id: 'partner_startup',
        name: 'SaaS 入門夥伴',
        emoji: '🚀',
        tagline: '適合剛起步的軟體工作室或中型連鎖品牌',
        slots: 20,
        price: {
            monthly: 5500,
            annual: 59400,     // 5500 * 12 * 0.9
            perSlotCost: 275   // 5500 / 20
        },
        features: [
            '包含 20 個 AI 店長席位',
            'SaaS 官方智庫控制中心使用權',
            'Partner API 基礎存取權',
            '實時事件總線監控 (Live Feed)',
            '標準技術支援 (Email/Line)',
            'Journey 自動化引擎基本版'
        ],
        color: '#06C755',
    },
    partner_growth: {
        id: 'partner_growth',
        name: 'SaaS 成長夥伴',
        emoji: '📈',
        tagline: '擴張中的服務商，需要更多席位與數據能力',
        slots: 50,
        badge: '最受歡迎',
        price: {
            monthly: 16000,
            annual: 172800,
            perSlotCost: 320
        },
        features: [
            '包含 50 個 AI 店長席位',
            '完整智庫控制中心 (含進階分析)',
            'Partner API 進階存取 (不限流量)',
            '跨店數據分析與市場情報 (Intel)',
            '專屬客戶經理服務',
            'Journey 自動化引擎進階版',
            '部分品牌字樣移除 (White-label hints)'
        ],
        color: '#4A90E2',
    },
    partner_enterprise: {
        id: 'partner_enterprise',
        name: 'SaaS 旗艦夥伴',
        emoji: '💎',
        tagline: '大型系統商與連鎖體系，追求極致客製化',
        slots: 150,
        price: {
            monthly: 45000,
            annual: 486000,
            perSlotCost: 300
        },
        features: [
            '包含 150 個 AI 店長席位',
            '全功能控制中心 + 原始數據存取',
            '完全白牌化 (White-labeling)',
            '優先級 AI 模型調優 (Dedicated Tuning)',
            'Journey 自動化引擎旗艦版',
            '核心源碼級技術支援',
            '專屬獨立伺服器部署選項'
        ],
        color: '#7B61FF',
    }
};
