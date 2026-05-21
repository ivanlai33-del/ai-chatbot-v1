import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, campaignId, status } = body;

        const ADMIN_ID = "Ud8b8dd79162387a80b2b5a4aba20f604";
        if (userId !== ADMIN_ID) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { error } = await supabase
            .from('ai_campaigns')
            .update({ is_active: status, updated_at: new Date().toISOString() })
            .eq('id', campaignId);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
