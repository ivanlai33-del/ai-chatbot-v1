import { CogneeClient } from './CogneeClient';
import { IntentNoiseFilter } from './IntentNoiseFilter';

const cogneeClient = new CogneeClient();

/**
 * 記憶積木對外統一適配器 (Memory Adapter)
 * 封裝了訂閱方案過濾 (199/499/1299)、防護過濾、開關切換與記憶讀寫。
 */
export class MemoryAdapter {
    /**
     * 檢查是否符合 Cognee 記憶庫呼叫條件
     */
    private static isMemoryEnabled(bot: any): boolean {
        // 1. 全域環境變數開關 (Feature Flag)
        if (process.env.ENABLE_COGNEE_MEMORY !== 'true') {
            return false;
        }

        // 2. 機器人狀態檢查
        if (!bot || bot.status !== 'active') {
            return false;
        }

        // 3. 訂閱方案過濾 ($199 基礎版 / Free 版跳過 Cognee 圖譜分析，節省成本)
        const plan = (bot.selected_plan || bot.subscription_plan || '').toString().toLowerCase();

        // 若為 $199 基礎方案或 Free 免費方案，不開啟 Cognee 圖譜記憶
        if (plan.includes('199') || plan.includes('free') || plan.includes('starter')) {
            return false;
        }

        return true;
    }

    /**
     * 1. 檢索顧客長期圖譜記憶 (於 LLM 對話生成前呼叫)
     */
    static async getCustomerMemory(bot: any, lineUserId: string, userMessageText: string): Promise<string> {
        if (!this.isMemoryEnabled(bot)) {
            return '';
        }

        // 🛡️ 第一道防線：防長文攻擊 (超過 1000 字不查詢)
        if (userMessageText && userMessageText.length > 1000) {
            return '';
        }

        const result = await cogneeClient.recall(
            bot.id,
            bot.organization_id || bot.partner_id || 'default_org',
            lineUserId,
            userMessageText
        );

        if (result.success && result.memoriesText) {
            return `\n【關於該顧客的長期知識與歷史偏好 (Knowledge Graph)】：\n${result.memoriesText}\n`;
        }

        return '';
    }

    /**
     * 2. 非同步儲存對話記憶 (於 LLM 對話生成後呼叫，非阻塞)
     */
    static saveConversationMemory(bot: any, lineUserId: string, userMessageText: string, botResponseText: string): void {
        if (!this.isMemoryEnabled(bot)) {
            return;
        }

        // 🛡️ 第二道防線：無效對話過濾 (如寒暄、貼圖、系統指令不寫入圖譜)
        if (IntentNoiseFilter.shouldSkipCognify(userMessageText)) {
            return;
        }

        // ⚡ 非同步發送寫入請求，背景執行 Cognify 實體建圖
        cogneeClient.remember(
            bot.id,
            bot.organization_id || bot.partner_id || 'default_org',
            lineUserId,
            userMessageText,
            botResponseText
        );
    }
}
