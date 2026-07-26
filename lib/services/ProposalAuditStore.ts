import fs from 'fs';
import path from 'path';

export interface AuditSession {
  sessionId: string;
  proposalSlug: string;
  clientIp: string;
  userAgent: string;
  createdAt: string;
  updatedAt: string;
  isTeamIp?: boolean;
  actions: { action: string; timestamp: string; details?: any }[];
  invoiceInfo?: {
    companyName: string;
    taxId: string;
    invoiceAddress?: string;
    contactEmail?: string;
    remittanceBank5?: string;
    remittanceName?: string;
    submittedAt: string;
  };
}

export interface ProposalProjectConfig {
  slug: string;
  clientTitle: string;
  createdAt: string; // ISO date string YYYY-MM-DD
  validPasswords: string[];
}

export const ALL_PROPOSALS: ProposalProjectConfig[] = [
  {
    slug: 'butter-toast',
    clientTitle: '奶油吐司 (旗艦版)',
    createdAt: '2026-07-23',
    validPasswords: ['20260723', '0723', '20260725', '0725'],
  },
  {
    slug: 'butter-toast-starter',
    clientTitle: '奶油吐司 (精簡版)',
    createdAt: '2026-07-23',
    validPasswords: ['20260723', '0723', '20260725', '0725'],
  },
  {
    slug: 'huajian-motors',
    clientTitle: '華鍵汽車',
    createdAt: '2026-07-24',
    validPasswords: ['20260724', '0724', '20260725', '0725'],
  },
  {
    slug: 'stark-works',
    clientTitle: '史塔克運動科學團隊',
    createdAt: '2026-07-25',
    validPasswords: ['20260725', '0725', '20260724', '0724'],
  },
  {
    slug: 'ko-loong',
    clientTitle: '可龍哥運動科技',
    createdAt: '2026-07-25',
    validPasswords: ['20260725', '0725', '20260724', '0724'],
  },
];

interface AuditStoreData {
  teamIps: string[];
  sessions: Record<string, AuditSession[]>;
  closedProposals?: Record<string, boolean>;
}

// 預設記憶體資料
let auditStoreData: AuditStoreData = {
  teamIps: ['127.0.0.1', '::1', '::ffff:127.0.0.1'],
  sessions: {},
  closedProposals: {},
};

const STORE_FILE_PATH = path.join(process.cwd(), 'lib/data/proposal-audit-store.json');

// 初始化從檔案讀取備份
function loadFromFile() {
  try {
    if (fs.existsSync(STORE_FILE_PATH)) {
      const content = fs.readFileSync(STORE_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.sessions) {
        auditStoreData = {
          teamIps: parsed.teamIps || ['127.0.0.1', '::1', '::ffff:127.0.0.1'],
          sessions: parsed.sessions || {},
          closedProposals: parsed.closedProposals || {},
        };
      } else {
        auditStoreData = {
          teamIps: ['127.0.0.1', '::1', '::ffff:127.0.0.1'],
          sessions: parsed,
          closedProposals: {},
        };
      }
    }
  } catch (err) {
    console.error('[ProposalAuditStore] Error loading audit store file:', err);
  }
}

// 儲存至檔案備份
function saveToFile() {
  try {
    const dir = path.dirname(STORE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(auditStoreData, null, 2), 'utf-8');
  } catch (err) {
    console.error('[ProposalAuditStore] Error saving audit store file:', err);
  }
}

loadFromFile();

export { evaluateIpRisk } from './ProposalAuditUtils';

/**
 * 計算報價單動態生命週期
 */
export function getProposalLifecycleStage(proposalSlug: string) {
  loadFromFile();

  const isManuallyClosed = !!(auditStoreData.closedProposals && auditStoreData.closedProposals[proposalSlug]);
  if (isManuallyClosed) {
    return {
      stage: 'MANUALLY_CLOSED' as const,
      countdownStarted: true,
      daysDiff: 0,
      firstExternalViewedAt: null,
      message: '🔒 已由管理者手動關閉 (對外隱蔽中)',
      isManuallyClosed: true,
    };
  }

  const sessions = auditStoreData.sessions[proposalSlug] || [];
  const teamIps = new Set(auditStoreData.teamIps || []);

  const firstExternalSession = sessions
    .filter((s) => !teamIps.has(s.clientIp) && !s.isTeamIp)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

  if (!firstExternalSession) {
    return {
      stage: 'NORMAL' as const,
      countdownStarted: false,
      daysDiff: 0,
      firstExternalViewedAt: null,
      message: '等待客戶首次開啓 (倒數未啟動)',
      isManuallyClosed: false,
    };
  }

  const firstViewDate = new Date(firstExternalSession.createdAt);
  const now = new Date();
  const timeDiff = now.getTime() - firstViewDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;

  if (daysDiff <= 5) {
    return {
      stage: 'NORMAL' as const,
      countdownStarted: true,
      daysDiff,
      firstExternalViewedAt: firstExternalSession.createdAt,
      message: `客戶已於 ${new Date(firstExternalSession.createdAt).toLocaleDateString('zh-TW')} 首次開啓 (倒數第 ${daysDiff} 天)`,
      isManuallyClosed: false,
    };
  } else if (daysDiff <= 10) {
    return {
      stage: 'EXPIRED' as const,
      countdownStarted: true,
      daysDiff,
      firstExternalViewedAt: firstExternalSession.createdAt,
      message: `密碼已過期 (客戶首次開啓後第 ${daysDiff} 天)`,
      isManuallyClosed: false,
    };
  } else {
    return {
      stage: 'ARCHIVED_404' as const,
      countdownStarted: true,
      daysDiff,
      firstExternalViewedAt: firstExternalSession.createdAt,
      message: `網址已歸檔下架 (客戶首次開啓後第 ${daysDiff} 天)`,
      isManuallyClosed: false,
    };
  }
}

export const ProposalAuditService = {
  toggleProposalStatus(slug: string, isClosed: boolean) {
    loadFromFile();
    if (!auditStoreData.closedProposals) {
      auditStoreData.closedProposals = {};
    }
    auditStoreData.closedProposals[slug] = isClosed;
    saveToFile();
    return auditStoreData.closedProposals;
  },

  isProposalManuallyClosed(slug: string) {
    loadFromFile();
    return !!(auditStoreData.closedProposals && auditStoreData.closedProposals[slug]);
  },

  registerTeamIp(ip: string) {
    loadFromFile();
    if (ip && !auditStoreData.teamIps.includes(ip)) {
      auditStoreData.teamIps.push(ip);
      saveToFile();
    }
  },

  logAction(data: {
    proposalSlug: string;
    sessionId: string;
    clientIp: string;
    userAgent: string;
    action: string;
    isAdminAccess?: boolean;
    details?: any;
  }) {
    loadFromFile();
    const { proposalSlug, sessionId, clientIp, userAgent, action, isAdminAccess, details } = data;
    const nowIso = new Date().toISOString();

    if (isAdminAccess && clientIp) {
      if (!auditStoreData.teamIps.includes(clientIp)) {
        auditStoreData.teamIps.push(clientIp);
      }
    }

    const isTeamIp = auditStoreData.teamIps.includes(clientIp) || isAdminAccess === true;

    if (!auditStoreData.sessions[proposalSlug]) {
      auditStoreData.sessions[proposalSlug] = [];
    }

    let session = auditStoreData.sessions[proposalSlug].find((s) => s.sessionId === sessionId);
    if (!session) {
      session = {
        sessionId,
        proposalSlug,
        clientIp,
        userAgent,
        createdAt: nowIso,
        updatedAt: nowIso,
        isTeamIp,
        actions: [],
      };
      auditStoreData.sessions[proposalSlug].push(session);
    }

    session.updatedAt = nowIso;
    session.isTeamIp = isTeamIp;
    session.actions.push({
      action,
      timestamp: nowIso,
      details,
    });

    saveToFile();
    return session;
  },

  logInvoice(proposalSlug: string, invoiceData: any) {
    loadFromFile();
    if (!auditStoreData.sessions[proposalSlug]) {
      auditStoreData.sessions[proposalSlug] = [];
    }
    const nowIso = new Date().toISOString();
    const session = auditStoreData.sessions[proposalSlug][0] || {
      sessionId: `INV-${Date.now()}`,
      proposalSlug,
      clientIp: 'Form Submission',
      userAgent: 'Form Submission',
      createdAt: nowIso,
      updatedAt: nowIso,
      isTeamIp: false,
      actions: [],
    };

    session.invoiceInfo = {
      companyName: invoiceData.companyName,
      taxId: invoiceData.taxId,
      invoiceAddress: invoiceData.invoiceAddress,
      contactEmail: invoiceData.contactEmail,
      remittanceBank5: invoiceData.remittanceBank5,
      remittanceName: invoiceData.remittanceName,
      submittedAt: nowIso,
    };

    saveToFile();
    return session;
  },

  getProposalLogs(slug?: string) {
    loadFromFile();
    if (slug) {
      return auditStoreData.sessions[slug] || [];
    }
    return auditStoreData.sessions;
  },

  getTeamIps() {
    loadFromFile();
    return auditStoreData.teamIps;
  },

  getAllAuditBackup() {
    loadFromFile();
    return {
      exportedAt: new Date().toISOString(),
      teamIps: auditStoreData.teamIps,
      proposals: ALL_PROPOSALS.map((p) => {
        const stageInfo = getProposalLifecycleStage(p.slug);
        return {
          project: p,
          lifecycle: stageInfo,
          sessions: auditStoreData.sessions[p.slug] || [],
        };
      }),
    };
  },
};
