/**
 * ============================================================
 * 🛡️ FreemiumGuard — 免費會員通話額度管理系統 v2.0
 * ============================================================
 *
 * ✅ v2.0 升級：所有額度數字改從 lib/config/pricing.ts 讀取
 *    不再寫死任何數字，調整方案只需改 pricing.ts 一個檔案。
 *
 * 三道防護：
 *   1. 終身 / 月度額度檢查（依方案 tier 決定）
 *   2. 單日速率限制（防止一天內刷爆額度）
 *   3. 訊息長度截斷（防止 Token 炸彈）
 */

import { supabase } from '@/lib/supabase';
import { getPlanByTier } from '@/lib/config/pricing';

// 訊息長度截斷上限（所有方案共用，防 Token 炸彈）
export const MAX_INPUT_CHARS = 300;

export type GuardResult =
  | { allowed: true; isPaid: boolean; lifetimeUsed: number; tier: number }
  | { allowed: false; reason: 'lifetime_exceeded' | 'daily_exceeded' | 'monthly_exceeded'; lifetimeUsed: number; tier: number; limit: number };

export class FreemiumGuard {
  /**
   * 取得使用者的方案等級 (tier)
   */
  static async getUserTier(userId: string): Promise<number> {
    const { data } = await supabase
        .from('platform_users')
        .select('plan_level')
        .eq('id', userId)
        .maybeSingle();
    return data?.plan_level ?? 0;
  }

  /**
   * 主閘門：檢查用戶是否能繼續對話
   * 依 tier 自動套用對應方案的額度規則
   */
  static async check(userId: string): Promise<GuardResult> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const currentMonth = new Date().toISOString().slice(0, 7);

    // ── 並行查詢：會員等級 + 本月用量 ──────────────────────
    const [memberResult, usageResult] = await Promise.all([
      supabase
        .from('stock_radar_members')
        .select('tier')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('user_usage_stats')
        .select('message_count')
        .eq('user_id', userId)
        .eq('month', currentMonth)
        .maybeSingle(),
    ]);

    const tier = memberResult.data?.tier ?? 0;
    const plan = getPlanByTier(tier);

    // 找不到方案定義時，預設為免費方案規則（防禦性設計）
    if (!plan) {
      console.error(`[FreemiumGuard] Unknown tier: ${tier}, defaulting to free restrictions`);
      return { allowed: false, reason: 'monthly_exceeded', lifetimeUsed: 0, tier, limit: 0 };
    }

    const { monthlyQuota, dailyQuota, isLifetimeQuota } = plan.limits;

    // ── 旗艦方案（tier ≥ 5）：直接放行，無限額度 ─────────
    if (monthlyQuota === -1) {
      return { allowed: true, isPaid: true, lifetimeUsed: 0, tier };
    }

    // ── 計算累計用量 ───────────────────────────────────────
    // 免費版：終身累計（加總所有月份）
    // 付費版：僅本月
    let totalUsed = 0;

    if (isLifetimeQuota) {
      // 免費版：查詢所有月份累計
      const { data: allUsage } = await supabase
        .from('user_usage_stats')
        .select('message_count')
        .eq('user_id', userId);
      totalUsed = allUsage?.reduce((sum, row) => sum + (row.message_count ?? 0), 0) ?? 0;
    } else {
      // 付費版：只看本月
      totalUsed = usageResult.data?.message_count ?? 0;
    }

    // ── 第 1 道：月度 / 終身額度檢查 ──────────────────────
    if (totalUsed >= monthlyQuota) {
      console.log(`[FreemiumGuard] ❌ Quota exceeded: user=${userId} tier=${tier} used=${totalUsed}/${monthlyQuota}`);
      return {
        allowed: false,
        reason: isLifetimeQuota ? 'lifetime_exceeded' : 'monthly_exceeded',
        lifetimeUsed: totalUsed,
        tier,
        limit: monthlyQuota,
      };
    }

    // ── 第 2 道：每日速率限制（僅對低 tier 做保護）────────
    if (dailyQuota > 0) {
      const { count: dailyCount } = await supabase
        .from('chat_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', todayStart.toISOString());

      const todayUsed = dailyCount ?? 0;
      if (todayUsed >= dailyQuota) {
        console.log(`[FreemiumGuard] ⏱️ Daily limit hit: user=${userId} today=${todayUsed}/${dailyQuota}`);
        return {
          allowed: false,
          reason: 'daily_exceeded',
          lifetimeUsed: totalUsed,
          tier,
          limit: dailyQuota,
        };
      }
    }

    return { allowed: true, isPaid: tier > 0, lifetimeUsed: totalUsed, tier };
  }

  /**
   * 訊息長度截斷（第 3 道防護）
   * 防止超長訊息製造 Token 炸彈
   */
  static sanitizeInput(message: string): string {
    if (message.length <= MAX_INPUT_CHARS) return message;
    return message.substring(0, MAX_INPUT_CHARS) + '...[訊息過長，已截斷]';
  }

  /**
   * 根據攔截原因 + tier，產生對應的 LINE 回覆文案
   */
  static getBlockMessage(
    reason: 'lifetime_exceeded' | 'daily_exceeded' | 'monthly_exceeded',
    tier: number,
    limit: number
  ): string {
    const plan = getPlanByTier(tier);
    const planName = plan?.name ?? '目前方案';

    if (reason === 'lifetime_exceeded') {
      return [
        `✨ 您的 AI 店長體驗額度（${limit} 則）已全部用完！`,
        ``,
        `感謝您的試用，希望 AI 店長有讓您看到它的價值 😊`,
        ``,
        `📌 最低每月只要 NT$199，AI 店長就能幫您 24H 接客！`,
        ``,
        `👉 立即升級：bot.ycideas.com`,
      ].join('\n');
    }

    if (reason === 'monthly_exceeded') {
      return [
        `📊 您的「${planName}」本月 ${limit} 則額度已用完！`,
        ``,
        `AI 店長已暫停服務，升級方案後立即恢復。`,
        ``,
        `👉 前往升級：bot.ycideas.com`,
      ].join('\n');
    }

    if (reason === 'daily_exceeded') {
      return [
        `⏱️ 您今天的試用額度（${limit} 則/天）已用完！`,
        ``,
        `明天可以繼續體驗，或立即升級享受更多對話 👇`,
        `bot.ycideas.com`,
      ].join('\n');
    }

    return '額度已用完，請升級以繼續使用。bot.ycideas.com';
  }
}
