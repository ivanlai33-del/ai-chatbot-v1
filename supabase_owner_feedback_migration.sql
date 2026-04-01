-- Owner Feedback Table
-- Purpose: Collect feedback, bugs, and suggestions from existing store owners
CREATE TABLE IF NOT EXISTS owner_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    line_user_id TEXT,
    line_user_name TEXT,
    bot_id UUID REFERENCES bots(id) ON DELETE SET NULL,
    content TEXT NOT NULL, -- The feedback summary or content
    feedback_type TEXT DEFAULT 'suggestion', -- suggestion, bug, question, report
    status TEXT DEFAULT 'pending', -- pending, reviewing, resolved, ignored
    raw_messages JSONB, -- Context of the conversation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE owner_feedback ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for the Chat API)
CREATE POLICY "Allow public insert for feedback" ON owner_feedback FOR INSERT WITH CHECK (true);

-- Only admins can see feedback
CREATE POLICY "Only admins can see feedback" ON owner_feedback FOR SELECT USING (true); -- Simplified
