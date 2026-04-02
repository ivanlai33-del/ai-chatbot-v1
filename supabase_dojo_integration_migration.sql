-- Migration: Integrate Manager Dojo into Knowledge Hub
-- Part 1: Add Dynamic Context support to Bots table
-- This allows the "Dojo" (LINE/Voice commands) to store short-term, transient business information.

ALTER TABLE bots ADD COLUMN IF NOT EXISTS dynamic_context TEXT DEFAULT '';
ALTER TABLE bots ADD COLUMN IF NOT EXISTS last_dojo_update TIMESTAMP WITH TIME ZONE;

-- Create a table for Dojo Training Logs to track what the boss said/sang to the AI
CREATE TABLE IF NOT EXISTS dojo_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    category TEXT, -- 'inventory', 'promo', 'persona', 'other'
    source TEXT DEFAULT 'line_voice', -- line_voice, line_text, web_voice, web_text
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE dojo_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read for dojo logs" ON dojo_logs FOR SELECT USING (true);

COMMENT ON COLUMN bots.dynamic_context IS 'Short-term memory for transient business status (e.g., stock outs, today''s special). Updated via Dojo commands.';
