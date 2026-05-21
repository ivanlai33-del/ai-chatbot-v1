-- ==========================================
-- AI Chatbot OS: Full Module Infrastructure
-- ==========================================

-- 1. Channel & Account Setup
CREATE TABLE IF NOT EXISTS official_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name TEXT NOT NULL,
    line_oa_id TEXT UNIQUE,
    channel_id TEXT,
    channel_secret TEXT,
    channel_token TEXT,
    webhook_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS liff_apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oa_id UUID REFERENCES official_accounts(id),
    liff_id TEXT UNIQUE,
    name TEXT,
    url TEXT,
    size TEXT CHECK (size IN ('compact', 'tall', 'full')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CRM & Tagging System
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oa_id UUID REFERENCES official_accounts(id),
    line_user_id TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    email TEXT,
    phone TEXT,
    tags JSONB DEFAULT '[]',
    source TEXT,
    status TEXT DEFAULT 'active',
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags_definition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oa_id UUID REFERENCES official_accounts(id),
    name TEXT NOT NULL,
    color TEXT DEFAULT '#06C755',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Visual Asset Hub & Brand DNA
CREATE TABLE IF NOT EXISTS brand_dna (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) UNIQUE,
    colors JSONB DEFAULT '["#06C755", "#0f172a"]',
    font_family TEXT DEFAULT 'Inter',
    ai_prompt_prefix TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visual_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oa_id UUID REFERENCES official_accounts(id),
    type TEXT CHECK (type IN ('image', 'flex', 'video', 'richmenu')),
    url TEXT,
    prompt_metadata JSONB,
    tags JSONB DEFAULT '[]',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Automation & Workflows
CREATE TABLE IF NOT EXISTS auto_reply_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oa_id UUID REFERENCES official_accounts(id),
    keyword TEXT NOT NULL,
    response_type TEXT DEFAULT 'text',
    content JSONB,
    priority INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oa_id UUID REFERENCES official_accounts(id),
    name TEXT,
    nodes JSONB,
    edges JSONB,
    trigger_event TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Broadcast & Analytics
CREATE TABLE IF NOT EXISTS broadcast_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oa_id UUID REFERENCES official_accounts(id),
    asset_id UUID REFERENCES visual_assets(id),
    target_segment JSONB,
    scheduled_at TIMESTAMPTZ,
    status TEXT DEFAULT 'waiting',
    sent_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id),
    event_type TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Enablement
ALTER TABLE official_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_dna ENABLE ROW LEVEL SECURITY;
