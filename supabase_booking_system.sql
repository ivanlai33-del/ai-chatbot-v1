-- ============================================================
-- 📅 通用標準化預約系統 (Universal Booking Engine Schema v1)
-- ============================================================

-- 1. 門市預約規則設定表 (booking_settings)
CREATE TABLE IF NOT EXISTS public.booking_settings (
    bot_id UUID PRIMARY KEY REFERENCES public.bots(id) ON DELETE CASCADE,
    owner_line_id TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    slot_interval_minutes INT DEFAULT 60, -- 時段切分 (30, 45, 60, 90 分鐘)
    operating_hours JSONB DEFAULT '{"mon":["10:00","21:00"],"tue":["10:00","21:00"],"wed":["10:00","21:00"],"thu":["10:00","21:00"],"fri":["10:00","21:00"],"sat":["10:00","21:00"],"sun":[]}'::jsonb,
    max_capacity_per_slot INT DEFAULT 1, -- 每時段人數上限
    custom_fields JSONB DEFAULT '[{"id":"name","label":"顧客姓名","required":true},{"id":"phone","label":"聯絡電話","required":true}]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 門市預約服務項目清單 (booking_services)
CREATE TABLE IF NOT EXISTS public.booking_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- 服務項目名稱 (例：手部美甲, 汽車保養, VIP諮詢)
    duration_minutes INT DEFAULT 60, -- 所需分鐘數
    price NUMERIC DEFAULT 0, -- 費用 (0 為免費/現場付)
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 預約對帳明細主表 (bookings - 帶有行級鎖定與狀態)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.booking_services(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    booking_date DATE NOT NULL, -- YYYY-MM-DD
    start_time TEXT NOT NULL, -- HH:mm (例：14:00)
    end_time TEXT NOT NULL, -- HH:mm (例：15:00)
    line_user_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    note TEXT,
    status TEXT DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 建立高效查詢索引 (確保 AI 對話能 50 毫秒內秒查空位)
CREATE INDEX IF NOT EXISTS idx_bookings_bot_date ON public.bookings(bot_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(line_user_id);
CREATE INDEX IF NOT EXISTS idx_booking_services_bot ON public.booking_services(bot_id);

-- RLS 安全權限
ALTER TABLE public.booking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read/write for booking_settings" ON public.booking_settings FOR ALL USING (true);
CREATE POLICY "Allow authenticated read/write for booking_services" ON public.booking_services FOR ALL USING (true);
CREATE POLICY "Allow authenticated read/write for bookings" ON public.bookings FOR ALL USING (true);
