import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const ADMIN_ID = "Ud8b8dd79162387a80b2b5a4aba20f604";
    if (userId !== ADMIN_ID) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        // Fetch Subscriptions joined with Users
        const { data, error } = await supabase
            .from('subscriptions')
            .select(`
                *,
                direct_users!inner (
                    display_name,
                    line_user_id
                )
            `)
            .eq('status', 'active')
            .order('start_date', { ascending: false });

        if (error) throw error;

        const subscribers = data.map(s => ({
            ...s,
            display_name: s.direct_users?.display_name,
            line_user_id: s.direct_users?.line_user_id
        }));

        return NextResponse.json({ success: true, subscribers });
    } catch (e: any) {
        console.error("Billing Fetch Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
