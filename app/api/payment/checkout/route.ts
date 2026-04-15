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

        let tradeInfoObj: any = {};

        // 4. 根據週期決定走哪一條路徑
        if (isYearly) {
            // --- 年繳方案：走 MPG (單筆付款) ---
            tradeInfoObj = {
                MerchantID: config.merchantId,
                RespondType: 'JSON',
                TimeStamp: Math.floor(Date.now() / 1000).toString(),
                Version: config.version,
                MerchantOrderNo: merchantOrderNo,
                Amt: amount,
                ItemDesc: `${plan.name} (年繳方案)`,
                Email: userEmail,
                LoginType: 0,
                ReturnURL: config.returnUrl,
                NotifyURL: config.notifyUrl,
                ClientBackURL: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
                OrderComment: `User ID: ${userId}`,
                // 限制只能用信用卡、LINE Pay、Apple Pay 等 (視需求調整)
                CREDIT: 1,
                ANDROIDPAY: 1,
                SAMSUNGPAY: 1,
                LINEPAY: 1,
            };
        } else {
            // --- 月繳方案：走 Periodical (定期定額) ---
            // 注意：定期定額 API 與 MPG 欄位略有不同
            tradeInfoObj = {
                MerchantID_: config.merchantId,
                PostData_ : '', // 稍後會由加密組成
                RespondType: 'JSON',
                TimeStamp: Math.floor(Date.now() / 1000).toString(),
                Version: '1.0', // 定期定額 API 版本通常固定為 1.0
                MerchantOrderNo: merchantOrderNo,
                PeriodAmt: amount,              // 每期扣款金額
                PeriodType: 'M',                // M: 月, W: 週, Y: 年
                PeriodPoint: '01',              // 每月 1 號扣款 (可自訂)
                PeriodStartType: 1,             // 1: 立即扣第一期
                PeriodTimes: 99,                // 扣款次數 (99 代表直到取消)
                ReturnURL: config.returnUrl,
                PType: 'CREDIT',                // 定期定額強制使用信用卡
                NotifyURL: config.notifyUrl,
                ExtenID: userId,                // 存放 User ID 方便回傳對應
                Email: userEmail,
                ItemDesc: `${plan.name} (月繳訂閱)`,
            };
            
            // 定期定額的加密邏輯稍微不同，這裡是先準備資料
            // 實務上藍新定期定額是以另一套 API 接收，
            // 這裡我們先回傳讓前端能組裝表單即可。
        }

        // 5. 執行加密
        const tradeInfoChain = genDataChain(tradeInfoObj);
        const aesEncrypt = createMpgAesEncrypt(tradeInfoChain, config.hashKey, config.hashIV);
        const shaEncrypt = createMpgShaEncrypt(aesEncrypt, config.hashKey, config.hashIV);

        // 6. 回傳結果給前端
        return NextResponse.json({
            success: true,
            data: {
                MerchantID: config.merchantId,
                TradeInfo: aesEncrypt,
                TradeSha: shaEncrypt,
                Version: isYearly ? config.version : '1.0',
                TargetUrl: isYearly ? config.backendUrl : (config.backendUrl.includes('ccore') ? 'https://ccore.newebpay.com/MPG/period' : 'https://core.newebpay.com/MPG/period'), // 自動判斷測試/正式定期定額網址
                OrderNo: merchantOrderNo,
                Amount: amount
            }
        });

    } catch (error: any) {
        console.error('[Checkout API Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
