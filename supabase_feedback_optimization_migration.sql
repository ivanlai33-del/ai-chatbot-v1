-- Optimize Owner Feedback Table
-- Purpose: Add categories, priorities, and smart reply suggestions for the admin
ALTER TABLE owner_feedback ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE owner_feedback ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 3; -- 1-5 Scale
ALTER TABLE owner_feedback ADD COLUMN IF NOT EXISTS smart_suggestion TEXT; -- AI suggested reply for admin
ALTER TABLE owner_feedback ADD COLUMN IF NOT EXISTS impact_score INTEGER DEFAULT 0; -- Derived from number of similar reports
