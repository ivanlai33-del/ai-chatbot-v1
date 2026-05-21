-- 模擬五種情境的神經記憶存檔
INSERT INTO chat_memories (organization_id, membership_email, sender_type, message, metadata)
VALUES
-- 情境 S1: 母親節行銷
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'user', '店長，市場情報顯示最近「母親節」關鍵字很熱，我們有什麼對策？', '{"scenario": "S1", "block": "BD Intelligence"}'),
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'agi', '報告指揮官，我掃描了市場雷達，發現競品正在推 5 折早鳥券。我建議調動【行銷中心】針對 CRM 中的「VIP 女性」客群發送「寵愛媽咪」Flex 訊息，並已為您準備好草稿。', '{"scenario": "S1", "block": "Campaigns", "action": "Draft Created"}'),

-- 情境 S2: 流程修復
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'user', '客戶反應週末無法預約，幫我檢查一下自動化流程。', '{"scenario": "S2", "block": "Journey"}'),
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'agi', '正在診斷【行銷旅程】... 發現「週末預約節點」的 API Hook 失效。我已將其重新導向至「客服工作台」備援，現在預約已恢復正常運作。', '{"scenario": "S2", "block": "Support", "action": "Logic Patched"}'),

-- 情境 S3: 視覺更新
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'user', '天氣變熱了，我想把選單換成「酷夏清爽」的風格。', '{"scenario": "S3", "block": "Factory"}'),
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'agi', '了解。已調動【素材工廠】生成三款冰藍色調背景，並同步更新【圖文選單】的按鈕文字為「夏季限定特調」。請預覽並確認發佈。', '{"scenario": "S3", "block": "Menu", "action": "Visuals Generated"}'),

-- 情境 S4: VIP 挽回
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'user', '幫我找一下最近 14 天沒互動的高價值客戶，給他們一點驚喜。', '{"scenario": "S4", "block": "CRM"}'),
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'agi', '在【CRM】中鎖定了 5 位流失 VIP。我已調動【群發中心】為他們準備了「好久不見」個人化 Flex Message，內含 100 點回饋金，預計點擊率可提升 12%。', '{"scenario": "S4", "block": "Broadcast", "action": "Segment Targeted"}'),

-- 情境 S5: 知識升級
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'user', '這是 2025 年的新產品型錄 PDF，請學習一下。', '{"scenario": "S5", "block": "Knowledge"}'),
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'agi', '接收檔案中... 學習完成！我已更新【智庫 FAQ】，現在可以精準回答關於「智能節能系統」的規格問題，並同步記錄在我的【神經記憶】中。', '{"scenario": "S5", "block": "Memories", "action": "RAG Updated"}');
