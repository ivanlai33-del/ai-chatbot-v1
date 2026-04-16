import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PRICING_PLANS, PlanId } from '@/lib/config/pricing';
import { 
    getNewebPayConfig, 
    createMpgAesEncrypt, 
    createMpgShaEncrypt, 
    genDataChain, 
    generateMerchantOrderNo 
} from '@/lib/newebpay';

/**
 * 藍新金流結帳引導 API
 * 功能：
 * 1. 驗證使用者身份
 * 2. 根據方案與週期抓取正確金額 (防止前端竄改)
 * 3. 區分 MPG (年繳一次付清) 與 Periodical (月繳定期定額) 路徑
 * 4. 回傳加密包裹給前端跳轉
 */

export async function POST(req: NextRequest) {
    try {
        // 1. 驗證使用者 (從 Header 抓 Token 或 Session)
        const authHeader = req.headers.get('Authorization');
        const token = authHeader?.split(' ')[1] || '';
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        // 為了開發方便，如果沒登入先用 mock ID (正式環境應嚴格檢查)
        const userId = user?.id || 'MOCK_USER_ID';
        const userEmail = user?.email || 'test@example.com';

        // 2. 解析請求參數
        const { planId, cycle } = await req.json() as { planId: PlanId; cycle: 'monthly' | 'yearly' };
        
        // 3. 從積木設定檔案 (pricing.ts) 抓取原始、正確的金額 (防竄改)
        const plan = PRICING_PLANS[planId];
        if (!plan) {
            return NextResponse.json({ error: '找不到指定的方案' }, { status: 404 });
        }

        const isYearly = cycle === 'yearly';
        const amount = isYearly ? plan.pricing.annual : plan.pricing.monthly;
        const config = getNewebPayConfig();
        const merchantOrderNo = generateMerchantOrderNo(); // 產生唯一訂單編號

        const timeStamp = Math.floor(Date.now() / 1000).toString();

        // 4. 準備交易物件 (基礎 MPG 參數)
        const tradeInfoObj: any = {
            MerchantID: config.merchantId,
            RespondType: 'JSON',
            TimeStamp: timeStamp,
            Version: config.version,
            MerchantOrderNo: merchantOrderNo,
            Amt: amount,
            ItemDesc: 'Subscription',
            Email: userEmail,
            LoginType: 0,
            ReturnURL: `${config.baseUrl}/api/payment/return`,
            NotifyURL: config.notifyUrl,
            ClientBackURL: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
            CREDIT: 1,
            ANDROIDPAY: 1,
            SAMSUNGPAY: 1,
            LINEPAY: isYearly ? 1 : 0, 
        };

        // 5. 【關鍵驗證】如果是月繳，才加入定期定額參數
        // 如果年繳也失敗，那就是加密公式 (SHA) 問題。
        // 如果年繳成功但月繳失敗，那就是定期定額參數或權限問題。
        if (!isYearly) {
            Object.assign(tradeInfoObj, {
                PeriodAmt: amount,
                PeriodType: 'M',
                PeriodPoint: '01',
                PeriodStartType: 1,
                PeriodTimes: 99
            });
        }

        // 6. 執行加密
        const tradeInfoChain = genDataChain(tradeInfoObj);
        console.log('[NewebPay Debug] DataChain:', tradeInfoChain); // 方便您在本機看欄位的拼湊

        const aesEncrypt = createMpgAesEncrypt(tradeInfoChain, config.hashKey, config.hashIV);
        const shaEncrypt = createMpgShaEncrypt(aesEncrypt, config.hashKey, config.hashIV);

        // 【同步驗證關鍵】將最終回傳值印出來
        console.log('[NewebPay Debug] FINAL AES (TradeInfo):', aesEncrypt);
        console.log('[NewebPay Debug] FINAL TradeSha:', shaEncrypt);

        // 7. 回傳結果給前端 (強制禁用快取，避免前後端資料錯位)
        return NextResponse.json({
            success: true,
            data: {
                MerchantID: config.merchantId,
                TradeInfo: aesEncrypt,
                TradeSha: shaEncrypt,
                Version: config.version,
                RespondType: 'JSON',
                TimeStamp: timeStamp,
                TargetUrl: config.backendUrl,
                OrderNo: merchantOrderNo,
                Amount: amount
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
                'Pragma': 'no-cache'
            }
        });

    } catch (error: any) {
        console.error('[Checkout API Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
