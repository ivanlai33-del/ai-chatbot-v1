import { NextRequest, NextResponse } from 'next/server';
import { MarketService } from '@/lib/services/MarketService';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const botId = searchParams.get('botId');

        if (!botId) {
            return NextResponse.json({ error: 'Missing botId' }, { status: 400 });
        }

        const reports = await MarketService.getTrendsReports(botId);
        
        // 如果沒有報告，生成一個 Demo 報告
        if (reports.length === 0) {
            const demo = await MarketService.generateDemoTrends(botId);
            return NextResponse.json({ success: true, data: [demo] });
        }

        return NextResponse.json({ success: true, data: reports });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { botId } = await req.json();
        if (!botId) return NextResponse.json({ error: 'Missing botId' }, { status: 400 });

        const newReport = await MarketService.generateDemoTrends(botId);
        return NextResponse.json({ success: true, data: newReport });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
