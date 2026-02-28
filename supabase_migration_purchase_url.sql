-- 在 products 表新增 purchase_url 欄位
-- 請在 Supabase Dashboard → SQL Editor 執行此指令

ALTER TABLE products
ADD COLUMN IF NOT EXISTS purchase_url TEXT DEFAULT NULL;

-- 確認欄位已新增
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'purchase_url';
