import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class GuardianService {
  /**
   * 執行全方位品牌聲譽掃描
   */
  static async performFullScan(botId: string) {
    console.log(`[Guardian] Starting full scan for bot: ${botId}`);
    
    // 1. 獲取監控關鍵字
    const { data: keywords } = await supabase
      .from('monitoring_keywords')
      .select('keyword')
      .eq('bot_id', botId)
      .eq('is_active', true);
    
    const keywordList = keywords?.map(k => k.keyword) || [];

    // 2. 模擬從社群平台抓取內容 (未來對接真實 API)
    // 這裡我們先模擬抓取到了幾條新提及
    const mockMentions = [
      { source: 'Threads', content: 'IVAN HQ 的 AI 店長真的很有禮貌，幫我解決了訂單問題！' },
      { source: 'Facebook', content: '最近試用了這款服務，感覺回覆速度可以在快一點。' },
      { source: 'Google Maps', content: '東西好用，但價格如果能在優惠一點就好了。' }
    ];

    const results = [];
    for (const mention of mockMentions) {
        // 3. 使用 AI 進行情緒分析
        const analysis = await this.analyzeSentiment(mention.content);
        
        // 4. 存入資料庫
        const { data } = await supabase.from('brand_mentions').insert({
            bot_id: botId,
            source_platform: mention.source,
            content: mention.content,
            sentiment: analysis.sentiment,
            star_rating: analysis.suggestedStar,
            is_alert: analysis.sentiment === 'Negative',
            mentioned_at: new Date().toISOString()
        }).select().single();
        
        if (data) results.push(data);

        // 5. 如果是負評，觸發警報邏輯 (LINE Push)
        if (analysis.sentiment === 'Negative') {
            await this.triggerAlert(botId, mention);
        }
    }

    // 6. 重新計算並更新健康指標
    await this.refreshHealthMetrics(botId);

    return { success: true, newMentions: results.length };
  }

  /**
   * 使用 AI 分析情緒與內容
   */
  static async analyzeSentiment(content: string) {
    const prompt = `分析以下使用者評論的情緒 (Positive, Neutral, Negative) 並給予 1-5 星等建議：\n\n內容：${content}`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });
    
    // 預期回傳 { "sentiment": "Positive", "suggestedStar": 5 }
    return JSON.parse(response.choices[0].message.content || '{"sentiment": "Neutral", "suggestedStar": 3}');
  }

  /**
   * 更新品牌健康指標
   */
  static async refreshHealthMetrics(botId: string) {
    const { data: mentions } = await supabase
        .from('brand_mentions')
        .select('sentiment')
        .eq('bot_id', botId)
        .order('mentioned_at', { ascending: false })
        .limit(100);

    if (!mentions || mentions.length === 0) return;

    const total = mentions.length;
    const pos = mentions.filter(m => m.sentiment === 'Positive').length;
    const neg = mentions.filter(m => m.sentiment === 'Negative').length;
    const neu = total - pos - neg;

    const healthScore = Math.round(((pos * 1 + neu * 0.5) / total) * 100);

    await supabase.from('brand_sentiment_metrics').upsert({
        bot_id: botId,
        health_score: healthScore,
        positive_ratio: pos / total,
        neutral_ratio: neu / total,
        negative_ratio: neg / total,
        measured_at: new Date().toISOString().split('T')[0]
    });
  }

  /**
   * 觸發 LINE 警報
   */
  static async triggerAlert(botId: string, mention: any) {
    console.warn(`[Guardian Alert] Critical mention detected for ${botId}: ${mention.content}`);
    // 未來串接 LINE Push API
  }
}
