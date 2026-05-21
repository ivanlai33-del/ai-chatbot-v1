# 模組 PRD：帳號與頻道設定 (Channel Setup)

## 1. 產品概述
本模組是系統的「通訊中樞」，負責管理所有與 LINE 平台的連線與權限。它不僅是單純的存放 API Key，更是一個具備「部署能力」的發布中心，負責將 Webhook、LIFF 與 Rich Menu 規則送往 LINE 端點。

## 2. 核心功能規格 (User Stories)
- **多帳號管理**：管理者可建立多個 OA 專案，並快速切換。
- **API 通訊安全**：加密儲存 Channel Access Token 與 Secret。
- **Webhook 自動化**：支援一鍵開啟 Webhook 並進行驗證測試。
- **LIFF 集中控管**：自動註冊並顯示 LIFF ID，免去頻繁切換 LINE Developers 頁面。

## 3. 資料表 Schema (Supabase / Postgres)

### 表名：`official_accounts`
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `organization_id` | uuid | 所屬組織 ID |
| `name` | varchar | OA 顯示名稱 |
| `line_oa_id` | varchar | LINE 官方帳號 ID (@...) |
| `channel_id` | varchar | Messaging API Channel ID |
| `channel_secret` | text (encrypted) | Channel Secret |
| `channel_token` | text (encrypted) | Long-lived Access Token |
| `webhook_url` | text | 系統配發的 Webhook 位址 |
| `is_active` | boolean | 服務是否啟用 |
| `created_at` | timestamptz | 建立時間 |

### 表名：`liff_apps`
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `oa_id` | uuid | 關聯的 OA ID |
| `liff_id` | varchar | LINE 配發的 LIFF ID |
| `name` | varchar | LIFF 內部名稱 (如：會員中心) |
| `url` | text | 入口網址 |
| `size` | varchar | compact / tall / full |

## 4. API 清單
- `GET /api/line/provision` - 獲取當前 OA 設定狀態。
- `POST /api/line/webhook/test` - 觸發 Webhook 重送測試。
- `PUT /api/line/token/refresh` - 更新並儲存新的 Channel Token。

## 5. UI 佈局 (Wireframe)
- **頂部**：OA 切換下拉選單、連線健康度燈號。
- **左側**：API 配置區塊（金鑰欄位、複製按鈕）。
- **右側**：Webhook 即時日誌、LIFF 快速清單。
