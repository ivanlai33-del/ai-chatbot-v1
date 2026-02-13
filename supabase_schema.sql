-- Bots Table: Stores bot configurations and credentials
CREATE TABLE bots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name TEXT NOT NULL,
  line_channel_secret TEXT,
  line_channel_access_token TEXT,
  openai_api_key TEXT,
  system_prompt TEXT DEFAULT '你是一個專業的 AI 客服助手。',
  selected_plan TEXT DEFAULT 'Standard',
  status TEXT DEFAULT 'active',
  mgmt_token UUID DEFAULT uuid_generate_v4(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Chat Logs Table: Stores interaction history
CREATE TABLE chat_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Line User ID
  role TEXT NOT NULL,    -- 'ai' or 'user'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Row Level Security (RLS)
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Simple Policies (Expand as needed for multi-tenant Auth)
CREATE POLICY "Allow public read for demo" ON bots FOR SELECT USING (true);
CREATE POLICY "Allow public read for demo logs" ON chat_logs FOR SELECT USING (true);

-- Products Table: Stores inventory and pricing
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Orders Table: Stores customer orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  line_user_id TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, paid, shipped, cancelled
  items JSONB, -- Array of {product_id, quantity, price}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- FAQ Table: Stores knowledge base questions and answers
CREATE TABLE faq (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Appointments Table: Stores service bookings
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  line_user_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  appointment_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'confirmed', -- confirmed, cancelled, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for all new tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Allow public read for demo (matching existing policy style)
CREATE POLICY "Allow public read for demo products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read for demo orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public read for demo faq" ON faq FOR SELECT USING (true);
CREATE POLICY "Allow public read for demo appointments" ON appointments FOR SELECT USING (true);
