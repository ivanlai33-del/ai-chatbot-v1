import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * 報價專區 — 多裝置/多成員傳閱與 IP 稽核紀錄 API
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      proposalSlug = 'ko-loong',
      sessionId = `SES-${Date.now()}`,
      deviceInfo = 'Desktop (Web)',
      clientIp = '',
      userAgent = '',
      probableRole = '窗口/觀看者',
      events = [],
      acceptedTerms = false,
      totalDurationSeconds = 0,
    } = body;

    // 獲取 Real IP (支援 Proxy / Cloudflare Header)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = forwardedFor ? forwardedFor.split(',')[0].trim() : clientIp || req.ip || 'Unknown';

    console.log(`[Proposal Multi-Session Audit] Session: ${sessionId} | Role: ${probableRole} | IP: ${realIp} | Device: ${deviceInfo}`);

    // 1. 寫入 Supabase saas_leads / audit 資料表
    const { data, error } = await supabase
      .from('saas_leads')
      .insert({
        company_name: `[${probableRole}] ${proposalSlug}`,
        tax_id: `${realIp} (${deviceInfo})`,
        source: `audit_${proposalSlug}_${sessionId}`,
        status: acceptedTerms ? 'TERMS_ACCEPTED' : 'VIEWED',
        notes: `Session: ${sessionId} | 角色估計: ${probableRole} | 裝置: ${deviceInfo} | IP: ${realIp} | 停留: ${totalDurationSeconds}秒 | 事件數: ${events.length}`,
      })
      .select();

    if (error) {
      console.warn('[Audit DB Log Warning]:', error.message);
    }

    return NextResponse.json({
      success: true,
      sessionId,
      probableRole,
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

    return NextResponse.json({ success: true, sessions: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
