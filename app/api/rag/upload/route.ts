import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// 允許此 API 最長執行 60 秒 (保護 AI 學習不被強制中斷)
export const maxDuration = 60;

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// ── 限制 ──────────────────────────────────────────
const MAX_FILE_SIZE_MB = 5;
const MAX_DOCS_PER_BOT = 5;
const CHUNK_SIZE = 1200;        // 每塊約 300 tokens
const CHUNK_OVERLAP = 200;      // 前後重疊 50 tokens，保留上下文
const ALLOWED_TYPES = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// ── 文字分塊 ──────────────────────────────────────
function chunkText(text: string): string[] {
    const chunks: string[] = [];
    let start = 0;
    const clean = text.replace(/\s+/g, ' ').trim();

    while (start < clean.length) {
        const end = Math.min(start + CHUNK_SIZE, clean.length);
        const chunk = clean.slice(start, end).trim();
        if (chunk.length > 50) chunks.push(chunk); // 過濾太短的塊
        start += CHUNK_SIZE - CHUNK_OVERLAP;
    }
    return chunks;
}

// ── PDF 文字提取（使用 pdfjs-dist）────────────────
async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs' as any);
    const pdf = await getDocument({ data: new Uint8Array(buffer) }).promise;
    let fullText = '';

    for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) { // 最多 50 頁
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
            .map((item: any) => item.str)
            .join(' ');
        fullText += pageText + '\n';
    }
    return fullText;
}

// ── TXT 文字提取 ──────────────────────────────────
function extractTxtText(buffer: ArrayBuffer): string {
    return new TextDecoder('utf-8').decode(buffer);
}

// ── DOCX 文字提取（Phase 2 實作，目前請改用 PDF/TXT）──
async function extractDocxText(_buffer: ArrayBuffer): Promise<string> {
    // Note: 完整 DOCX 解析需要 mammoth 套件，將在 Phase 2 加入
    // 目前透過 API 驗證層已接受 .docx，但提取時回傳提示訊息
    throw new Error('DOCX 格式目前尚未完整支援，請將文件另存為 PDF 或 TXT 格式後重新上傳');
}


// ── Embedding 生成（批次，節省 API 呼叫次數）────────
async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
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

// ── 主要 Handler ──────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const botId = formData.get('botId') as string;
        const userId = formData.get('userId') as string;

        if (!file || !botId || !userId) {
            return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
        }

        // 1. 驗證檔案大小
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            return NextResponse.json({ error: `檔案超過 ${MAX_FILE_SIZE_MB}MB 上限` }, { status: 400 });
        }

        // 2. 驗證檔案類型
        const fileType = file.type || 'application/octet-stream';
        if (!ALLOWED_TYPES.includes(fileType) && !file.name.endsWith('.txt') && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
            return NextResponse.json({ error: '僅支援 PDF、TXT、DOCX 格式' }, { status: 400 });
        }

        // 3. 確認該 bot 未超過文件上限
        const { count } = await supabase
            .from('rag_documents')
            .select('*', { count: 'exact', head: true })
            .eq('bot_id', botId)
            .eq('status', 'ready');

        if ((count || 0) >= MAX_DOCS_PER_BOT) {
            return NextResponse.json({ error: `每個店長最多上傳 ${MAX_DOCS_PER_BOT} 份文件，請先刪除舊文件` }, { status: 400 });
        }

        // 4. 建立 rag_documents 記錄（狀態：processing）
        const { data: docRecord, error: docErr } = await supabase
            .from('rag_documents')
            .insert({
                bot_id: botId,
                user_id: userId,
                file_name: file.name,
                file_size: file.size,
                file_type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
                status: 'processing',
            })
            .select('id')
            .single();

        if (docErr || !docRecord) {
            return NextResponse.json({ error: '建立文件記錄失敗' }, { status: 500 });
        }

        const docId = docRecord.id;

        // 5. 執行學習（強制 await 以防止 Vercel 將其強制關閉）
        try {
            await processDocument(file, docId, botId);
        } catch (err: any) {
            console.error(`[RAG] Document processing failed for ${docId}:`, err.message);
            await supabase.from('rag_documents').update({
                status: 'error',
                error_message: err.message,
            }).eq('id', docId);
            return NextResponse.json({ error: err.message }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            documentId: docId,
            message: '文件已完成 AI 學習並建立向量索引',
        });

    } catch (err: any) {
        console.error('[RAG Upload] Error:', err.message);
        return NextResponse.json({ error: '上傳失敗，請稍後再試' }, { status: 500 });
    }
}

// ── 背景文件處理流程 ──────────────────────────────
async function processDocument(file: File, docId: string, botId: string) {
    const buffer = await file.arrayBuffer();
    const ext = file.name.split('.').pop()?.toLowerCase();

    // 步驟 1：提取文字
    let rawText = '';
    if (ext === 'pdf') {
        rawText = await extractPdfText(buffer);
    } else if (ext === 'txt') {
        rawText = extractTxtText(buffer);
    } else if (ext === 'docx') {
        rawText = await extractDocxText(buffer);
    }

    if (!rawText || rawText.length < 50) {
        throw new Error('無法從文件中提取有效文字，請確認文件非純圖片格式');
    }

    // 步驟 2：分塊
    const chunks = chunkText(rawText);
    if (chunks.length === 0) throw new Error('文件分塊失敗');

    // 步驟 3：生成 Embedding
    const embeddings = await generateEmbeddings(chunks);

    // 步驟 4：批次寫入 rag_chunks
    const chunkRows = chunks.map((content, idx) => ({
        document_id: docId,
        bot_id: botId,
        content,
        embedding: JSON.stringify(embeddings[idx]), // Supabase 接受 JSON 陣列格式
        chunk_index: idx,
    }));

    const { error: chunkErr } = await supabase.from('rag_chunks').insert(chunkRows);
    if (chunkErr) throw new Error(`寫入文字塊失敗: ${chunkErr.message}`);

    // 步驟 5：更新文件狀態為 ready
    await supabase.from('rag_documents').update({
        status: 'ready',
        chunk_count: chunks.length,
        char_count: rawText.length,
        updated_at: new Date().toISOString(),
    }).eq('id', docId);

    console.log(`[RAG] Document ${docId} processed: ${chunks.length} chunks, ${rawText.length} chars`);
}

// ── 查詢文件列表 ──────────────────────────────────
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get('botId');
    if (!botId) return NextResponse.json({ error: '缺少 botId' }, { status: 400 });

    const { data, error } = await supabase
        .from('rag_documents')
        .select('id, file_name, file_size, file_type, chunk_count, char_count, status, error_message, created_at')
        .eq('bot_id', botId)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ documents: data || [] });
}

// ── 刪除文件 ──────────────────────────────────────
export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const docId = searchParams.get('docId');
    if (!docId) return NextResponse.json({ error: '缺少 docId' }, { status: 400 });

    const { error } = await supabase.from('rag_documents').delete().eq('id', docId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
