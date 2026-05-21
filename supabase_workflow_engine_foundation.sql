-- Workflows Table for Automation Engine
-- Purpose: Store the logic for "Trigger -> Condition -> Action" journeys
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    trigger_event TEXT NOT NULL, -- e.g., 'booking.created', 'contact.created', 'form.submitted'
    conditions JSONB DEFAULT '[]'::jsonb, -- Filter rules
    actions JSONB DEFAULT '[]'::jsonb, -- Sequence of actions to take
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_workflows_bot_trigger ON workflows(bot_id, trigger_event) WHERE is_active = true;

-- Enable RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage their workflows" 
ON workflows FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM bots 
        WHERE bots.id = workflows.bot_id 
        AND (bots.owner_line_id = auth.uid()::text OR bots.partner_id::text = auth.uid()::text)
    )
);
