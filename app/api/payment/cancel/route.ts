import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getNewebPayConfig, createPeriodicalUpdatePayload, genDataChain } from '@/lib/newebpay';

/**
 * 終止定期定額訂閱 API
 * 流程：
 * 1. 驗證使用者身份
 * 2. 找出該使用者目前活躍的訂閱紀錄 (MerchantOrderNo / payment_ref)
 * 3. 呼叫藍新定期定額變更 API (Terminate)
 * 4. 更新資料庫狀態為 'canceling'
 */

export async function POST(req: NextRequest) {
    try {
        const { lineUserId, reason, feedback } = await req.json();

        if (!lineUserId) {
            return NextResponse.json({ success: false, error: 'Missing lineUserId' }, { status: 400 });
        }

        // 1. 找出使用者在系統中的 UUID 與活躍訂閱
        const { data: user, error: userError } = await supabase
            .from('direct_users')
            .select('id, plan_level')
            .eq('line_user_id', lineUserId)
            .single();

        if (userError || !user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // 2. 找出最接近到期日且狀態為 active 的訂閱紀錄
        const { data: sub, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .eq('auto_renew', true)
            .order('end_date', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (subError || !sub || !sub.payment_ref) {
            return NextResponse.json({ 
                success: false, 
                error: '未找到活躍中的定期定額訂閱，或該訂閱已由藍新後台終止。' 
            }, { status: 404 });
        }

        const config = getNewebPayConfig();

        // 3. 準備藍新定期定額變更 API 所需資料
        const postData = {
            RespondType: 'JSON',
            Version: '1.0',
            MerchantID_: config.merchantId,
            MerchantOrderNo: sub.payment_ref, // 我們在 Webhook 中存入的是當初的 MerchantOrderNo
            PeriodType: 'terminate',         // 終止授權
            TimeStamp: Math.floor(Date.now() / 1000).toString()
        };

        const encryptedData = createPeriodicalUpdatePayload(postData, config.hashKey, config.hashIV);

        // 4. 呼叫藍新 API
        const response = await fetch(config.periodicalUpdateUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                MerchantID_: config.merchantId,
                PostData_: encryptedData
            })
        });

        const resultJson = await response.json();
        console.log('[NewebPay Cancel] Response:', resultJson);

        // 藍新回傳 Status = SUCCESS 代表終止指令已接收
        if (resultJson.Status === 'SUCCESS') {
            // 5. 更新資料庫
            // A. 更新訂閱紀錄為 'canceling' (代表本期結束後不再扣款)
            await supabase
                .from('subscriptions')
                .update({ status: 'canceling', auto_renew: false })
                .eq('id', sub.id);

            // B. 在 direct_users 標記為待取消，但不立即調降 plan_level (維持使用權限至到期)
            // 這裡我們暫時維持 active，但在 UI 顯示 "將於日期結束"
            // 並記錄取消原因
            if (reason) {
                await supabase.from('subscription_cancellation_reasons').insert({
                    line_user_id: lineUserId,
                    reason,
                    feedback,
                    created_at: new Date().toISOString()
                });
            }

            return NextResponse.json({ 
                success: true, 
                message: '已成功終止自動續約，服務可使用至 ' + new Date(sub.end_date).toLocaleDateString()
            });
        } else {
            return NextResponse.json({ 
                success: false, 
                error: `藍新 API 錯誤: ${resultJson.Message || '未知錯誤'}` 
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('[Cancel API Fatal Error]:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
