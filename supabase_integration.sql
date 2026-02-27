-- 1. 股市雷達成員表 (StockRadar Members)
-- 用於存放與 StockRadar 相關的會員等級與設定
CREATE TABLE IF NOT EXISTS stock_radar_members (
  line_user_id TEXT PRIMARY KEY,
  tier INTEGER DEFAULT 0, -- 0: Free, 1: LV1, 3: LV3, 5: LV5
  preferences JSONB DEFAULT '{}',
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. 外部服務註冊表 (External Service Registry)
-- 用於擴充 AI 店長的功能，讓它知道可以去哪裡查資料
CREATE TABLE IF NOT EXISTS ai_external_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name TEXT NOT NULL UNIQUE, -- 例如 'StockRadar'
  api_base_url TEXT NOT NULL,
  api_key TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. 服務工具定義表 (Service Tools)
-- 定義 AI 可以呼叫的具體 Tool (Function Calling)
CREATE TABLE IF NOT EXISTS ai_service_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES ai_external_services(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL, -- 例如 'get_stock_analytics'
  description TEXT,        -- 給 AI 讀的工具描述
  parameters_schema JSONB, -- JSON Schema 定義工具參數
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 預填寫 StockRadar 服務入口 (假設本地開發為 3133 端口，部署後需更換)
INSERT INTO ai_external_services (service_name, api_base_url, description)
VALUES ('StockRadar', 'http://localhost:3133/api/ai/v1', '股市雷達實時數據與 AI 分析積木服務')
ON CONFLICT (service_name) DO NOTHING;

-- 預填寫股市查詢工具
INSERT INTO ai_service_tools (service_id, tool_name, description, parameters_schema)
SELECT id, 'get_stock_info', '獲取台灣股市的實時價格、技術指標與 AI 分析數據。', 
'{
  "type": "object",
  "properties": {
    "symbol": { "type": "string", "description": "股票代碼或名稱，例如 2330 或 台積電" }
  },
  "required": ["symbol"]
}'::jsonb
FROM ai_external_services WHERE service_name = 'StockRadar'
ON CONFLICT DO NOTHING;
