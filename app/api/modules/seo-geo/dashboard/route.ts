import { NextResponse } from 'next/server';
import { SEOGEOOrchestrator } from '@/lib/modules/seo-geo-engine/SEOGEOOrchestrator';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const botId = searchParams.get('botId') || 'default-bot-id';
        const industry = searchParams.get('industry') || '美容美睫';
        const storeName = searchParams.get('storeName') || '我的專屬門市';

        const metrics = await SEOGEOOrchestrator.getDashboardMetrics({
            botId,
            storeName,
            industry,
            targetKeywords: [`${industry} LINE 自動預約`, `${industry} 客服`, `${industry} 24H 導購`],
            isAutoPublishThreads: true,
            isAutoSubmitGoogleIndex: true
        });

        return NextResponse.json({
            success: true,
            botId,
            industry,
            metrics,
            flywheelStatus: 'ACTIVE',
            threadsConnected: true
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
