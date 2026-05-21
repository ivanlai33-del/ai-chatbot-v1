import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '5');

    const ADMIN_ID = "Ud8b8dd79162387a80b2b5a4aba20f604";
    if (userId !== ADMIN_ID) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { data, error } = await supabase
            .from('strategist_reports')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return NextResponse.json({ success: true, reports: data });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
