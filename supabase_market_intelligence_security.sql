-- ============================================================
-- 🛡️ SECURITY FIX: Market Intelligence RLS Isolation
-- Purpose: Resolve "RLS Disabled" warnings for competitor tracking tables
-- ============================================================

-- 1. competitor_monitors
ALTER TABLE public.competitor_monitors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role bypass" ON public.competitor_monitors;
CREATE POLICY "Service role bypass" ON public.competitor_monitors FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Isolated bot access" ON public.competitor_monitors;
CREATE POLICY "Isolated bot access" ON public.competitor_monitors FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM bots WHERE bots.id = competitor_monitors.bot_id AND (bots.owner_line_id = auth.jwt()->>'line_user_id' OR bots.partner_id = auth.uid()::uuid)));

-- 2. competitor_analysis
ALTER TABLE public.competitor_analysis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role bypass" ON public.competitor_analysis;
CREATE POLICY "Service role bypass" ON public.competitor_analysis FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Isolated bot access" ON public.competitor_analysis;
CREATE POLICY "Isolated bot access" ON public.competitor_analysis FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM bots WHERE bots.id = competitor_analysis.bot_id AND (bots.owner_line_id = auth.jwt()->>'line_user_id' OR bots.partner_id = auth.uid()::uuid)));

-- 3. brand_sentiment_metrics
ALTER TABLE public.brand_sentiment_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role bypass" ON public.brand_sentiment_metrics;
CREATE POLICY "Service role bypass" ON public.brand_sentiment_metrics FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Isolated bot access" ON public.brand_sentiment_metrics;
CREATE POLICY "Isolated bot access" ON public.brand_sentiment_metrics FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM bots WHERE bots.id = brand_sentiment_metrics.bot_id AND (bots.owner_line_id = auth.jwt()->>'line_user_id' OR bots.partner_id = auth.uid()::uuid)));

-- 4. brand_mentions
ALTER TABLE public.brand_mentions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role bypass" ON public.brand_mentions;
CREATE POLICY "Service role bypass" ON public.brand_mentions FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Isolated bot access" ON public.brand_mentions;
CREATE POLICY "Isolated bot access" ON public.brand_mentions FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM bots WHERE bots.id = brand_mentions.bot_id AND (bots.owner_line_id = auth.jwt()->>'line_user_id' OR bots.partner_id = auth.uid()::uuid)));

-- 5. market_trends_reports
ALTER TABLE public.market_trends_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role bypass" ON public.market_trends_reports;
CREATE POLICY "Service role bypass" ON public.market_trends_reports FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Isolated bot access" ON public.market_trends_reports;
CREATE POLICY "Isolated bot access" ON public.market_trends_reports FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM bots WHERE bots.id = market_trends_reports.bot_id AND (bots.owner_line_id = auth.jwt()->>'line_user_id' OR bots.partner_id = auth.uid()::uuid)));

-- 6. monitoring_keywords
ALTER TABLE public.monitoring_keywords ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role bypass" ON public.monitoring_keywords;
CREATE POLICY "Service role bypass" ON public.monitoring_keywords FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Isolated bot access" ON public.monitoring_keywords;
CREATE POLICY "Isolated bot access" ON public.monitoring_keywords FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM bots WHERE bots.id = monitoring_keywords.bot_id AND (bots.owner_line_id = auth.jwt()->>'line_user_id' OR bots.partner_id = auth.uid()::uuid)));

-- Finalize
NOTIFY pgrst, 'reload schema';
