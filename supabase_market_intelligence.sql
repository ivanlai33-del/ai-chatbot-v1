-- 建立競品監控表
CREATE TABLE IF NOT EXISTS competitor_monitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    brand_name TEXT,
    last_crawled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立競品分析報告表
CREATE TABLE IF NOT EXISTS competitor_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monitor_id UUID REFERENCES competitor_monitors(id) ON DELETE CASCADE,
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    analysis_report JSONB, -- 儲存 AI 產生的分析結果
    content_hash TEXT,    -- 本次抓取的雜湊值
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- Brand Guardian & Market Pulse Schema
-- ================================================

-- 1. 品牌情緒指標表 (Brand Sentiment Metrics)
-- 用於存放每日/每週的品牌健康數值與情緒分布
CREATE TABLE IF NOT EXISTS brand_sentiment_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    health_score INTEGER DEFAULT 0, -- 0-100
    positive_ratio FLOAT DEFAULT 0.0,
    neutral_ratio FLOAT DEFAULT 0.0,
    negative_ratio FLOAT DEFAULT 0.0,
    measured_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bot_id, measured_at)
);

-- 2. 品牌警報與提及紀錄 (Brand Mentions & Alerts)
-- 儲存從 FB, Google, Threads 等抓取到的關鍵提及
CREATE TABLE IF NOT EXISTS brand_mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    source_platform TEXT, -- e.g., 'Google Maps', 'Facebook', 'Threads'
    content TEXT,
    sentiment TEXT, -- 'Positive', 'Neutral', 'Negative'
    star_rating INTEGER, -- 若有星等
    mentioned_at TIMESTAMP WITH TIME ZONE,
    is_alert BOOLEAN DEFAULT FALSE, -- 是否觸發關鍵字警報
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 產業趨勢週報 (Market Trends Reports)
-- 儲存 AI 生成的市場分析與建議
CREATE TABLE IF NOT EXISTS market_trends_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    report_title TEXT,
    analysis_json JSONB, -- 儲存趨勢詳細內容、建議策略等
    report_period_start DATE,
    report_period_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 監控關鍵字設定 (Monitoring Keywords)
CREATE TABLE IF NOT EXISTS monitoring_keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    category TEXT DEFAULT 'general', -- 'negative', 'positive', 'product'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bot_id, keyword)
);

-- 加強索引
CREATE INDEX IF NOT EXISTS idx_competitor_monitors_bot ON competitor_monitors(bot_id);
CREATE INDEX IF NOT EXISTS idx_competitor_analysis_monitor ON competitor_analysis(monitor_id);
CREATE INDEX IF NOT EXISTS idx_brand_sentiment_bot ON brand_sentiment_metrics(bot_id);
CREATE INDEX IF NOT EXISTS idx_brand_mentions_bot ON brand_mentions(bot_id);
CREATE INDEX IF NOT EXISTS idx_market_trends_bot ON market_trends_reports(bot_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_keywords_bot ON monitoring_keywords(bot_id);
