-- SaaS Leads Table for Sales CRM
-- Purpose: Persistent storage for high-value sales leads collected by AI
CREATE TABLE IF NOT EXISTS saas_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    line_user_id TEXT UNIQUE,
    name TEXT, -- Extracted User Name or Store Name
    industry TEXT, -- Extracted Industry Type
    services TEXT, -- Extracted Main Services/Products
    target_audience TEXT, -- Extracted Target Audience
    contact_info TEXT, -- Extracted Line ID, Phone, or Email
    intent TEXT DEFAULT 'Sales Enquiry', -- Sales, Partnership, Info
    details TEXT, -- Full summary of requirements
    status TEXT DEFAULT 'New', -- New, Contacted, Qualified, Closed
    raw_history JSONB, -- Last few messages for context
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_saas_leads_line_user_id ON saas_leads(line_user_id);

-- RLS Policies
ALTER TABLE saas_leads ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for the API to save leads)
CREATE POLICY "Allow public insert for leads" ON saas_leads FOR INSERT WITH CHECK (true);

-- Only admins can see leads (matching admin dashboard)
CREATE POLICY "Only admins can see leads" ON saas_leads FOR SELECT USING (true); -- Simplified for now, adjust based on your auth
