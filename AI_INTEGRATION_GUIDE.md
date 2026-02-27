# 可擴展 AI 服務註冊機制 (AI Service Registry)

我們已將 **ai-chatbot-v1** 轉型為一個具備「動態擴充能力」的 AI 中台。未來如果您想增加新的 AI 功能（如：法律、天氣、電商），不再需要修改核心代碼，只需透過 **Supabase 表格** 即可達成。

## 1. 架構原理
AI 店長在啟動時會自動讀取資料庫中的「工具清單」，並動態生成 OpenAI 的 Function Calling 定義。當 AI 決定呼叫工具時，系統會自動根據註冊的 `api_base_url` 將請求轉發給對應的外部服務（如 StockRadar）。

## 2. 如何增加新服務 (例如：法律 AI 通道)
只需在 Supabase 中填寫兩張表：

### 第一步：註冊服務入口 (`ai_external_services`)
在表中新增一列：
- `service_name`: `LegalAI`
- `api_base_url`: `https://your-legal-app.com/api/ai/v1`
- `description`: `法律案件分析與條文查詢服務`

### 第二步：定義工具技能 (`ai_service_tools`)
在表中綁定 `LegalAI` 並新增具體技能：
- `tool_name`: `get_legal_advice`
- `description`: `根據法律條文提供專業建議`
- `parameters_schema`:
  ```json
  {
    "type": "object",
    "properties": {
      "case_description": { "type": "string", "description": "案情描述" }
    },
    "required": ["case_description"]
  }
  ```

## 3. 已完成的整合 (StockRadar)
目前 **StockRadar** 已經預註冊為第一個「外部大腦」：
- **實時數據通道**: Line AI 店長現在能直接調用 StockRadar 的 API 獲取股價與分析（不再文不對題）。
- **會員雙向同步**: 當用戶在 StockRadar 升級時，`stock_radar_members` 表會同步，Line 店長可據此提供差異化服務。

## 4. 目錄結構變更說明
- **StockRadar-main**:
  - `src/app/api/ai/v1/stock/route.ts`: 對外的 AI 專用接口。
  - `src/lib/supabase.ts`: 連線至 ai-chatbot-v1 的資料庫。
- **ai-chatbot-v1**:
  - `app/api/chat/route.ts`: 已升級為「動態工具加載模式」。
  - `supabase_integration.sql`: 用於初始化這些註冊表的腳本。
