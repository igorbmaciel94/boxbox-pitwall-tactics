import type { BestScore, RunHistoryEntry, SavedDeck, SeasonRunEntry, Trophy } from './types';
import type { SyncPayload } from './api';
import type { TeamId } from '@boxbox/engine';
import type { Locale } from '../i18n';

interface LocalData {
  selectedTeam: TeamId | null;
  locale: Locale;
  savedDecks: SavedDeck[];
  bestScores: BestScore[];
  runHistory: RunHistoryEntry[];
  seasonRuns: SeasonRunEntry[];
  trophies: Trophy[];
}

export function mergeSyncData(local: LocalData, remote: SyncPayload): LocalData {
  return {
    selectedTeam: mergeSimpleValue(
      local.selectedTeam,
      remote.selectedTeam as TeamId | null,
      remote.lastSyncedAt,
    ),
    locale: mergeSimpleValue(
      local.locale,
      (remote.locale || 'en') as Locale,
      remote.lastSyncedAt,
    ),
    savedDecks: mergeDecks(local.savedDecks, remote.savedDecks as SavedDeck[]),
    bestScores: mergeBestScores(local.bestScores, remote.bestScores as BestScore[]),
    runHistory: mergeByTimestamp(local.runHistory, remote.runHistory as RunHistoryEntry[], 20),
    seasonRuns: mergeByTimestamp(local.seasonRuns, remote.seasonRuns as SeasonRunEntry[], 10),
    trophies: mergeByTimestamp(local.trophies, remote.trophies as Trophy[], 20),
  };
}

function mergeSimpleValue<T>(local: T, remote: T, remoteLastSynced: number): T {
  // If remote has been synced and has a value, prefer remote
  return remoteLastSynced > 0 && remote != null ? remote : local;
}

function mergeDecks(local: SavedDeck[], remote: SavedDeck[]): SavedDeck[] {
  const map = new Map<string, SavedDeck>();

  for (const deck of local) {
    map.set(deck.id, deck);
  }

  for (const deck of remote) {
    const existing = map.get(deck.id);
    if (!existing || deck.createdAt > existing.createdAt) {
      map.set(deck.id, deck);
    }
  }

  return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
}

function mergeBestScores(local: BestScore[], remote: BestScore[]): BestScore[] {
  const map = new Map<string, BestScore>();

  for (const score of local) {
    map.set(score.scenarioId, score);
  }

  for (const score of remote) {
    const existing = map.get(score.scenarioId);
    if (!existing || score.score > existing.score) {
      map.set(score.scenarioId, score);
    }
  }

  return Array.from(map.values());
}

function mergeByTimestamp<T extends { timestamp: number }>(
  local: T[],
  remote: T[],
  maxItems: number,
): T[] {
  const seen = new Set<number>();
  const merged: T[] = [];

  for (const item of [...local, ...remote]) {
    if (!seen.has(item.timestamp)) {
      seen.add(item.timestamp);
      merged.push(item);
    }
  }

  merged.sort((a, b) => b.timestamp - a.timestamp);
  return merged.slice(0, maxItems);
}

export function localDataToSyncPayload(data: LocalData): SyncPayload {
  return {
    selectedTeam: data.selectedTeam,
    locale: data.locale,
    savedDecks: data.savedDecks,
    bestScores: data.bestScores,
    runHistory: data.runHistory,
    seasonRuns: data.seasonRuns,
    trophies: data.trophies,
    lastSyncedAt: Date.now(),
  };
}
