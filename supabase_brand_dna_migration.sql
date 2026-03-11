-- brand_dna table: stores Brand DNA collected during chatbot sales conversation
-- Records are created/updated as AI extracts fields during chat
-- bot_id is null until the user completes onboarding (payment + LINE setup)

CREATE TABLE IF NOT EXISTS brand_dna (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id       TEXT NOT NULL,
    bot_id           UUID REFERENCES bots(id) ON DELETE SET NULL,
    industry_type    TEXT,       -- 行業別 e.g. 瑜伽教室
    company_name     TEXT,       -- 品牌名稱 e.g. 放鬆瑜伽
    main_services    TEXT,       -- 主打服務 e.g. 上班族晚間瑜伽課
    target_audience  TEXT,       -- 目標客群 e.g. 30歲想減壓的都市OL
    contact_info     TEXT,       -- 聯絡方式（有此欄位才算有效名單）
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id)
);

-- Auto-update updated_at on every upsert
CREATE OR REPLACE FUNCTION update_brand_dna_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER brand_dna_updated_at
BEFORE UPDATE ON brand_dna
FOR EACH ROW EXECUTE FUNCTION update_brand_dna_updated_at();

-- Index for fast session lookups
CREATE INDEX IF NOT EXISTS idx_brand_dna_session_id ON brand_dna(session_id);
CREATE INDEX IF NOT EXISTS idx_brand_dna_bot_id ON brand_dna(bot_id);

-- RLS: Only service role can read/write (server-side only)
ALTER TABLE brand_dna ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON brand_dna
    USING (auth.role() = 'service_role');
