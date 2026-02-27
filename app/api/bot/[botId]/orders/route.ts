import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    req: Request,
    { params }: { params: { botId: string } }
) {
    const { searchParams } = new URL(req.url);
    const mgmtToken = searchParams.get('token');

    if (!mgmtToken) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

    // Verify token & plan
    const { data: bot } = await supabase.from('bots').select('id, selected_plan').eq('id', params.botId).eq('mgmt_token', mgmtToken).single();
    if (!bot) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (bot.selected_plan?.includes('399')) return NextResponse.json({ error: '此方案不包含訂單管理功能，請先升級。' }, { status: 403 });

    const { data: orders } = await supabase.from('orders').select('*').eq('bot_id', params.botId).order('created_at', { ascending: false });
    return NextResponse.json({ orders: orders || [] });
}
