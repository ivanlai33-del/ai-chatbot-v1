-- 第二階段：深度營運情境神經記憶存檔
INSERT INTO chat_memories (organization_id, membership_email, sender_type, message, metadata)
VALUES
-- 情境 S6: 成效檢討
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'user', '店長，幫我分析一下這週母親節優惠券的表現。', '{"scenario": "S6", "block": "Coupons"}'),
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'agi', '報告！【報表中心】顯示核銷率高達 85%，帶來 15 萬預估營收。但【CRM】顯示有 30% 是新客，建議調動【集點卡系統】贈送他們「新客回娘家點數」，鎖定二次回購。', '{"scenario": "S6", "block": "Reports", "action": "Performance Analyzed"}'),

-- 情境 S7: 高風險客訴
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'user', '剛才有個客人在抱怨物流太慢，妳怎麼處理的？', '{"scenario": "S7", "block": "Support"}'),
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'agi', '偵測到該客戶情緒為「憤怒」，我已在【客服工作台】建立了「緊急工單」並標記為高優先級。同時，我調閱了他的【CRM】紀錄，他是五年老客戶，請您立即介入安撫。', '{"scenario": "S7", "block": "CRM", "action": "High-Priority Ticket Created"}'),

-- 情境 S8: 獎勵優化
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'user', '最近集點卡大家換得很少，是不是獎勵不夠吸引人？', '{"scenario": "S8", "block": "Loyalty"}'),
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'agi', '分析顯示 70% 用戶積點超過 500 但未兌換。建議調動【素材工廠】生成「限量品牌手拿包」的視覺圖，並新增為 500 點兌換獎項，增加兌換誘因。', '{"scenario": "S8", "block": "Factory", "action": "New Reward Suggested"}'),

-- 情境 S10: 營收預報
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'user', '這個月營收能達成目標嗎？', '{"scenario": "S10", "block": "Reports"}'),
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'agi', '根據目前趨勢，月底預計會有 15% 的業績缺口。建議參考【市場情報】，在本週五發動一波「閃電促銷」，針對購物車遺棄用戶發送 9 折【優惠券】。', '{"scenario": "S10", "block": "BD Intelligence", "action": "Revenue Strategy Generated"}'),

-- 情境 S9: 問卷調查
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'user', '我們想出新款香水，先幫我問問大家的喜好。', '{"scenario": "S9", "block": "Surveys"}'),
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'agi', '沒問題！已在【問卷中心】建立三題式簡短調查，並準備透過【群發中心】送給「過去一年有購買香氛」的 400 位核心會員，完成填寫將自動贈送 10 點。', '{"scenario": "S9", "block": "Campaigns", "action": "Survey Campaign Ready"}');
