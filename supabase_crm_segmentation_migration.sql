-- Phase 1: CRM & Segmentation Schema (AI 店長專用分眾行銷後台)

-- 自動被 AI 建檔的顧客清單
CREATE TABLE IF NOT EXISTS bot_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id TEXT NOT NULL, -- 關聯到 line_channel_configs 的 id (對應各專屬店長)
  line_user_id TEXT NOT NULL,
  display_name TEXT,
  profile_url TEXT,
  ai_summary TEXT, -- AI 自動產生的一句話總結
  last_interacted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(bot_id, line_user_id)
);

-- 自動被 AI 貼上的標籤
CREATE TABLE IF NOT EXISTS bot_customer_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES bot_customers(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL, -- 例如 #高潛力, #近期詢問
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(customer_id, tag_name)
);

-- 加速查詢用 Index
CREATE INDEX IF NOT EXISTS idx_bot_customers_bot_id ON bot_customers(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_customers_last_interacted ON bot_customers(last_interacted_at);
CREATE INDEX IF NOT EXISTS idx_bot_customer_tags_tag_name ON bot_customer_tags(tag_name);
