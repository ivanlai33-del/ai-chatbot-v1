import fs from 'fs';
import path from 'path';

export interface AuditSession {
  sessionId: string;
  proposalSlug: string;
  clientIp: string;
  userAgent: string;
  createdAt: string;
  updatedAt: string;
  actions: { action: string; timestamp: string; details?: any }[];
  invoiceInfo?: {
    companyName: string;
    taxId: string;
    invoiceAddress?: string;
    contactEmail?: string;
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
    slug: 'ko-loong',
    clientTitle: '科隆工業',
    createdAt: '2026-07-20',
    validPasswords: ['20260720', '0720', '20260725', '0725'],
  },
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
];

/**
 * 計算報價單目前的生命週期階段
 * 🟢 Day 1 ~ 5: NORMAL (正常存取)
 * 🟡 Day 6 ~ 10: EXPIRED (密碼過期禁用)
 * 🔴 Day > 10: ARCHIVED_404 (網址隱蔽歸檔 404)
 */
export function getProposalLifecycleStage(createdDateStr: string) {
  const createdDate = new Date(createdDateStr);
  const now = new Date();
  
  // 計算天數差 (以 ms 為單位轉成天數)
  const timeDiff = now.getTime() - createdDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

  if (daysDiff <= 5) {
    return { stage: 'NORMAL' as const, daysDiff };
  } else if (daysDiff <= 10) {
    return { stage: 'EXPIRED' as const, daysDiff };
  } else {
    return { stage: 'ARCHIVED_404' as const, daysDiff };
  }
}

// 記憶體快取數據
let memoryAuditStore: Record<string, AuditSession[]> = {};

const STORE_FILE_PATH = path.join(process.cwd(), 'lib/data/proposal-audit-store.json');

// 初始化從檔案讀取備份
function loadFromFile() {
  try {
    if (fs.existsSync(STORE_FILE_PATH)) {
      const content = fs.readFileSync(STORE_FILE_PATH, 'utf-8');
      memoryAuditStore = JSON.parse(content);
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
    fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(memoryAuditStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[ProposalAuditStore] Error saving audit store file:', err);
  }
}

loadFromFile();

export const ProposalAuditService = {
  logAction(data: {
    proposalSlug: string;
    sessionId: string;
    clientIp: string;
    userAgent: string;
    action: string;
    details?: any;
  }) {
    loadFromFile();
    const { proposalSlug, sessionId, clientIp, userAgent, action, details } = data;
    const nowIso = new Date().toISOString();

    if (!memoryAuditStore[proposalSlug]) {
      memoryAuditStore[proposalSlug] = [];
    }

    let session = memoryAuditStore[proposalSlug].find((s) => s.sessionId === sessionId);
    if (!session) {
      session = {
        sessionId,
        proposalSlug,
        clientIp,
        userAgent,
        createdAt: nowIso,
        updatedAt: nowIso,
        actions: [],
      };
      memoryAuditStore[proposalSlug].push(session);
    }

    session.updatedAt = nowIso;
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
    if (!memoryAuditStore[proposalSlug]) {
      memoryAuditStore[proposalSlug] = [];
    }
    const nowIso = new Date().toISOString();
    const session = memoryAuditStore[proposalSlug][0] || {
      sessionId: `INV-${Date.now()}`,
      proposalSlug,
      clientIp: 'Form Submission',
      userAgent: 'Form Submission',
      createdAt: nowIso,
      updatedAt: nowIso,
      actions: [],
    };

    session.invoiceInfo = {
      companyName: invoiceData.companyName,
      taxId: invoiceData.taxId,
      invoiceAddress: invoiceData.invoiceAddress,
      contactEmail: invoiceData.contactEmail,
      submittedAt: nowIso,
    };

    saveToFile();
    return session;
  },

  getProposalLogs(slug?: string) {
    loadFromFile();
    if (slug) {
      return memoryAuditStore[slug] || [];
    }
    return memoryAuditStore;
  },

  getAllAuditBackup() {
    loadFromFile();
    return {
      exportedAt: new Date().toISOString(),
      proposals: ALL_PROPOSALS.map((p) => {
        const stageInfo = getProposalLifecycleStage(p.createdAt);
        return {
          project: p,
          lifecycle: stageInfo,
          sessions: memoryAuditStore[p.slug] || [],
        };
      }),
    };
  },
};
