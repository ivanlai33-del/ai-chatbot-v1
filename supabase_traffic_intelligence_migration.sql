-- Market Intelligence & Traffic Tracking
-- Purpose: Track visitor origins and monitor market "Deserts" vs "Hot Zones"

-- 1. Visitor Logs Table
CREATE TABLE IF NOT EXISTS platform_visitor_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip TEXT NOT NULL,
    city TEXT,
    district TEXT,
    isp TEXT,
    referer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enhance Bots table with location data
ALTER TABLE bots ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS district TEXT;

-- 3. Seed some sample location data for current bots (Optional, for demo)
UPDATE bots SET city = '台北市', district = '信義區' WHERE city IS NULL LIMIT 1;
UPDATE bots SET city = '台中市', district = '西屯區' WHERE city IS NULL LIMIT 1;
