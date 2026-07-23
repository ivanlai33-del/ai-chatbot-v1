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
    isTestMode: boolean;
}

// 取得環境變數中的藍新設定（若無設定則預設啟用測試沙盒模式）
export function getNewebPayConfig(): NewebPayConfig {
    const cleanEnv = (val: string | undefined) => (val || '').trim().replace(/^["']|["']$/g, '');
    
    let merchantId = cleanEnv(process.env.NEWEBPAY_MERCHANT_ID);
    let hashKey = cleanEnv(process.env.NEWEBPAY_HASH_KEY);
    let hashIV = cleanEnv(process.env.NEWEBPAY_HASH_IV);
    const version = cleanEnv(process.env.NEWEBPAY_VERSION) || '2.0';
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://bot.ycideas.com').trim();
    
    // 是否為測試環境沙盒
    let isTestMode = false;
    if (!merchantId || !hashKey || !hashIV) {
        console.warn('⚠️ [NewebPay Warning] 尚未設定正式金鑰，目前使用藍新測試沙盒 (Sandbox) 模式');
        merchantId = 'MS32470650'; // 藍新測試商店代號
        hashKey = '28489704253948572093847502938475'; 
        hashIV = '1029384756019283';
        isTestMode = true;
    }

    const defaultBackendUrl = isTestMode 
        ? 'https://ccore.newebpay.com/MPG/mpg_gateway' 
        : 'https://core.newebpay.com/MPG/mpg_gateway';

    const backendUrl = cleanEnv(process.env.NEXT_PUBLIC_NEWEBPAY_URL) || defaultBackendUrl;
    const periodicalUpdateUrl = process.env.NEWEBPAY_PERIODICAL_UPDATE_URL || 
        (isTestMode ? 'https://ccore.newebpay.com/MPG/periodical' : 'https://core.newebpay.com/MPG/periodical');

    return {
        merchantId,
        hashKey,
        hashIV,
        version,
        baseUrl: appUrl,
        returnUrl: `${appUrl}/dashboard/billing/success`,
        notifyUrl: `${appUrl}/api/payment/webhook`,
        backendUrl,
        periodicalUpdateUrl,
        isTestMode
    };
}

export function createMpgAesEncrypt(tradeInfoStr: string, hashKey: string, hashIV: string): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', hashKey, hashIV);
    let encrypted = cipher.update(tradeInfoStr, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted; // ✅ 保持小寫 Hex，符合藍新規範 (TradeInfo 不可轉大寫)
}

export function createMpgShaEncrypt(aesEncrypted: string, hashKey: string, hashIV: string): string {
    // ✅ 正確格式：HashKey={Key}&{TradeInfo (hex)}&HashIV={IV}，中間不加 TradeInfo=
    const shaString = `HashKey=${hashKey}&${aesEncrypted}&HashIV=${hashIV}`;
    
    console.log('[NewebPay Debug] SHA Raw String:', shaString.substring(0, 80) + '...');

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
        decipher.setAutoPadding(false);

        let decrypted = decipher.update(encryptedTradeInfo, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        // 手動移除 Pkcs7 padding
        const paddingLength = decrypted.charCodeAt(decrypted.length - 1);
        if (paddingLength > 0 && paddingLength <= 32) {
            decrypted = decrypted.slice(0, -paddingLength);
        }

        return JSON.parse(decrypted);

    } catch (error) {
        console.error('藍新金流解密失敗:', error);
        throw new Error('Decrypt TradeInfo Failed.');
    }
}

export function genDataChain(orderParams: Record<string, any>): string {
    return Object.entries(orderParams)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '') 
        .map(([key, value]) => {
            const encoded = encodeURIComponent(String(value)).replace(/%20/g, '+');
            return `${key}=${encoded}`;
        })
        .join('&');
}

/**
 * 產生藍新金流要求的唯一訂單編號 (前綴 + 時間戳 + 隨機亂碼)
 */
export function generateMerchantOrderNo(prefix = 'ORD'): string {
    const date = new Date();
    const timestamp = date.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const randomStr = crypto.randomBytes(2).toString('hex').toUpperCase();
    
    return `${prefix}${timestamp}${randomStr}`;
}

/**
 * 產生定期定額執行/中止所需的加密資料 (Periodical Update API)
 */
export function createPeriodicalUpdatePayload(orderParams: Record<string, any>, hashKey: string, hashIV: string): string {
    const dataChain = genDataChain(orderParams);
    return createMpgAesEncrypt(dataChain, hashKey, hashIV);
}
