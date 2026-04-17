import { NextRequest, NextResponse } from 'next/server';
import { CrawlerService } from '@/lib/services/CrawlerService';

// 每頁最長執行 60 秒
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const { botId, userId, targetUrl } = await req.json();

        if (!botId || !targetUrl) {
            return NextResponse.json({ error: '缺少 botId 或 targetUrl' }, { status: 400 });
        }

        // 簡單驗證 URL 格式
        try {
            new URL(targetUrl);
        } catch (e) {
            return NextResponse.json({ error: '無效的 URL 格式' }, { status: 400 });
        }

        // 執行同步邏輯
        const result = await CrawlerService.syncUrl(botId, userId || 'admin', targetUrl);

        if (result.skipped) {
            return NextResponse.json({ 
                success: true, 
                message: '內容無變動，已跳過同步',
                docId: result.docId 
            });
        }

        return NextResponse.json({ 
            success: true, 
            message: '網頁內容同步成功',
            docId: result.docId 
        });

    } catch (err: any) {
        console.error('[Crawler API] Error:', err.message);
        return NextResponse.json({ error: err.message || '同步失敗' }, { status: 500 });
    }
}
