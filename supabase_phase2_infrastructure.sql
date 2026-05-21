-- 第二階段：進階營運積木基礎設施

-- 1. 優惠券中心 (Coupons)
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oa_id UUID REFERENCES official_accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'discount', -- discount, gift, shipping
    discount_value NUMERIC,
    min_spend NUMERIC DEFAULT 0,
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    stock INTEGER DEFAULT -1, -- -1 為無限
    used_count INTEGER DEFAULT 0,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 集點卡與點子點數 (Points/Loyalty)
CREATE TABLE IF NOT EXISTS loyalty_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oa_id UUID REFERENCES official_accounts(id) ON DELETE CASCADE UNIQUE,
    ratio NUMERIC DEFAULT 1, -- 1元集1點
    point_name TEXT DEFAULT '點子點',
    expire_months INTEGER DEFAULT 12,
    rules JSONB DEFAULT '[]', -- 集點規則
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 客服工單系統 (Support Tickets)
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oa_id UUID REFERENCES official_accounts(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Open', -- Open, Pending, Resolved, Closed
    priority TEXT DEFAULT 'Medium',
    assigned_to TEXT, -- 專員名稱
    subject TEXT,
    last_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 報表快照 (Report Snapshots)
CREATE TABLE IF NOT EXISTS report_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oa_id UUID REFERENCES official_accounts(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL, -- revenue, interaction, conversion
    period TEXT NOT NULL, -- daily, weekly, monthly
    data JSONB NOT NULL,
    snapshot_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 問卷系統 (已包含在 liff_apps 中，但增加 responses 表)
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    liff_app_id UUID REFERENCES liff_apps(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
