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
        // Fetch last 10 pairs of user/assistant messages from chat_logs
        // We'll group them into pairs
        const { data: logs, error } = await supabase
            .from('chat_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        // Group into dialogue objects
        const feed: any[] = [];
        for (let i = 0; i < logs.length; i++) {
            if (logs[i].role === 'ai' && (i + 1 < logs.length) && logs[i + 1].role === 'user') {
                feed.push({
                    id: logs[i].id,
                    user_id: logs[i + 1].user_id,
                    user_name: logs[i + 1].user_name || `訪客 #${logs[i + 1].user_id.slice(-4)}`,
                    user_content: logs[i + 1].content,
                    ai_content: logs[i].content,
                    created_at: logs[i].created_at
                });
            }
        }

        return NextResponse.json({ success: true, feed });
    } catch (e: any) {
        console.error("Live Feed Fetch Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
