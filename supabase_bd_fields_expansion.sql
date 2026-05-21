-- ============================================================
-- BD (BUSINESS DEVELOPMENT) FIELDS EXPANSION
-- ============================================================

-- Extend saas_leads with high-value BD tracking fields
ALTER TABLE public.saas_leads ADD COLUMN IF NOT EXISTS bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE;
ALTER TABLE public.saas_leads ADD COLUMN IF NOT EXISTS estimated_revenue DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.saas_leads ADD COLUMN IF NOT EXISTS probability INTEGER DEFAULT 0; -- 0 to 100
ALTER TABLE public.saas_leads ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium'; -- Low, Medium, High
ALTER TABLE public.saas_leads ADD COLUMN IF NOT EXISTS lead_source TEXT DEFAULT 'Organic'; -- LINE Ad, Web, Cold Call, Referral
ALTER TABLE public.saas_leads ADD COLUMN IF NOT EXISTS next_step TEXT;
ALTER TABLE public.saas_leads ADD COLUMN IF NOT EXISTS company_size TEXT; -- Small, Medium, Enterprise
ALTER TABLE public.saas_leads ADD COLUMN IF NOT EXISTS assigned_to UUID; -- References a specific staff/user

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_saas_leads_priority ON saas_leads(priority);
CREATE INDEX IF NOT EXISTS idx_saas_leads_status ON saas_leads(status);

-- Finalize
NOTIFY pgrst, 'reload schema';
