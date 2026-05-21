import { NextRequest, NextResponse } from 'next/server';
import { MarketService } from '@/lib/services/MarketService';

export async function POST(req: NextRequest) {
  try {
    const { botId, userId, competitorUrl } = await req.json();

    if (!botId || !competitorUrl) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const result = await MarketService.analyzeCompetitor(botId, competitorUrl, userId);

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Market Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get('botId');

    if (!botId) {
      return NextResponse.json({ error: 'Missing botId' }, { status: 400 });
    }

    const reports = await MarketService.getCompetitorReports(botId);

    return NextResponse.json({ success: true, reports });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
