import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * 每日計費排程 (Cron Job) API
 * 目的：篩選出欠費 (past_due) 超過 3 天的訂閱，並將其狀態變更為 suspended (停用)
 */
export async function GET(req: NextRequest) {
    try {
        // 驗證簡單的 Security Key 防止被惡意呼叫 (可搭配 Vercel Cron Secret)
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 計算 3 天前的時間
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 3);
        const cutoffIso = cutoffDate.toISOString();

        console.log(`[Cron Billing] Running subscription suspension check. Cutoff date: ${cutoffIso}`);

        // 1. 取得所有狀態為 past_due 且更新時間大於 3 天的訂閱
        const { data: pastDueSubscriptions, error: subError } = await supabase
            .from('subscriptions')
            .select('id, user_id, payment_ref, updated_at')
            .eq('status', 'past_due')
            .lte('updated_at', cutoffIso);

        if (subError) throw subError;

        console.log(`[Cron Billing] Found ${pastDueSubscriptions?.length || 0} expired past_due subscriptions.`);

        if (pastDueSubscriptions && pastDueSubscriptions.length > 0) {
            const userIdsToSuspend = pastDueSubscriptions.map(s => s.user_id);
            const subIdsToSuspend = pastDueSubscriptions.map(s => s.id);

            // 2. 將訂閱狀態設為 suspended
            const { error: updateSubErr } = await supabase
                .from('subscriptions')
                .update({ 
                    status: 'suspended',
                    updated_at: new Date().toISOString()
                })
                .in('id', subIdsToSuspend);

            if (updateSubErr) throw updateSubErr;

            // 3. 將使用者狀態設為 suspended
            const { error: updateUserErr } = await supabase
                .from('direct_users')
                .update({
                    subscription_status: 'suspended',
                    updated_at: new Date().toISOString()
                })
                .in('id', userIdsToSuspend);

            if (updateUserErr) throw updateUserErr;

            console.log(`[Cron Billing] Successfully suspended users: ${userIdsToSuspend.join(', ')}`);
        }

        // ⚡ 4. 偵測「已付款但未綁定成功」的用戶 (第五階段流失/卡關挽救機制)
        const { data: paidUsers, error: paidUsersErr } = await supabase
            .from('direct_users')
            .select('id, email, line_user_id')
            .eq('subscription_status', 'active');

        const unsyncedUsers: any[] = [];
        if (!paidUsersErr && paidUsers && paidUsers.length > 0) {
            for (const user of paidUsers) {
                const { data: botConfigs } = await supabase
                    .from('line_channel_configs')
                    .select('status')
                    .eq('user_id', user.id);

                const hasActiveBot = botConfigs && botConfigs.some((b: any) => b.status === 'active');
                if (!hasActiveBot) {
                    unsyncedUsers.push(user);
                    // 🔔 可拋出事件或寄信/發送 LINE 提醒，提醒使用者回來綁定
                    console.warn(`[Cron Billing Alert] Paid but Unsynced User Detected: ${user.id} (${user.email})`);
                }
            }
        }

        return NextResponse.json({ 
            success: true, 
            suspendedCount: pastDueSubscriptions?.length || 0,
            unsyncedAlertCount: unsyncedUsers.length,
            unsyncedUsers: unsyncedUsers.map(u => ({ id: u.id, email: u.email }))
        });

    } catch (error: any) {
        console.error('[Cron Billing Error]:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
