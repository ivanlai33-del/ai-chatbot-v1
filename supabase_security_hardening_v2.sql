-- ============================================================
-- 🛡️ SECURITY HARDENING: Comprehensive RLS Protocol (v2.1)
-- Purpose: Resolve Supabase "Table publicly accessible" warnings
-- Target: All core, SaaS, and extension tables
-- ============================================================

DO $$ 
DECLARE
    t TEXT;
    all_tables TEXT[] := ARRAY[
        'partners', 'brands', 'bots', 'chat_logs', 'products', 'orders', 
        'faq', 'appointments', 'brand_dna', 'ai_campaigns', 'owner_feedback', 
        'bot_customers', 'bot_customer_tags', 'invoice_records', 
        'line_channel_configs', 'stock_radar_members', 'ai_external_services', 
        'ai_service_tools', 'platform_users', 'token_usage', 
        'console_chat_logs', 'strategist_reports', 'enterprise_enquiries', 
        'competitor_monitors', 'competitor_analysis', 'brand_sentiment_metrics', 
        'brand_mentions', 'market_trends_reports', 'monitoring_keywords',
        'platform_visitor_logs', 'user_usage_stats', 'payment_logs', 
        'reservations', 'subscription_cancellation_reasons', 'dojo_logs'
    ];
BEGIN
    FOREACH t IN ARRAY all_tables LOOP
        -- Check if table exists before proceeding
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
            -- 1. Enable RLS (The primary security gate)
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
            
            -- 2. Add Service Role Bypass (Ensures backend APIs still work)
            EXECUTE format('DROP POLICY IF EXISTS "Service role bypass" ON public.%I', t);
            EXECUTE format('CREATE POLICY "Service role bypass" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', t);
            
            -- 3. Clear Permissive Policies
            EXECUTE format('DROP POLICY IF EXISTS "Allow public read for demo" ON public.%I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Allow public read for demo logs" ON public.%I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Allow public read for demo faq" ON public.%I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Allow public read for demo products" ON public.%I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Allow public read for demo orders" ON public.%I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Allow public read for demo appointments" ON public.%I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Allow public read for demo partners" ON public.%I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Allow public read for demo brands" ON public.%I', t);
        END IF;
    END LOOP;
END $$;

-- ============================================================
-- 🎯 CUSTOM ACCESS POLICIES: User Isolation
-- ============================================================

-- 1. Platform Users: Only the user can see their own data
-- Note: Check if platform_users exists and uses line_user_id
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'platform_users' AND column_name = 'line_user_id') THEN
        CREATE POLICY "Users can manage own profile" ON public.platform_users
            FOR ALL TO authenticated
            USING (auth.jwt()->>'line_user_id' = line_user_id)
            WITH CHECK (auth.jwt()->>'line_user_id' = line_user_id);
    END IF;
END $$;

-- 2. Line Configs: strictly isolated by User ID (Auth UUID)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'line_channel_configs') THEN
        DROP POLICY IF EXISTS "Users manage their own line configs" ON line_channel_configs;
        -- Use user_id (UUID) for Auth integration
        CREATE POLICY "Users manage their own line configs" ON public.line_channel_configs
            FOR ALL TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Knowledge Engine (FAQ, Products): Using Service Role Bypass is primary
-- Specific user-level policies depend heavily on schema version, so we rely on loop bypass for now.

-- 5. Force Schema Cache Refresh
NOTIFY pgrst, 'reload schema';
