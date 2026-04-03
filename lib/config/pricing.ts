/**
 * ============================================================
 * 💎 PRICING CONFIG — 定價積木系統（唯一真實來源）
 * ============================================================
 *
 * ⚠️  重要：所有與價格、方案、額度相關的數字，
 *     全部都在這個檔案定義。
 *
 *     修改價格時，只需要改這一個檔案，
 *     其餘所有頁面、守門員、報表都會自動更新。
 *
 * 影響範圍：
 *   - 前端定價頁 (SaasPricingPlan.tsx)
 *   - 定價 Modal (PricingModal.tsx)
 *   - 守門員 (FreemiumGuard.ts)
 *   - Webhook 額度檢查 (line/webhook/[id])
 *   - 後台方案顯示 (Console)
 *   - 金流連結 (ECPay)
 *
 * 年付邏輯：月費 × 11（送 1 個月）
 * 原價邏輯：優惠價 ÷ 0.8（8折優惠，原價當錨點）
 */

// ─── 方案 ID 型別（統一識別碼）────────────────────────────
export type PlanId =
  | 'free'
  | 'starter'
  | 'solo'
  | 'growth'
  | 'chain'
  | 'flagship_lite'
  | 'flagship_pro';

// ─── 單一方案型別定義 ─────────────────────────────────────
export interface PricingPlan {
  id: PlanId;
  tier: number;              // 0=免費, 1=入門, 2=單店主力, 3=成長多店, 4=連鎖專業, 5=旗艦Lite, 6=旗艦Pro
  name: string;              // 方案名稱
  emoji: string;             // 代表 Emoji
  tagline: string;           // 一句話說明
  targetAudience: string;    // 適合對象（用於自選引導）
  monthlyInquiryRange: string; // 每月詢問量描述

  pricing: {
    monthly: number;         // 優惠月費（NT$）
    originalMonthly: number; // 原價月費（NT$）
    annual: number;          // 年付價格（月費 × 11）
    annualSaving: number;    // 年付省多少（= monthly × 1）
    isStartingPrice: boolean; // 是否為「起」價（旗艦方案）
  };

  limits: {
    stores: number;          // 店數上限（-1 = 無限）
    monthlyQuota: number;    // 每月訊息額度（-1 = 無限）
    dailyQuota: number;      // 每日訊息上限（防刷保護，-1 = 無限）
    isLifetimeQuota: boolean; // true = 終身額度（免費版），false = 每月重置
  };

  features: string[];        // 功能列表
  notIncluded?: string[];    // 不包含（顯示 ✗）

  payment: {
    ecpayMonthlyLink: string;  // ECPay 月付連結
    ecpayAnnualLink: string;   // ECPay 年付連結
  };

  badge?: string;            // 徽章文字（如「最受歡迎」「最划算」）

  overage?: {
    per1000Messages: number; // 超量每 1,000 則加收（NT$）
    description: string;
  };
}

// ─── 方案主資料表（修改價格就改這裡）──────────────────────
export const PRICING_PLANS: Record<PlanId, PricingPlan> = {

  // ── 免費體驗 ──────────────────────────────────────────
  free: {
    id: 'free',
    tier: 0,
    name: '免費體驗',
    emoji: '🎁',
    tagline: '先試試看，AI 店長適不適合你',
    targetAudience: '還沒決定要不要用的老闆',
    monthlyInquiryRange: '終身 20 則體驗額度',
    pricing: {
      monthly: 0,
      originalMonthly: 0,
      annual: 0,
      annualSaving: 0,
      isStartingPrice: false,
    },
    limits: {
      stores: 1,
      monthlyQuota: 20,
      dailyQuota: 5,
      isLifetimeQuota: true,  // ← 終身額度，不重置
    },
    features: [
      '24H AI 自動回話體驗',
      '品牌個性設定',
      '商品 / FAQ 教學（初階）',
      '對話紀錄查看',
    ],
    notIncluded: [
      '潛在客戶自動標記',
      '多店管理',
      '報表分析',
    ],
    payment: {
      ecpayMonthlyLink: '',
      ecpayAnnualLink: '',
    },
  },

  // ── 入門嚐鮮 NT$199 ──────────────────────────────────
  starter: {
    id: 'starter',
    tier: 1,
    name: '入門嚐鮮',
    emoji: '🌱',
    tagline: '剛開 LINE，先讓 AI 幫你試試看',
    targetAudience: '剛開 LINE 官方帳號，試水溫的老闆',
    monthlyInquiryRange: '每月不超過 500 則詢問',
    pricing: {
      monthly: 199,
      originalMonthly: 249,
      annual: 2190,          // 199 × 11
      annualSaving: 199,     // 省 1 個月
      isStartingPrice: false,
    },
    limits: {
      stores: 1,
      monthlyQuota: 500,
      dailyQuota: 30,
      isLifetimeQuota: false,
    },
    features: [
      '24H AI 自動回話',
      '品牌 DNA 設定（語氣/口吻）',
      '商品 / 服務 / 價目表教學',
      'FAQ 常見問題自動回答',
      '對話紀錄查看',
    ],
    notIncluded: [
      '潛在客戶自動標記',
      '預約意圖自動記錄',
      '多店管理',
      '分析報表',
    ],
    payment: {
      ecpayMonthlyLink: 'https://p.ecpay.com.tw/PLACEHOLDER_199M',
      ecpayAnnualLink: 'https://p.ecpay.com.tw/PLACEHOLDER_199Y',
    },
  },

  // ── 單店主力 NT$499 ──────────────────────────────────
  solo: {
    id: 'solo',
    tier: 2,
    name: '單店主力',
    emoji: '🏪',
    tagline: '一間店，讓 AI 幫你接 7 成客服',
    targetAudience: '訊息不少、常常回不完的單店老闆',
    monthlyInquiryRange: '每月 500–1,999 則詢問',
    badge: '最受歡迎 ⭐',
    pricing: {
      monthly: 499,
      originalMonthly: 629,
      annual: 5490,          // 499 × 11
      annualSaving: 499,
      isStartingPrice: false,
    },
    limits: {
      stores: 1,
      monthlyQuota: 2000,
      dailyQuota: 100,
      isLifetimeQuota: false,
    },
    features: [
      '24H AI 自動回話',
      '品牌 DNA 設定（語氣/口吻）',
      '商品 / 服務 / 價目表教學',
      'FAQ 常見問題自動回答',
      '對話紀錄查看',
      '✅ 潛在客戶自動標記',
      '✅ 預約意圖自動記錄',
    ],
    notIncluded: [
      '多店管理',
      '分析報表',
    ],
    payment: {
      ecpayMonthlyLink: 'https://p.ecpay.com.tw/A06FE6B',
      ecpayAnnualLink: 'https://p.ecpay.com.tw/723E398',
    },
  },

  // ── 成長多店 NT$1,299 ─────────────────────────────────
  growth: {
    id: 'growth',
    tier: 3,
    name: '成長多店',
    emoji: '🔗',
    tagline: '2–3 間店，統一管理不混亂',
    targetAudience: '有 2–3 家分店、訊息分散各店的連鎖老闆',
    monthlyInquiryRange: '全部分店加起來每月 2,000–5,000 則',
    pricing: {
      monthly: 1299,
      originalMonthly: 1649,
      annual: 14290,         // 1299 × 11
      annualSaving: 1299,
      isStartingPrice: false,
    },
    limits: {
      stores: 3,
      monthlyQuota: 5000,
      dailyQuota: 300,
      isLifetimeQuota: false,
    },
    features: [
      '單店主力所有功能',
      '✅ 最多 3 間店同時串接',
      '✅ 統一後台管理各店 LINE',
      '✅ 各店獨立品牌設定',
      '✅ 潛在客戶自動標記',
      '✅ 預約意圖自動記錄',
    ],
    notIncluded: [
      '月度分析報表',
      '優先客服',
    ],
    payment: {
      ecpayMonthlyLink: 'https://p.ecpay.com.tw/PLACEHOLDER_1299M',
      ecpayAnnualLink: 'https://p.ecpay.com.tw/PLACEHOLDER_1299Y',
    },
  },

  // ── 連鎖專業 NT$2,490 ────────────────────────────────
  chain: {
    id: 'chain',
    tier: 4,
    name: '連鎖專業',
    emoji: '👑',
    tagline: '4–6 間店，管好品牌、看懂數據',
    targetAudience: '有固定客群、開始重視數據的連鎖品牌',
    monthlyInquiryRange: '全品牌每月 5,000–10,000 則',
    pricing: {
      monthly: 2490,
      originalMonthly: 3090,
      annual: 27390,         // 2490 × 11
      annualSaving: 2490,
      isStartingPrice: false,
    },
    limits: {
      stores: 6,
      monthlyQuota: 10000,
      dailyQuota: 500,
      isLifetimeQuota: false,
    },
    features: [
      '成長多店所有功能',
      '✅ 最多 6 間店同時串接',
      '✅ 月度對話分析報表',
      '✅ 優先客服支援',
    ],
    payment: {
      ecpayMonthlyLink: 'https://p.ecpay.com.tw/FFD88CA',
      ecpayAnnualLink: 'https://p.ecpay.com.tw/C1E8916',
    },
  },

  // ── 旗艦 Lite NT$4,990 起 ────────────────────────────
  flagship_lite: {
    id: 'flagship_lite',
    tier: 5,
    name: '旗艦 Lite',
    emoji: '🔥',
    tagline: '知名品牌、團媽、直播，AI 幫你撐住爆量',
    targetAudience: '小有名氣品牌、高流量單店、直播團購',
    monthlyInquiryRange: '每月至少 10,000 則以上',
    pricing: {
      monthly: 4990,
      originalMonthly: 6290,
      annual: 54890,         // 4990 × 11
      annualSaving: 4990,
      isStartingPrice: true, // 顯示「NT$4,990 起」
    },
    limits: {
      stores: 3,
      monthlyQuota: 15000,
      dailyQuota: -1,        // 無每日上限（大量帳號）
      isLifetimeQuota: false,
    },
    features: [
      '連鎖專業所有功能',
      '✅ 15,000 則 / 月基本額度',
      '✅ 超量彈性加購（每 1,000 則 NT$150）',
      '✅ 完整後台自助設定與智庫建置',
      '✅ 技術問題優先遠端快速支援',
      '✅ 月度對話成效分析報表',
    ],
    overage: {
      per1000Messages: 150,
      description: '超過月額度：每 1,000 則加收 NT$150',
    },
    payment: {
      ecpayMonthlyLink: 'https://p.ecpay.com.tw/PLACEHOLDER_4990M',
      ecpayAnnualLink: 'https://p.ecpay.com.tw/PLACEHOLDER_4990Y',
    },
  },

  // ── 旗艦 Pro NT$7,990 起 ─────────────────────────────
  flagship_pro: {
    id: 'flagship_pro',
    tier: 6,
    name: '旗艦 Pro',
    emoji: '🚀',
    tagline: '超高流量、大品牌——客服是你的關鍵戰場',
    targetAudience: '超高流量品牌，客服是關鍵競爭力',
    monthlyInquiryRange: '每月 20,000 則以上，直接談專案',
    pricing: {
      monthly: 7990,
      originalMonthly: 9990,
      annual: 87890,         // 7990 × 11
      annualSaving: 7990,
      isStartingPrice: true,
    },
    limits: {
      stores: 6,
      monthlyQuota: 30000,
      dailyQuota: -1,
      isLifetimeQuota: false,
    },
    features: [
      '旗艦 Lite 所有功能',
      '✅ 30,000 則 / 月基本額度',
      '✅ 最多 6 間店同時串接',
      '✅ 超量彈性加購（每 1,000 則 NT$200，可議）',
      '✅ 技術問題最優先遠端快速支援',
      '✅ 每季設定健診與效能確認',
    ],
    overage: {
      per1000Messages: 200,
      description: '超過月額度：每 1,000 則加收 NT$200（可議）',
    },
    payment: {
      ecpayMonthlyLink: 'https://p.ecpay.com.tw/PLACEHOLDER_7990M',
      ecpayAnnualLink: 'https://p.ecpay.com.tw/PLACEHOLDER_7990Y',
    },
  },

};

// ─── 輔助函式（直接從定價表計算，不需要手動維護）──────────
export const PLAN_IDS_ORDERED: PlanId[] = [
  'free', 'starter', 'solo', 'growth', 'chain', 'flagship_lite', 'flagship_pro'
];

/** 依 tier 數字取得方案 */
export function getPlanByTier(tier: number): PricingPlan | undefined {
  return Object.values(PRICING_PLANS).find(p => p.tier === tier);
}

/** 依 PlanId 取得方案 */
export function getPlanById(id: PlanId): PricingPlan {
  return PRICING_PLANS[id];
}

/** 取得某方案的月訊息額度 */
export function getMonthlyQuota(tier: number): number {
  return getPlanByTier(tier)?.limits.monthlyQuota ?? 0;
}

/** 取得某方案的店數上限 */
export function getStoreLimit(tier: number): number {
  return getPlanByTier(tier)?.limits.stores ?? 1;
}

/** 判斷此 tier 是否為旗艦（無每日限制）*/
export function isFlagshipTier(tier: number): boolean {
  return tier >= 5;
}

/** 判斷是否為免費方案 */
export function isFreeTier(tier: number): boolean {
  return tier === 0;
}
