-- Enterprise Enquiries Table
-- Lead: Engineering
-- Purpose: Persistent storage for high-value sales leads

CREATE TABLE IF NOT EXISTS enterprise_enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  needs TEXT,
  store_name TEXT,
  plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE enterprise_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert for leads" ON enterprise_enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can see leads" ON enterprise_enquiries FOR SELECT USING (auth.role() = 'service_role');
