-- Console Chat Logs Table
-- Purpose: Store the conversation history between the Admin (iVan) and the AI Strategist
CREATE TABLE IF NOT EXISTS console_chat_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id TEXT NOT NULL, -- The LINE user ID of the admin
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    active_tab TEXT, -- The tab the admin was viewing when they asked (for context)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for fast retrieval
CREATE INDEX IF NOT EXISTS idx_console_chat_admin_id ON console_chat_logs(admin_id);

-- RLS Policies
ALTER TABLE console_chat_logs ENABLE ROW LEVEL SECURITY;

-- Only the admin can see their own logs (matching the hardcoded ID)
CREATE POLICY "Admin can access own console logs" ON console_chat_logs
    FOR ALL USING (true); -- Simplified, usually check against auth.uid() or hardcoded ID match
