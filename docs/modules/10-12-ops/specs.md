# 模組 PRD：營運工具集 (Phase 2 Tools)

## 1. 優惠券與集點卡 (Marketing Gimmicks)
### 核心功能：
- **核銷追蹤**：每一張優惠券都有唯一識別碼，支援 QR Code 掃描核銷。
- **點數規則**：設定消費/互動點數比例，達標自動升級會員等級。
### 資料表：`coupons` / `loyalty_cards`

## 2. 客服與聊天管理 (Support Desk)
### 核心功能：
- **真人在線切換**：客服上線時自動暫停 AI 回覆。
- **對話摘要**：AGI 自動整理歷史對話重點，方便客服快速進入狀況。
- **常用回覆庫**：快速調用預設高品質文案。
### 資料表：`support_tickets`

## 3. 報表與追蹤中心 (Analytics Hub)
### 核心功能：
- **事件追蹤 (Event Tracking)**：記錄所有選單點擊、LIFF 開啟、表單送出行為。
- **轉換漏斗分析**：從推播、開啟、到最後成交的轉化率分析。
- **AI 趨勢建議**：自動分析近期客戶關鍵字分佈，建議更新 FAQ。

## 4. 資料表 Schema
### 表名：`analytics_events`
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `member_id` | uuid | 關聯會員 |
| `event_type` | varchar | click / open / submit |
| `metadata` | jsonb | 事件細節 (如：哪一個按鈕) |

---

# 📖 專案 specs 索引清單

- [00 全站 Sitemap (已完成)](/docs/sitemap.md)
- [01 帳號與頻道設定 (已完成)](/docs/modules/01-channel-setup/specs.md)
- [02 好友與標籤管理 (已完成)](/docs/modules/02-crm-tags/specs.md)
- [03 訊息素材中心 (已完成)](/docs/modules/03-asset-hub/specs.md)
- [04-07 互動與自動化 (已完成)](/docs/modules/04-07-interaction/specs.md)
- [08-09 LIFF 與發送中心 (已完成)](/docs/modules/08-09-broadcast/specs.md)
- [10-12 營運工具集 (已完成)](/docs/modules/10-12-ops/specs.md)
