import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/**
 * 搜尋與用戶訊息最相關的 RAG 知識庫段落
 * 直接呼叫，無需 HTTP 請求，降低延遲
 *
 * @returns 相關段落文字陣列（空陣列代表無結果或失敗）
 */
export async function searchRAGChunks(
    botId: string,
    query: string,
    limit = 3,
    minSimilarity = 0.50
): Promise<string[]> {
    try {
        // 1. 確認此 bot 是否有 ready 的文件（避免不必要的 Embedding 費用）
        const { count } = await supabase
            .from('rag_documents')
            .select('*', { count: 'exact', head: true })
            .eq('bot_id', botId)
            .eq('status', 'ready');

        if (!count || count === 0) return [];

        // 2. 生成查詢的 Embedding
        const embRes = await Promise.race([
            openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: query,
            }),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Embedding timeout')), 3000)
            ),
        ]);

        const queryEmbedding = (embRes as any).data[0].embedding;

        // 3. 向量相似度搜尋（使用 pgvector RPC）
        const { data, error } = await supabase.rpc('search_rag_chunks', {
            p_bot_id: botId,
            p_embedding: queryEmbedding,
            p_limit: limit,
        });

        if (error) {
            console.warn('[RAGService] pgvector search error:', error.message);
            return [];
        }

        // 4. 過濾低相似度結果
        return (data || [])
            .filter((r: { content: string; similarity: number }) => r.similarity >= minSimilarity)
            .map((r: { content: string; similarity: number }) => r.content);

    } catch (err: any) {
        // 靜默失敗，不影響主要 AI 回覆流程
        console.warn('[RAGService] Search failed (non-blocking):', err.message);
        return [];
    }
}
