import { NextRequest, NextResponse } from 'next/server';
import { messagingApi } from '@line/bot-sdk';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const { channelId, channelSecret, channelAccessToken, botBasicId } = await req.json();

        // 1. Basic validation
        if (!channelId || !channelSecret || !channelAccessToken) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        // 2. Simple verify call to LINE API (e.g., check quota or profile)
        const client = new messagingApi.MessagingApiClient({
            channelAccessToken: channelAccessToken
        });

        try {
            const profile = await client.getBotInfo();
            if (!profile) throw new Error('Could not fetch bot info');
        } catch (lineErr: any) {
            console.error('LINE Verification Error:', lineErr);
            return NextResponse.json({ error: 'LINE 驗證失敗：此 Access Token 無效或已過期。' }, { status: 401 });
        }

        // 3. Save to Supabase (Mocked userId for now, should come from auth)
        // In a real app we'd get the auth.uid()
        const { data: { user } } = await supabase.auth.getUser(req.headers.get('Authorization')?.split(' ')[1] || '');
        const userId = user?.id || '00000000-0000-0000-0000-000000000001'; // Fallback for local dev

        const { error: saveErr } = await supabase
            .from('line_channel_configs')
            .upsert({
                user_id: userId,
                channel_id: channelId,
                channel_secret: channelSecret,
                channel_access_token: channelAccessToken,
                bot_basic_id: botBasicId,
                status: 'active',
                last_validated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (saveErr) {
            console.error('Supabase Save Error:', saveErr);
            return NextResponse.json({ error: '儲存至資料庫時發生錯誤。' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Verification Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
