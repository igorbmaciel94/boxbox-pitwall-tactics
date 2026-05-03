import { normalizePersistedData, type PersistedGameData } from '../stores/persistence';

export const BACKUP_APP_ID = 'apex-tactics';
export const BACKUP_VERSION = 1;

export interface BackupPayload {
  version: typeof BACKUP_VERSION;
  app: typeof BACKUP_APP_ID;
  exportedAt: number;
  data: PersistedGameData;
}

export class BackupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackupError';
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseData(value: unknown): PersistedGameData {
  if (!isObject(value)) throw new BackupError('Invalid backup data');

  const locale = value.locale;
  if (locale !== null && locale !== undefined && locale !== 'en' && locale !== 'pt-BR') {
    throw new BackupError('Unsupported backup locale');
  }

  return normalizePersistedData({
    selectedTeam: typeof value.selectedTeam === 'string' ? value.selectedTeam : null,
    locale: locale === 'en' || locale === 'pt-BR' ? locale : null,
    currentDeck: Array.isArray(value.currentDeck) ? value.currentDeck as PersistedGameData['currentDeck'] : [],
    savedDecks: Array.isArray(value.savedDecks) ? value.savedDecks as PersistedGameData['savedDecks'] : [],
    bestScores: Array.isArray(value.bestScores) ? value.bestScores as PersistedGameData['bestScores'] : [],
    runHistory: Array.isArray(value.runHistory) ? value.runHistory as PersistedGameData['runHistory'] : [],
    seasonRuns: Array.isArray(value.seasonRuns) ? value.seasonRuns as PersistedGameData['seasonRuns'] : [],
    seasonProgress: isObject(value.seasonProgress) ? value.seasonProgress as unknown as PersistedGameData['seasonProgress'] : null,
    trophies: Array.isArray(value.trophies) ? value.trophies as PersistedGameData['trophies'] : [],
  });
}

export function createBackupPayload(data: PersistedGameData, exportedAt = Date.now()): BackupPayload {
  return {
    version: BACKUP_VERSION,
    app: BACKUP_APP_ID,
    exportedAt,
    data: normalizePersistedData(data),
  };
}

export function serializeBackup(data: PersistedGameData, exportedAt?: number): string {
  return JSON.stringify(createBackupPayload(data, exportedAt), null, 2);
}

export function parseBackup(raw: string): BackupPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new BackupError('Backup file is not valid JSON');
  }

  if (!isObject(parsed)) throw new BackupError('Invalid backup file');
  if (parsed.app !== BACKUP_APP_ID) throw new BackupError('Backup was made for another app');
  if (parsed.version !== BACKUP_VERSION) throw new BackupError('Unsupported backup version');
  if (typeof parsed.exportedAt !== 'number') throw new BackupError('Backup export date is missing');

  return {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt: parsed.exportedAt,
    data: parseData(parsed.data),
  };
}

export async function readBackupFile(file: File): Promise<BackupPayload> {
  return parseBackup(await file.text());
}

export function downloadBackup(raw: string, exportedAt = Date.now()): void {
  const blob = new Blob([raw], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `apex-tactics-backup-${new Date(exportedAt).toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
