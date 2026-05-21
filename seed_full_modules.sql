-- 種子資料：為積木注入實質內容

-- 1. 建立測試 OA
INSERT INTO official_accounts (name, line_oa_id, is_active)
VALUES ('萊特科技官方旗艦店', '@wright_tech', true);

-- 2. 建立測試品牌 DNA
INSERT INTO brand_dna (colors, ai_prompt_prefix)
VALUES ('["#06C755", "#05A044", "#111827"]', '使用萊特綠漸層, 極簡蘋果風格, 高品質渲染');

-- 3. 建立測試會員 (CRM)
INSERT INTO members (line_user_id, display_name, tags, source)
VALUES 
('U123456789', '小明 (Ivan)', '["VIP", "已購買", "新客"]', 'MOTHERS_DAY_QR'),
('U987654321', '愛麗絲', '["待開發"]', 'FB_ADS');

-- 4. 建立測試素材 (Asset Hub)
INSERT INTO visual_assets (type, url, tags)
VALUES 
('image', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', '["活動主圖", "母親節"]'),
('flex', 'https://api.line.me/flex/v1/preview/123', '["結帳卡片"]');

-- 5. 建立自動回覆規則
INSERT INTO auto_reply_rules (keyword, response_type, content)
VALUES 
('營業時間', 'text', '{"text": "我們的營業時間為週一至週五 09:00 - 18:00。"}'),
('最新活動', 'text', '{"text": "目前正在舉行母親節感謝祭，全館 8 折！"}');
