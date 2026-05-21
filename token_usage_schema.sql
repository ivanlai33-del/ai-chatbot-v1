-- Token Usage Tracking Table
-- Lead: Data Persona

CREATE TABLE IF NOT EXISTS token_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID REFERENCES bots(id) ON DELETE SET NULL,
  is_master BOOLEAN DEFAULT false,
  model TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  cost_usd DECIMAL(12,6) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexing for ROI reports
CREATE INDEX idx_token_usage_bot ON token_usage(bot_id);
CREATE INDEX idx_token_usage_master ON token_usage(is_master);

-- Enable RLS
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bot owners can see usage" ON token_usage FOR SELECT USING (true);
