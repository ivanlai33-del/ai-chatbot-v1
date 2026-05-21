-- Create table for tracking monthly usage
CREATE TABLE IF NOT EXISTS public.user_usage_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.direct_users(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Format: YYYY-MM
    message_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month)
);

-- Index for faster lookup by user and month
CREATE INDEX IF NOT EXISTS idx_usage_user_month ON public.user_usage_stats(user_id, month);

-- RLS Policies
ALTER TABLE public.user_usage_stats ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists to prevent errors on re-run
DROP POLICY IF EXISTS "Users can view their own usage stats" ON public.user_usage_stats;

CREATE POLICY "Users can view their own usage stats"
ON public.user_usage_stats FOR SELECT
USING (auth.uid() = user_id);
