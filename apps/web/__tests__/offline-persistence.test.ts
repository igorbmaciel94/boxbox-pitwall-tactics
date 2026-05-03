import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockIdb = vi.hoisted(() => ({
  store: new Map<string, unknown>(),
}));

vi.mock('idb-keyval', () => ({
  get: vi.fn((key: string) => Promise.resolve(mockIdb.store.get(key))),
  set: vi.fn((key: string, value: unknown) => {
    mockIdb.store.set(key, value);
    return Promise.resolve();
  }),
  del: vi.fn((key: string) => {
    mockIdb.store.delete(key);
    return Promise.resolve();
  }),
}));

import { parseBackup } from '../src/lib/backup';
import {
  OFFLINE_PROFILE_ID,
  loadAllPersistedData,
  migrateToOfflineProfile,
  replaceAllPersistedData,
  type PersistedGameData,
} from '../src/stores/persistence';

function createLocalStorageMock() {
  const values = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    removeItem: vi.fn((key: string) => values.delete(key)),
    clear: vi.fn(() => values.clear()),
  };
}

describe('offline profile migration', () => {
  beforeEach(() => {
    mockIdb.store.clear();
    vi.stubGlobal('localStorage', createLocalStorageMock());
  });

  it('copies guest profile data into the offline profile when offline is empty', async () => {
    localStorage.setItem('boxbox-guest-id', 'guest-123');
    mockIdb.store.set('boxbox-guest-123-team', 'crimson');
    mockIdb.store.set('boxbox-guest-123-current-deck', ['push-hard', 'box-box']);
    mockIdb.store.set('boxbox-guest-123-decks', [{ id: 'deck-1', name: 'box-box', cards: ['box-box'], createdAt: 1 }]);

    await migrateToOfflineProfile();

    const data = await loadAllPersistedData(OFFLINE_PROFILE_ID);
    expect(data.selectedTeam).toBe('crimson');
    expect(data.currentDeck).toEqual(['push-hard', 'pit-call']);
    expect(data.savedDecks).toEqual([{ id: 'deck-1', name: 'box-box', cards: ['pit-call'], createdAt: 1 }]);
    expect(mockIdb.store.get('boxbox-guest-123-team')).toBe('crimson');
    expect(mockIdb.store.get('apex-offline-team')).toBe('crimson');
  });

  it('copies old offline profile data before guest data', async () => {
    mockIdb.store.set('boxbox-offline-team', 'azure');
    mockIdb.store.set('boxbox-guest-123-team', 'crimson');
    localStorage.setItem('boxbox-guest-id', 'guest-123');

    await migrateToOfflineProfile();

    const data = await loadAllPersistedData(OFFLINE_PROFILE_ID);
    expect(data.selectedTeam).toBe('azure');
  });

  it('does not overwrite an existing Apex offline profile', async () => {
    localStorage.setItem('boxbox-guest-id', 'guest-123');
    mockIdb.store.set('apex-offline-team', 'azure');
    mockIdb.store.set('boxbox-guest-123-team', 'crimson');

    await migrateToOfflineProfile();

    const data = await loadAllPersistedData(OFFLINE_PROFILE_ID);
    expect(data.selectedTeam).toBe('azure');
  });

  it('does not treat a locale-only offline profile as migrated progress', async () => {
    localStorage.setItem('boxbox-guest-id', 'guest-123');
    mockIdb.store.set('apex-offline-locale', 'en');
    mockIdb.store.set('boxbox-guest-123-team', 'crimson');

    await migrateToOfflineProfile();

    const data = await loadAllPersistedData(OFFLINE_PROFILE_ID);
    expect(data.selectedTeam).toBe('crimson');
  });

  it('restores valid imported backup data', async () => {
    const imported: PersistedGameData = {
      selectedTeam: 'crimson',
      locale: 'pt-BR',
      currentDeck: ['pit-call'],
      savedDecks: [{ id: 'deck-1', name: 'Imported', cards: ['pit-call'], createdAt: 1 }],
      bestScores: [{ scenarioId: 'harbor', score: 80, position: 2, medal: 'gold', timestamp: 1 }],
      runHistory: [],
      seasonRuns: [],
      seasonProgress: null,
      trophies: [{ goalCardId: 'top-6', teamId: 'crimson', championshipPosition: 2, goalAchieved: true, finalScore: 80, timestamp: 1 }],
    };

    await replaceAllPersistedData(OFFLINE_PROFILE_ID, imported);

    expect(await loadAllPersistedData(OFFLINE_PROFILE_ID)).toEqual(imported);
  });

  it('leaves existing data unchanged when backup parsing fails', async () => {
    const existing: PersistedGameData = {
      selectedTeam: 'azure',
      locale: 'en',
      currentDeck: ['push-hard'],
      savedDecks: [],
      bestScores: [],
      runHistory: [],
      seasonRuns: [],
      seasonProgress: null,
      trophies: [],
    };
    await replaceAllPersistedData(OFFLINE_PROFILE_ID, existing);

    expect(() => parseBackup('{bad json')).toThrow();
    expect(await loadAllPersistedData(OFFLINE_PROFILE_ID)).toEqual(existing);
  });
});
