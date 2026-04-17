import { NextRequest, NextResponse } from 'next/server';
import { MarketService } from '@/lib/services/MarketService';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const botId = searchParams.get('botId');

        if (!botId) {
            return NextResponse.json({ error: 'Missing botId' }, { status: 400 });
        }

        const metrics = await MarketService.getGuardianMetrics(botId);
        
        return NextResponse.json({ success: true, data: metrics });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { botId } = await req.json();
        if (!botId) return NextResponse.json({ error: 'Missing botId' }, { status: 400 });

        const data = await MarketService.generateDemoGuardianMetrics(botId);
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
