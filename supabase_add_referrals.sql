-- ============================================================
-- 🌟 推薦好友·月費全免計畫 (Referral Program Schema)
-- ============================================================

-- 1. 推薦碼對照表 (每個 Bot/店家擁有一組專屬 6 碼大寫代碼)
CREATE TABLE IF NOT EXISTS public.referral_codes (
    bot_id UUID PRIMARY KEY REFERENCES public.bots(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    clicks_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 推薦記錄與進度表
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
    referee_bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    plan_type TEXT DEFAULT 'monthly' CHECK (plan_type IN ('monthly', 'annual')),
    paid_months_count INT DEFAULT 0,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'QUALIFIED', 'FAILED', 'REDEEMED')),
    reward_applied_month VARCHAR(7), -- 格式：'YYYY-MM' (如：2026-11)
    failure_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(referee_bot_id) -- 每家店只能被推薦一次
);

-- 開啟 RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- 建立通用讀寫 RLS 政策
CREATE POLICY "Allow authenticated read/write for referral_codes" ON public.referral_codes FOR ALL USING (true);
CREATE POLICY "Allow authenticated read/write for referrals" ON public.referrals FOR ALL USING (true);

-- 索引加速
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_bot_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
