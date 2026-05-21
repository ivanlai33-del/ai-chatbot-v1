-- 五大產業店家：多工協作神經記憶存檔
INSERT INTO chat_memories (organization_id, membership_email, sender_type, message, metadata)
VALUES
-- 店家 1: 美業預約 (Context: 凝香美學館)
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'agi', '【凝香美學館】報告：本週六下午尚有 3 個空檔。我已在【優惠券中心】備好「週末寵愛快閃券」，是否調動【群發中心】針對常客發送？', '{"oa_name": "凝香美學館", "block": "Coupons", "action": "Slot Optimization"}'),

-- 店家 2: 服飾電商 (Context: Wright Fashion)
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'agi', '【Wright Fashion】報告：偵測到氣溫回升。我已調動【素材工廠】生成 5 款「夏季涼感衫」視覺，並建議更新【圖文選單】的 A 區區塊。', '{"oa_name": "Wright Fashion", "block": "Factory", "action": "Seasonal Update"}'),

-- 店家 3: 在地餐飲 (Context: 賴家私房菜)
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'agi', '【賴家私房菜】報告：目前晚餐尖峰時段詢問量激增。我已自動攔截並處理了 42 筆訂位查詢，現有 1 筆關於「過敏原調整」的特殊需求已轉入【客服工作台】供您核准。', '{"oa_name": "賴家私房菜", "block": "Support", "action": "Peak Filtering"}'),

-- 店家 4: B2B 顧問 (Context: AI 數位轉型中心)
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'agi', '【AI 數位轉型中心】報告：在【BD 商機中心】發現一家高科技製造業剛完成諮詢問卷。根據評分他屬於「超高價值客戶」，我已將其加入您的「今日必親自跟進」清單。', '{"oa_name": "AI 數位轉型中心", "block": "BD", "action": "Lead Scoring"}'),

-- 店家 5: 社區學院 (Context: 未來學習社)
('77777777-7777-7777-7777-777777777777', 'ivan@ycideas.com', 'agi', '【未來學習社】報告：2025 春季班簡章已閱讀完畢。我現在可以自動引導用戶完成報名流程，並將數據存入【問卷中心】。剛才已成功引導 12 位學員完成報名。', '{"oa_name": "未來學習社", "block": "Knowledge", "action": "Auto-Registration"}');
