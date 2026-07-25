import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ProposalAuditService } from '@/lib/services/ProposalAuditStore';

/**
 * 報價專區 — 客戶發票資料提交與通知 API
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, taxId, invoiceAddress, contactEmail, proposalSlug = 'butter-toast' } = body;

    if (!companyName || !taxId) {
      return NextResponse.json({ error: '請填寫公司名稱與統一編號' }, { status: 400 });
    }

    console.log(`[Invoice Submission] Customer submitted invoice info for proposal: ${proposalSlug}`, body);

    // 同步備份至 ProposalAuditService
    ProposalAuditService.logInvoice(proposalSlug, {
      companyName,
      taxId,
      invoiceAddress,
      contactEmail,
    });

    // 1. 寫入 Supabase 資料庫
    try {
      await supabase
        .from('saas_leads')
        .insert({
          company_name: companyName,
          tax_id: taxId,
          contact_email: contactEmail,
          address: invoiceAddress,
          source: `proposal_${proposalSlug}`,
          status: 'NEW_INVOICE_REQUIRED',
          notes: `發票地址: ${invoiceAddress} | 提交時間: ${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`,
        });
    } catch (dbErr) {
      console.warn('[Invoice Supabase Warning]:', dbErr);
    }

    // 2. LINE Notify 即時通知老闆/小編
    if (process.env.LINE_NOTIFY_TOKEN) {
      const messageText = `\n🧾【收到客戶發票資料通知】\n` +
        `📌 專案：${proposalSlug}\n` +
        `🏢 公司全銜：${companyName}\n` +
        `🔢 統一編號：${taxId}\n` +
        `📍 寄送地址：${invoiceAddress || '未填寫'}\n` +
        `✉️ 通知 Email：${contactEmail || '未填寫'}\n` +
        `⏰ 提交時間：${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`;

      try {
        await fetch('https://notify-api.line.me/api/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${process.env.LINE_NOTIFY_TOKEN}`,
          },
          body: `message=${encodeURIComponent(messageText)}`,
        });
      } catch (err) {
        console.error('[LINE Notify Error]:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: '發票資料已成功傳送！',
      submittedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Invoice API Error]:', err);
    return NextResponse.json({ error: err.message || '提交失敗' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const logs = ProposalAuditService.getProposalLogs(slug || undefined);

    return NextResponse.json({ success: true, records: logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
