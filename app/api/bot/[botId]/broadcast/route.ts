import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/lib/encryption';
import { checkRateLimit } from '@/lib/middleware/rateLimit';

/**
 * POST /api/bot/[botId]/broadcast
 * 
 * Sends a push broadcast to all users who have chatted with this bot.
 * Restricted to 1199 강력 plan bots only.
 * Auth: ?token={mgmt_token}
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { botId: string } }
) {
    try {
        const { botId } = params;
        const token = req.nextUrl.searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Missing management token' }, { status: 401 });
        }

        // 1. Verify bot & plan
        const { data: bot, error: botError } = await supabase
            .from('bots')
            .select('*')
            .eq('id', botId)
            .eq('mgmt_token', token)
            .single();

        if (botError || !bot) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. 1199 plan gate
        const plan = bot.selected_plan || '';
        const is1199 = plan.includes('1199') || plan.includes('強力');
        if (!is1199) {
            return NextResponse.json({ error: '主動廣播功能僅限 1199 方案', upgrade: true }, { status: 403 });
        }

        // 3. Rate limit: 5 broadcasts per hour per bot
        const rl = checkRateLimit(`broadcast:${botId}`, 5, 3_600_000);
        if (!rl.allowed) {
            return NextResponse.json({ error: '每小時最多發送 5 次廣播，請稍後再試' }, { status: 429 });
        }

        // 4. Parse message
        const { message } = await req.json();
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return NextResponse.json({ error: '廣播內容不能為空' }, { status: 400 });
        }
        if (message.length > 1000) {
            return NextResponse.json({ error: '廣播內容不能超過 1000 字' }, { status: 400 });
        }

        // 5. Get all unique users who chatted with this bot
        const { data: logs, error: logError } = await supabase
            .from('chat_logs')
            .select('user_id')
            .eq('bot_id', botId)
            .not('user_id', 'is', null);

        if (logError) {
            return NextResponse.json({ error: '查詢用戶清單失敗' }, { status: 500 });
        }

        const uniqueUserIds = [...new Set((logs || []).map((l: any) => l.user_id).filter(Boolean))];

        if (uniqueUserIds.length === 0) {
            return NextResponse.json({ success: true, message: '目前尚無可廣播的用戶', sent: 0 });
        }

        // 6. Send via LINE push (use bot's own access token)
        const lineToken = decrypt(bot.line_channel_access_token);
        const chunkSize = 500;
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < uniqueUserIds.length; i += chunkSize) {
            const chunk = uniqueUserIds.slice(i, i + chunkSize);
            try {
                const res = await fetch('https://api.line.me/v2/bot/message/multicast', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${lineToken}`
                    },
                    body: JSON.stringify({
                        to: chunk,
                        messages: [{ type: 'text', text: message }]
                    })
                });
                if (res.ok) successCount += chunk.length;
                else failCount += chunk.length;
            } catch {
                failCount += chunk.length;
            }
        }

        return NextResponse.json({
            success: true,
            message: `廣播完成`,
            sent: successCount,
            failed: failCount
        });

    } catch (err: any) {
        console.error('[broadcast] error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
