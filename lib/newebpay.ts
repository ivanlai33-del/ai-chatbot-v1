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
    returnUrl: string;
    notifyUrl: string;
    backendUrl: string;
}

// 取得環境變數中的藍新設定
export function getNewebPayConfig(): NewebPayConfig {
    const merchantId = process.env.NEWEBPAY_MERCHANT_ID || '';
    const hashKey = process.env.NEWEBPAY_HASH_KEY || '';
    const hashIV = process.env.NEWEBPAY_HASH_IV || '';
    const version = process.env.NEWEBPAY_VERSION || '2.0';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!merchantId || !hashKey || !hashIV) {
        console.warn('⚠️ 藍新金流環境變數未完全配置 (NEWEBPAY_MERCHANT_ID, NEWEBPAY_HASH_KEY, NEWEBPAY_HASH_IV)');
    }

    return {
        merchantId,
        hashKey,
        hashIV,
        version,
        returnUrl: `${appUrl}/dashboard/billing/success`,     // 使用者付完款後被跳轉回來的畫面
        notifyUrl: `${appUrl}/api/payment/webhook`,           // 藍新幕後通知我們付款成功的 API
        backendUrl: process.env.NEXT_PUBLIC_NEWEBPAY_URL || 'https://ccore.newebpay.com/MPG/mpg_gateway', 
    };
}

/**
 * AES-256-CBC 加密 TradeInfo
 * @param tradeInfoStr 已組裝好的訂單字串（例如 MerchantID=...&Amt=...）
 */
export function createMpgAesEncrypt(tradeInfoStr: string, hashKey: string, hashIV: string): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', hashKey, hashIV);
    let encrypted = cipher.update(tradeInfoStr, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

/**
 * SHA256 產生校驗碼 TradeSha
 * @param aesEncrypted 透過 AES 加密後的 TradeInfo Hex 字串
 */
export function createMpgShaEncrypt(aesEncrypted: string, hashKey: string, hashIV: string): string {
    const shaString = `HashKey=${hashKey}&${aesEncrypted}&HashIV=${hashIV}`;
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

/**
 * 將物件轉換為 x-www-form-urlencoded 字串 (NewebPay 要求格式)
 */
export function genDataChain(orderParams: Record<string, any>): string {
    return Object.entries(orderParams)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${key}=${encodeURIComponent(value.toString())}`)
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
