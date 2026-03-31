-- Phase 3: LINE Official Account Integration Schema

-- 用於存放各個商家/帳號的 LINE Channel 設定
CREATE TABLE IF NOT EXISTS line_channel_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- 關聯到商家/管理者的 ID
  channel_id TEXT NOT NULL,
  channel_secret TEXT NOT NULL,
  channel_access_token TEXT NOT NULL,
   bot_basic_id TEXT, -- LINE ID (例如 @yourbot)
  webhook_url TEXT, -- 每個帳號獨有的 Webhook URL (可選)
  setup_token TEXT, -- 用於自動同步的一次性權杖
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'error'
  last_validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 為了安全性，這張表應設定 RLS，只有對應的 user_id 或管理員可以讀取
ALTER TABLE line_channel_configs ENABLE ROW LEVEL SECURITY;

-- 簡易原則：使用者只能讀取/修改自己的設定
CREATE POLICY "Users can manage their own line configs" 
ON line_channel_configs 
FOR ALL 
USING (auth.uid() = user_id);

-- 索引加速查詢
CREATE INDEX IF NOT EXISTS idx_line_channel_configs_user_id ON line_channel_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_line_channel_configs_channel_id ON line_channel_configs(channel_id);
