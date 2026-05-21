-- Revenue Conversion Engine: Active Campaigns Table
-- Purpose: Store AI-driven sales campaigns that modify the chatbot's persona in real-time
CREATE TABLE IF NOT EXISTS ai_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id TEXT NOT NULL,
    campaign_name TEXT NOT NULL, -- e.g., 'Early Bird Promo'
    trigger_keyword TEXT NOT NULL, -- e.g., '美甲'
    promotion_script TEXT NOT NULL, -- The specific instruction to the AI
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed an initial useful campaign
INSERT INTO ai_campaigns (admin_id, campaign_name, trigger_keyword, promotion_script, is_active)
VALUES ('Ud8b8dd79162387a80b2b5a4aba20f604', '早鳥自動成交引導', '預約', '如果用戶提到「預約」，請主動告知目前的【早鳥 9 折優惠】僅剩最後 3 組名額，引導其立刻留下 LINE ID。', true)
ON CONFLICT DO NOTHING;
