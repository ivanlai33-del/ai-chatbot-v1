import { CheerioCrawler } from '@crawlee/cheerio';
import TurndownService from 'turndown';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { IngestionService } from './IngestionService';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});

// 移除 Markdown 中不必要的導航與廣告連結
turndown.addRule('remove-nav', {
    filter: ['nav', 'header', 'footer', 'aside', 'script', 'style', 'iframe'],
    replacement: () => ''
});

// ── 安全護欄設定 (Guardrails) ────────────────────────
const MAX_PAGES_DEFAULT = 10;
const MAX_CHARS_PER_PAGE = 30000;
const CRAWL_TIMEOUT_MS = 15000; // 15秒超時

export class CrawlerService {
    /**
     * 同步單個網址的內容到 RAG
     * @param botId Bot ID
     * @param userId 操作者 User ID
     * @param targetUrl 目標 URL
     */
    static async syncUrl(botId: string, userId: string, targetUrl: string) {
        let fullMarkdown = '';
        let pageTitle = '';

        console.log(`[Crawler] Starting sync for ${targetUrl}`);

        const crawler = new CheerioCrawler({
            maxRequestsPerCrawl: 1, // 目前僅針對單頁，未來可擴充為多頁
            requestHandlerTimeoutSecs: CRAWL_TIMEOUT_MS / 1000,
            async requestHandler({ request, $, body }) {
                pageTitle = $('title').text().trim() || '未命名網頁';
                
                // 移除不可見元素
                $('nav, header, footer, aside, script, style, iframe, .ads, #ads').remove();
                
                const html = $('body').html() || '';
                let markdown = turndown.turndown(html);

                // 安全護欄：字數裁切
                if (markdown.length > MAX_CHARS_PER_PAGE) {
                    markdown = markdown.substring(0, MAX_CHARS_PER_PAGE) + '\n\n...(內容過長已裁切)';
                }
                
                fullMarkdown = markdown;
            },
            failedRequestHandler({ request }) {
                throw new Error(`無法存取網頁: ${request.url}`);
            }
        });

        await crawler.run([targetUrl]);

        if (!fullMarkdown || fullMarkdown.length < 50) {
            throw new Error('網頁內容過少或抓取失敗');
        }

        // 1. 計算雜湊值 (SHA-256)
        const hash = crypto.createHash('sha256').update(fullMarkdown).digest('hex');

        // 2. 檢查資料庫中是否已有相同內容且 status='ready'
        const { data: existingDoc } = await supabase
            .from('rag_documents')
            .select('id, content_hash')
            .eq('bot_id', botId)
            .eq('source_url', targetUrl)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (existingDoc && existingDoc.content_hash === hash) {
            console.log('[Crawler] Content unchanged, skipping sync.');
            return { skipped: true, docId: existingDoc.id };
        }

        // 3. 建立或更新 rag_documents 錄
        // 如果已存在舊的文件，我們會建立新版本或標記舊的為過時 (此處先簡單處理為新增)
        const { data: docRecord, error: docErr } = await supabase
            .from('rag_documents')
            .insert({
                bot_id: botId,
                user_id: userId,
                file_name: `網頁同步: ${pageTitle}`,
                file_size: fullMarkdown.length,
                file_type: 'web',
                source_url: targetUrl,
                content_hash: hash,
                status: 'processing',
                last_scraped_at: new Date().toISOString()
            })
            .select('id')
            .single();

        if (docErr || !docRecord) throw new Error(`建立文件記錄失敗: ${docErr?.message}`);

        const docId = docRecord.id;

        // 4. 委託 IngestionService 進行 AI 學習
        try {
            await IngestionService.processText(fullMarkdown, docId, botId);
            return { success: true, docId };
        } catch (err: any) {
            await supabase.from('rag_documents').update({
                status: 'error',
                error_message: err.message
            }).eq('id', docId);
            throw err;
        }
    }

    /**
     * 僅抓取網址內容並轉為 Markdown，不寫入資料庫
     */
    static async crawlUrl(targetUrl: string): Promise<string> {
        let fullMarkdown = '';
        
        const crawler = new CheerioCrawler({
            maxRequestsPerCrawl: 1,
            requestHandlerTimeoutSecs: CRAWL_TIMEOUT_MS / 1000,
            async requestHandler({ $, body }) {
                // 移除不可見元素
                $('nav, header, footer, aside, script, style, iframe, .ads, #ads').remove();
                const html = $('body').html() || '';
                let markdown = turndown.turndown(html);

                if (markdown.length > MAX_CHARS_PER_PAGE) {
                    markdown = markdown.substring(0, MAX_CHARS_PER_PAGE);
                }
                fullMarkdown = markdown;
            },
            failedRequestHandler({ request }) {
                throw new Error(`無法存取網頁: ${request.url}`);
            }
        });

        await crawler.run([targetUrl]);
        return fullMarkdown;
    }
}
