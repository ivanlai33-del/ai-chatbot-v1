import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper: get line_user_id from cookie
function getUserId(req: NextRequest) {
    return req.cookies.get('line_user_id')?.value || null;
}

// GET /api/member/store-config
export async function GET(req: NextRequest) {
    const lineUserId = getUserId(req);
    if (!lineUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const botId = searchParams.get('botId');

    // Find user
    const { data: user } = await supabase
        .from('direct_users')
        .select('id')
        .eq('line_user_id', lineUserId)
        .single();

    if (!user) return NextResponse.json({ config: null });

    // Multi-bot logic: if botId is provided, filter by it.
    // Otherwise, for legacy/Lite support, pick the first one.
    let query = supabase.from('store_configs').select('*');
    
    if (botId) {
        query = query.eq('bot_config_id', botId);
    } else {
        query = query.eq('user_id', user.id).limit(1);
    }

    const { data: config } = await (botId ? query.maybeSingle() : query.single());

    return NextResponse.json({ config });
}

// POST /api/member/store-config
export async function POST(req: NextRequest) {
    const lineUserId = getUserId(req);
    if (!lineUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // Find user
    const { data: user } = await supabase
        .from('direct_users')
        .select('id')
        .eq('line_user_id', lineUserId)
        .single();

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Calculate completion percentage
    const fields = [body.brand_dna?.name, body.offerings?.[0]?.name, body.faq_base?.[0]?.q, body.logic_rules, body.contact_info?.line_id];
    const filled = fields.filter(f => f && String(f).trim().length > 0).length;
    const completion_pct = Math.round((filled / fields.length) * 100);

    // Upsert store config
    // For multi-bot, we must have a bot_config_id.
    // If not provided in body, we try to find the user's first bot (Legacy).
    let targetBotId = body.botId;
    if (!targetBotId) {
        const { data: firstBot } = await supabase
            .from('line_channel_configs')
            .select('id')
            .eq('user_id', user.id)
            .limit(1)
            .single();
        targetBotId = firstBot?.id;
    }

    if (!targetBotId) {
        return NextResponse.json({ error: '未偵測到關聯的 LINE 帳號，請先前往串接頁面。' }, { status: 400 });
    }

    const { error } = await supabase
        .from('store_configs')
        .upsert({
            user_id: user.id,
            bot_config_id: targetBotId,
            brand_dna: body.brand_dna || {},
            offerings: body.offerings || [],
            faq_base: body.faq_base || [],
            logic_rules: body.logic_rules || '',
            contact_info: body.contact_info || {},
            completion_pct,
        }, { onConflict: 'bot_config_id' }); // Conflict is now on the bot slot!

    if (error) {
        console.error('[StoreConfig] Upsert Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, completion_pct, botId: targetBotId });
}
