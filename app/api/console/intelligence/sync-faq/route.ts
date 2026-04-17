import { NextRequest, NextResponse } from 'next/server';
import { CrawlerService } from '@/lib/services/CrawlerService';
import { AIService } from '@/lib/services/AIService';

export async function POST(req: NextRequest) {
    try {
        const { url, botId } = await req.json();

        if (!url) {
            return NextResponse.json({ error: '請提供網址' }, { status: 400 });
        }

        // 1. 執行爬取
        const markdown = await CrawlerService.crawlUrl(url);

        if (!markdown || markdown.length < 50) {
            return NextResponse.json({ error: '網頁內容抓取失敗或內容過少' }, { status: 400 });
        }

        // 2. AI 提取結構化資料
        const faqs = await AIService.extractStructuredData(markdown, 'faq');

        return NextResponse.json({ 
            success: true, 
            data: faqs,
            source: url
        });

    } catch (error: any) {
        console.error('[Sync FAQ Error]:', error);
        return NextResponse.json({ error: error.message || '同步失敗' }, { status: 500 });
    }
}
