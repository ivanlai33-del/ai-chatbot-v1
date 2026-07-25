-- ============================================================
-- Supabase RLS Policy Relational Hardening (Final Secure Version)
-- Target: Replace always-true policies with membership-based RLS
-- ============================================================

-- 1. 刪除舊的寬鬆防禦型 "Authenticated access" 政策
DROP POLICY IF EXISTS "Authenticated access" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated access" ON public.official_accounts;
DROP POLICY IF EXISTS "Authenticated access" ON public.workflows;
DROP POLICY IF EXISTS "Authenticated access" ON public.coupons;
DROP POLICY IF EXISTS "Authenticated access" ON public.loyalty_config;
DROP POLICY IF EXISTS "Authenticated access" ON public.support_tickets;

-- 2. 確保 memberships (成員表) 已啟用 RLS，並建立安全讀寫政策
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to read their own memberships" ON public.memberships;
CREATE POLICY "Allow users to read their own memberships" ON public.memberships
    FOR SELECT
    TO authenticated
    USING (email = auth.jwt()->>'email');

DROP POLICY IF EXISTS "Allow users to manage their own memberships" ON public.memberships;
CREATE POLICY "Allow users to manage their own memberships" ON public.memberships
    FOR ALL
    TO authenticated
    USING (email = auth.jwt()->>'email')
    WITH CHECK (email = auth.jwt()->>'email');

-- 3. 建立基於 memberships 關係的限制政策

-- 3.1 public.organizations (組織表)
-- 讀寫：僅限組織成員；寫入(INSERT)：允許已登入用戶建立組織（註冊流程）
DROP POLICY IF EXISTS "Secure organizations access" ON public.organizations;
CREATE POLICY "Secure organizations access" ON public.organizations
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.memberships 
            WHERE memberships.organization_id = organizations.id 
            AND memberships.email = auth.jwt()->>'email'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.memberships 
            WHERE memberships.organization_id = organizations.id 
            AND memberships.email = auth.jwt()->>'email'
        )
    );

DROP POLICY IF EXISTS "Allow authenticated to insert organizations" ON public.organizations;
CREATE POLICY "Allow authenticated to insert organizations" ON public.organizations
    FOR INSERT
    TO authenticated
    WITH CHECK (name IS NOT NULL);

-- 3.2 public.official_accounts (官方帳號表)
-- 僅限該官方帳號所屬組織的成員讀寫
DROP POLICY IF EXISTS "Secure official_accounts access" ON public.official_accounts;
CREATE POLICY "Secure official_accounts access" ON public.official_accounts
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.memberships 
            WHERE memberships.organization_id = official_accounts.organization_id 
            AND memberships.email = auth.jwt()->>'email'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.memberships 
            WHERE memberships.organization_id = official_accounts.organization_id 
            AND memberships.email = auth.jwt()->>'email'
        )
    );

-- 3.3 public.workflows (自動化工作流)
-- 透過 oa_id 向上關聯組織，僅限成員讀寫
DROP POLICY IF EXISTS "Secure workflows access" ON public.workflows;
CREATE POLICY "Secure workflows access" ON public.workflows
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.official_accounts oa
            JOIN public.memberships m ON oa.organization_id = m.organization_id
            WHERE oa.id = workflows.oa_id 
            AND m.email = auth.jwt()->>'email'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.official_accounts oa
            JOIN public.memberships m ON oa.organization_id = m.organization_id
            WHERE oa.id = workflows.oa_id 
            AND m.email = auth.jwt()->>'email'
        )
    );

-- 3.4 public.coupons (優惠券)
DROP POLICY IF EXISTS "Secure coupons access" ON public.coupons;
CREATE POLICY "Secure coupons access" ON public.coupons
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.official_accounts oa
            JOIN public.memberships m ON oa.organization_id = m.organization_id
            WHERE oa.id = coupons.oa_id 
            AND m.email = auth.jwt()->>'email'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.official_accounts oa
            JOIN public.memberships m ON oa.organization_id = m.organization_id
            WHERE oa.id = coupons.oa_id 
            AND m.email = auth.jwt()->>'email'
        )
    );

-- 3.5 public.loyalty_config (會員點數設定)
DROP POLICY IF EXISTS "Secure loyalty_config access" ON public.loyalty_config;
CREATE POLICY "Secure loyalty_config access" ON public.loyalty_config
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.official_accounts oa
            JOIN public.memberships m ON oa.organization_id = m.organization_id
            WHERE oa.id = loyalty_config.oa_id 
            AND m.email = auth.jwt()->>'email'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.official_accounts oa
            JOIN public.memberships m ON oa.organization_id = m.organization_id
            WHERE oa.id = loyalty_config.oa_id 
            AND m.email = auth.jwt()->>'email'
        )
    );

-- 3.6 public.support_tickets (客服工單)
DROP POLICY IF EXISTS "Secure support_tickets access" ON public.support_tickets;
CREATE POLICY "Secure support_tickets access" ON public.support_tickets
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.official_accounts oa
            JOIN public.memberships m ON oa.organization_id = m.organization_id
            WHERE oa.id = support_tickets.oa_id 
            AND m.email = auth.jwt()->>'email'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.official_accounts oa
            JOIN public.memberships m ON oa.organization_id = m.organization_id
            WHERE oa.id = support_tickets.oa_id 
            AND m.email = auth.jwt()->>'email'
        )
    );

-- 4. 重新載入 API 綱要 (Schema Cache)
NOTIFY pgrst, 'reload schema';
