import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * 報價專區 — 客戶瀏覽行為與 IP 時間戳記背景紀錄 API
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      proposalSlug = 'ko-loong',
      clientIp = '',
      userAgent = '',
      events = [],
      acceptedTerms = false,
      totalDurationSeconds = 0,
    } = body;

    // 取得請求來源的 Real IP (優先由 Header 獲取)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = forwardedFor ? forwardedFor.split(',')[0].trim() : clientIp || req.ip || 'Unknown';

    console.log(`[Proposal Audit Trail Logged] Slug: ${proposalSlug} | IP: ${realIp} | Events: ${events.length}`);

    // 1. 寫入 Supabase saas_leads / audit 表
    const { data, error } = await supabase
      .from('saas_leads')
      .insert({
        company_name: `[Audit Tracker] ${proposalSlug}`,
        tax_id: realIp,
        source: `audit_${proposalSlug}`,
        status: acceptedTerms ? 'TERMS_ACCEPTED' : 'VIEWED',
        notes: `IP: ${realIp} | 停留: ${totalDurationSeconds}秒 | 事件數: ${events.length} |UA: ${userAgent.slice(0, 100)}`,
      })
      .select();

    if (error) {
      console.warn('[Audit DB Log Warning]:', error.message);
    }

    return NextResponse.json({
      success: true,
      loggedIp: realIp,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Proposal Audit API Error]:', err);
    return NextResponse.json({ error: err.message || 'Audit logging failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('saas_leads')
      .select('*')
      .like('source', 'audit_%')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, logs: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
