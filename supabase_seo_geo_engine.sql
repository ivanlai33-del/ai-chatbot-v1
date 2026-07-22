-- ========================================================
-- 🧱 SEO / GEO (SGO) 全自動流量積木引擎 獨立資料庫 Migration
-- 完全與既有聊天/金流隔離，保證系統解耦與資料完整性
-- ========================================================

-- 1. 產業流量飛輪設定表 (SEO/GEO Campaigns)
CREATE TABLE IF NOT EXISTS seo_geo_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    target_keywords TEXT[] DEFAULT '{}',
    is_auto_threads BOOLEAN DEFAULT true,
    is_auto_google_index BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active', -- active, paused
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 自動產出之文章與貼文資產紀錄 (SEO/GEO Generated Articles)
CREATE TABLE IF NOT EXISTS seo_geo_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES seo_geo_campaigns(id) ON DELETE CASCADE,
    industry TEXT NOT NULL,
    seo_title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    page_url TEXT NOT NULL,
    article_body_markdown TEXT,
    threads_post_content TEXT,
    threads_post_id TEXT,
    google_indexed BOOLEAN DEFAULT false,
    views_count INT DEFAULT 0,
    leads_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Google SERP 關鍵字排名記錄表 (SEO/GEO Rankings)
CREATE TABLE IF NOT EXISTS seo_geo_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    rank INT,
    page_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Meta Threads 授權與 Token 記錄表 (Threads OAuth Tokens)
CREATE TABLE IF NOT EXISTS threads_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE UNIQUE,
    threads_user_id TEXT,
    threads_username TEXT,
    access_token_encrypted TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 啟用 RLS 防護
ALTER TABLE seo_geo_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_geo_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_geo_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads_tokens ENABLE ROW LEVEL SECURITY;

-- 允許 Service Role 全權存取
CREATE POLICY "Allow Service Role full access on seo_geo_campaigns" ON seo_geo_campaigns FOR ALL USING (true);
CREATE POLICY "Allow Service Role full access on seo_geo_articles" ON seo_geo_articles FOR ALL USING (true);
CREATE POLICY "Allow Service Role full access on seo_geo_rankings" ON seo_geo_rankings FOR ALL USING (true);
CREATE POLICY "Allow Service Role full access on threads_tokens" ON threads_tokens FOR ALL USING (true);
