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
        // 1. Get regional traffic stats (Visitor logs)
        const { data: trafficLogs } = await supabase
            .from('platform_visitor_logs')
            .select('city, district');

        // 2. Get AI Activation stats (Bots)
        const { data: botLogs } = await supabase
            .from('bots')
            .select('city, district');

        // Logic: Group by City/District
        const regionMap: Record<string, { inquiries: number, activations: number }> = {};
        
        trafficLogs?.forEach(log => {
            const key = log.city || '未知區域';
            if (!regionMap[key]) regionMap[key] = { inquiries: 0, activations: 0 };
            regionMap[key].inquiries++;
        });

        botLogs?.forEach(bot => {
            const key = bot.city || '未知區域';
            if (!regionMap[key]) regionMap[key] = { inquiries: 0, activations: 0 };
            regionMap[key].activations++;
        });

        const regions = Object.entries(regionMap).map(([name, data]) => {
            const penetration = data.inquiries > 0 ? Math.round((data.activations / data.inquiries) * 100) : 0;
            let status = 'Standard';
            if (data.inquiries > 10 && data.activations > 0) status = 'Hot';
            if (data.inquiries > 5 && data.activations === 0) status = 'Desert';
            
            return {
                name,
                inquiries: data.inquiries,
                activations: data.activations,
                penetration,
                status
            };
        }).sort((a, b) => b.inquiries - a.inquiries);

        const hotZone = regions.find(r => r.status === 'Hot')?.name || '尚無火熱戰區';
        const desertRegion = regions.find(r => r.status === 'Desert')?.name || '尚無明顯沙漠區';

        return NextResponse.json({ 
            success: true, 
            regions,
            summary: {
                hot_zone: hotZone,
                desert_region: desertRegion,
                total_inquiries: trafficLogs?.length || 0,
                penetration: Math.round((botLogs?.length || 0) / (trafficLogs?.length || 1) * 100)
            }
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
