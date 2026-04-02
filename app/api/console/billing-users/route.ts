import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch users with plan_level > 0 (Paid members)
    const { data: users, error, count } = await supabase
        .from('platform_users')
        .select(`
            line_user_id,
            line_user_name,
            line_user_picture,
            plan_level,
            billing_cycle,
            invoice_type,
            invoice_title,
            tax_id,
            mailing_address,
            last_payment_at,
            cancel_at_period_end
        `, { count: 'exact' })
        .gt('plan_level', 0)
        .order('last_payment_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
        success: true, 
        users, 
        total: count 
    });
}
