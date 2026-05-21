# 模組 PRD：自動回覆中心 (Auto-Reply)

## 1. 產品概述
整合關鍵字、AI FAQ 與情境回覆的調度中心。支援傳統規則導向 (Rule-based) 與現代 AGI 語意導向 (LLM-based) 的雙軌切換，確保使用者在任何時間都能獲得精確回應。

## 2. 核心功能規格
- **雙軌回覆模式**：可針對特定關鍵字設定「強制規則」，其餘則交由「AI 語意分析」。
- **RAG 知識庫對接**：自動檢索 `/knowledge` 內的 PDF 或文字檔作為回覆基準。
- **營業時間管理**：設定離線自動答覆，並記錄離線期間的客戶需求。
- **情感分析與轉真人**：偵測到客戶情緒不佳或特定字眼時，自動切換至 `/support` 人工接手。

## 3. 資料表 Schema
### 表名：`auto_reply_rules`
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `keyword` | varchar | 關鍵字或正則表達式 |
| `response_type` | varchar | text / flex / template |
| `content` | jsonb | 回覆內容 |
| `priority` | int | 優先權等級 |

---

# 模組 PRD：對話流程設計器 (Journey Builder)

## 1. 產品概述
視覺化的對話邏輯編排器。透過節點與連線，定義使用者加入好友後的旅程，或特定行銷活動的引導流程。

## 2. 核心功能規格
- **拖拉式編輯介面**：視覺化管理流程分支 (If/Else)。
- **節點類型**：發送訊息、等待回覆、標籤判斷、條件篩選、API 呼叫、LIFF 跳轉。
- **A/B Testing**：在流程中測試不同訊息版本的轉換效果。

## 3. 資料表 Schema
### 表名：`workflows`
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `nodes` | jsonb | 所有節點定義與位置 |
| `edges` | jsonb | 節點間的連接關係 |
| `trigger_event` | varchar | 觸發事件 (如：FOLLOW) |

---

# 模組 PRD：圖文選單管理 (Rich Menu)

## 1. 產品概述
LINE 聊天視窗底部的核心入口管理。支援動態切換、多層選單與分眾顯示，是提升 LIFF 點擊率的最強工具。

## 2. 核心功能規格
- **多版型支援**：內建 1~6 格常用版型配置。
- **動態切換 API**：根據使用者標籤（如：已綁定會員 vs 未綁定）切換選單內容。
- **排程設定**：預約特定時段自動更換選單（如：雙 11 活動專屬選單）。

## 3. 資料表 Schema
### 表名：`rich_menus`
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `line_rich_menu_id` | varchar | LINE 配發的 Rich Menu ID |
| `layout_config` | jsonb | 格項位置與動作定義 |
| `is_default` | boolean | 是否為全域預設選單 |

---

# 模組 PRD：快速回覆與互動按鈕 (Quick Reply)

## 1. 產品概述
提供即時的互動引導，透過訊息底部的 Quick Reply 按鈕，降低使用者的輸入成本並引導其進入特定 LIFF 流程。

## 2. 核心功能規格
- **一鍵式配置**：在訊息編輯時快速加入 1~13 個 Quick Reply 按鈕。
- **常用模板**：預設「聯絡客服」、「產品查詢」、「活動參與」等常用按鈕組。
