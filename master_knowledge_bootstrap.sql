-- 建立或更新「總店長 (Master Bot)」的專業知識庫
-- 確保 AI 在官網聊天室中，能準確回答關於本專案的所有細節

-- 1. 更新主體配置 (如果存在的話)
UPDATE store_configs 
SET 
  company_name = 'LINE 智能店長 Pro | YC Ideas 數位轉型中心',
  industry_type = 'AI 數位轉型 SaaS',
  main_services = '24H LINE 官方帳號自動化銷售、智慧客服、智庫語音學習',
  target_audience = '需要提升 LINE 經營效率、減少人工客服、增加半夜轉單率的老闆與商店',
  metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{official_url}',
    '"https://bot.ycideas.com"'
  )
WHERE id = (SELECT bot_id FROM platform_users LIMIT 1); -- 暫時鎖定為第一個註冊的 Bot

-- 2. 灌錄核心智庫 (Brand DNA)
INSERT INTO brand_dna (bot_id, category, key, value, description)
VALUES 
  ((SELECT bot_id FROM platform_users LIMIT 1), 'fundamental', 'website', 'https://bot.ycideas.com', '官方網站網址'),
  ((SELECT bot_id FROM platform_users LIMIT 1), 'fundamental', 'contact_line', 'https://line.me/R/ti/p/@yc_ideas', '官方聯繫 LINE 連結'),
  ((SELECT bot_id FROM platform_users LIMIT 1), 'pricing', 'lite', '499元/月', '個人店長版 (限時早鳥)'),
  ((SELECT bot_id FROM platform_users LIMIT 1), 'pricing', 'pro', '1199元/月', '公司強力店長版 (支援 PDF 學習)'),
  ((SELECT bot_id FROM platform_users LIMIT 1), 'usp', 'no_api', '免 API Key，三分鐘快速掃碼開通', '核心技術優勢'),
  ((SELECT bot_id FROM platform_users LIMIT 1), 'usp', 'automation', '24 小時真人在線對話，自動引導完成結帳', '核心服務特色')
ON CONFLICT (bot_id, category, key) DO UPDATE SET value = EXCLUDED.value;
