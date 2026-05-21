-- ==========================================
-- AI Chatbot OS: Comprehensive Infrastructure Hotfix
-- Resovles 404/PGRST205 errors and matches Frontend Columns
-- ==========================================

-- 1. Essential: Workflows (Journeys)
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oa_id UUID REFERENCES official_accounts(id),
    name TEXT NOT NULL,
    nodes JSONB DEFAULT '[]',
    edges JSONB DEFAULT '[]',
    trigger_event TEXT DEFAULT 'manual',
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Essential: Coupons (Marketing)
-- Updated to match frontend: used_count, stock, start_at, end_at
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oa_id UUID REFERENCES official_accounts(id),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'discount', -- 'discount', 'gift'
    description TEXT,
    used_count INTEGER DEFAULT 0,
    stock INTEGER DEFAULT -1, -- -1 for infinite
    start_at TIMESTAMPTZ DEFAULT NOW(),
    end_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Essential: Loyalty Configuration
CREATE TABLE IF NOT EXISTS loyalty_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oa_id UUID REFERENCES official_accounts(id) UNIQUE,
    point_name TEXT DEFAULT '點數',
    ratio INTEGER DEFAULT 100, -- NT$100 = 1 pt
    welcome_bonus INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Essential: Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oa_id UUID REFERENCES official_accounts(id),
    member_id UUID,
    subject TEXT,
    last_message TEXT,
    status TEXT DEFAULT 'open', -- 'open', 'closed', 'pending'
    priority TEXT DEFAULT 'Medium', -- 'Low', 'Medium', 'High'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS Enablement & Policies
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Enable all access for development" ON workflows;
    CREATE POLICY "Enable all access for development" ON workflows FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Enable all access for development" ON coupons;
    CREATE POLICY "Enable all access for development" ON coupons FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Enable all access for development" ON loyalty_config;
    CREATE POLICY "Enable all access for development" ON loyalty_config FOR ALL USING (true);

    DROP POLICY IF EXISTS "Enable all access for development" ON support_tickets;
    CREATE POLICY "Enable all access for development" ON support_tickets FOR ALL USING (true);
END $$;

-- 6. Initial Seed Data
INSERT INTO loyalty_config (oa_id, point_name, ratio)
SELECT id, '神經元點數', 100 FROM official_accounts
ON CONFLICT (oa_id) DO NOTHING;
