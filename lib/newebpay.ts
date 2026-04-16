import crypto from 'crypto';

/**
 * 藍新金流 (NewebPay) 加解密核心工具
 * NewebPay 官方規範：
 * - AES 加密：AES-256-CBC, Pkcs7 padding, 結果轉 Hex
 * - SHA256 壓碼：將 AES 密文加上 HashKey 與 HashIV 後做 SHA256，結果轉全大寫 Hex
 */

export interface NewebPayConfig {
    merchantId: string;
    hashKey: string;
    hashIV: string;
    version: string;
    baseUrl: string;
    returnUrl: string;
    notifyUrl: string;
    backendUrl: string;
    periodicalUpdateUrl: string;
}

// 取得環境變數中的藍新設定
export function getNewebPayConfig(): NewebPayConfig {
    // 強力清理：移除兩端的空格與可能被誤加的引號
    const cleanEnv = (val: string | undefined) => (val || '').trim().replace(/^["']|["']$/g, '');
    
    const merchantId = cleanEnv(process.env.NEWEBPAY_MERCHANT_ID);
    const hashKey = cleanEnv(process.env.NEWEBPAY_HASH_KEY);
    const hashIV = cleanEnv(process.env.NEWEBPAY_HASH_IV);
    const version = cleanEnv(process.env.NEWEBPAY_VERSION) || '2.0';
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim();
    const backendUrl = (process.env.NEXT_PUBLIC_NEWEBPAY_URL || '').trim();
    const periodicalUpdateUrl = process.env.NEWEBPAY_PERIODICAL_UPDATE_URL || 'https://core.newebpay.com/MPG/periodical';

    if (!merchantId || !hashKey || !hashIV) {
        throw new Error('NewebPay configuration is missing in environment variables');
    }

    return {
        merchantId,
        hashKey,
        hashIV,
        version,
        baseUrl: appUrl,
        returnUrl: `${appUrl}/dashboard/billing/success`,
        notifyUrl: `${appUrl}/api/payment/webhook`,
        backendUrl,
        periodicalUpdateUrl
    };
}

export function createMpgAesEncrypt(tradeInfoStr: string, hashKey: string, hashIV: string): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', hashKey, hashIV);
    let encrypted = cipher.update(tradeInfoStr, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted; // ✅ 保持小寫 Hex，符合藍新規範 (TradeInfo 不可轉大寫)
}

export function createMpgShaEncrypt(aesEncrypted: string, hashKey: string, hashIV: string): string {
    // 【對齊診斷結果 A】使用帶標籤的標準 2.0 公式
    const shaString = `HashKey=${hashKey}&TradeInfo=${aesEncrypted}&HashIV=${hashIV}`;
    
    // 輸出原始字串供手動校驗
    console.log('[NewebPay Debug] SHA Raw String (Standard 2.0):', shaString);

    const hash = crypto.createHash('sha256').update(shaString).digest('hex');
    return hash.toUpperCase();
}

/**
 * 解密從藍新金流回傳的 TradeInfo
 * @param encryptedTradeInfo 從藍新收到的 TradeInfo 密文
 */
export function decryptTradeInfo(encryptedTradeInfo: string, hashKey: string, hashIV: string): any {
    try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', hashKey, hashIV);
        // 設定不自動取消 padding，我們手動處理，避免某些特殊字串報錯
        decipher.setAutoPadding(false);

        let decrypted = decipher.update(encryptedTradeInfo, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        // 手動移除 Pkcs7 padding
        const paddingLength = decrypted.charCodeAt(decrypted.length - 1);
        if (paddingLength > 0 && paddingLength <= 32) {
            decrypted = decrypted.slice(0, -paddingLength);
        }

        // 回傳的解密字串會是 JSON 格式（因為我們請求時 RespondType 會設為 JSON）
        return JSON.parse(decrypted);

    } catch (error) {
        console.error('藍新金流解密失敗:', error);
        throw new Error('Decrypt TradeInfo Failed.');
    }
}

export function genDataChain(orderParams: Record<string, any>): string {
    return Object.entries(orderParams)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '') 
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
}

/**
 * 產生藍新金流要求的唯一訂單編號 (前綴 + 時間戳 + 隨機亂碼)
 */
export function generateMerchantOrderNo(prefix = 'ORD'): string {
    const date = new Date();
    // 產生如 20231005123045
    const timestamp = date.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    // 產生 4 碼隨機字串
    const randomStr = crypto.randomBytes(2).toString('hex').toUpperCase();
    
    return `${prefix}${timestamp}${randomStr}`;
}

/**
 * 產生定期定額執行/中止所需的加密資料 (Periodical Update API)
 * @param orderParams 包含 MerchantOrderNo, PeriodNo, PeriodType ('terminate') 等
 */
export function createPeriodicalUpdatePayload(orderParams: Record<string, any>, hashKey: string, hashIV: string): string {
    const dataChain = genDataChain(orderParams);
    return createMpgAesEncrypt(dataChain, hashKey, hashIV);
}
