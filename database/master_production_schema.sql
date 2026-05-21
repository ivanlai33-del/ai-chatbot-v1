-- ============================================================
-- 🚀 iVan AI-Chatbot MASTER PRODUCTION SCHEMA (v2.0)
-- Purpuse: One-stop deployment for 499/1199 SaaS Infrastructure
-- ============================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 🟢 IDENTITY ENGINE: Platform Users (Master Anchor)
CREATE TABLE IF NOT EXISTS platform_users (
    line_user_id        TEXT PRIMARY KEY,               -- LINE 永久識別碼 (U123...)
    line_user_name      TEXT,                           -- LINE 顯示名稱 (displayName)
    line_user_picture   TEXT,                           -- LINE 圖片 (pictureUrl)
    email               TEXT,                           -- 聯繫用
    plan_level          SMALLINT DEFAULT 0,             -- 0:Free, 1:499(Lite), 2:1199(Pro)
    billing_cycle       TEXT DEFAULT 'monthly',         -- monthly | yearly
    subscription_status TEXT DEFAULT 'active',          -- active | expired | trial
    last_payment_at     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 🤖 BOT ENGINE: Bots & Management
CREATE TABLE IF NOT EXISTS bots (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT,
    industry        TEXT,
    system_prompt   TEXT,
    city            TEXT,
    district        TEXT,
    plan_level      INTEGER DEFAULT 0,              -- 副本同步方案等級
    mgmt_token      UUID DEFAULT uuid_generate_v4(),-- SaaS 商家綁定令牌
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 🛡️ SECURITY ENGINE: LINE Channel Secrets (At-Rest Encryption Protected)
CREATE TABLE IF NOT EXISTS line_channel_configs (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    line_user_id         TEXT NOT NULL REFERENCES platform_users(line_user_id) ON DELETE CASCADE,
    
    channel_id           TEXT,
    channel_secret       TEXT,                          -- 儲存 AES-256 加密密文
    channel_access_token TEXT,                          -- 儲存 AES-256 加密密文
    bot_basic_id         TEXT,
    
    setup_token          TEXT UNIQUE,                   -- 書籤安全同步權杖
    status               TEXT NOT NULL DEFAULT 'pending',-- pending | active
    last_validated_at    TIMESTAMPTZ,
    
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(line_user_id)
);

-- 4. 🧠 KNOWLEDGE ENGINE: Store & Brand Intelligence
CREATE TABLE IF NOT EXISTS store_configs (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    line_user_id    TEXT NOT NULL REFERENCES platform_users(line_user_id) ON DELETE CASCADE,
    brand_dna       JSONB DEFAULT '{}'::jsonb,          -- 智庫五感屬性
    offerings       JSONB DEFAULT '[]'::jsonb,          -- 服務清單
    faq_base        JSONB DEFAULT '[]'::jsonb,          -- FAQ 資料庫
    completion_pct  SMALLINT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(line_user_id)
);

-- 5. 💰 BILLING ENGINE: Usage & Payment Tracking
CREATE TABLE IF NOT EXISTS user_usage_stats (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line_user_id     TEXT NOT NULL REFERENCES platform_users(line_user_id) ON DELETE CASCADE,
    month            TEXT NOT NULL,                     -- 格式: 2026-04
    message_count    INTEGER DEFAULT 0,
    total_tokens     INTEGER DEFAULT 0,
    last_updated     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(line_user_id, month)
);

CREATE TABLE IF NOT EXISTS payment_logs (
    id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    line_user_id         TEXT NOT NULL REFERENCES platform_users(line_user_id) ON DELETE CASCADE,
    merchant_trade_no    TEXT,                          -- 藍新金流交易編號
    amount               NUMERIC,
    status               TEXT DEFAULT 'pending',        -- pending | paid
    created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 📅 FEATURE ENGINE: Reservations & Products
CREATE TABLE IF NOT EXISTS reservations (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id           UUID REFERENCES bots(id) ON DELETE CASCADE,
    line_user_id     TEXT NOT NULL,
    user_name        TEXT,
    phone            TEXT,
    booking_time     TIMESTAMPTZ,
    status           TEXT DEFAULT 'pending',
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_id           UUID REFERENCES bots(id) ON DELETE CASCADE,
    name             TEXT NOT NULL,
    price            NUMERIC DEFAULT 0,
    purchase_url     TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ⚡️ AUTOMATION: Upsert Function
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

-- 8. 🛡️ HARDENED POLICIES: Service Role Only (Security First)
DO $$ 
BEGIN
    -- Enable RLS for all
    ALTER TABLE platform_users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
    ALTER TABLE line_channel_configs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE store_configs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_usage_stats ENABLE ROW LEVEL SECURITY;
    ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

    -- Drop & Re-create Master Policies
    DROP POLICY IF EXISTS "Service role bypass" ON platform_users;
    CREATE POLICY "Service role bypass" ON platform_users FOR ALL USING (auth.role() = 'service_role');

    DROP POLICY IF EXISTS "Service role bypass" ON line_channel_configs;
    CREATE POLICY "Service role bypass" ON line_channel_configs FOR ALL USING (auth.role() = 'service_role');

    DROP POLICY IF EXISTS "Service role bypass" ON store_configs;
    CREATE POLICY "Service role bypass" ON store_configs FOR ALL USING (auth.role() = 'service_role');

    DROP POLICY IF EXISTS "Service role bypass" ON user_usage_stats;
    CREATE POLICY "Service role bypass" ON user_usage_stats FOR ALL USING (auth.role() = 'service_role');

    DROP POLICY IF EXISTS "Service role bypass" ON payment_logs;
    CREATE POLICY "Service role bypass" ON payment_logs FOR ALL USING (auth.role() = 'service_role');
END $$;

NOTIFY pgrst, 'reload schema';
