-- reservations table: stores appointment/booking inquiries auto-captured by the AI
-- Created when AI detects reservation intent in LINE webhook messages (1199 plan only)

CREATE TABLE IF NOT EXISTS reservations (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_id          UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    line_user_id    TEXT NOT NULL,
    customer_name   TEXT,
    requested_date  TEXT,           -- Free text, e.g. "下週三下午" or "3/15 14:00"
    service_type    TEXT,           -- What they want to book, e.g. "頭皮護理"
    note            TEXT,           -- Additional info the guest mentioned
    status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_reservations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER reservations_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW EXECUTE FUNCTION update_reservations_updated_at();

CREATE INDEX IF NOT EXISTS idx_reservations_bot_id ON reservations(bot_id);
CREATE INDEX IF NOT EXISTS idx_reservations_line_user ON reservations(line_user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON reservations
    USING (auth.role() = 'service_role');
