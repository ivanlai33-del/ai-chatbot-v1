-- Bots Table: Stores bot configurations and credentials
CREATE TABLE bots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name TEXT NOT NULL,
  line_channel_secret TEXT,
  line_channel_access_token TEXT,
  openai_api_key TEXT,
  system_prompt TEXT DEFAULT '你是一個專業的 AI 客服助手。',
  selected_plan TEXT DEFAULT 'Standard',
  status TEXT DEFAULT 'active',
  mgmt_token UUID DEFAULT uuid_generate_v4(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Chat Logs Table: Stores interaction history
CREATE TABLE chat_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Line User ID
  role TEXT NOT NULL,    -- 'ai' or 'user'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Row Level Security (RLS)
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Simple Policies (Expand as needed for multi-tenant Auth)
CREATE POLICY "Allow public read for demo" ON bots FOR SELECT USING (true);
CREATE POLICY "Allow public read for demo logs" ON chat_logs FOR SELECT USING (true);
