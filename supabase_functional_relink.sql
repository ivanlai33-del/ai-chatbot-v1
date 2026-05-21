-- AGI Orchestration OS: Neural Relinking Script
-- This script creates the missing tables for 'Dead' or 'Orphan' modules.

-- 1. Activity Logs (For Logs Module)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES public.partners(id),
    oa_id UUID REFERENCES public.official_accounts(id),
    actor_type TEXT NOT NULL, -- 'AGI' or 'HUMAN'
    action_type TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Deployment Queue (For Publish Module)
CREATE TABLE IF NOT EXISTS public.deployment_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES public.partners(id),
    target_oa_id UUID REFERENCES public.official_accounts(id),
    component_type TEXT NOT NULL, -- 'RICH_MENU', 'MESSAGE', 'COUPON'
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'SUCCESS', 'FAILED'
    payload JSONB,
    deployed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Coupons (For Coupons Module)
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oa_id UUID REFERENCES public.official_accounts(id),
    title TEXT NOT NULL,
    discount_type TEXT NOT NULL, -- 'PERCENTAGE', 'FIXED'
    value NUMERIC NOT NULL,
    min_spend NUMERIC DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Loyalty Points (For Loyalty Module)
CREATE TABLE IF NOT EXISTS public.loyalty_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id),
    oa_id UUID REFERENCES public.official_accounts(id),
    points_change INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Knowledge Entries (For Knowledge Module)
CREATE TABLE IF NOT EXISTS public.knowledge_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES public.partners(id),
    category TEXT,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- For Vector Search
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Surveys (For Surveys Module)
CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oa_id UUID REFERENCES public.official_accounts(id),
    title TEXT NOT NULL,
    questions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Customer Journeys (For Journey Module)
CREATE TABLE IF NOT EXISTS public.customer_journeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oa_id UUID REFERENCES public.official_accounts(id),
    title TEXT NOT NULL,
    nodes JSONB NOT NULL, -- Visual Workflow Nodes
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and permissions for all new tables
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_journeys ENABLE ROW LEVEL SECURITY;
