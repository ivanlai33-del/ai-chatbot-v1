/**
 * ============================================================
 * 🛡️ FreemiumGuard — 免費會員通話額度管理系統
 * ============================================================
 *
 * 商業邏輯：
 *   - 免費用戶享有「終身 20 則」試用額度（非每月重置）
 *   - 用完即永久停用，需升級付費方案才能繼續
 *   - 付費用戶（任何 tier > 0）完全不受限制
 *
 * 防濫用機制：
 *   1. 終身額度上限 (LIFETIME_LIMIT)
 *   2. 單日速率限制 (DAILY_LIMIT)  ← 防止快速刷爆額度
 *   3. 訊息長度截斷 (MAX_INPUT_CHARS) ← 防止超長訊息炸 Token
 *
 * 成本估算 (gpt-4o-mini)：
 *   每次對話 ~1,080 tokens ≈ NT$0.01
 *   20 則終身額度 ≈ NT$0.20 / 人
 *   100,000 人 × NT$0.20 = NT$20,000（可接受的拉新成本）
 */

import { supabase } from '@/lib/supabase';

// ─── 商業參數（老闆可調整這裡）─────────────────────────────
export const FREE_LIFETIME_LIMIT = 20;  // 免費終身額度（則）
export const FREE_DAILY_LIMIT = 5;      // 每日上限（防止一天刷爆）
export const MAX_INPUT_CHARS = 300;     // 訊息最大長度（防止 Token 炸彈）
// ─────────────────────────────────────────────────────────────

export type GuardResult =
    | { allowed: true; isPaid: boolean; lifetimeUsed: number }
    | { allowed: false; reason: 'lifetime_exceeded' | 'daily_exceeded'; lifetimeUsed: number; dailyUsed?: number };

export class FreemiumGuard {
    /**
     * 主閘門：檢查用戶是否能繼續對話
     * 同時查詢會員等級、終身用量、今日用量（三個並行 DB 請求，速度最快）
     */
    static async check(userId: string): Promise<GuardResult> {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // 並行查詢三件事，節省時間
        const [memberResult, lifetimeResult, dailyResult] = await Promise.all([
            // 1. 查會員等級
            supabase
                .from('stock_radar_members')
                .select('tier')
                .eq('user_id', userId)
                .maybeSingle(),

            // 2. 查終身累計對話數（加總所有月份）
            supabase
                .from('user_usage_stats')
                .select('message_count')
                .eq('user_id', userId),

            // 3. 查今日對話數（從 chat_logs 計算）
            supabase
                .from('user_usage_stats')
                .select('message_count')
                .eq('user_id', userId)
                .eq('month', new Date().toISOString().slice(0, 7)) // 當月
                .maybeSingle()
        ]);

        // 付費用戶直接放行（tier > 0）
        const tier = memberResult.data?.tier || 0;
        if (tier > 0) {
            const lifetimeTotal = lifetimeResult.data?.reduce((s, r) => s + (r.message_count || 0), 0) || 0;
            return { allowed: true, isPaid: true, lifetimeUsed: lifetimeTotal };
        }

        // 計算終身累計
        const lifetimeTotal = lifetimeResult.data?.reduce((s, r) => s + (r.message_count || 0), 0) || 0;

        // 第 1 道：終身額度檢查
        if (lifetimeTotal >= FREE_LIFETIME_LIMIT) {
            return { allowed: false, reason: 'lifetime_exceeded', lifetimeUsed: lifetimeTotal };
        }

        // 第 2 道：今日速率限制（防止一天之內刷完所有額度）
        // 用今天的計數來估計（這裡用月份記錄做近似，實際可強化為 daily_usage 表）
        // 暫時用一個簡單的方式：今天已用量從 chat_logs 查
        const { count: dailyCount } = await supabase
            .from('chat_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', todayStart.toISOString());

        const todayUsed = dailyCount || 0;
        if (todayUsed >= FREE_DAILY_LIMIT) {
            return {
                allowed: false,
                reason: 'daily_exceeded',
                lifetimeUsed: lifetimeTotal,
                dailyUsed: todayUsed
            };
        }

        return { allowed: true, isPaid: false, lifetimeUsed: lifetimeTotal };
    }

    /**
     * 訊息長度截斷（第 3 道防護）
     * 防止用戶用超長訊息炸 Token
     */
    static sanitizeInput(message: string): string {
        if (message.length <= MAX_INPUT_CHARS) return message;
        return message.substring(0, MAX_INPUT_CHARS) + '...[訊息過長，已截斷]';
    }

    /**
     * 根據攔截原因，生成 LINE 回覆文案
     */
    static getBlockMessage(reason: 'lifetime_exceeded' | 'daily_exceeded', lifetimeUsed: number): string {
        if (reason === 'lifetime_exceeded') {
            return [
                `您的 AI 店長體驗額度 (${FREE_LIFETIME_LIMIT} 則) 已全部用完了！✨`,
                ``,
                `感謝您的試用！希望 AI 店長有讓您感受到它的價值 😊`,
                ``,
                `📌 每月只要 NT$499，AI 店長就能無限為您 24 小時接客、回答問題、協助銷售！`,
                ``,
                `👉 立即升級：bot.ycideas.com`
            ].join('\n');
        }

        if (reason === 'daily_exceeded') {
            return [
                `您今天的試用額度 (${FREE_DAILY_LIMIT} 則 / 天) 已用完囉！`,
                ``,
                `明天可以繼續體驗，或是立即升級享受無限對話 👇`,
                `bot.ycideas.com`
            ].join('\n');
        }

        return '額度已用完，請升級以繼續使用。';
    }
}
