export function calculateProposalLifecycle(createdAtStr: string) {
  const created = new Date(createdAtStr);
  const now = new Date();
  
  // 計算天數差
  const diffTime = now.getTime() - created.getTime();
  const daysDiff = Math.floor(diffTime / (1000 * 3600 * 24));

  if (daysDiff <= 5) {
    return { stage: "NORMAL" as const, daysDiff };
  } else if (daysDiff <= 10) {
    return { stage: "EXPIRED" as const, daysDiff };
  } else {
    return { stage: "ARCHIVED_404" as const, daysDiff };
  }
}

export async function sendProposalAuditTrack(slug: string, action: string, details?: any, isAdminAccess?: boolean): Promise<any> {
  try {
    let sessionId = sessionStorage.getItem(`audit_session_${slug}`);
    if (!sessionId) {
      sessionId = `SES-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      sessionStorage.setItem(`audit_session_${slug}`, sessionId);
    }

    const res = await fetch("/api/proposals/audit-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proposalSlug: slug,
        sessionId,
        action,
        isAdminAccess: isAdminAccess || false,
        details,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("[Audit Track Error]:", err);
    return null;
  }
}
