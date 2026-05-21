-- ==========================================
-- AI Chatbot OS: Unified Infrastructure & Module Hotfix (v4)
-- ==========================================

-- 1. Organizations & Memberships (Core)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 確保現有表具備所有欄位 (解決 CREATE TABLE IF NOT EXISTS 不會更新現有表的問題)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;

INSERT INTO organizations (id, name, tax_id, website)
VALUES ('77777777-7777-7777-7777-777777777777', '奕暢創新工作室', '12345678', 'https://aipoint.pro')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    tax_id = COALESCE(organizations.tax_id, EXCLUDED.tax_id),
    website = COALESCE(organizations.website, EXCLUDED.website);

CREATE TABLE IF NOT EXISTS official_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    name TEXT NOT NULL,
    line_oa_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 確保現有表具備所有欄位
ALTER TABLE official_accounts ADD COLUMN IF NOT EXISTS channel_id TEXT;
ALTER TABLE official_accounts ADD COLUMN IF NOT EXISTS channel_secret TEXT;
ALTER TABLE official_accounts ADD COLUMN IF NOT EXISTS channel_token TEXT;
ALTER TABLE official_accounts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 確保 line_oa_id 具備唯一約束 (解決 ON CONFLICT 報錯)
DO $$ 
BEGIN 
    -- 如果有重複資料，先清理其關聯資料 (防止外鍵衝突)
    DELETE FROM loyalty_config WHERE oa_id IN (
        SELECT id FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY line_oa_id ORDER BY created_at) as row_num FROM official_accounts WHERE line_oa_id IS NOT NULL) t WHERE t.row_num > 1
    );
    DELETE FROM workflows WHERE oa_id IN (
        SELECT id FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY line_oa_id ORDER BY created_at) as row_num FROM official_accounts WHERE line_oa_id IS NOT NULL) t WHERE t.row_num > 1
    );
    DELETE FROM coupons WHERE oa_id IN (
        SELECT id FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY line_oa_id ORDER BY created_at) as row_num FROM official_accounts WHERE line_oa_id IS NOT NULL) t WHERE t.row_num > 1
    );
    DELETE FROM support_tickets WHERE oa_id IN (
        SELECT id FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY line_oa_id ORDER BY created_at) as row_num FROM official_accounts WHERE line_oa_id IS NOT NULL) t WHERE t.row_num > 1
    );

    -- 最後清理重複的官方帳號
    DELETE FROM official_accounts 
    WHERE id IN (
        SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY line_oa_id ORDER BY created_at) as row_num
            FROM official_accounts
            WHERE line_oa_id IS NOT NULL
        ) t WHERE t.row_num > 1
    );

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name='official_accounts' AND constraint_type='UNIQUE') THEN
        ALTER TABLE official_accounts ADD CONSTRAINT official_accounts_line_oa_id_key UNIQUE (line_oa_id);
    END IF;
END $$;

INSERT INTO official_accounts (organization_id, name, line_oa_id)
VALUES ('77777777-7777-7777-7777-777777777777', '愛點科技 - 官方旗艦店', '@aipoint_shop')
ON CONFLICT (line_oa_id) DO NOTHING;

-- 2. Automation & Workflows (Journeys)
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oa_id UUID REFERENCES official_accounts(id),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 確保現有表具備所有欄位
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS nodes JSONB DEFAULT '[]';
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS edges JSONB DEFAULT '[]';
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS trigger_event TEXT DEFAULT 'manual';
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Marketing & CRM (Coupons, Loyalty, Support)
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oa_id UUID REFERENCES official_accounts(id),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 確保現有表具備所有欄位
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'discount';
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS used_count INTEGER DEFAULT 0;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT -1;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days');
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS loyalty_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oa_id UUID REFERENCES official_accounts(id),
    point_name TEXT DEFAULT '點數',
    ratio INTEGER DEFAULT 100,
    welcome_bonus INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 確保 oa_id 具備唯一約束 (解決 ON CONFLICT 報錯)
DO $$ 
BEGIN 
    -- 如果有重複資料，先清理 (只保留最舊的一筆)
    DELETE FROM loyalty_config 
    WHERE id IN (
        SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY oa_id ORDER BY updated_at) as row_num
            FROM loyalty_config
            WHERE oa_id IS NOT NULL
        ) t WHERE t.row_num > 1
    );

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name='loyalty_config' AND constraint_type='UNIQUE') THEN
        ALTER TABLE loyalty_config ADD CONSTRAINT loyalty_config_oa_id_key UNIQUE (oa_id);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oa_id UUID REFERENCES official_accounts(id),
    member_id UUID,
    subject TEXT,
    last_message TEXT,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'Medium',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS & Permissions
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- Allow all access for now (Development Mode)
    DROP POLICY IF EXISTS "Public access" ON organizations;
    CREATE POLICY "Public access" ON organizations FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Public access" ON official_accounts;
    CREATE POLICY "Public access" ON official_accounts FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Public access" ON workflows;
    CREATE POLICY "Public access" ON workflows FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Public access" ON coupons;
    CREATE POLICY "Public access" ON coupons FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Public access" ON loyalty_config;
    CREATE POLICY "Public access" ON loyalty_config FOR ALL USING (true);

    DROP POLICY IF EXISTS "Public access" ON support_tickets;
    CREATE POLICY "Public access" ON support_tickets FOR ALL USING (true);
END $$;
