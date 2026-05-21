import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// ── 限制與常數 ────────────────────────────────────
const CHUNK_SIZE = 1200;        // 每塊約 300 tokens
const CHUNK_OVERLAP = 200;      // 前後重疊 50 tokens

export class IngestionService {
    /**
     * 將純文字轉為 RAG 向量並存入資料庫
     */
    static async processText(text: string, docId: string, botId: string) {
        if (!text || text.length < 50) {
            throw new Error('文字內容過短，無法建立知識庫');
        }

        // 1. 分塊
        const chunks = this.chunkText(text);
        if (chunks.length === 0) throw new Error('文字分塊失敗');

        // 2. 生成 Embedding
        const embeddings = await this.generateEmbeddings(chunks);

        // 3. 批次寫入 rag_chunks
        const chunkRows = chunks.map((content, idx) => ({
            document_id: docId,
            bot_id: botId,
            content,
            embedding: JSON.stringify(embeddings[idx]),
            chunk_index: idx,
        }));

        const { error: chunkErr } = await supabase.from('rag_chunks').insert(chunkRows);
        if (chunkErr) throw new Error(`寫入文字塊失敗: ${chunkErr.message}`);

        // 4. 更新文件狀態
        await supabase.from('rag_documents').update({
            status: 'ready',
            chunk_count: chunks.length,
            char_count: text.length,
            updated_at: new Date().toISOString(),
        }).eq('id', docId);

        return { success: true, chunks: chunks.length };
    }

    private static chunkText(text: string): string[] {
        const chunks: string[] = [];
        let start = 0;
        const clean = text.replace(/\s+/g, ' ').trim();

        while (start < clean.length) {
            const end = Math.min(start + CHUNK_SIZE, clean.length);
            const chunk = clean.slice(start, end).trim();
            if (chunk.length > 50) chunks.push(chunk);
            start += CHUNK_SIZE - CHUNK_OVERLAP;
        }
        return chunks;
    }

    private static async generateEmbeddings(chunks: string[]): Promise<number[][]> {
        const BATCH_SIZE = 20;
        const embeddings: number[][] = [];

        for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
            const batch = chunks.slice(i, i + BATCH_SIZE);
            const response = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: batch,
            });
            embeddings.push(...response.data.map(d => d.embedding));
        }
        return embeddings;
    }
}
