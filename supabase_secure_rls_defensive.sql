-- ============================================================
-- Supabase RLS Policy Defensive Security Hotfix
-- Target: Restrict anonymous public access on 6 core business tables
-- ============================================================

-- 1. 刪除原本全開的 "Public access" 政策
DROP POLICY IF EXISTS "Public access" ON public.organizations;
DROP POLICY IF EXISTS "Public access" ON public.official_accounts;
DROP POLICY IF EXISTS "Public access" ON public.workflows;
DROP POLICY IF EXISTS "Public access" ON public.coupons;
DROP POLICY IF EXISTS "Public access" ON public.loyalty_config;
DROP POLICY IF EXISTS "Public access" ON public.support_tickets;

-- 也可以順便清理可能存在的其他名稱的開發用政策
DROP POLICY IF EXISTS "Enable all access for development" ON public.workflows;
DROP POLICY IF EXISTS "Enable all access for development" ON public.coupons;
DROP POLICY IF EXISTS "Enable all access for development" ON public.loyalty_config;
DROP POLICY IF EXISTS "Enable all access for development" ON public.support_tickets;

-- 2. 確保這些資料表均已啟用 RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- 3. 建立新的防禦型安全政策（限定 authenticated 角色，拒絕匿名 anon 角色）
CREATE POLICY "Authenticated access" ON public.organizations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated access" ON public.official_accounts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated access" ON public.workflows
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated access" ON public.coupons
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated access" ON public.loyalty_config
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated access" ON public.support_tickets
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. 重新載入 API 綱要 (Schema Cache) 以套用變更
NOTIFY pgrst, 'reload schema';
