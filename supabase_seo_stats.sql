-- ============================================================
-- SEO PERFORMANCE TRACKING
-- ============================================================
CREATE TABLE IF NOT EXISTS seo_stats (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword         TEXT NOT NULL,
    clicks          INT DEFAULT 0,
    impressions     INT DEFAULT 0,
    ctr             DECIMAL(5,4),
    position        DECIMAL(5,2),
    
    device          TEXT DEFAULT 'all',  -- all | mobile | desktop
    country         TEXT DEFAULT 'twn',
    
    synced_at       TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(keyword, synced_at)
);

CREATE INDEX IF NOT EXISTS idx_seo_stats_synced ON seo_stats(synced_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_stats_keyword ON seo_stats(keyword);

-- RLS: Service role only (Backend Sync)
ALTER TABLE seo_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only - seo_stats" ON seo_stats
    USING (auth.role() = 'service_role');
