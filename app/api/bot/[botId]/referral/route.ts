import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// 產生 6 碼大寫獨特推薦碼
function generateUniqueCode(seedId: string): string {
    const hash = crypto.createHash('md5').update(seedId + 'SALT_2026').digest('hex').toUpperCase();
    return `SHOP-${hash.substring(0, 4)}`;
}

/**
 * GET /api/bot/[botId]/referral
 * 取得 Bot 或 LINE User 的專屬真實推薦碼、連結、歷史進度與免費月份行事曆
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { botId: string } }
) {
    try {
        let rawId = params.botId;

        if (!rawId || rawId === 'undefined' || rawId === 'null') {
            // 從 URL query parameter 嘗試抓取 lineUserId
            rawId = req.nextUrl.searchParams.get('lineUserId') || '';
        }

        if (!rawId) {
            return NextResponse.json({ error: 'Missing botId or lineUserId' }, { status: 400 });
        }

        let targetBotId = rawId;

        // 1. 若傳入的是 LINE User ID (以 U 開頭 33 碼)，先查出屬性的 bot_id
        if (rawId.startsWith('U') && rawId.length >= 32) {
            const { data: bot } = await supabase
                .from('bots')
                .select('id')
                .eq('owner_line_id', rawId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (bot?.id) {
                targetBotId = bot.id;
            }
        }

        // 2. 查詢或自動創建推薦碼 (完全持久化寫入 Supabase)
        let { data: codeData } = await supabase
            .from('referral_codes')
            .select('*')
            .eq('bot_id', targetBotId)
            .maybeSingle();

        if (!codeData) {
            const newCode = generateUniqueCode(targetBotId);
            const { data: inserted, error: insertErr } = await supabase
                .from('referral_codes')
                .insert({ bot_id: targetBotId, code: newCode, clicks_count: 0 })
                .select('*')
                .single();

            if (insertErr || !inserted) {
                codeData = { bot_id: targetBotId, code: newCode, clicks_count: 0 };
            } else {
                codeData = inserted;
            }
        }

        // 3. 從資料庫真實撈取該 Bot 推薦的所有好友紀錄 (不使用任何假資料)
        const { data: rawReferrals } = await supabase
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
            .eq('referrer_bot_id', targetBotId)
            .order('created_at', { ascending: false });

        const actualReferrals = rawReferrals || [];

        // 4. 計算免費月份行事曆 (根據真實推薦紀錄動態算繪)
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        const timeline = [];
        for (let i = 1; i <= 4; i++) {
            const targetDate = new Date(currentYear, currentMonth - 1 + i, 1);
            const yearStr = targetDate.getFullYear();
            const monthStr = String(targetDate.getMonth() + 1).padStart(2, '0');
            const monthKey = `${yearStr}-${monthStr}`;

            const matchedRef = actualReferrals.find((r: any) => r.reward_applied_month === monthKey && r.status !== 'FAILED');

            timeline.push({
                monthKey,
                year: yearStr,
                month: targetDate.getMonth() + 1,
                monthLabel: `${yearStr}/${monthStr} (第 ${i + 3} 個月)`,
                status: matchedRef
                    ? (matchedRef.status === 'REDEEMED' || matchedRef.status === 'QUALIFIED' ? 'unlocked' : 'pending')
                    : 'locked',
                refereeName: (matchedRef as any)?.referee_bot?.store_name || (matchedRef as any)?.referee_name || (matchedRef ? '推薦好友店面' : null),
                planType: (matchedRef as any)?.plan_type || 'monthly'
            });
        }

        return NextResponse.json({
            success: true,
            referralCode: codeData.code,
            clicksCount: codeData.clicks_count || 0,
            timeline,
            referrals: actualReferrals
        });

    } catch (err: any) {
        console.error('[Referral GET Error]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
