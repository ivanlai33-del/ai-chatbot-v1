-- 1. 品牌視覺規範 (Visual Profiles)
CREATE TABLE IF NOT EXISTS visual_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name TEXT NOT NULL,
    brand_colors JSONB, -- { primary: '#06C755', secondary: '#...' }
    font_family TEXT,
    logo_url TEXT,
    style_keywords TEXT[], -- ['minimalist', 'vibrant', 'professional']
    ai_prompt_prefix TEXT, -- 為了品牌一致性，強制附加在 Prompt 前端的語法
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 視覺模板 (Visual Templates)
CREATE TABLE IF NOT EXISTS visual_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL, -- 'rich_menu', 'flex', 'form_header', 'coupon'
    name TEXT NOT NULL,
    layout_config JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI 生成資產庫 (Generated Assets)
CREATE TABLE IF NOT EXISTS generated_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    profile_id UUID REFERENCES visual_profiles(id),
    original_prompt TEXT,
    final_prompt TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'pending_review', -- 'pending_review', 'approved', 'rejected'
    reviewer_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 獨立按鈕組件 (Button Components)
CREATE TABLE IF NOT EXISTS button_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    label TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'url', 'postback', 'message'
    action_value TEXT,
    style_config JSONB, -- { color: '#...', shape: 'rounded' }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 功能積木與視覺資產綁定表 (Block Visual Bindings)
-- 這是最重要的表：一顆「預約積木」可以同時綁定多個不同格式的視覺輸出
CREATE TABLE IF NOT EXISTS block_visual_bindings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    block_type TEXT NOT NULL, -- 'booking', 'campaign', 'form', etc.
    block_id UUID, -- 對應到各功能表的 ID
    asset_id UUID REFERENCES generated_assets(id),
    template_type TEXT NOT NULL, -- 'rich_menu', 'flex', 'form_header'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Rich Menu 配置表
CREATE TABLE IF NOT EXISTS richmenu_layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name TEXT NOT NULL,
    layout_type TEXT DEFAULT 'grid_6', -- 'grid_6', 'grid_3', 'custom'
    slots JSONB, -- 儲存每個槽位綁定的功能積木與按鈕
    bg_asset_id UUID REFERENCES generated_assets(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 啟用 RLS
ALTER TABLE visual_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_visual_bindings ENABLE ROW LEVEL SECURITY;

-- 簡易策略 (暫時允許組織內存取)
CREATE POLICY "Allow org access to visual_profiles" ON visual_profiles FOR ALL USING (true);
CREATE POLICY "Allow org access to generated_assets" ON generated_assets FOR ALL USING (true);
CREATE POLICY "Allow org access to block_visual_bindings" ON block_visual_bindings FOR ALL USING (true);
