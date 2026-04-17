import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { IngestionService } from '@/lib/services/IngestionService';

// 允許此 API 最長執行 60 秒 (保護 AI 學習不被強制中斷)
export const maxDuration = 60;

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── 限制 ──────────────────────────────────────────
const MAX_FILE_SIZE_MB = 5;
const MAX_DOCS_PER_BOT = 10; // 放寬限制以支援更多來源
const ALLOWED_TYPES = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

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

// ── DOCX 文字提取器 ───────────────────────────────
async function extractDocxText(_buffer: ArrayBuffer): Promise<string> {
    throw new Error('DOCX 格式目前尚未完整支援，請將文件另存為 PDF 或 TXT 格式後重新上傳');
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

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            return NextResponse.json({ error: `檔案超過 ${MAX_FILE_SIZE_MB}MB 上限` }, { status: 400 });
        }

        const fileType = file.type || 'application/octet-stream';
        if (!ALLOWED_TYPES.includes(fileType) && !file.name.endsWith('.txt') && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
            return NextResponse.json({ error: '僅支援 PDF、TXT、DOCX 格式' }, { status: 400 });
        }

        const { count } = await supabase
            .from('rag_documents')
            .select('*', { count: 'exact', head: true })
            .eq('bot_id', botId)
            .eq('status', 'ready');

        if ((count || 0) >= MAX_DOCS_PER_BOT) {
            return NextResponse.json({ error: `已達到知識庫文件上限 (${MAX_DOCS_PER_BOT})` }, { status: 400 });
        }

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

        if (docErr || !docRecord) throw new Error('建立文件記錄失敗');

        const docId = docRecord.id;

        // 執行學習 (重構後使用 IngestionService)
        try {
            const buffer = await file.arrayBuffer();
            const ext = file.name.split('.').pop()?.toLowerCase();
            let rawText = '';
            
            if (ext === 'pdf') rawText = await extractPdfText(buffer);
            else if (ext === 'txt') rawText = extractTxtText(buffer);
            else if (ext === 'docx') rawText = await extractDocxText(buffer);

            await IngestionService.processText(rawText, docId, botId);

        } catch (err: any) {
            await supabase.from('rag_documents').update({ status: 'error', error_message: err.message }).eq('id', docId);
            return NextResponse.json({ error: err.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, documentId: docId });

    } catch (err: any) {
        return NextResponse.json({ error: '上傳失敗' }, { status: 500 });
    }
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
