import fs from 'fs';
import path from 'path';

export interface ProposalVersion {
  versionId: string; // e.g. 'v1', 'v2'
  versionNum: number;
  createdAt: string; // ISO date string
  note?: string; // Optional admin note
  isActive: boolean; // Is this version currently served to clients?
  textOverrides: Record<string, string>; // Map of element key -> text content
}

export interface ProposalVersionStoreData {
  versions: Record<string, ProposalVersion[]>;
  activeVersionIds: Record<string, string>;
}

let storeData: ProposalVersionStoreData = {
  versions: {},
  activeVersionIds: {},
};

const STORE_FILE_PATH = path.join(process.cwd(), 'lib/data/proposal-versions-store.json');

function loadFromFile() {
  try {
    if (fs.existsSync(STORE_FILE_PATH)) {
      const content = fs.readFileSync(STORE_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      storeData = {
        versions: parsed.versions || {},
        activeVersionIds: parsed.activeVersionIds || {},
      };
    }
  } catch (err) {
    console.error('[ProposalVersionStore] Load Error:', err);
  }
}

function saveToFile() {
  try {
    const dir = path.dirname(STORE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(storeData, null, 2), 'utf-8');
  } catch (err) {
    console.error('[ProposalVersionStore] Save Error:', err);
  }
}

loadFromFile();

export const ProposalVersionService = {
  getVersions(slug: string): { versions: ProposalVersion[]; activeVersionId: string } {
    loadFromFile();
    const versions = storeData.versions[slug] || [];
    const activeVersionId = storeData.activeVersionIds[slug] || (versions.length > 0 ? versions[versions.length - 1].versionId : 'v1');

    if (versions.length === 0) {
      // Default initial version
      const v1: ProposalVersion = {
        versionId: 'v1',
        versionNum: 1,
        createdAt: new Date().toISOString(),
        note: 'AI 初始建立版',
        isActive: true,
        textOverrides: {},
      };
      return { versions: [v1], activeVersionId: 'v1' };
    }

    return { versions, activeVersionId };
  },

  getVersionContent(slug: string, targetVersionId?: string): { version: ProposalVersion | null; textOverrides: Record<string, string> } {
    loadFromFile();
    const versions = storeData.versions[slug] || [];
    const activeId = targetVersionId || storeData.activeVersionIds[slug] || (versions.length > 0 ? versions[versions.length - 1].versionId : 'v1');

    const found = versions.find((v) => v.versionId === activeId);
    if (found) {
      return { version: found, textOverrides: found.textOverrides || {} };
    }

    // Default empty overrides if not found
    return {
      version: versions.length > 0 ? versions[0] : null,
      textOverrides: versions.length > 0 && versions[0].textOverrides ? versions[0].textOverrides : {},
    };
  },

  createVersion(slug: string, textOverrides: Record<string, string>, note?: string): ProposalVersion {
    loadFromFile();
    if (!storeData.versions[slug]) {
      storeData.versions[slug] = [];
    }

    const currentVersions = storeData.versions[slug];
    const nextNum = currentVersions.length + 1;
    const versionId = `v${nextNum}`;
    const nowIso = new Date().toISOString();

    // Mark previous versions inactive
    currentVersions.forEach((v) => {
      v.isActive = false;
    });

    const newVersion: ProposalVersion = {
      versionId,
      versionNum: nextNum,
      createdAt: nowIso,
      note: note || `版本 v${nextNum} (自訂編修)`,
      isActive: true,
      textOverrides,
    };

    currentVersions.push(newVersion);
    storeData.activeVersionIds[slug] = versionId;

    saveToFile();
    return newVersion;
  },

  setActiveVersion(slug: string, versionId: string): boolean {
    loadFromFile();
    const versions = storeData.versions[slug] || [];
    const found = versions.find((v) => v.versionId === versionId);

    if (!found) return false;

    versions.forEach((v) => {
      v.isActive = v.versionId === versionId;
    });

    storeData.activeVersionIds[slug] = versionId;
    saveToFile();
    return true;
  },
};
