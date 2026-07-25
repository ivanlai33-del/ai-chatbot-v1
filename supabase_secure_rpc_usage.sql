-- ============================================================
-- Supabase SECURITY DEFINER RPC Security Hardening (Dynamic Safe Version)
-- Target: Revoke public execution of increment_user_usage function
-- ============================================================

-- 使用 PostgreSQL 動態 SQL 區塊，自動尋找資料庫中所有不同參數簽章的同名函數，
-- 並自動套用安全規則，避免因參數型態不符（例如 TEXT 與 UUID 的差異）導致執行錯誤。

DO $$
DECLARE
    r RECORD;
BEGIN
    -- 尋找 public schema 中所有名稱為 'increment_user_usage' 的函數
    -- 使用 p.oid 與 p.proname 確保欄位參照明確，不產生混淆
    FOR r IN 
        SELECT p.oid::regprocedure AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.proname = 'increment_user_usage'
    LOOP
        -- 1. 撤銷 public (所有人)、anon (訪客)、authenticated (一般登入者) 的執行權限
        EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM public', r.func_signature);
        EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', r.func_signature);
        EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM authenticated', r.func_signature);
        
        -- 2. 僅將執行權限單獨授予 service_role (系統管理者)
        EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.func_signature);
        
        RAISE NOTICE 'Successfully updated permissions for function: %', r.func_signature;
    END LOOP;
END $$;

-- 3. 重新整理 API Schema 快取
NOTIFY pgrst, 'reload schema';
