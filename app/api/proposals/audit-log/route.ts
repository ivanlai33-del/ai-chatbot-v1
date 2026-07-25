import { NextRequest, NextResponse } from 'next/server';
import { ProposalAuditService, ALL_PROPOSALS, getProposalLifecycleStage } from '@/lib/services/ProposalAuditStore';

/**
 * 報價專區 — IP / 時間標記 / 操作軌跡與備份下載 API
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      proposalSlug = 'stark-works',
      sessionId = `SES-${Date.now()}`,
      action = 'UNLOCKED_VIEW',
      details = {},
    } = body;

    // 獲取 Real IP (支援 Proxy / Cloudflare Header)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const cfIp = req.headers.get('cf-connecting-ip');
    const realIp = cfIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : req.ip || 'Unknown');
    const userAgent = req.headers.get('user-agent') || 'Unknown Device';

    // 記錄 Audit 日誌
    const session = ProposalAuditService.logAction({
      proposalSlug,
      sessionId,
      clientIp: realIp,
      userAgent,
      action,
      details,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
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
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const exportMode = searchParams.get('export');

    if (exportMode === 'all') {
      const fullBackup = ProposalAuditService.getAllAuditBackup();
      return new NextResponse(JSON.stringify(fullBackup, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="all_proposals_audit_backup_${Date.now()}.json"`,
        },
      });
    }

    if (exportMode === 'single' && slug) {
      const logs = ProposalAuditService.getProposalLogs(slug);
      const projectConfig = ALL_PROPOSALS.find((p) => p.slug === slug);
      const stageInfo = projectConfig ? getProposalLifecycleStage(projectConfig.createdAt) : null;
      
      const singleBackup = {
        exportedAt: new Date().toISOString(),
        project: projectConfig,
        lifecycle: stageInfo,
        sessions: logs,
      };

      return new NextResponse(JSON.stringify(singleBackup, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${slug}_evidence_pack_${Date.now()}.json"`,
        },
      });
    }

    // 預設返回後台統計數據
    const allLogs = ProposalAuditService.getProposalLogs() as Record<string, any[]>;
    
    // 計算全站實時統計數據
    let totalSessionsCount = 0;
    let totalInvoiceCount = 0;
    const projectSummaries = ALL_PROPOSALS.map((p) => {
      const projectSessions = (allLogs[p.slug] || []) as any[];
      totalSessionsCount += projectSessions.length;
      
      const invoiceSessions = projectSessions.filter((s) => s.invoiceInfo);
      totalInvoiceCount += invoiceSessions.length;

      const latestSession = projectSessions.length > 0
        ? projectSessions.reduce((prev, current) => (new Date(prev.updatedAt) > new Date(current.updatedAt) ? prev : current))
        : null;

      const stageInfo = getProposalLifecycleStage(p.createdAt);

      return {
        slug: p.slug,
        title: p.clientTitle,
        createdAt: p.createdAt,
        lifecycle: stageInfo,
        sessionCount: projectSessions.length,
        latestViewAt: latestSession ? latestSession.updatedAt : null,
        latestIp: latestSession ? latestSession.clientIp : null,
        invoiceCount: invoiceSessions.length,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalProjects: ALL_PROPOSALS.length,
        totalSessions: totalSessionsCount,
        totalInvoices: totalInvoiceCount,
      },
      projects: projectSummaries,
      allLogs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
