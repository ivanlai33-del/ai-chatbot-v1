-- ============================================================
-- 🚀 解除舊版方案等級限制
-- 目的：解除 platform_users 表格中過時的 plan_level 上限限制
-- ============================================================

-- 1. 移除舊的 check_plan_level 限制 (允許我們升級到 plan_level 3, 4, 5, 6 等高級方案)
ALTER TABLE platform_users DROP CONSTRAINT IF EXISTS check_plan_level;

-- 2. 備用：假如當初取名叫做 platform_users_plan_level_check，一併移除
ALTER TABLE platform_users DROP CONSTRAINT IF EXISTS platform_users_plan_level_check;
