/**
 * ============================================================
 * 🔐 feature-access.ts — 功能開放節點輔助函式（唯一來源）
 * ============================================================
 *
 * 各 Dashboard Tab 元件透過此模組取得當前方案的功能額度，
 * 而非在元件內硬編程數字。所有上限數字皆來自 lib/config/pricing.ts。
 */

import { PRICING_PLANS, PLAN_IDS_ORDERED, type PricingPlan } from '@/lib/config/pricing';

/** 依照 tier 數字取得方案的 featureAccess 物件，若找不到則回傳 free 方案 */
export function getFeatureAccess(tier: number): PricingPlan['featureAccess'] {
  const plan = Object.values(PRICING_PLANS).find(p => p.tier === tier);
  return plan?.featureAccess ?? PRICING_PLANS.free.featureAccess;
}

/** 取得計畫名稱（用於 UI 顯示） */
export function getPlanName(tier: number): string {
  const plan = Object.values(PRICING_PLANS).find(p => p.tier === tier);
  return plan?.name ?? '免費體驗';
}

/**
 * 取得解鎖特定功能所需的「最低方案名稱」
 * 例如：要開啟 PDF 學習，需要 solo (tier=2) 以上
 */
export function getRequiredPlanName(
  feature: keyof PricingPlan['featureAccess'],
  minValue: number | boolean = true
): string {
  for (const planId of PLAN_IDS_ORDERED) {
    const plan = PRICING_PLANS[planId];
    const val = plan.featureAccess[feature];
    
    if (typeof val === 'boolean' && val === true && minValue === true) {
      return plan.name;
    }
    
    if (typeof val === 'number' && typeof minValue === 'number') {
      if (val >= minValue) return plan.name;
    }
  }
  return '旗艦 Pro';
}

/** 判斷某數量是否已達上限（-1 表示無限） */
export function isAtLimit(current: number, limit: number): boolean {
  if (limit === -1) return false; // 無限
  return current >= limit;
}

/** 格式化顯示上限文字（-1 顯示為「無限」） */
export function formatLimit(limit: number): string {
  if (limit === -1) return '無限';
  return String(limit);
}
