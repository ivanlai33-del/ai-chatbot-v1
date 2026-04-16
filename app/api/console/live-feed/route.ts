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
        // 抓取最新的 50 筆訪客對話
        const { data, error } = await supabase
            .from('chat_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        // 簡單的分組與格式化邏輯
        const formattedFeed = data.map(log => ({
            id: log.id,
            store: '全站監控', // 這裡未來可以根據 bot_id 對應站台名稱
            botName: 'AI 助手',
            visitor: log.role === 'user' ? '訪客' : 'AI',
            time: new Date(log.created_at).toLocaleTimeString(),
            lastMsg: log.content,
            status: 'active',
            intent: 'general'
        }));

        return NextResponse.json({ success: true, feed: formattedFeed });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
