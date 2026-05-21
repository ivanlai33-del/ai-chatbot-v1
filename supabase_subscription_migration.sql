-- ==========================================
-- SUBSCRIPTION ENGINE MIGRATION
-- Purpose: Persistent plan levels tied to LINE User ID
-- ==========================================

-- 1. Create Platform Users Table (Identity anchor)
CREATE TABLE IF NOT EXISTS platform_users (
    line_user_id TEXT PRIMARY KEY,
    line_user_name TEXT,
    line_user_picture TEXT,
    plan_level INTEGER DEFAULT 0, -- 0: Free, 1: Basic (499), 2: Pro (1199)
    subscription_status TEXT DEFAULT 'active',
    last_payment_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Link existing bots to plan levels (Optional but good for fallback)
ALTER TABLE bots ADD COLUMN IF NOT EXISTS plan_level INTEGER DEFAULT 0;

-- 3. Upsert function for user login/registration
CREATE OR REPLACE FUNCTION upsert_platform_user(
    p_line_id TEXT,
    p_name TEXT,
    p_picture TEXT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO platform_users (line_user_id, line_user_name, line_user_picture)
    VALUES (p_line_id, p_name, p_picture)
    ON CONFLICT (line_user_id) DO UPDATE SET
        line_user_name = EXCLUDED.line_user_name,
        line_user_picture = EXCLUDED.line_user_picture,
        updated_at = now();
END;
$$ LANGUAGE plpgsql;
