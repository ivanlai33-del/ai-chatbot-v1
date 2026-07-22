import { TrendCrawlerBlock } from './sub-blocks/TrendCrawlerBlock';
import { ContentGeneratorBlock } from './sub-blocks/ContentGeneratorBlock';
import { GoogleIndexSubmitBlock } from './sub-blocks/GoogleIndexSubmitBlock';
import { ThreadsPublishBlock } from './sub-blocks/ThreadsPublishBlock';
import { PerformanceTrackerBlock } from './sub-blocks/PerformanceTrackerBlock';
import { SEOGEOEngineConfig, PublishResult, SEOGEOPerformanceMetrics } from './types';

export class SEOGEOOrchestrator {
    /**
     * 執行全自動 SEO/GEO 流量引擎管線 (SOP 飛輪)
     */
    static async runFlywheelPipeline(config: SEOGEOEngineConfig): Promise<PublishResult> {
        console.log(`[SEOGEOOrchestrator] Launching flywheel pipeline for ${config.storeName} (${config.industry})...`);

        try {
            // STEP 1: 挖掘產業熱圖與關鍵字
            const trends = await TrendCrawlerBlock.mineIndustryTrends(config.industry);
            const mergedKeywords = Array.from(new Set([...config.targetKeywords, ...trends.keywords]));

            // STEP 2: 自動生成 SEO 落地頁、Threads 貼文與 GEO 語意 Schema
            const contentMatrix = await ContentGeneratorBlock.generateContentMatrix(
                config.storeName,
                config.industry,
                trends.painPoints,
                mergedKeywords,
                config.lineOAUri || 'https://bot.ycideas.com'
            );

            const pageUrl = `https://bot.ycideas.com/solutions/${contentMatrix.slug}`;

            // STEP 3: Google 索引自動提交
            let indexingSubmitted = false;
            if (config.isAutoSubmitGoogleIndex) {
                const indexRes = await GoogleIndexSubmitBlock.submitToGoogleIndex(pageUrl);
                indexingSubmitted = indexRes.success;
            }

            // STEP 4: Threads 自動排程與貼文發布
            let threadsPostId: string | undefined = undefined;
            if (config.isAutoPublishThreads && config.threadsAccessToken) {
                const threadsRes = await ThreadsPublishBlock.publishPost(
                    config.threadsAccessToken,
                    contentMatrix.threadsPostContent
                );
                if (threadsRes.success) {
                    threadsPostId = threadsRes.postId;
                }
            }

            return {
                success: true,
                slug: contentMatrix.slug,
                pageUrl,
                threadsPostId,
                indexingSubmitted
            };
        } catch (error: any) {
            console.error('[SEOGEOOrchestrator] Flywheel execution failed:', error);
            return {
                success: false,
                error: error.message || 'Orchestrator pipeline execution failed'
            };
        }
    }

    /**
     * 獲取目前店家的 SEO/GEO 成效與關鍵字排名指標
     */
    static async getDashboardMetrics(config: SEOGEOEngineConfig): Promise<SEOGEOPerformanceMetrics> {
        return PerformanceTrackerBlock.evaluateMetrics(config.botId, config.targetKeywords);
    }
}
