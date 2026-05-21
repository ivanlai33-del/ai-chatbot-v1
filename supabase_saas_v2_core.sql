-- ============================================================
-- 💎 SAAS V2 CORE ARCHITECTURE — 組織化權限與帳務模型
-- ============================================================

-- 1. 組織 / 工作區 (Organizations / Workspaces)
-- 真正的付費與資料主體
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE, -- 用於網址標識
    logo_url TEXT,
    
    -- 方案與狀態
    plan_id TEXT DEFAULT 'free', -- starter, pro, elite
    status TEXT DEFAULT 'active', -- active, suspended, canceled
    
    -- 帳務基本資料 (Billing Profile)
    billing_email TEXT,
    payment_method_id TEXT, -- 綁定的藍新/綠界支付代碼
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    
    -- 三聯式發票資料 (Invoice Profile)
    tax_id TEXT, -- 統一編號
    invoice_title TEXT, -- 公司抬頭
    invoice_type TEXT DEFAULT '3-part', -- 2-part, 3-part, electronic
    invoice_address TEXT, -- 發票寄送地址
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. 成員與角色 (Memberships / RBAC)
-- 連結 User 與 Organization
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 角色定義：owner, admin, billing_admin, operator, viewer
    role TEXT NOT NULL DEFAULT 'operator',
    
    -- 狀態
    invitation_status TEXT DEFAULT 'accepted', -- invited, accepted
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(organization_id, user_id)
);

-- 3. LINE 官方帳號資產 (LINE Assets)
-- 掛載在組織底下的資源
CREATE TABLE IF NOT EXISTS public.line_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- LINE 串接資料
    name TEXT, -- 機器人名稱
    line_bot_id TEXT, -- LINE ID (@...)
    channel_id TEXT,
    channel_secret TEXT,
    channel_access_token TEXT,
    
    -- AGI 設定連結
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. 合作夥伴與代理商擴充 (Partner/Reseller Mode)
-- 允許一個組織管理多個子組織
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS parent_organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS is_partner BOOLEAN DEFAULT false;

-- 5. 啟用 RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_assets ENABLE ROW LEVEL SECURITY;

-- 6. 權限策略 (Security Policies)
-- 只有組織成員可以查看所屬組織
CREATE POLICY "Users can view their organizations" ON public.organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE memberships.organization_id = organizations.id 
            AND memberships.user_id = auth.uid()
        )
    );

-- 只有組織成員可以查看所屬 LINE 資產
CREATE POLICY "Users can view their line assets" ON public.line_assets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE memberships.organization_id = line_assets.organization_id 
            AND memberships.user_id = auth.uid()
        )
    );

-- 重新整理快取
NOTIFY pgrst, 'reload schema';
