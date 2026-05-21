-- Seed default workflows for the Modular OS
-- Replace '00000000-0000-0000-0000-000000000000' with a real bot_id if needed, 
-- but normally this should be done per bot. 
-- This script provides a template to be inserted via the UI or a migration.

-- 1. 預約自動轉商機 (Booking -> Lead)
INSERT INTO workflows (bot_id, name, description, trigger_event, actions, is_active)
SELECT 
    id, 
    '預約自動轉商機', 
    '當有客戶完成預約時，自動建立一筆銷售商機', 
    'booking.created', 
    '[{"type": "create_lead", "params": {}}]'::jsonb,
    true
FROM bots;

-- 2. 表單自動轉商機 (Form -> Lead)
INSERT INTO workflows (bot_id, name, description, trigger_event, actions, is_active)
SELECT 
    id, 
    '表單提交轉商機', 
    '當客戶提交詢問表單時，自動同步至 BD 商機中心', 
    'form.submitted', 
    '[{"type": "create_lead", "params": {}}]'::jsonb,
    true
FROM bots;

-- 3. 競品異動提醒 (Intel -> Notification)
INSERT INTO workflows (bot_id, name, description, trigger_event, actions, is_active)
SELECT 
    id, 
    '競品異動偵測提醒', 
    '當市場情報發現競品有重大異動時，自動標記高價值標籤並通知', 
    'intelligence.competitor_changed', 
    '[{"type": "add_tag", "params": {"tag": "Intel_Alert"}}, {"type": "notify_admin", "params": {}}]'::jsonb,
    true
FROM bots;
