import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const viewMode = searchParams.get('viewMode') || 'personal';

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    try {
        let metricsData: any = {};

        if (viewMode === 'platform') {
            // --- 🚀 SaaS Owner Platform View ---
            // 1. REAL Revenue from active subscriptions
            const { data: subData, error: subErr } = await supabase
                .from('subscriptions')
                .select('amount')
                .eq('status', 'active');
            
            const totalRevenue = subData?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;

            // 2. Total Provisioned Bots
            const { count: botsTotal } = await supabase
                .from('line_bot_configs')
                .select('*', { count: 'exact', head: true })
                .eq('connection_status', 'fully_integrated');

            // 3. SaaS CRM Leads Collected
            const { count: leadsTotal } = await supabase
                .from('saas_leads')
                .select('*', { count: 'exact', head: true });

            metricsData = {
                revenue: `$${totalRevenue.toLocaleString()}`,
                activeBots: botsTotal || 0,
                platformLeads: leadsTotal || 0,
                apiCostRatio: '14.2%' // This would be AI usage / revenue
            };
        } else {
            // --- 🏪 Personal Shop Owner View ---
            // 1. Leads Captured
            const { count: leadsCount } = await supabase
                .from('chat_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_lead', true);

            // 2. AI Automation Count
            const { count: msgsCount } = await supabase
                .from('chat_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            // 3. Time Saved (Estimated: 3 mins per message)
            const hoursSaved = (((msgsCount || 0) * 3) / 60).toFixed(1);

            metricsData = {
                leads: leadsCount || 0,
                automation: msgsCount || 0,
                timeSaved: `${hoursSaved} 小時`,
                blindSpots: '1 筆' // This would need a smarter query for empty AI responses
            };
        }

        return NextResponse.json({ 
            success: true, 
            metrics: metricsData,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
