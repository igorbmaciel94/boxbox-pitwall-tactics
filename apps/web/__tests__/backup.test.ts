import { describe, expect, it } from 'vitest';
import { BackupError, BACKUP_APP_ID, BACKUP_VERSION, createBackupPayload, parseBackup, serializeBackup } from '../src/lib/backup';
import type { PersistedGameData } from '../src/stores/persistence';
import type { RaceDebrief, RaceEvent } from '@apex/engine';

const sampleEvent: RaceEvent = {
  type: 'caution-phase',
  name: 'Caution Phase',
  flavorIndex: 0,
  effect: { tireWear: -5 },
  flavorText: 'Caution phase deployed.',
};

const sampleDebrief: RaceDebrief = {
  scenarioId: 'harbor',
  teamId: 'crimson',
  finalPosition: 2,
  positionScore: 18,
  objectivesCompleted: [],
  objectivePoints: 0,
  styleBonus: 0,
  totalScore: 80,
  eventHistory: [sampleEvent],
  cardsPlayed: ['pit-call'],
  perkUsed: false,
  hasPitted: true,
  turnLog: [{
    turn: 1,
    event: sampleEvent,
    actionCard: 'pit-call',
    perkActivated: false,
    tireCompound: 'medium',
    stateSnapshot: { position: 2, tireWear: 0 },
  }],
  seed: 7,
};

const sampleData: PersistedGameData = {
  selectedTeam: 'crimson',
  locale: 'en',
  currentDeck: ['push-hard', 'pit-call'],
  savedDecks: [{ id: 'deck-1', name: 'Starter', cards: ['push-hard'], createdAt: 1 }],
  bestScores: [{ scenarioId: 'harbor', score: 80, position: 2, medal: 'gold', timestamp: 2 }],
  runHistory: [{ scenarioId: 'harbor', teamId: 'crimson', debrief: sampleDebrief, timestamp: 3 }],
  seasonRuns: [{
    teamId: 'crimson',
    races: [sampleDebrief],
    finalScore: 80,
    timestamp: 4,
    goalCardId: 'top-6',
    goalAchieved: true,
    championshipPosition: 2,
  }],
  seasonProgress: {
    raceOrder: ['harbor'],
    currentRaceIndex: 0,
    raceResults: [sampleDebrief],
    cumulativeScore: 80,
    seed: 9,
    tireBank: { soft: 1, medium: 1, hard: 1 },
    difficulty: 'normal',
    initialTireBank: { soft: 1, medium: 1, hard: 1 },
    pendingTireAllocation: null,
    playerDriverId: 'driver-1',
    goalCardId: 'top-6',
    championshipStandings: [],
  },
  trophies: [{
    goalCardId: 'top-6',
    teamId: 'crimson',
    championshipPosition: 2,
    goalAchieved: true,
    finalScore: 80,
    timestamp: 5,
  }],
};

describe('backup payloads', () => {
  it('creates a versioned Apex Tactics backup', () => {
    const backup = createBackupPayload(sampleData, 123);

    expect(backup).toEqual({
      version: BACKUP_VERSION,
      app: BACKUP_APP_ID,
      exportedAt: 123,
      data: sampleData,
    });
    expect(backup.data.currentDeck).toHaveLength(2);
    expect(backup.data.runHistory).toHaveLength(1);
    expect(backup.data.seasonRuns).toHaveLength(1);
    expect(backup.data.seasonProgress?.raceResults).toHaveLength(1);
    expect(backup.data.trophies).toHaveLength(1);
  });

  it('round-trips serialized backup data', () => {
    const parsed = parseBackup(serializeBackup(sampleData, 456));

    expect(parsed.exportedAt).toBe(456);
    expect(parsed.data).toEqual(sampleData);
  });

  it('rejects invalid JSON without producing data', () => {
    expect(() => parseBackup('{bad json')).toThrow(BackupError);
  });

  it('rejects backups from another app', () => {
    const raw = JSON.stringify({ version: 1, app: 'other-app', exportedAt: 1, data: sampleData });

    expect(() => parseBackup(raw)).toThrow(BackupError);
  });

  it('normalizes legacy ids when parsing an old backup', () => {
    const legacy = {
      version: 1,
      app: BACKUP_APP_ID,
      exportedAt: 1,
      data: {
        ...sampleData,
        currentDeck: ['box-box', 'drs-attack'],
        savedDecks: [{ id: 'deck-1', name: 'monaco', cards: ['box-box'], createdAt: 1 }],
        bestScores: [{ ...sampleData.bestScores[0], scenarioId: 'monaco' }],
      },
    };

    const parsed = parseBackup(JSON.stringify(legacy));
    expect(parsed.data.currentDeck).toEqual(['pit-call', 'aero-boost']);
    expect(parsed.data.savedDecks[0]).toMatchObject({ name: 'monaco', cards: ['pit-call'] });
    expect(parsed.data.bestScores[0].scenarioId).toBe('harbor');
  });
});
