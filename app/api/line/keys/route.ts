import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper: get line_user_id from cookie
function getUserId(req: NextRequest) {
    return req.cookies.get('line_user_id')?.value || null;
}

export async function GET(req: NextRequest) {
    const lineUserId = getUserId(req);
    if (!lineUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const botId = searchParams.get('botId');
    if (!botId) return NextResponse.json({ error: 'botId required' }, { status: 400 });

    const { data: user } = await supabase
        .from('direct_users')
        .select('id')
        .eq('line_user_id', lineUserId)
        .single();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { data: config } = await supabase
        .from('line_channel_configs')
        .select('id, channel_secret, channel_access_token')
        .eq('id', botId)
        .eq('user_id', user.id)
        .single();

    if (!config) return NextResponse.json({ error: 'Config not found' }, { status: 404 });

    return NextResponse.json({ 
        channel_secret: config.channel_secret || '',
        channel_access_token: config.channel_access_token || '' 
    });
}

export async function POST(req: NextRequest) {
    const lineUserId = getUserId(req);
    if (!lineUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { botId, channel_secret, channel_access_token } = body;

    if (!botId) return NextResponse.json({ error: 'botId required' }, { status: 400 });

    const { data: user } = await supabase
        .from('direct_users')
        .select('id')
        .eq('line_user_id', lineUserId)
        .single();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { error } = await supabase
        .from('line_channel_configs')
        .update({ channel_secret, channel_access_token, updated_at: new Date().toISOString() })
        .eq('id', botId)
        .eq('user_id', user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
