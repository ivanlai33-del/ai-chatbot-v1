-- ============================================================
-- 修復 RLS 政策，允許匿名同步 API 操作
-- ============================================================

-- 1. 允許匿名 SELECT (用於檢查 setup_token 是否存在)
DROP POLICY IF EXISTS "Allow anon select by token" ON line_channel_configs;
CREATE POLICY "Allow anon select by token"
ON line_channel_configs
FOR SELECT
TO anon
USING ( setup_token IS NOT NULL );

-- 2. 允許匿名 UPDATE (用於寫入同步資料)
DROP POLICY IF EXISTS "Allow anon update by token" ON line_channel_configs;
CREATE POLICY "Allow anon update by token"
ON line_channel_configs
FOR UPDATE
TO anon
USING ( setup_token IS NOT NULL )
WITH CHECK ( setup_token IS NOT NULL );

-- 3. 確保 Service Role 擁有所有權限 (通常是預設，但明確加上更保險)
ALTER TABLE line_channel_configs FORCE ROW LEVEL SECURITY;
ALTER TABLE line_channel_configs ENABLE ROW LEVEL SECURITY;
