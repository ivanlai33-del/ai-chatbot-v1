import { createClient } from '@supabase/supabase-js';
import { CrawlerService } from './CrawlerService';
import OpenAI from 'openai';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class MarketService {
  /**
   * 執行競品對比分析
   */
  static async analyzeCompetitor(botId: string, url: string, userId: string) {
    // 1. 執行爬蟲抓取最新內容（回傳純 Markdown 字串）
    const markdown = await CrawlerService.crawlUrl(url);
    if (!markdown || markdown.length < 50) {
      throw new Error('Crawl failed: 網頁內容過少或無法存取');
    }

    // 計算內容雜湊
    const hash = crypto.createHash('sha256').update(markdown).digest('hex');

    // 2. 獲取上一次的分析記錄
    const { data: lastAnalysis } = await supabase
      .from('competitor_analysis')
      .select('*')
      .eq('bot_id', botId)
      .eq('content_hash', hash)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // 如果雜湊值一樣，表示內容沒變
    if (lastAnalysis) {
      return { 
        status: 'no_change', 
        message: '內容與上次抓取一致，無需重新分析',
        report: lastAnalysis.analysis_report 
      };
    }

    // 3. 獲取更早的一份報告作為對比（若有）
    const { data: prevRecord } = await supabase
      .from('competitor_analysis')
      .select('analysis_report')
      .eq('bot_id', botId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // 4. 使用 LLM 進行深度分析
    const prompt = `
      你是一位專業的電商經營顧問。請分析以下這份競爭對手的網頁內容，並與「上期摘要（若有）」進行對比。
      
      【本次網頁內容 (Markdown)】:
      ${markdown.substring(0, 5000)}
      
      【上期摘要】:
      ${prevRecord ? JSON.stringify(prevRecord.analysis_report) : '無'}

      請精簡地總結以下三點 (繁體中文)：
      1. 是否有新產品或服務上架？
      2. 價格是否有異動或出現新的促銷方案？
      3. 整體經營策略有哪些可疑的轉向？
      
      請以 JSON 格式回傳：
      {
        "hasChanges": boolean,
        "newProducts": string,
        "pricingUpdates": string,
        "strategicShift": string,
        "recommendation": "給老闆的一句話建議"
      }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const report = JSON.parse(response.choices[0].message.content || '{}');

    // 5. 儲存結果
    const { data: monitor } = await supabase
      .from('competitor_monitors')
      .select('id')
      .eq('bot_id', botId)
      .eq('url', url)
      .single();

    let monitorId = monitor?.id;
    if (!monitorId) {
      const { data: newMonitor } = await supabase
        .from('competitor_monitors')
        .insert({ bot_id: botId, url, brand_name: url.split('/')[2] })
        .select()
        .single();
      monitorId = newMonitor.id;
    }

    await supabase.from('competitor_analysis').insert({
      monitor_id: monitorId,
      bot_id: botId,
      analysis_report: report,
      content_hash: hash
    });

    // 更新 monitor 的最後抓取時間
    await supabase.from('competitor_monitors').update({ last_crawled_at: new Date() }).eq('id', monitorId);

    return { status: 'success', report };
  }

  /**
   * 獲取競品分析歷史報表
   */
  static async getCompetitorReports(botId: string) {
    const { data } = await supabase
      .from('competitor_analysis')
      .select(`
        *,
        competitor_monitors (
          brand_name,
          url
        )
      `)
      .eq('bot_id', botId)
      .order('created_at', { ascending: false });
    return data || [];
  }


  /**
   * 獲取產業趨勢週報
   */
  static async getTrendsReports(botId: string) {
    const { data } = await supabase
      .from('market_trends_reports')
      .select('*')
      .eq('bot_id', botId)
      .order('created_at', { ascending: false });
    return data || [];
  }

  /**
   * 獲取品牌守護者指標 (情緒、健康度、最新警報)
   */
  static async getGuardianMetrics(botId: string) {
    const { data: metrics } = await supabase
      .from('brand_sentiment_metrics')
      .select('*')
      .eq('bot_id', botId)
      .order('measured_at', { ascending: false })
      .limit(7); // 過去一周

    const { data: mentions } = await supabase
      .from('brand_mentions')
      .select('*')
      .eq('bot_id', botId)
      .order('mentioned_at', { ascending: false })
      .limit(10);

    const { data: keywords } = await supabase
      .from('monitoring_keywords')
      .select('*')
      .eq('bot_id', botId);

    return {
      metrics: metrics || [],
      mentions: mentions || [],
      keywords: keywords || []
    };
  }

  /**
   * 模擬生成趨勢報 (Demo 用，未來可串接 AI 搜尋)
   */
  static async generateDemoTrends(botId: string) {
    const demoReport = {
      summary: "本週北部餐飲市場熱度上升 15%，特別是健康輕食類別。",
      sentimentCurve: [65, 72, 68, 85, 90, 88, 92],
      topKeywords: ["Threads 流量", "低卡餐盒", "外送補貼"],
      recommendations: [
        "建議加強在 Threads 的穿搭/開箱圖文投放",
        "推出期間限定的強健身體套餐",
        "優化外送平台的評論回覆速度"
      ]
    };

    const { data } = await supabase
      .from('market_trends_reports')
      .insert({
        bot_id: botId,
        report_title: `${new Date().toLocaleDateString()} 產業趨勢週報`,
        analysis_json: demoReport,
        report_period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        report_period_end: new Date().toISOString()
      })
      .select()
      .single();

    return data;
  }

  /**
   * 模擬生成品牌護衛數據 (Demo 用)
   */
  static async generateDemoGuardianMetrics(botId: string) {
    const healthScore = Math.floor(Math.random() * 20) + 75; // 75-95
    const pos = 0.6 + Math.random() * 0.2;
    const neg = 0.05 + Math.random() * 0.1;
    const neu = 1 - pos - neg;

    // 1. 插入情緒指標
    await supabase.from('brand_sentiment_metrics').upsert({
      bot_id: botId,
      health_score: healthScore,
      positive_ratio: pos,
      neutral_ratio: neu,
      negative_ratio: neg,
      measured_at: new Date().toISOString().split('T')[0]
    });

    // 2. 插入一些模擬提及
    const demoMentions = [
      { source_platform: 'Google Maps', content: '這家店的服務真的很貼心，AI 回覆也很快！', sentiment: 'Positive', star_rating: 5, mentioned_at: new Date().toISOString() },
      { source_platform: 'Facebook', content: '看到朋友推薦這款服務，感覺很有潛力。', sentiment: 'Positive', star_rating: 4, mentioned_at: new Date(Date.now() - 86400000).toISOString() },
      { source_platform: 'Threads', content: '有人用過這家的 AI 嗎？想知道評價如何。', sentiment: 'Neutral', star_rating: 3, mentioned_at: new Date(Date.now() - 172800000).toISOString() }
    ];

    for (const m of demoMentions) {
        await supabase.from('brand_mentions').insert({
            bot_id: botId,
            source_platform: m.source_platform,
            content: m.content,
            sentiment: m.sentiment,
            star_rating: m.star_rating,
            mentioned_at: m.mentioned_at
        });
    }

    // 3. 確保有一些關鍵字
    const demoKeywords = [
        { keyword: 'AI 回覆', category: 'positive' },
        { keyword: '等待時間', category: 'negative' },
        { keyword: '價格透明', category: 'general' }
    ];

    for (const k of demoKeywords) {
        await supabase.from('monitoring_keywords').upsert({
            bot_id: botId,
            keyword: k.keyword,
            category: k.category
        });
    }

    return this.getGuardianMetrics(botId);
  }
}
