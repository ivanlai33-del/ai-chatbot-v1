-- [NEW MIGRATION] Enhanced Traffic & Behavioral Intelligence
-- Purpose: Support UTM, Device, Page, and Behavioral Content Tagging

-- 1. Expand Visitor Logs Table
ALTER TABLE platform_visitor_logs 
ADD COLUMN IF NOT EXISTS session_id UUID,
ADD COLUMN IF NOT EXISTS visitor_id UUID,
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS utm_content TEXT,
ADD COLUMN IF NOT EXISTS utm_term TEXT,
ADD COLUMN IF NOT EXISTS page_url TEXT,
ADD COLUMN IF NOT EXISTS page_title TEXT,
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS os TEXT,
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS content_tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS liff_user_id TEXT;

-- 2. Create Index for faster Analytics
CREATE INDEX IF NOT EXISTS idx_visitor_logs_session ON platform_visitor_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_visitor ON platform_visitor_logs(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_created ON platform_visitor_logs(created_at DESC);
