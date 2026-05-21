-- 建立對話記憶表
CREATE TABLE IF NOT EXISTS public.chat_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 開啟 RLS
ALTER TABLE public.chat_memories ENABLE ROW LEVEL SECURITY;

-- 建立政策：使用者只能存取自己的記憶 (基於 email)
CREATE POLICY "Users can manage their own chat memories" 
ON public.chat_memories
FOR ALL
USING (membership_email = (auth.jwt()->>'email'))
WITH CHECK (membership_email = (auth.jwt()->>'email'));

-- 建立索引以加速搜尋
CREATE INDEX IF NOT EXISTS idx_memories_email ON public.chat_memories(membership_email);
CREATE INDEX IF NOT EXISTS idx_memories_created ON public.chat_memories(created_at);

-- 為了方便 AI 搜尋，我們也可以考慮加入 pgvector，但目前先以文字紀錄為主。
