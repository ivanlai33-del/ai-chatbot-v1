-- ================================================
-- Crawler Enhancement: rag_documents
-- ================================================

-- 1. 新增加欄位（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rag_documents' AND column_name='source_url') THEN
        ALTER TABLE rag_documents ADD COLUMN source_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rag_documents' AND column_name='content_hash') THEN
        ALTER TABLE rag_documents ADD COLUMN content_hash TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rag_documents' AND column_name='last_scraped_at') THEN
        ALTER TABLE rag_documents ADD COLUMN last_scraped_at TIMESTAMPTZ;
    END IF;
END $$;

-- 2. 建立索引加速來源查詢
CREATE INDEX IF NOT EXISTS rag_documents_source_url_idx ON rag_documents (source_url);

-- 3. 備註描述
COMMENT ON COLUMN rag_documents.source_url IS '爬取的資料來源 URL';
COMMENT ON COLUMN rag_documents.content_hash IS 'Markdown 內容的 SHA-256 雜湊，用於比對是否有更動';
COMMENT ON COLUMN rag_documents.last_scraped_at IS '最後一次成功爬取同步的時間';
