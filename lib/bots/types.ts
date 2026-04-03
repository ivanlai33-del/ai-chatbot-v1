/**
 * ============================================================
 * 🤖 Bot Engine Shared Types
 * ============================================================
 * 所有 TIER 共用的型別定義。
 * 修改這裡時請確認所有 Engine 仍然兼容。
 */

import { WebhookEvent } from '@line/bot-sdk';

// ─── Bot 設定（來自 Supabase bots table）────────────────────
export interface BotConfig {
    id: string;
    store_name: string;
    status: 'active' | 'suspended' | 'pending';
    owner_line_id: string | null;
    owner_type: 'standalone' | 'partner' | 'saas';
    partner_id: string | null;
    system_prompt: string | null;
    dynamic_context: string | null;
    brand_dna: Record<string, any> | null;
    selected_plan: string | null;
    plan_level: number;
    openai_api_key: string | null;           // 加密存儲
    line_channel_access_token: string;       // 加密存儲
    line_channel_secret: string;             // 加密存儲
    mgmt_token: string | null;
    last_dojo_update: string | null;
    created_at: string;
}

// ─── Engine 執行結果 ─────────────────────────────────────────
export interface BotHandleResult {
    success: boolean;
    replied: boolean;
    error?: string;
    replyContent?: string;
}

// ─── LINE Event (直接 re-export 方便各 Engine import) ────────
export type { WebhookEvent };

// ─── Dojo 練功房 指令分類結果 ────────────────────────────────
export type DojoClassification =
    | { type: 'faq'; question: string; answer: string }
    | { type: 'product'; name: string; price: number; cost?: number }
    | { type: 'dynamic'; update: string }
    | { type: 'unknown' };

// ─── TIER 識別符（用於 Logging）───────────────────────────────
export type BotTier =
    | 'TIER1:StoreManager'
    | 'TIER2:WebsiteSales'
    | 'TIER2:WebsiteOnboarding'
    | 'TIER2:WebsiteOwner'
    | 'TIER3:MasterHub'
    | 'TIER4:Partner';
