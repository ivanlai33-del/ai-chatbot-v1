import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const { lineUserId, planLevel, billingCycle = 'monthly' } = await req.json();

    if (!lineUserId || planLevel === undefined) {
        return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    // Update level and cycle in platform_users
    const { error: userError } = await supabase
        .from('platform_users')
        .upsert({ 
            line_user_id: lineUserId, 
            plan_level: planLevel,
            billing_cycle: billingCycle,
            last_payment_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'line_user_id'
        });

    if (userError) {
        return NextResponse.json({ success: false, error: userError.message }, { status: 500 });
    }

    return NextResponse.json({ 
        success: true, 
        message: 'Upgrade Successful', 
        activatedLevel: planLevel,
        billingCycle 
    });
}
