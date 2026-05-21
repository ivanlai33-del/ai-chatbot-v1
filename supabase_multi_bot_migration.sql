-- ============================================================
-- MULTI-BOT ARCHITECTURE MIGRATION (1:N) - FINAL CONSOLIDATED
-- ============================================================

-- 1. Upgrade line_channel_configs to support multiple bots
-- Remove the 1:1 restriction
ALTER TABLE line_channel_configs DROP CONSTRAINT IF EXISTS unique_user_line_config;
ALTER TABLE line_channel_configs DROP CONSTRAINT IF EXISTS line_channel_configs_user_id_key;

-- Add descriptive columns
ALTER TABLE line_channel_configs ADD COLUMN IF NOT EXISTS channel_name TEXT;
ALTER TABLE line_channel_configs ADD COLUMN IF NOT EXISTS channel_icon TEXT;

-- Add unique constraint for the pair (User + Specific Bot)
-- This prevents the same bot being added twice to the same user
ALTER TABLE line_channel_configs ADD CONSTRAINT unique_user_bot_pair UNIQUE (user_id, bot_basic_id);


-- 2. Upgrade store_configs to support multiple stores (one per bot)
-- Remove the 1:1 restriction on store_configs
ALTER TABLE store_configs DROP CONSTRAINT IF EXISTS store_configs_user_id_key;

-- Add bot_config_id to link knowledge to a specific bot configuration
ALTER TABLE store_configs ADD COLUMN IF NOT EXISTS bot_config_id UUID REFERENCES line_channel_configs(id) ON DELETE CASCADE;

-- Backfill: Link existing store_configs to the user's current line_channel_config
-- (Assumption: Each existing user has at most one bot config right now)
UPDATE store_configs 
SET bot_config_id = (
  SELECT id FROM line_channel_configs 
  WHERE line_channel_configs.user_id = store_configs.user_id 
  LIMIT 1
)
WHERE bot_config_id IS NULL;

-- Now add the primary constraint for stores: One bot = One knowledge base
-- This ensures each bot has exactly one set of "Big 5" configurations
ALTER TABLE store_configs ADD CONSTRAINT unique_bot_store_config UNIQUE (bot_config_id);


-- 3. Enhance RLS for the multi-bot world (Cleanup and Refresh)
DROP POLICY IF EXISTS "Users manage their own line configs" ON line_channel_configs;
CREATE POLICY "Users manage their own line configs"
ON line_channel_configs
FOR ALL
TO authenticated
USING ( auth.uid() = user_id )
WITH CHECK ( auth.uid() = user_id );

-- 4. Enable RLS on store_configs if not already
ALTER TABLE store_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage their own store configs" ON store_configs;
CREATE POLICY "Users manage their own store configs"
ON store_configs
FOR ALL
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM line_channel_configs 
    WHERE line_channel_configs.id = store_configs.bot_config_id 
    AND line_channel_configs.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM line_channel_configs 
    WHERE line_channel_configs.id = store_configs.bot_config_id 
    AND line_channel_configs.user_id = auth.uid()
  )
);
