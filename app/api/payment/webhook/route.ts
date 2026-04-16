import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { decryptTradeInfo, getNewebPayConfig } from '@/lib/newebpay';
import { PRICING_PLANS } from '@/lib/config/pricing';

/**
 * 藍新金流回報 (Webhook) API
 * 功能：接收藍新後台傳來的付款結果通知，並自動開通使用者權限。
 * 
 * 官方規範：
 * 1. 藍新會以 POST 方式傳送加密資料 (TradeInfo)
 * 2. 我們負責解密、驗證、並更新資料庫
 * 3. 需回傳 "OK" 讓藍新停止重複通知
 */

export async function POST(req: NextRequest) {
    console.log('[NewebPay Webhook] Received notification');

    try {
        // 1. 取得藍新傳來的加密內容
        const formData = await req.formData();
        const tradeInfo = formData.get('TradeInfo') as string;
        const config = getNewebPayConfig();

        if (!tradeInfo) {
            return NextResponse.json({ error: 'Missing TradeInfo' }, { status: 400 });
        }

        // 2. 解密交易內容
        const result = decryptTradeInfo(tradeInfo, config.hashKey, config.hashIV);
        console.log('[NewebPay Webhook] Decrypted Data:', JSON.stringify(result));

        /**
         * 藍新成功時 Status 為 "SUCCESS"
         * 欄位包含：
         * - Status: 成功狀態
         * - MerchantOrderNo: 我們產生的訂單號
         * - Amt: 金額
         * - TradeNo: 藍新的交易序號
         * - Result.ExtenID: 我們自訂帶入的 User ID (定期定額模式)
         */
        
        if (result.Status === 'SUCCESS') {
            const data = result.Result;
            
            // 嘗試從 ExtenID (定期定額) 或自訂規則中取得 User ID
            // 注意：這裡需根據您在 Checkout API 帶入資料的規則調整
            const userId = data.ExtenID || ''; 
            const amount = data.Amt;
            const tradeNo = data.TradeNo;
            const merchantOrderNo = data.MerchantOrderNo;

            if (!userId) {
                console.error('[NewebPay Webhook] Error: UserID (ExtenID) not found in result');
                // 如果是單筆結帳 (MPG)，我們可能需要另外透過 MerchantOrderNo 去查詢暫存的訂單紀錄
                return NextResponse.json({ error: 'User mapping failed' }, { status: 400 });
            }

            // 3. 根據金額或自訂回傳值，對應方案等級 (積木化邏輯)
            // 實務上建議透過 MerchantOrderNo 關聯資料庫中的 pending_orders 紀錄更精準
            // 此處示範：根據金額反查方案
            const matchedPlan = Object.values(PRICING_PLANS).find(p => 
                p.pricing.monthly === amount || p.pricing.annual === amount
            );
            
            if (!matchedPlan) {
                console.error(`[NewebPay Webhook] Unrecognized amount: ${amount}`);
            }

            const planLevel = matchedPlan?.tier || 0;
            const cycle = (matchedPlan?.pricing.annual === amount) ? 'YEARLY' : 'MONTHLY';

            console.log(`[NewebPay Webhook] Payment Verified. User: ${userId}, Plan: ${planLevel}, Cycle: ${cycle}`);

            // 4. 更新資料庫
            // A. 更新使用者主表
            const { error: userErr } = await supabase
                .from('direct_users')
                .update({ 
                    plan_level: planLevel,
                    subscription_status: 'active',
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (userErr) throw userErr;

            // B. 寫入訂閱紀錄表 (subscriptions)
            const startDate = new Date();
            const endDate = new Date();
            if (cycle === 'YEARLY') {
                endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
                endDate.setMonth(endDate.getMonth() + 1);
            }

            const { error: subErr } = await supabase
                .from('subscriptions')
                .insert({
                    user_id: userId,
                    plan_type: matchedPlan?.id.toUpperCase() || 'UNKNOWN',
                    billing_cycle: cycle,
                    amount: amount,
                    status: 'active',
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    payment_ref: merchantOrderNo, // 儲存我們產生的訂單號，以便後續取消訂閱時使用
                    auto_renew: cycle === 'MONTHLY'
                });

            if (subErr) throw subErr;

            console.log(`[NewebPay Webhook] Database updated successfully for Order: ${merchantOrderNo}`);
        }

        // 5. 藍新規範：必須回傳 "OK" 字串 (且不能有其他 HTML 標籤)
        return new Response('OK', { status: 200 });

    } catch (error: any) {
        console.error('[NewebPay Webhook Fatal Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
