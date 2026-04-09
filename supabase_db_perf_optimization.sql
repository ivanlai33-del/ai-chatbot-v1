-- ============================================================
-- 🚀 DB 效能優化 Migration
-- 配合 webhook/[id]/route.ts 與 UsageService.ts 的程式碼優化
-- ============================================================

-- ① bot_customers: 確保 (bot_id, line_user_id) 有唯一索引
--    讓 upsert(onConflict: 'bot_id,line_user_id') 能正確運作
ALTER TABLE bot_customers
    ADD COLUMN IF NOT EXISTS last_interacted_at TIMESTAMPTZ DEFAULT now();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'bot_customers_bot_id_line_user_id_key'
    ) THEN
        ALTER TABLE bot_customers
            ADD CONSTRAINT bot_customers_bot_id_line_user_id_key
            UNIQUE (bot_id, line_user_id);
    END IF;
END $$;

-- ② bot_customer_tags: 確保 (customer_id, tag_name) 有唯一索引
--    讓批量 upsert(onConflict: 'customer_id,tag_name') 能正確運作
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'bot_customer_tags_customer_id_tag_name_key'
    ) THEN
        ALTER TABLE bot_customer_tags
            ADD CONSTRAINT bot_customer_tags_customer_id_tag_name_key
            UNIQUE (customer_id, tag_name);
    END IF;
END $$;

-- ③ user_usage_stats: 確保 (user_id, month) 有唯一索引
--    讓原子 upsert increment 能正確運作
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'user_usage_stats_user_id_month_key'
    ) THEN
        ALTER TABLE user_usage_stats
            ADD CONSTRAINT user_usage_stats_user_id_month_key
            UNIQUE (user_id, month);
    END IF;
END $$;

-- ④ increment_user_usage RPC：原子計數器
--    取代 UsageService 的 select → insert/update 兩步走
--    同時支援 line_user_id 欄位別名（相容舊有呼叫）
CREATE OR REPLACE FUNCTION increment_user_usage(
    p_user_id   TEXT,
    p_month     TEXT,
    p_tokens    INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO user_usage_stats (user_id, month, message_count, total_tokens, last_updated)
    VALUES (p_user_id, p_month, 1, p_tokens, NOW())
    ON CONFLICT (user_id, month)
    DO UPDATE SET
        message_count = user_usage_stats.message_count + 1,
        total_tokens  = user_usage_stats.total_tokens + EXCLUDED.total_tokens,
        last_updated  = NOW();
END;
$$;

-- 授予執行權限（Supabase anon / service_role）
GRANT EXECUTE ON FUNCTION increment_user_usage(TEXT, TEXT, INTEGER) TO anon, authenticated, service_role;
