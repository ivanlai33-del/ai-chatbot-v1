/**
 * 意圖與噪聲過濾器 (Intent Noise Filter)
 * 用於在訊息送入 Cognee 圖譜記憶庫之前，先進行輕量過濾，避免日常廢話、貼圖、系統指令污染知識圖譜。
 */
export class IntentNoiseFilter {
    // 日常無效廢話/寒暄詞句
    private static TRIVIAL_PHRASES = new Set([
        '哈囉', 'hello', 'hi', '你好', '您好', '安安',
        '謝謝', '感謝', 'thank you', 'thanks', '不客氣',
        '好的', 'ok', 'okay', '收到', '知道了',
        '再見', '拜拜', 'bye', 'goodbye',
        '哈哈哈', '笑死', 'XD', 'XDDD', '👍', '🙏', '❤️'
    ]);

    /**
     * 判斷是否應該跳過 Cognee 圖譜記憶寫入 (Cognify)
     */
    static shouldSkipCognify(userMessage: string): boolean {
        if (!userMessage) return true;

        const trimmed = userMessage.trim().toLowerCase();

        // 1. 系統指令過濾 (以 @ 或 # 開頭的指令)
        if (trimmed.startsWith('@') || trimmed.startsWith('#')) {
            return true;
        }

        // 2. 超短廢話/貼圖代碼過濾 (少於 2 個字且非商業關鍵字)
        if (trimmed.length <= 1) {
            return true;
        }

        // 3. 純寒暄短句比對
        if (this.TRIVIAL_PHRASES.has(trimmed)) {
            return true;
        }

        // 4. 重複亂碼檢測 (例如 "asdfghjkl" 或 "gggggggg")
        const isRepeatedChar = /^(.)\1+$/.test(trimmed);
        if (isRepeatedChar && trimmed.length > 3) {
            return true;
        }

        return false;
    }
}
