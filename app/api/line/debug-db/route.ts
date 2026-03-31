import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * DEBUG ONLY: Lists all sync tokens regardless of user.
 */
export async function GET() {
    const { data, error } = await supabase
        .from('line_channel_configs')
        .select('id, user_id, setup_token, status, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
        msg: 'All channel configs',
        configs: data 
    });
}
