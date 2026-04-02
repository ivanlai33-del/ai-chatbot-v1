-- Add Cancellation Fields to platform_users
ALTER TABLE platform_users 
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_end_at TIMESTAMP WITH TIME ZONE; -- The calculated end date based on last payment + cycle

-- Optional: Add cancellation reasons table for analytics
CREATE TABLE IF NOT EXISTS subscription_cancellation_reasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    line_user_id TEXT REFERENCES platform_users(line_user_id),
    reason TEXT NOT NULL,
    feedback TEXT,
    plan_level INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
