-- ============================================================
-- 穩定版 LINE 智能同步 資料表結構
-- ============================================================

-- 1. 啟用 uuid-ossp（Supabase 必備，用於 uuid_generate_v4）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 建立線路設定表
CREATE TABLE IF NOT EXISTS line_channel_configs (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- 綁定 supabase 使用者 (這會確保 user_id 必須存在於 auth.users)
    user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- LINE 基本金鑰（採集前為 NULL）
    channel_id           TEXT,
    channel_secret       TEXT,
    channel_access_token TEXT,
    bot_basic_id         TEXT,

    -- 同步流程相關
    setup_token          TEXT,
    status               TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'active'
    last_validated_at    TIMESTAMPTZ,

    -- Webhook 預留欄位
    webhook_url          TEXT,
    webhook_enabled      BOOLEAN DEFAULT FALSE,
    webhook_verified_at  TIMESTAMPTZ,

    -- 時間戳
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- 一個 user 一筆設定 (用於 upsert)
    CONSTRAINT unique_user_line_config UNIQUE (user_id),

    -- 同步權杖也必須唯一
    CONSTRAINT unique_setup_token UNIQUE (setup_token)
);

-- 3. 自動更新 updated_at 觸發器
CREATE OR REPLACE FUNCTION set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_on_line_channel_configs ON line_channel_configs;

CREATE TRIGGER set_timestamp_on_line_channel_configs
BEFORE UPDATE ON line_channel_configs
FOR EACH ROW
EXECUTE FUNCTION set_timestamp();

-- 4. 啟用 RLS
ALTER TABLE line_channel_configs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policy：允許使用者管理自己的資料
DROP POLICY IF EXISTS "Users manage their own line configs" ON line_channel_configs;
CREATE POLICY "Users manage their own line configs"
ON line_channel_configs
FOR ALL
TO authenticated
USING ( auth.uid() = user_id )
WITH CHECK ( auth.uid() = user_id );

-- 讓後端 Service Role 可以完全控制 (忽略 RLS)
-- (Supabase Service Role Key 預設就會跳過 RLS，保險起見可不加或加一條給管理員)
