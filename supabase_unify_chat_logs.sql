-- Fix Chat Logs Table for TIER-1 AI Shop Manager
-- Adds support for 'line_channel_configs' (The new SaaS Sync system)

-- 1. Add config_id column for TIER-1 bots
ALTER TABLE chat_logs ADD COLUMN IF NOT EXISTS config_id UUID REFERENCES line_channel_configs(id) ON DELETE CASCADE;

-- 2. Add is_lead column for Lead Capture identification
ALTER TABLE chat_logs ADD COLUMN IF NOT EXISTS is_lead BOOLEAN DEFAULT false;

-- 3. Relax bot_id constraint (Allow null for TIER-1 bots)
ALTER TABLE chat_logs ALTER COLUMN bot_id DROP NOT NULL;

-- 4. Unified Indexing for Memory Fetching
CREATE INDEX IF NOT EXISTS idx_chat_logs_config_id ON chat_logs(config_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_id ON chat_logs(user_id); -- Index for customer ID lookup
