-- ============================================================
-- 🚀 CORE OS FOUNDATION: Modular Blocks & Event-Driven Engine
-- Purpose: Unified Contacts, Event Bus, Block Protocol, and Brand DNA
-- ============================================================

-- 1. Unified Contacts (聯絡人主檔)
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL, -- 與現有架構一致的租戶隔離
    line_user_id TEXT,
    name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}', -- 支援各行業自訂欄位
    last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bot_id, line_user_id)
);

-- 2. Event Bus (事件總線)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL,
    event_name TEXT NOT NULL, -- 如 form.submitted, booking.created
    actor_id UUID REFERENCES public.contacts(id), -- 觸發事件的聯絡人
    source_type TEXT NOT NULL, -- block, system, manual
    source_id UUID, -- 觸發事件的積木實例 ID
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Block Registry (積木協議註冊)
CREATE TABLE IF NOT EXISTS public.blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL, -- 如 form_block, booking_block
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- data, input, interaction, logic, action, analysis
    emit_events TEXT[] DEFAULT '{}',
    consume_events TEXT[] DEFAULT '{}',
    config_schema JSONB DEFAULT '{}', -- UI 配置定義
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Block Instances (積木實例配置)
CREATE TABLE IF NOT EXISTS public.block_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL,
    block_id UUID REFERENCES public.blocks(id),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- draft, published, active, deprecated
    config JSONB DEFAULT '{}', -- 具體配置 (如表單欄位、選單圖案)
    data_mapping JSONB DEFAULT '{}', -- 資料寫入對應關係
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Brand DNA (品牌視覺規範)
CREATE TABLE IF NOT EXISTS public.brand_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID UNIQUE NOT NULL,
    primary_color TEXT,
    font_family TEXT,
    style_keywords TEXT[] DEFAULT '{}',
    negative_prompts TEXT,
    logo_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Visual Assets (視覺資產與審核)
CREATE TABLE IF NOT EXISTS public.visual_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL,
    source_instance_id UUID REFERENCES public.block_instances(id),
    asset_type TEXT NOT NULL, -- rich_menu_bg, flex_hero, form_header
    image_url TEXT NOT NULL,
    prompt_used TEXT,
    review_status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 🛡️ RLS POLICIES (基於現有 bot_id 安全模式)
-- ============================================================

-- 啟用 RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visual_assets ENABLE ROW LEVEL SECURITY;

-- 通用 RLS 規則範例 (仿照現有模式)
-- 注意：這裡假設 bots 資料表結構與 owner_line_id/partner_id 關聯不變

-- Contacts RLS
DROP POLICY IF EXISTS "Isolated bot access" ON public.contacts;
CREATE POLICY "Isolated bot access" ON public.contacts FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM bots WHERE bots.id = contacts.bot_id AND (bots.owner_line_id = auth.jwt()->>'line_user_id' OR bots.partner_id = auth.uid()::uuid)));

-- Events RLS
DROP POLICY IF EXISTS "Isolated bot access" ON public.events;
CREATE POLICY "Isolated bot access" ON public.events FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM bots WHERE bots.id = events.bot_id AND (bots.owner_line_id = auth.jwt()->>'line_user_id' OR bots.partner_id = auth.uid()::uuid)));

-- Block Instances RLS
DROP POLICY IF EXISTS "Isolated bot access" ON public.block_instances;
CREATE POLICY "Isolated bot access" ON public.block_instances FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM bots WHERE bots.id = block_instances.bot_id AND (bots.owner_line_id = auth.jwt()->>'line_user_id' OR bots.partner_id = auth.uid()::uuid)));

-- Brand Profiles RLS
DROP POLICY IF EXISTS "Isolated bot access" ON public.brand_profiles;
CREATE POLICY "Isolated bot access" ON public.brand_profiles FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM bots WHERE bots.id = brand_profiles.bot_id AND (bots.owner_line_id = auth.jwt()->>'line_user_id' OR bots.partner_id = auth.uid()::uuid)));

-- Visual Assets RLS
DROP POLICY IF EXISTS "Isolated bot access" ON public.visual_assets;
CREATE POLICY "Isolated bot access" ON public.visual_assets FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM bots WHERE bots.id = visual_assets.bot_id AND (bots.owner_line_id = auth.jwt()->>'line_user_id' OR bots.partner_id = auth.uid()::uuid)));

-- Finalize
NOTIFY pgrst, 'reload schema';
