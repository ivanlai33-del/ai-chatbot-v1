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
        // 1. Customer Analysis: Top Engaged Users
        const { data: customerData, error: custErr } = await supabase
            .from('chat_logs')
            .select('*')
            .eq('role', 'user')
            .order('created_at', { ascending: false })
            .limit(200);

        if (custErr) throw custErr;

        // Manual aggregation
        const userCounts: Record<string, number> = {};
        customerData.forEach(log => {
            userCounts[log.user_id] = (userCounts[log.user_id] || 0) + 1;
        });

        // Get Top 5 IDs
        const topUserIds = Object.keys(userCounts).sort((a,b) => userCounts[b] - userCounts[a]).slice(0, 5);

        // Fetch Names
        const { data: users, error: namesErr } = await supabase
            .from('direct_users')
            .select('line_user_id, display_name')
            .in('line_user_id', topUserIds);

        const customers = topUserIds.map(id => ({
            line_user_id: id,
            display_name: users?.find(u => u.line_user_id === id)?.display_name || '訪客',
            msg_count: userCounts[id]
        }));

        // 2. Keyword Analysis: Common Topics
        const allText = customerData.map(log => log.content).join(' ');
        
        // Naive Keyword Extraction: split by symbols, emoji and spaces
        const words = allText.split(/[\s,\.\!\?，。！？：；（）()『』「」]+/)
            .filter(w => w.length >= 2 && !['這個', '那邊', '我們', '你們', '他們', '可以', '請問', '謝謝', '感謝', '的話', '這是', '還有', '怎麼'].includes(w));

        const wordCounts: Record<string, number> = {};
        words.forEach(w => {
            wordCounts[w] = (wordCounts[w] || 0) + 1;
        });

        const keywords = Object.keys(wordCounts)
            .sort((a,b) => wordCounts[b] - wordCounts[wordCounts[a] > wordCounts[b] ? a : b])
            .slice(0, 10)
            .map(w => ({ word: w, count: wordCounts[w] }));

        return NextResponse.json({ success: true, customers, keywords });
    } catch (e: any) {
        console.error("Analysis Fetch Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
