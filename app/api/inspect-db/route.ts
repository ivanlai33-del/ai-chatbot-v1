import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    if (req.nextUrl.searchParams.get('wipe') === 'true') {
        const { error: delErr } = await supabase.from('line_channel_configs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (delErr) return NextResponse.json({ error: delErr });
        return NextResponse.json({ success: true, message: 'All configs deleted' });
    }
    const { data, error } = await supabase.from('line_channel_configs').select('id, user_id, channel_name, setup_token, status');
    return NextResponse.json({ data, error });
}
