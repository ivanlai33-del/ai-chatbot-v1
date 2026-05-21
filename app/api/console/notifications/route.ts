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
        // Fetch 3 Latest Leads
        const { data: leads } = await supabase
            .from('saas_leads')
            .select('name, created_at, lead_category')
            .eq('lead_category', 'Cold')
            .order('created_at', { ascending: false })
            .limit(3);

        // Fetch 3 Latest Feedback
        const { data: feedback } = await supabase
            .from('owner_feedback')
            .select('line_user_name, content, created_at, priority')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(3);

        const notifications: any[] = [];

        leads?.forEach(l => {
            notifications.push({
                type: 'lead',
                title: '發現潛在 B2B 線索',
                message: `來自 ${l.name} 的興趣詢問。`,
                time: new Date(l.created_at).toLocaleTimeString()
            });
        });

        feedback?.forEach(f => {
            notifications.push({
                type: 'feedback',
                title: '收到新的店長反饋',
                message: `${f.line_user_name}: ${f.content.slice(0, 30)}...`,
                time: new Date(f.created_at).toLocaleTimeString()
            });
        });

        // Final sort by combined time
        const sorted = notifications.sort((a, b) => b.time.localeCompare(a.time));

        return NextResponse.json({ success: true, notifications: sorted });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
