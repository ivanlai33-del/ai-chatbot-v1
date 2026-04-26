import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    const userId = 'Ud8b8dd79162387a80b2b5a4aba20f604';
    try {
        const { data: platformUser } = await supabase
            .from('platform_users')
            .select('*')
            .eq('line_user_id', userId)
            .single();

        const { data: radarMember } = await supabase
            .from('stock_radar_members')
            .select('*')
            .eq('line_user_id', userId)
            .single();

        return NextResponse.json({
            success: true,
            database_status: {
                platform_users_table: platformUser || "找不到資料",
                stock_radar_members_table: radarMember || "找不到資料"
            }
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
