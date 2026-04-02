import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/lib/encryption';

// Helper: get line_user_id from cookie
function getUserId(req: NextRequest) {
    return req.cookies.get('line_user_id')?.value || null;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get('botId');
    if (!botId) return NextResponse.json({ error: 'botId required' }, { status: 400 });

    // 1. Try Supabase Auth first (Primary for Dashboard)
    const { data: { user: sbUser } } = await supabase.auth.getUser();
    let userId = sbUser?.id;

    // 2. Fallback to line_user_id cookie
    if (!userId) {
        const lineUserId = req.cookies.get('line_user_id')?.value;
        if (lineUserId) {
            const { data: directUser } = await supabase
                .from('direct_users')
                .select('id')
                .eq('line_user_id', lineUserId)
                .single();
            if (directUser) userId = directUser.id;
        }
    }

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. Try Formal Config (line_channel_configs)
    let { data: config } = await supabase
        .from('line_channel_configs')
        .select('channel_id, channel_secret, channel_access_token, bot_basic_id')
        .eq('id', botId)
        .single();

    // 4. Draft Fallback (Check 'bots' table if formal is empty)
    if (!config || (!config.channel_secret && !config.channel_access_token)) {
        const { data: draft } = await supabase
            .from('bots')
            .select('line_channel_id, line_channel_secret, line_channel_access_token, bot_basic_id')
            .eq('id', botId)
            .single();
        
        if (draft) {
            config = {
                channel_id: draft.line_channel_id || '',
                // IMPORTANT: In 'bots' table, we encrypt. In 'configs', we might not yet.
                channel_secret: draft.line_channel_secret ? decrypt(draft.line_channel_secret) : draft.line_channel_secret,
                channel_access_token: draft.line_channel_access_token ? decrypt(draft.line_channel_access_token) : draft.line_channel_access_token,
                bot_basic_id: draft.bot_basic_id || ''
            };
        }
    }

    if (!config) return NextResponse.json({ error: 'Config not found' }, { status: 404 });

    // Ensure we send back exactly what the frontend expects
    return NextResponse.json({ 
        channel_id: config.channel_id || '',
        channel_secret: config.channel_secret || '',
        channel_access_token: config.channel_access_token || '',
        bot_basic_id: config.bot_basic_id || ''
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
