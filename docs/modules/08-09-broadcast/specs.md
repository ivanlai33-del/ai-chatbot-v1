# 模組 PRD：LIFF 應用中心 (LIFF Apps)

## 1. 產品概述
將 LINE 聊天視窗延伸為全功能的「輕量 App」。透過 LIFF 頁面承接會員中心、預約、電商結帳等深度互動任務。

## 2. 核心功能規格
- **表單/問卷模組**：支援多樣化題型，提交後自動回傳 LINE 訊息確認。
- **會員綁定中心**：引導使用者完成手機/Email 綁定，並寫入 CRM 資料表。
- **預約掛號系統**：即時時段顯示、線上預約、並發送推播提醒。
- **電商導購頁**：在 LIFF 內完成購物車與結帳導轉。

## 3. 資料表 Schema
### 表名：`liff_interactions`
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `member_id` | uuid | 關聯會員 ID |
| `app_type` | varchar | form / booking / store |
| `data` | jsonb | 互動提交的內容 (如：報名資料) |

---

# 模組 PRD：發送與排程中心 (Broadcast & Schedule)

## 1. 產品概述
主動觸及與排程管理中心。控制「什麼時候發」、「發給誰」、「發什麼」，並確保推播頻率符合營運規範。

## 2. 核心功能規格
- **分眾廣播 (Broadcast)**：根據標籤、來源、活躍度篩選目標受眾進行群發。
- **排程發送 (Scheduling)**：預約發送時間，支援週期性發送（如：每月 5 號會員日）。
- **頻次限制 (Capping)**：防止對使用者過度騷擾，設定單一會員每日收訊上限。

## 3. 資料表 Schema
### 表名：`broadcast_jobs`
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `asset_id` | uuid | 關聯的素材 ID |
| `target_segment` | jsonb | 受眾篩選條件 |
| `scheduled_at` | timestamptz | 預定發送時間 |
| `status` | varchar | waiting / processing / completed |
