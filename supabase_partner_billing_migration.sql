-- ============================================================
-- SAAS PARTNER BILLING & SUBSCRIPTION MIGRATION
-- ============================================================

-- 1. Extend Partners Table with Plan Info
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS current_plan TEXT DEFAULT 'Starter'; -- Starter, Pro, Elite
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'active'; -- active, past_due, canceled
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly'; -- monthly, yearly
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS company_tax_id TEXT; -- 統一編號
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS company_address TEXT;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS company_phone TEXT;

-- 2. Partner Billing Records (帳單紀錄)
CREATE TABLE IF NOT EXISTS public.partner_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    plan_name TEXT NOT NULL,
    billing_period_start TIMESTAMPTZ NOT NULL,
    billing_period_end TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'paid', -- paid, pending, failed
    payment_method TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Partner Usage Meters (用量追蹤)
-- Tracks the real-time consumption against plan limits
CREATE TABLE IF NOT EXISTS public.partner_usage_meters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    month_key TEXT NOT NULL, -- e.g., '2024-04'
    events_consumed INTEGER DEFAULT 0,
    workflows_executed INTEGER DEFAULT 0,
    ai_tasks_completed INTEGER DEFAULT 0,
    UNIQUE(partner_id, month_key)
);

-- Enable RLS
ALTER TABLE public.partner_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_usage_meters ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Partners view own invoices" ON public.partner_invoices;
CREATE POLICY "Partners view own invoices" ON public.partner_invoices
    FOR SELECT TO authenticated
    USING (partner_id = (SELECT id FROM partners WHERE contact_email = auth.jwt()->>'email'));

DROP POLICY IF EXISTS "Partners view own usage" ON public.partner_usage_meters;
CREATE POLICY "Partners view own usage" ON public.partner_usage_meters
    FOR SELECT TO authenticated
    USING (partner_id = (SELECT id FROM partners WHERE contact_email = auth.jwt()->>'email'));

-- Finalize
NOTIFY pgrst, 'reload schema';
