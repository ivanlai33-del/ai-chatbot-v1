/**
 * Cognee 微服務 HTTP API 客戶端
 * 負責處理與 Python FastAPI 記憶微服務之間的 HTTP 通訊、逾時降級與資安 Token 標頭。
 */

export interface MemoryRecallResult {
    success: boolean;
    memoriesText: string;
}

export class CogneeClient {
    private baseUrl: string;
    private internalSecret: string;

    constructor() {
        this.baseUrl = process.env.COGNEE_SERVICE_URL || 'http://localhost:8000';
        this.internalSecret = process.env.INTERNAL_COGNEE_SECRET || 'default_secret_key';
    }

    private getHeaders(): Record<string, string> {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.internalSecret}`
        };
    }

    /**
     * 1. 檢索圖譜記憶 (Recall)
     * 附帶嚴格的 800ms 逾時保護，若微服務異常靜默降級，不影響主系統。
     */
    async recall(botId: string, organizationId: string, userId: string, query: string): Promise<MemoryRecallResult> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 800); // ⚡ 800ms 超時降級

            const response = await fetch(`${this.baseUrl}/api/v1/memory/recall`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    bot_id: botId,
                    organization_id: organizationId || 'default',
                    user_id: userId,
                    query
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                return { success: false, memoriesText: '' };
            }

            const data = await response.json();
            if (data.status === 'success' && Array.isArray(data.memories) && data.memories.length > 0) {
                const formattedMemories = data.memories.map((m: any) => typeof m === 'string' ? m : JSON.stringify(m)).join('\n');
                return { success: true, memoriesText: formattedMemories };
            }

            return { success: true, memoriesText: '' };
        } catch (error: any) {
            // 🛡️ 降級保護：若逾時或網路錯誤，靜默記錄 warning，不跳出例外
            console.warn(`[CogneeClient] Recall bypassed or timed out: ${error?.message || error}`);
            return { success: false, memoriesText: '' };
        }
    }

    /**
     * 2. 背景寫入圖譜記憶 (Remember - Fire & Forget)
     * 非同步發送請求，不等待回應即可返回。
     */
    remember(botId: string, organizationId: string, userId: string, userMessage: string, botResponse: string): void {
        fetch(`${this.baseUrl}/api/v1/memory/remember`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                bot_id: botId,
                organization_id: organizationId || 'default',
                user_id: userId,
                user_message: userMessage,
                bot_response: botResponse
            })
        }).catch(err => {
            console.warn(`[CogneeClient] Background remember request bypass: ${err.message}`);
        });
    }
}
