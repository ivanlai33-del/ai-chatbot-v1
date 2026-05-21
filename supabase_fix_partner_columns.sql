-- ============================================================
-- FIX PARTNER COLUMNS MIGRATION
-- ============================================================

-- Ensure the partners table has all required billing and plan columns
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS current_plan TEXT DEFAULT 'Starter';
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'active'; -- active, past_due, canceled
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly'; -- monthly, yearly
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS company_tax_id TEXT;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS company_address TEXT;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
