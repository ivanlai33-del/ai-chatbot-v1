import { NextResponse } from 'next/server';
import { SEOGEOOrchestrator } from '@/lib/modules/seo-geo-engine/SEOGEOOrchestrator';

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { botId, storeName = '預設店家', industry = '美業', keywords = [] } = body;

        const result = await SEOGEOOrchestrator.runFlywheelPipeline({
            botId: botId || 'default-bot-id',
            storeName,
            industry,
            targetKeywords: keywords.length > 0 ? keywords : ['LINE 客服', '自動預約', '導購機器人'],
            isAutoPublishThreads: true,
            isAutoSubmitGoogleIndex: true,
            lineOAUri: 'https://bot.ycideas.com'
        });

        return NextResponse.json({
            success: true,
            message: 'SEO/GEO 流量飛輪管線執行完畢！',
            data: result
        });
    } catch (error: any) {
        console.error('[SEO/GEO Cron API Error]:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Cron execution failed' },
            { status: 500 }
        );
    }
}
