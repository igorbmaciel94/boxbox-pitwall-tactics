import { get, set, del } from 'idb-keyval';
import type { CardId, RaceDebrief, TeamId } from '@boxbox/engine';
import type { BestScore, RunHistoryEntry, SavedDeck, SeasonRunEntry, Trophy } from '../lib/types';
import type { SeasonProgress } from './game-store';
import { calculateMedal } from '../lib/constants';
import type { Locale } from '../i18n';

function keysFor(userId: string) {
  return {
    selectedTeam: `boxbox-${userId}-team`,
    locale: `boxbox-${userId}-locale`,
    savedDecks: `boxbox-${userId}-decks`,
    currentDeck: `boxbox-${userId}-current-deck`,
    bestScores: `boxbox-${userId}-best-scores`,
    runHistory: `boxbox-${userId}-run-history`,
    seasonRuns: `boxbox-${userId}-season-runs`,
    seasonProgress: `boxbox-${userId}-season-progress`,
    trophies: `boxbox-${userId}-trophies`,
  };
}

// Old keys (pre-migration, no userId prefix)
const LEGACY_KEYS = {
  selectedTeam: 'boxbox-team',
  locale: 'boxbox-locale',
  savedDecks: 'boxbox-decks',
  currentDeck: 'boxbox-current-deck',
  bestScores: 'boxbox-best-scores',
  runHistory: 'boxbox-run-history',
  seasonRuns: 'boxbox-season-runs',
  seasonProgress: 'boxbox-season-progress',
  trophies: 'boxbox-trophies',
} as const;

// --- Migration from legacy keys to userId-scoped keys ---
export async function migrateToUserScoped(userId: string): Promise<void> {
  if (localStorage.getItem('boxbox-migrated-v2')) return;

  const keys = keysFor(userId);
  const migrations = Object.entries(LEGACY_KEYS).map(async ([field, legacyKey]) => {
    const oldValue = await get(legacyKey);
    if (oldValue !== undefined) {
      const newKey = keys[field as keyof typeof keys];
      // Only migrate if the new key doesn't already have data
      const existing = await get(newKey);
      if (existing === undefined) {
        await set(newKey, oldValue);
      }
      await del(legacyKey);
    }
  });

  await Promise.all(migrations);
  localStorage.setItem('boxbox-migrated-v2', 'true');
}

// --- Team ---
export async function saveSelectedTeam(userId: string, teamId: TeamId): Promise<void> {
  await set(keysFor(userId).selectedTeam, teamId);
}

export async function loadSelectedTeam(userId: string): Promise<TeamId | null> {
  return (await get<TeamId>(keysFor(userId).selectedTeam)) ?? null;
}

// --- Locale ---
export async function saveLocale(userId: string, locale: Locale): Promise<void> {
  await set(keysFor(userId).locale, locale);
}

export async function loadLocale(userId: string): Promise<Locale | null> {
  return (await get<Locale>(keysFor(userId).locale)) ?? null;
}

// --- Current Deck ---
export async function saveCurrentDeck(userId: string, cards: CardId[]): Promise<void> {
  await set(keysFor(userId).currentDeck, cards);
}

export async function loadCurrentDeck(userId: string): Promise<CardId[]> {
  return (await get<CardId[]>(keysFor(userId).currentDeck)) ?? [];
}

// --- Saved Decks ---
export async function saveDeckList(userId: string, decks: SavedDeck[]): Promise<void> {
  await set(keysFor(userId).savedDecks, decks);
}

export async function loadDeckList(userId: string): Promise<SavedDeck[]> {
  return (await get<SavedDeck[]>(keysFor(userId).savedDecks)) ?? [];
}

// --- Best Scores ---
export async function loadBestScores(userId: string): Promise<BestScore[]> {
  return (await get<BestScore[]>(keysFor(userId).bestScores)) ?? [];
}

export async function saveBestScore(userId: string, debrief: RaceDebrief): Promise<BestScore[]> {
  const scores = await loadBestScores(userId);
  const existing = scores.findIndex((s) => s.scenarioId === debrief.scenarioId);
  const entry: BestScore = {
    scenarioId: debrief.scenarioId,
    score: debrief.totalScore,
    position: debrief.finalPosition,
    medal: calculateMedal(debrief.finalPosition),
    timestamp: Date.now(),
  };

  if (existing >= 0) {
    if (debrief.totalScore > scores[existing].score) {
      scores[existing] = entry;
    }
  } else {
    scores.push(entry);
  }

  await set(keysFor(userId).bestScores, scores);
  return scores;
}

// --- Run History ---
export async function loadRunHistory(userId: string): Promise<RunHistoryEntry[]> {
  return (await get<RunHistoryEntry[]>(keysFor(userId).runHistory)) ?? [];
}

export async function addRunHistoryEntry(userId: string, debrief: RaceDebrief): Promise<RunHistoryEntry[]> {
  const history = await loadRunHistory(userId);
  history.unshift({
    scenarioId: debrief.scenarioId,
    teamId: debrief.teamId,
    debrief,
    timestamp: Date.now(),
  });
  if (history.length > 20) history.length = 20;
  await set(keysFor(userId).runHistory, history);
  return history;
}

// --- Season Runs ---
export async function loadSeasonRuns(userId: string): Promise<SeasonRunEntry[]> {
  return (await get<SeasonRunEntry[]>(keysFor(userId).seasonRuns)) ?? [];
}

export async function addSeasonRun(userId: string, entry: SeasonRunEntry): Promise<SeasonRunEntry[]> {
  const runs = await loadSeasonRuns(userId);
  runs.unshift(entry);
  if (runs.length > 10) runs.length = 10;
  await set(keysFor(userId).seasonRuns, runs);
  return runs;
}

// --- Trophies ---
export async function loadTrophies(userId: string): Promise<Trophy[]> {
  return (await get<Trophy[]>(keysFor(userId).trophies)) ?? [];
}

export async function addTrophy(userId: string, trophy: Trophy): Promise<Trophy[]> {
  const trophies = await loadTrophies(userId);
  trophies.unshift(trophy);
  if (trophies.length > 20) trophies.length = 20;
  await set(keysFor(userId).trophies, trophies);
  return trophies;
}

// --- Season Progress ---
export async function saveSeasonProgress(userId: string, progress: SeasonProgress | null): Promise<void> {
  if (progress) {
    await set(keysFor(userId).seasonProgress, progress);
  } else {
    await del(keysFor(userId).seasonProgress);
  }
}

export async function loadSeasonProgress(userId: string): Promise<SeasonProgress | null> {
  const raw = await get<SeasonProgress>(keysFor(userId).seasonProgress);
  if (!raw) return null;
  return {
    ...raw,
    playerDriverId: raw.playerDriverId ?? '',
    goalCardId: raw.goalCardId ?? null,
    championshipStandings: raw.championshipStandings ?? [],
  };
}

// --- Export all data for sync ---
export async function exportAllForSync(userId: string) {
  const data = await loadAllPersistedData(userId);
  return {
    selectedTeam: data.selectedTeam,
    locale: data.locale ?? 'en',
    savedDecks: data.savedDecks,
    bestScores: data.bestScores,
    runHistory: data.runHistory,
    seasonRuns: data.seasonRuns,
    trophies: data.trophies,
  };
}

// --- Import synced data ---
export async function importFromSync(userId: string, data: {
  selectedTeam: string | null;
  locale: string;
  savedDecks: SavedDeck[];
  bestScores: BestScore[];
  runHistory: RunHistoryEntry[];
  seasonRuns: SeasonRunEntry[];
  trophies: Trophy[];
}) {
  const keys = keysFor(userId);
  await Promise.all([
    data.selectedTeam ? set(keys.selectedTeam, data.selectedTeam) : Promise.resolve(),
    data.locale ? set(keys.locale, data.locale) : Promise.resolve(),
    set(keys.savedDecks, data.savedDecks),
    set(keys.bestScores, data.bestScores),
    set(keys.runHistory, data.runHistory),
    set(keys.seasonRuns, data.seasonRuns),
    set(keys.trophies, data.trophies),
  ]);
}

// --- Load all persisted data at startup ---
export async function loadAllPersistedData(userId: string) {
  const [selectedTeam, locale, currentDeck, savedDecks, bestScores, runHistory, seasonRuns, seasonProgress, trophies] =
    await Promise.all([
      loadSelectedTeam(userId),
      loadLocale(userId),
      loadCurrentDeck(userId),
      loadDeckList(userId),
      loadBestScores(userId),
      loadRunHistory(userId),
      loadSeasonRuns(userId),
      loadSeasonProgress(userId),
      loadTrophies(userId),
    ]);

  return { selectedTeam, locale, currentDeck, savedDecks, bestScores, runHistory, seasonRuns, seasonProgress, trophies };
}
