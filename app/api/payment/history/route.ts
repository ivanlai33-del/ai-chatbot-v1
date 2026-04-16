import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PRICING_PLANS } from '@/lib/config/pricing';

/**
 * 取得訂閱歷史紀錄 API
 */

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const lineUserId = searchParams.get('lineUserId');

        if (!lineUserId) {
            return NextResponse.json({ success: false, error: 'Missing lineUserId' }, { status: 400 });
        }

        // 1. 取得使用者 UUID
        const { data: user, error: userError } = await supabase
            .from('direct_users')
            .select('id')
            .eq('line_user_id', lineUserId)
            .single();

        if (userError || !user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // 2. 抓取該使用者的所有訂閱紀錄
        const { data: history, error: historyError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (historyError) throw historyError;

        // 3. 處理與翻譯方案名稱
        const formattedHistory = history.map(item => {
            const planId = item.plan_type.toLowerCase();
            // @ts-ignore
            const plan = PRICING_PLANS[planId];
            
            return {
                id: item.id,
                orderNo: item.payment_ref || '---',
                planName: plan?.name || item.plan_type,
                date: new Date(item.created_at).toISOString().split('T')[0],
                amount: Number(item.amount),
                status: item.status, // active | canceled | canceling | refund_requested | expired
                billingCycle: item.billing_cycle === 'YEARLY' ? '年繳' : '月繳'
            };
        });

        return NextResponse.json({ success: true, history: formattedHistory });

    } catch (error: any) {
        console.error('[History API Fatal Error]:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
