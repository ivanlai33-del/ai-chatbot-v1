-- ================================================
-- RAG Phase 1: Document Upload & Vector Search
-- 執行前請確認 Supabase 已啟用 pgvector 擴充
-- ================================================

-- 1. 啟用 pgvector 擴充（如已啟用可跳過）
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. RAG 文件主表（中繼資料）
CREATE TABLE IF NOT EXISTS rag_documents (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_id          UUID NOT NULL REFERENCES line_channel_configs(id) ON DELETE CASCADE,
    user_id         TEXT NOT NULL,
    file_name       TEXT NOT NULL,
    file_size       INTEGER NOT NULL,
    file_type       TEXT NOT NULL,  -- 'pdf' | 'docx' | 'txt'
    storage_path    TEXT,           -- Supabase Storage 路徑（備用）
    chunk_count     INTEGER DEFAULT 0,
    char_count      INTEGER DEFAULT 0,
    status          TEXT DEFAULT 'processing', -- 'processing' | 'ready' | 'error'
    error_message   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RAG 文字塊表（向量儲存）
CREATE TABLE IF NOT EXISTS rag_chunks (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id     UUID NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
    bot_id          UUID NOT NULL,  -- 冗餘但加速查詢
    content         TEXT NOT NULL,
    embedding       vector(1536),   -- OpenAI text-embedding-3-small 維度
    chunk_index     INTEGER NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 向量索引（加速相似度搜尋）
CREATE INDEX IF NOT EXISTS rag_chunks_embedding_idx
    ON rag_chunks USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 50);

CREATE INDEX IF NOT EXISTS rag_chunks_bot_id_idx
    ON rag_chunks (bot_id);

CREATE INDEX IF NOT EXISTS rag_documents_bot_id_idx
    ON rag_documents (bot_id);

-- 5. 向量相似度搜尋函式（供 API 呼叫）
CREATE OR REPLACE FUNCTION search_rag_chunks(
    p_bot_id    UUID,
    p_embedding vector(1536),
    p_limit     INTEGER DEFAULT 4
)
RETURNS TABLE (
    content     TEXT,
    similarity  FLOAT
)
LANGUAGE sql STABLE AS $$
    SELECT
        rc.content,
        1 - (rc.embedding <=> p_embedding) AS similarity
    FROM rag_chunks rc
    JOIN rag_documents rd ON rc.document_id = rd.id
    WHERE rc.bot_id = p_bot_id
      AND rd.status = 'ready'
      AND rc.embedding IS NOT NULL
    ORDER BY rc.embedding <=> p_embedding
    LIMIT p_limit;
$$;
