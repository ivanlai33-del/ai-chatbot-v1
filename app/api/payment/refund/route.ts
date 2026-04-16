import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getMonthlyQuota } from '@/lib/config/pricing';

/**
 * 申請退款 API
 * 政策：
 * 1. 需在支付後 7 天 (168 小時) 內申請
 * 2. 該月對話額度使用量需低於 5%
 * 3. 採「申請制」，系統標記後由管理員手動至藍新後台退款
 */

export async function POST(req: NextRequest) {
    try {
        const { lineUserId, reason } = await req.json();

        if (!lineUserId) {
            return NextResponse.json({ success: false, error: 'Missing lineUserId' }, { status: 400 });
        }

        // 1. 取得使用者資料與當前方案
        const { data: user, error: userError } = await supabase
            .from('direct_users')
            .select('id, plan_level')
            .eq('line_user_id', lineUserId)
            .single();

        if (userError || !user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // 2. 找出最近一筆 active 的訂閱紀錄
        const { data: sub, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (subError || !sub) {
            return NextResponse.json({ success: false, error: '未找到可退款的活躍訂閱' }, { status: 404 });
        }

        // 3. 檢查條件 A：7 天內 (168 小時)
        const startTime = new Date(sub.start_date).getTime();
        const now = Date.now();
        const hoursDiff = (now - startTime) / (1000 * 60 * 60);

        if (hoursDiff > 168) {
            return NextResponse.json({ success: false, error: '已超過 7 天退款申請期限。' }, { status: 400 });
        }

        // 4. 檢查條件 B：使用量低於 5%
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data: usageData } = await supabase
            .from('user_usage_stats')
            .select('message_count')
            .eq('line_user_id', lineUserId)
            .eq('month', currentMonth)
            .maybeSingle();

        const messageCount = usageData?.message_count || 0;
        const totalQuota = getMonthlyQuota(user.plan_level);

        if (totalQuota > 0 && (messageCount / totalQuota) > 0.05) {
            return NextResponse.json({ 
                success: false, 
                error: `由於您的對話額度已使用超過 5% (${messageCount}/${totalQuota})，不符合退款條件。` 
            }, { status: 400 });
        }

        // 5. 更新狀態為 'refund_requested'
        const { error: updateError } = await supabase
            .from('subscriptions')
            .update({ 
                status: 'refund_requested',
                auto_renew: false // 申請退款同時自動停止續約
            })
            .eq('id', sub.id);

        if (updateError) throw updateError;

        // 6. 紀錄退款原因
        if (reason) {
            await supabase.from('subscription_cancellation_reasons').insert({
                line_user_id: lineUserId,
                reason: `【退款申請】${reason}`,
                created_at: new Date().toISOString()
            });
        }

        return NextResponse.json({ 
            success: true, 
            message: '退款申請已送出！管理員將在 3-5 個工作日內審核。審核期間服務將暫時維持。' 
        });

    } catch (error: any) {
        console.error('[Refund API Fatal Error]:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
