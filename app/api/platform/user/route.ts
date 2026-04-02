import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const lineUserId = searchParams.get('lineUserId');

    if (!lineUserId) {
        return NextResponse.json({ success: false, error: 'Missing LINE ID' }, { status: 400 });
    }

    const { data: user, error } = await supabase
        .from('platform_users')
        .select('*')
        .eq('line_user_id', lineUserId)
        .single();

    if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: user || { plan_level: 0 } });
}
