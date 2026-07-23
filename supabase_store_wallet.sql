-- ============================================================
-- 💰 店長購物金錢包與交易明細對帳表 (Store Wallet Schema v2)
-- ============================================================

-- 1. 店長錢包主表 (含扣款偏好設定 deduction_mode)
CREATE TABLE IF NOT EXISTS public.store_wallets (
    owner_line_id TEXT PRIMARY KEY,
    balance_credits NUMERIC DEFAULT 0 CHECK (balance_credits >= 0),
    total_earned NUMERIC DEFAULT 0,
    total_spent NUMERIC DEFAULT 0,
    deduction_mode TEXT DEFAULT 'AUTO_ALL' CHECK (deduction_mode IN ('AUTO_ALL', 'OVERAGE_ONLY')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 錢包交易與爆量抵扣明細對帳表
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_line_id TEXT NOT NULL REFERENCES public.store_wallets(owner_line_id) ON DELETE CASCADE,
    bot_id UUID REFERENCES public.bots(id) ON DELETE SET NULL,
    store_name TEXT,
    type TEXT NOT NULL CHECK (type IN ('TOP_UP', 'REFERRAL_REWARD', 'MONTHLY_DEDUCTION', 'OVERAGE_DEDUCTION', 'STORE_DEDUCTION')),
    amount NUMERIC NOT NULL, -- 正數為入帳，負數為扣抵
    balance_after NUMERIC NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 開啟 RLS 權限
ALTER TABLE public.store_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read/write for store_wallets" ON public.store_wallets FOR ALL USING (true);
CREATE POLICY "Allow authenticated read/write for wallet_transactions" ON public.wallet_transactions FOR ALL USING (true);

-- 建立索引加速查詢
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_owner ON public.wallet_transactions(owner_line_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created ON public.wallet_transactions(created_at DESC);
