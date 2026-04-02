-- High-Scale Performance Optimization Migration
-- 1. Ensure primary search indexes exist for rapid lookups of 10k+ users
CREATE INDEX IF NOT EXISTS idx_platform_users_line_user_id ON platform_users(line_user_id);
CREATE INDEX IF NOT EXISTS idx_platform_users_plan_level ON platform_users(plan_level);
CREATE INDEX IF NOT EXISTS idx_platform_users_billing_cycle ON platform_users(billing_cycle);

-- 2. Index for the Billing/Invoice console audit trail
CREATE INDEX IF NOT EXISTS idx_invoice_records_line_user_id ON invoice_records(line_user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_records_created_at ON invoice_records(created_at);

-- 3. Add status constraint to ensure data integrity
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_plan_level') THEN
        ALTER TABLE platform_users ADD CONSTRAINT check_plan_level CHECK (plan_level >= 0 AND plan_level <= 2);
    END IF;
END $$;
