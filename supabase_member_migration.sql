-- ============================================================
-- MEMBER BACKEND MIGRATION
-- Direct Login Users (Individual / Company)
-- Separate from SaaS Partner/Brand system
-- ============================================================

-- 1. USERS TABLE: Core member identity tied to LINE account
CREATE TABLE IF NOT EXISTS direct_users (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    line_user_id        TEXT NOT NULL UNIQUE,           -- LINE userId (永久識別)
    display_name        TEXT,                           -- LINE 顯示名稱
    avatar_url          TEXT,                           -- LINE 大頭照
    email               TEXT,                           -- 選填，用於發票/通知
    plan_level          SMALLINT NOT NULL DEFAULT 0,    -- 0=Free, 1=Lite, 2=Company
    subscription_status TEXT DEFAULT 'free',            -- free | active | past_due | canceled
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_direct_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER direct_users_updated_at
BEFORE UPDATE ON direct_users
FOR EACH ROW EXECUTE FUNCTION update_direct_users_updated_at();

-- Index for fast LINE login lookups
CREATE INDEX IF NOT EXISTS idx_direct_users_line_id ON direct_users(line_user_id);


-- ============================================================
-- 2. STORE_CONFIGS TABLE: The "Big 5" store setup data
-- Persists regardless of payment status
-- ============================================================
CREATE TABLE IF NOT EXISTS store_configs (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES direct_users(id) ON DELETE CASCADE,

    -- Big 5 Items
    brand_dna       JSONB DEFAULT '{}'::jsonb,    -- 品牌個性、名稱、語調
    offerings       JSONB DEFAULT '[]'::jsonb,    -- 核心產品與服務清單
    faq_base        JSONB DEFAULT '[]'::jsonb,    -- 知識庫 Q&A
    logic_rules     TEXT DEFAULT '',              -- AI 引導與成交規則
    contact_info    JSONB DEFAULT '{}'::jsonb,    -- 真人聯絡窗口

    -- Completion tracking
    completion_pct  SMALLINT DEFAULT 0,           -- 0-100, 資料完成度進度

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id) -- One store config per user
);

CREATE OR REPLACE FUNCTION update_store_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER store_configs_updated_at
BEFORE UPDATE ON store_configs
FOR EACH ROW EXECUTE FUNCTION update_store_configs_updated_at();


-- ============================================================
-- 3. SUBSCRIPTIONS TABLE: Full billing history
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id             UUID NOT NULL REFERENCES direct_users(id) ON DELETE CASCADE,

    -- Plan info
    plan_type           TEXT NOT NULL,          -- 'LITE' | 'COMPANY'
    billing_cycle       TEXT NOT NULL,          -- 'MONTHLY' | 'YEARLY'
    amount              DECIMAL(10,2) NOT NULL, -- 實際支付金額 (499, 5500, 1199, 11000)

    -- Status & Dates
    status              TEXT DEFAULT 'active',  -- active | expired | canceled
    start_date          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date            TIMESTAMPTZ NOT NULL,   -- 到期日

    -- Renewal info
    auto_renew          BOOLEAN DEFAULT FALSE,
    last_notified_at    TIMESTAMPTZ,            -- 防止重複通知

    -- Payment reference
    payment_ref         TEXT,                   -- 金流系統的交易 ID

    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);


-- ============================================================
-- 4. LINE_BOT_CONFIGS TABLE: LINE Channel credentials per user
-- Filled by Zero-Friction assistant
-- ============================================================
CREATE TABLE IF NOT EXISTS line_bot_configs (
    id                          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id                     UUID NOT NULL REFERENCES direct_users(id) ON DELETE CASCADE,

    channel_id                  TEXT,           -- Channel ID (數字)
    channel_secret              TEXT,           -- Channel Secret
    channel_access_token        TEXT,           -- Long-lived Access Token

    webhook_url                 TEXT,           -- 我們產生的 Webhook URL

    -- Connection status
    connection_status           TEXT DEFAULT 'pending',
    -- pending | webhook_not_verified | fully_integrated | error

    last_verified_at            TIMESTAMPTZ,    -- 最後一次 Webhook Ping 成功時間
    connected_at                TIMESTAMPTZ,    -- 初次連線成功時間

    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id)
);

CREATE OR REPLACE FUNCTION update_line_bot_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER line_bot_configs_updated_at
BEFORE UPDATE ON line_bot_configs
FOR EACH ROW EXECUTE FUNCTION update_line_bot_configs_updated_at();


-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE direct_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_bot_configs ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (server-side API)
CREATE POLICY "Service role only - direct_users" ON direct_users
    USING (auth.role() = 'service_role');
CREATE POLICY "Service role only - store_configs" ON store_configs
    USING (auth.role() = 'service_role');
CREATE POLICY "Service role only - subscriptions" ON subscriptions
    USING (auth.role() = 'service_role');
CREATE POLICY "Service role only - line_bot_configs" ON line_bot_configs
    USING (auth.role() = 'service_role');
