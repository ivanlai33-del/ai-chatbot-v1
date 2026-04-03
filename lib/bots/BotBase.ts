/**
 * ============================================================
 * 🧰 BotBase - 所有 Bot Engine 的共用工具層
 * ============================================================
 * 職責：日誌格式化、LINE 回覆封裝、錯誤邊界
 * 不應包含任何業務邏輯 — 每個 TIER 各自實作業務邏輯。
 */

import { Client } from '@line/bot-sdk';
import { BotTier } from './types';

// ─── 結構化 Logger ────────────────────────────────────────────
export class BotLogger {
    private tier: BotTier;
    private botId: string;

    constructor(tier: BotTier, botId: string) {
        this.tier = tier;
        this.botId = botId;
    }

    info(msg: string, data?: any) {
        console.log(`[${this.tier}][${this.botId}] ${msg}`, data ? JSON.stringify(data) : '');
    }

    warn(msg: string, data?: any) {
        console.warn(`[${this.tier}][${this.botId}] ⚠️  ${msg}`, data ? JSON.stringify(data) : '');
    }

    error(msg: string, err?: any) {
        console.error(`[${this.tier}][${this.botId}] ❌ ${msg}`, err?.message || err || '');
    }
}

// ─── LINE Reply 安全封裝 ──────────────────────────────────────
/**
 * 安全地回覆 LINE 訊息。
 * 捕捉所有錯誤，防止 reply 失敗導致整個 webhook handler crash。
 */
export async function safeReply(
    client: Client,
    replyToken: string,
    text: string,
    logger?: BotLogger
): Promise<boolean> {
    try {
        if (!replyToken || !text.trim()) return false;
        await client.replyMessage(replyToken, {
            type: 'text',
            text: text.trim()
        });
        return true;
    } catch (err: any) {
        logger?.error('replyMessage failed', err);
        return false;
    }
}

/**
 * 安全地 push 訊息給用戶（不需要 replyToken）。
 */
export async function safePush(
    client: Client,
    userId: string,
    text: string,
    logger?: BotLogger
): Promise<boolean> {
    try {
        if (!userId || !text.trim()) return false;
        await client.pushMessage(userId, {
            type: 'text',
            text: text.trim()
        });
        return true;
    } catch (err: any) {
        logger?.error('pushMessage failed', err);
        return false;
    }
}

// ─── 通用錯誤回覆訊息 ─────────────────────────────────────────
export const BOT_ERROR_MESSAGES = {
    general: '抱歉，我剛才大腦斷線了，請再說一次。',
    timeout: '我現在有點忙碌，請稍後再試！',
    training: '老闆抱歉，我剛剛腦袋卡住了，沒能記下您的指令，請稍後再試...',
    audio: '老闆抱歉，我剛剛耳朵不太好，沒聽清楚您的語音指令，能請您再說一次嗎？',
} as const;

// ─── Reply Token 有效性檢查 ───────────────────────────────────
export function isValidReplyToken(token: any): boolean {
    return typeof token === 'string' && token.length > 10;
}
