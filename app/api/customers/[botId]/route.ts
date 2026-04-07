import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: { botId: string } }) {
    const { botId } = params;
    
    try {
        const { data: customers, error } = await supabase
            .from('bot_customers')
            .select(`
                id, line_user_id, display_name, profile_url, ai_summary, last_interacted_at,
                bot_customer_tags ( tag_name )
            `)
            .eq('bot_id', botId)
            .order('last_interacted_at', { ascending: false });
            
        if (error) throw error;
        
        // Transform nested tags into a flat array for the frontend
        const formatted = (customers || []).map(c => ({
            ...c,
            tags: c.bot_customer_tags ? c.bot_customer_tags.map((t: any) => t.tag_name) : []
        }));
        
        return NextResponse.json({ success: true, customers: formatted });
    } catch (err: any) {
        console.error('[API:Customers] Fetch error:', err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
