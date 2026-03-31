-- FIX: Deploy missing tables for Sandbox Pilot
-- Lead: Engineering
-- Target: Supabase Instance

-- 1. Create FAQs table if missing
CREATE TABLE IF NOT EXISTS faq (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create Brands table if missing
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT,
  base_system_prompt TEXT,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- 4. Simple Demo Policies
CREATE POLICY "Allow public read for demo faq" ON faq FOR SELECT USING (true);
CREATE POLICY "Allow public read for demo brands" ON brands FOR SELECT USING (true);

-- SUCCESS: Database integrity restored for Pilot.
