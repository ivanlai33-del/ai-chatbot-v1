-- ==========================================
-- MASTER CONSOLE MIGRATION (iVan HQ) - v1.2 FIX
-- Purpose: Corrects missing 'owner_feedback' dependency
-- ==========================================

-- 0. Core Table Dependencies
CREATE TABLE IF NOT EXISTS owner_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    line_user_id TEXT,
    line_user_name TEXT,
    bot_id UUID,
    content TEXT NOT NULL,
    feedback_type TEXT DEFAULT 'report',
    status TEXT DEFAULT 'pending',
    raw_messages JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1. Strategist Reports (Daily Digest)
CREATE TABLE IF NOT EXISTS strategist_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id TEXT NOT NULL,
    summary TEXT,
    content JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Revenue Engine (AI Campaigns)
CREATE TABLE IF NOT EXISTS ai_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id TEXT NOT NULL,
    campaign_name TEXT NOT NULL,
    trigger_keyword TEXT NOT NULL,
    promotion_script TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Enhanced Owner Feedback (Triage System)
ALTER TABLE owner_feedback ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE owner_feedback ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 3;
ALTER TABLE owner_feedback ADD COLUMN IF NOT EXISTS smart_suggestion TEXT;
ALTER TABLE owner_feedback ADD COLUMN IF NOT EXISTS impact_score INTEGER DEFAULT 0;

-- 4. Market Intelligence (Visitor Logs)
CREATE TABLE IF NOT EXISTS platform_visitor_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip TEXT NOT NULL,
    city TEXT,
    district TEXT,
    isp TEXT,
    referer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Geographic Awareness for Bots
-- Ensure bots exists or create a stub if missing (adjust as needed if bots is a core table elsewhere)
CREATE TABLE IF NOT EXISTS bots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    industry TEXT,
    system_prompt TEXT
);

ALTER TABLE bots ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS district TEXT;

-- 6. Console Chat Persistence
CREATE TABLE IF NOT EXISTS console_chat_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    context_tab TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed initial data
INSERT INTO ai_campaigns (admin_id, campaign_name, trigger_keyword, promotion_script, is_active)
VALUES ('Ud8b8dd79162387a80b2b5a4aba20f604', '早鳥自動成交引導', '預約', '如果用戶提到「預約」，請主動告知目前的【早鳥 9 折優惠】僅剩最後 3 組名額，引導其留下 LINE ID。', true)
ON CONFLICT DO NOTHING;
