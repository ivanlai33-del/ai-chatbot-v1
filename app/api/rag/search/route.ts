import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/**
 * 根據用戶提問，在 rag_chunks 向量空間中搜尋最相關段落
 * 供 LINE webhook 和 /chat API 呼叫
 */
export async function POST(req: NextRequest) {
    try {
        const { query, botId, limit = 4 } = await req.json();

        if (!query || !botId) {
            return NextResponse.json({ chunks: [] });
        }

        // 1. 生成查詢的 Embedding
        const embRes = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: query,
        });
        const queryEmbedding = embRes.data[0].embedding;

        // 2. 向量相似度搜尋
        const { data, error } = await supabase.rpc('search_rag_chunks', {
            p_bot_id: botId,
            p_embedding: queryEmbedding,
            p_limit: limit,
        });

        if (error) {
            console.error('[RAG Search] Error:', error.message);
            return NextResponse.json({ chunks: [] });
        }

        // 3. 只回傳相似度 > 0.5 的結果（濾掉不相關段落）
        const relevant = (data || []).filter((r: any) => r.similarity > 0.5);
        return NextResponse.json({ chunks: relevant.map((r: any) => r.content) });

    } catch (err: any) {
        console.error('[RAG Search] Unexpected error:', err.message);
        return NextResponse.json({ chunks: [] });
    }
}
