import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/bot/[botId]/report?token={mgmt_token}&month=YYYY-MM
 * 
 * Returns monthly analytics for a bot:
 * - Total messages (user + AI)
 * - Top 5 keywords from user messages
 * - Product mention frequency
 * 
 * Restricted to 1199 plan bots only.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { botId: string } }
) {
    try {
        const { botId } = params;
        const token = req.nextUrl.searchParams.get('token');
        const monthParam = req.nextUrl.searchParams.get('month'); // e.g. "2026-03"

        if (!token) {
            return NextResponse.json({ error: 'Missing management token' }, { status: 401 });
        }

        // 1. Auth & plan check
        const { data: bot, error: botError } = await supabase
            .from('bots')
            .select('selected_plan')
            .eq('id', botId)
            .eq('mgmt_token', token)
            .single();

        if (botError || !bot) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const plan = bot.selected_plan || '';
        const is1199 = plan.includes('1199') || plan.includes('強力');
        if (!is1199) {
            return NextResponse.json({ error: '月報分析功能僅限 1199 方案', upgrade: true }, { status: 403 });
        }

        // 2. Determine date range (default: current month)
        const now = new Date();
        const yearMonth = monthParam || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const startDate = `${yearMonth}-01T00:00:00Z`;
        const [year, month] = yearMonth.split('-').map(Number);
        const endDate = new Date(year, month, 1).toISOString();

        // 3. Fetch chat logs for the period
        const { data: logs, error: logError } = await supabase
            .from('chat_logs')
            .select('role, content, created_at')
            .eq('bot_id', botId)
            .gte('created_at', startDate)
            .lt('created_at', endDate)
            .order('created_at', { ascending: true });

        if (logError) {
            return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
        }

        const allLogs = logs || [];
        const userLogs = allLogs.filter((l: any) => l.role === 'user');
        const aiLogs = allLogs.filter((l: any) => l.role === 'ai');

        // 4. Keyword frequency (split by common separators)
        const stopWords = new Set(['的', '是', '我', '你', '有', '嗎', '了', '在', '嗯', '啊', '喔', '哦', '請問', '謝謝', '好的', '可以', '什麼', '怎麼', '這個', '那個', '一下']);
        const wordFreq: Record<string, number> = {};
        userLogs.forEach((l: any) => {
            const words = (l.content || '').split(/[\s，。！？、,!?.：:「」【】]/);
            words.forEach((w: string) => {
                const word = w.trim();
                if (word.length >= 2 && !stopWords.has(word)) {
                    wordFreq[word] = (wordFreq[word] || 0) + 1;
                }
            });
        });

        const topKeywords = Object.entries(wordFreq)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([word, count]) => ({ word, count }));

        // 5. Reservations this month (1199 only)
        const { data: reservations } = await supabase
            .from('reservations')
            .select('id, status, created_at')
            .eq('bot_id', botId)
            .gte('created_at', startDate)
            .lt('created_at', endDate);

        const reservationCount = (reservations || []).length;
        const pendingCount = (reservations || []).filter((r: any) => r.status === 'pending').length;

        // 6. Unique users
        const uniqueUsers = new Set(userLogs.map((l: any) => l.user_id)).size - 1; // -1 to exclude null if any

        return NextResponse.json({
            month: yearMonth,
            stats: {
                total_messages: allLogs.length,
                user_messages: userLogs.length,
                ai_replies: aiLogs.length,
                unique_users: Math.max(0, uniqueUsers),
                reservations_captured: reservationCount,
                reservations_pending: pendingCount,
            },
            top_keywords: topKeywords,
        });

    } catch (err: any) {
        console.error('[report] error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
