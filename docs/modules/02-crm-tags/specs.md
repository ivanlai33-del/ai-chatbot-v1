# 模組 PRD：好友與標籤管理 (CRM & Tags)

## 1. 產品概述
本模組將 LINE 原生的「好友」升級為「數位會員」。透過標籤系統與行為追蹤，建立深度的客戶畫像，為 AGI 提供決策數據，支援後續的自動化旅程觸發。

## 2. 核心功能規格 (User Stories)
- **會員畫像同步**：自動抓取顯示名稱、頭像、UID 與區域設定。
- **動態標籤系統**：支援手動貼標、流程自動貼標、以及 AI 語意貼標。
- **來源追蹤 (Source Tracking)**：追蹤使用者是透過哪一個 QR Code、連結或活動加入。
- **對話脈絡存檔**：與神經記憶庫串接，記錄每一筆客服互動狀態。

## 3. 資料表 Schema (Supabase / Postgres)

### 表名：`members`
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `line_user_id` | varchar | Unique LINE UID (U...) |
| `display_name` | varchar | LINE 顯示名稱 |
| `avatar_url` | text | 頭像網址 |
| `email` | varchar | 綁定 Email (選填) |
| `phone` | varchar | 綁定手機 (選填) |
| `tags` | jsonb | 標籤陣列 |
| `source` | varchar | 來源標記 (如：QR_MOTHERS_DAY) |
| `status` | varchar | active / blocked / unread |
| `last_seen` | timestamptz | 最後互動時間 |

### 表名：`tags_definition`
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `name` | varchar | 標籤名稱 (如：VIP) |
| `color` | varchar | UI 顯示顏色 |
| `count` | int | 該標籤下的會員總數 |

## 4. API 清單
- `GET /api/crm/members` - 獲取分頁會員清單與篩選。
- `POST /api/crm/tags/assign` - 批次為會員指派標籤。
- `GET /api/crm/member/{uid}/history` - 獲取單一會員的完整互動歷程。

## 5. UI 佈局 (Wireframe)
- **主畫面**：會員大列表、多重條件篩選器（標籤、時間、來源）。
- **側邊欄**：單一會員詳情（Timeline 互動軸、標籤牆、AI 指令建議）。
