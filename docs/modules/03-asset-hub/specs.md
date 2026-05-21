# 模組 PRD：訊息素材中心 (Asset Hub)

## 1. 產品概述
本模組是品牌的「創意軍火庫」，整合 AI 生成、版本控制與跨載體發布。支援 LINE 所有的原生訊息格式，並提供視覺化編輯介面，確保所有輸出的素材符合品牌 DNA。

## 2. 核心功能規格 (User Stories)
- **AI 視覺素材工廠**：透過 AGI 生成主圖與文案，並自動存檔至數位資產庫。
- **Flex Message 編輯器**：支援複雜的 Flex 佈局與 Button 動作配置。
- **跨載體發布 (The Orchestrator)**：一鍵將素材同步至 Rich Menu、廣播、或 LIFF 頁面。
- **品牌 DNA 強制校驗**：確保生成的每一張圖片與按鈕都符合品牌定義的 Hex/RGB 規範。

## 3. 資料表 Schema (Supabase / Postgres)

### 表名：`visual_assets`
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `type` | varchar | image / flex / video / richmenu |
| `url` | text | 素材託管位址 (CDN) |
| `prompt_metadata` | jsonb | 生成該素材時的 AI Prompt 與參數 |
| `tags` | jsonb | 素材標籤 (如：母親節, 促銷) |
| `version` | int | 版本號碼 |
| `created_by` | uuid | 建立者 ID |

### 表名：`brand_dna`
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `colors` | jsonb | 品牌色清單 (Hex/RGB) |
| `font_family` | varchar | 指定字體規範 |
| `ai_prompt_prefix` | text | 強制 AI 生成時加入的前綴關鍵字 |

## 4. API 清單
- `POST /api/assets/generate` - 呼叫 AI 產生新的視覺素材。
- `PUT /api/assets/{id}/sync` - 將特定素材同步至 LINE 端點。
- `GET /api/assets/library` - 檢索歷史素材，支援標籤篩選。

## 5. UI 佈局 (Wireframe)
- **左側**：分類瀏覽（圖片牆、Flex 模板、Rich Menu）。
- **中間**：AI 生成區/編輯器畫布。
- **右側**：發布中心（同步狀態、預覽模式、DNA 校驗結果）。
