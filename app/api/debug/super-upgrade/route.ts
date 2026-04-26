import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    try {
        const userId = 'Ud8b8dd79162387a80b2b5a4aba20f604';
        const { data: usersBefore } = await supabase.from('platform_users').select('*');
        
        await supabase
            .from('platform_users')
            .update({ plan_level: 6, subscription_status: 'active' })
            .gt('created_at', '2020-01-01');

        await supabase
            .from('stock_radar_members')
            .update({ tier: 6, message_credits: 999999 })
            .gt('created_at', '2020-01-01');

        return NextResponse.json({
            success: true,
            message: "【全系統暴力升級 v4 啟動】",
            users: usersBefore,
            timestamp: new Date().toISOString()
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
