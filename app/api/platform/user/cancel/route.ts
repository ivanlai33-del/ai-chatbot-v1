import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const { lineUserId, reason, feedback } = await req.json();

    if (!lineUserId) {
        return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    // Update user: set cancel_at_period_end = true
    const { error: userError } = await supabase
        .from('platform_users')
        .update({ 
            cancel_at_period_end: true,
            updated_at: new Date().toISOString()
        })
        .eq('line_user_id', lineUserId);

    if (userError) {
        return NextResponse.json({ success: false, error: userError.message }, { status: 500 });
    }

    // Save cancellation reason (Optional feedback)
    if (reason) {
        await supabase
            .from('subscription_cancellation_reasons')
            .insert({ 
                line_user_id: lineUserId, 
                reason, 
                feedback,
                created_at: new Date().toISOString()
            });
    }

    return NextResponse.json({ 
        success: true, 
        message: 'Subscription will cancel at the end of the period',
        cancelAtPeriodEnd: true
    });
}
