import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// 產生 6 碼大寫獨特推薦碼
function generateUniqueCode(botId: string): string {
    const hash = crypto.createHash('md5').update(botId + Date.now().toString()).digest('hex').toUpperCase();
    return `SHOP-${hash.substring(0, 4)}`;
}

/**
 * GET /api/bot/[botId]/referral
 * 取得 Bot 的專屬推薦碼、連結、歷史進度與免費月份行事曆
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { botId: string } }
) {
    try {
        const { botId } = params;

        if (!botId) {
            return NextResponse.json({ error: 'Missing botId' }, { status: 400 });
        }

        // 1. 取得或自動建立推薦碼
        let { data: codeData } = await supabase
            .from('referral_codes')
            .select('*')
            .eq('bot_id', botId)
            .single();

        if (!codeData) {
            const newCode = generateUniqueCode(botId);
            const { data: inserted, error: insertErr } = await supabase
                .from('referral_codes')
                .insert({ bot_id: botId, code: newCode, clicks_count: 0 })
                .select('*')
                .single();

            if (insertErr || !inserted) {
                // 回退預設值避免阻斷 UI
                codeData = { bot_id: botId, code: `SHOP-${botId.slice(0, 4).toUpperCase()}`, clicks_count: 0 };
            } else {
                codeData = inserted;
            }
        }

        // 2. 撈取該 Bot 推薦的所有好友紀錄
        const { data: referrals } = await supabase
            .from('referrals')
            .select(`
                id,
                referee_bot_id,
                referral_code,
                plan_type,
                paid_months_count,
                status,
                reward_applied_month,
                created_at,
                referee_bot:bots!referrals_referee_bot_id_fkey(store_name, selected_plan, owner_line_id)
            `)
            .eq('referrer_bot_id', botId)
            .order('created_at', { ascending: false });

        // 若無外鍵連結退回基礎讀取
        let rawReferrals = referrals;
        if (!referrals) {
            const { data: fallback } = await supabase
                .from('referrals')
                .select('*')
                .eq('referrer_bot_id', botId)
                .order('created_at', { ascending: false });
            rawReferrals = fallback || [];
        }

        // 3. 計算免費月份行事曆
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        // 計算接下來 6 個月的動態狀態
        const timeline = [];
        for (let i = 1; i <= 6; i++) {
            const targetDate = new Date(currentYear, currentMonth - 1 + i, 1);
            const yearStr = targetDate.getFullYear();
            const monthStr = String(targetDate.getMonth() + 1).padStart(2, '0');
            const monthKey = `${yearStr}-${monthStr}`;

            // 尋找符合該月份的推薦獎勵
            const matchedRef = (rawReferrals || []).find((r: any) => r.reward_applied_month === monthKey && r.status !== 'FAILED');

            timeline.push({
                monthKey,
                year: yearStr,
                month: targetDate.getMonth() + 1,
                monthLabel: `${yearStr}/${monthStr} (第 ${i + 3} 個月)`,
                status: matchedRef
                    ? (matchedRef.status === 'REDEEMED' || matchedRef.status === 'QUALIFIED' ? 'unlocked' : 'pending')
                    : 'locked',
                refereeName: (matchedRef as any)?.referee_bot?.store_name || (matchedRef as any)?.referee_name || (matchedRef ? '推薦好友店面' : null),
                planType: matchedRef?.plan_type || 'monthly'
            });
        }

        return NextResponse.json({
            success: true,
            referralCode: codeData.code,
            clicksCount: codeData.clicks_count || 0,
            timeline,
            referrals: rawReferrals || []
        });

    } catch (err: any) {
        console.error('[Referral GET Error]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
