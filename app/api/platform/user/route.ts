import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const requestedLineId = searchParams.get('lineUserId');
    
    // 🚨 終極後門：如果是特定測試 ID，直接給最高權限，不解釋
    if (requestedLineId === 'Ud8b8dd79162387a80b2b5a4aba20f604') {
        console.log("!!! ADMIN OVERRIDE FOR Ud8b8dd79162387a80b2b5a4aba20f604 !!!");
        return NextResponse.json({
            success: true,
            user: {
                line_user_id: requestedLineId,
                plan_level: 6,
                subscription_status: 'active',
                billing_cycle: 'yearly',
                is_admin: true
            }
        });
    }

    if (!requestedLineId) {
        return NextResponse.json({ success: false, error: 'Missing LINE ID' }, { status: 400 });
    }

    const { data: user, error } = await supabase
        .from('platform_users')
        .select('*')
        .eq('line_user_id', requestedLineId)
        .single();

    return NextResponse.json({ success: true, user: user || { plan_level: 0 } });
}
