import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const botId = searchParams.get('state') || searchParams.get('botId') || 'default-bot';

    try {
        // 儲存連線紀錄至 Supabase `threads_tokens` 資料表
        const mockAccessToken = `th_access_token_${Date.now()}`;
        const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 天後到期

        await supabase.from('threads_tokens').upsert({
            bot_id: botId,
            threads_user_id: `user_${botId.slice(0, 8)}`,
            threads_username: `@store_${botId.slice(0, 5)}`,
            access_token_encrypted: mockAccessToken,
            expires_at: expiresAt,
            updated_at: new Date().toISOString()
        }, { onConflict: 'bot_id' });

        // 重導向回 Dashboard 並帶上 success 提示
        const dashboardUrl = new URL(`/dashboard?tab=trends&threads_connected=true`, req.url);
        return NextResponse.redirect(dashboardUrl);
    } catch (error: any) {
        console.error('[Threads Callback Error]:', error);
        const dashboardUrl = new URL(`/dashboard?tab=trends&error=${encodeURIComponent(error.message)}`, req.url);
        return NextResponse.redirect(dashboardUrl);
    }
}
