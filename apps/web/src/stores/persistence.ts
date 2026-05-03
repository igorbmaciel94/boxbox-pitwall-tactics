import { get, set, del } from 'idb-keyval';
import type { CardId, RaceDebrief, RaceEvent, TeamId, TurnSummary } from '@apex/engine';
import type { BestScore, RunHistoryEntry, SavedDeck, SeasonRunEntry, Trophy } from '../lib/types';
import type { SeasonProgress } from './game-store';
import { calculateMedal } from '../lib/constants';
import type { Locale } from '../i18n';

export const OFFLINE_PROFILE_ID = 'offline';

function keysFor(userId: string) {
  return scopedKeys('apex', userId);
}

function legacyKeysFor(userId: string) {
  return scopedKeys('boxbox', userId);
}

function scopedKeys(prefix: string, userId: string) {
  return {
    selectedTeam: `${prefix}-${userId}-team`,
    locale: `${prefix}-${userId}-locale`,
    savedDecks: `${prefix}-${userId}-decks`,
    currentDeck: `${prefix}-${userId}-current-deck`,
    bestScores: `${prefix}-${userId}-best-scores`,
    runHistory: `${prefix}-${userId}-run-history`,
    seasonRuns: `${prefix}-${userId}-season-runs`,
    seasonProgress: `${prefix}-${userId}-season-progress`,
    trophies: `${prefix}-${userId}-trophies`,
  };
}

type PersistenceKeys = ReturnType<typeof keysFor>;

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

export interface PersistedGameData {
  selectedTeam: TeamId | null;
  locale: Locale | null;
  currentDeck: CardId[];
  savedDecks: SavedDeck[];
  bestScores: BestScore[];
  runHistory: RunHistoryEntry[];
  seasonRuns: SeasonRunEntry[];
  seasonProgress: SeasonProgress | null;
  trophies: Trophy[];
}

const LEGACY_ID_RENAMES: Record<string, string> = {
  'box-box': 'pit-call',
  'drs-attack': 'aero-boost',
  'safety-car': 'caution-phase',
  monaco: 'harbor',
  'monaco-main': 'harbor-main',
  'monaco-bonus': 'harbor-bonus',
  spa: 'forest-run',
  'spa-main': 'forest-run-main',
  'spa-bonus': 'forest-run-bonus',
  monza: 'velocity-ring',
  'monza-main': 'velocity-ring-main',
  'monza-bonus': 'velocity-ring-bonus',
  silverstone: 'north-loop',
  'silverstone-main': 'north-loop-main',
  'silverstone-bonus': 'north-loop-bonus',
  suzuka: 'figure-eight',
  'suzuka-main': 'figure-eight-main',
  'suzuka-bonus': 'figure-eight-bonus',
  interlagos: 'southbank',
  'interlagos-main': 'southbank-main',
  'interlagos-bonus': 'southbank-bonus',
};

function normalizeLegacyId<T extends string | null | undefined>(value: T): T {
  if (typeof value !== 'string') return value;
  return (LEGACY_ID_RENAMES[value] ?? value) as T;
}

function normalizeCardIds(cards: CardId[]): CardId[] {
  return cards.map((cardId) => normalizeLegacyId(cardId));
}

function normalizeRaceEvent(event: RaceEvent): RaceEvent {
  return {
    ...event,
    type: normalizeLegacyId(event.type) as RaceEvent['type'],
  };
}

function normalizeTurnSummary(summary: TurnSummary): TurnSummary {
  return {
    ...summary,
    event: normalizeRaceEvent(summary.event),
    actionCard: normalizeLegacyId(summary.actionCard),
  };
}

function normalizeRaceDebrief(debrief: RaceDebrief): RaceDebrief {
  return {
    ...debrief,
    scenarioId: normalizeLegacyId(debrief.scenarioId),
    objectivesCompleted: debrief.objectivesCompleted.map((objective) => ({
      ...objective,
      id: normalizeLegacyId(objective.id),
    })),
    eventHistory: debrief.eventHistory.map(normalizeRaceEvent),
    cardsPlayed: normalizeCardIds(debrief.cardsPlayed),
    turnLog: debrief.turnLog.map(normalizeTurnSummary),
  };
}

export function normalizePersistedData(data: PersistedGameData): PersistedGameData {
  return {
    ...data,
    currentDeck: normalizeCardIds(data.currentDeck),
    savedDecks: data.savedDecks.map((deck) => ({
      ...deck,
      cards: normalizeCardIds(deck.cards),
    })),
    bestScores: data.bestScores.map((score) => ({
      ...score,
      scenarioId: normalizeLegacyId(score.scenarioId),
    })),
    runHistory: data.runHistory.map((entry) => ({
      ...entry,
      scenarioId: normalizeLegacyId(entry.scenarioId),
      debrief: normalizeRaceDebrief(entry.debrief),
    })),
    seasonRuns: data.seasonRuns.map((entry) => ({
      ...entry,
      goalCardId: normalizeLegacyId(entry.goalCardId),
      races: entry.races.map(normalizeRaceDebrief),
    })),
    seasonProgress: data.seasonProgress
      ? {
        ...data.seasonProgress,
        raceOrder: data.seasonProgress.raceOrder.map((scenarioId) => normalizeLegacyId(scenarioId)),
        raceResults: data.seasonProgress.raceResults.map(normalizeRaceDebrief),
        goalCardId: normalizeLegacyId(data.seasonProgress.goalCardId),
      }
      : null,
    trophies: data.trophies.map((trophy) => ({
      ...trophy,
      goalCardId: normalizeLegacyId(trophy.goalCardId),
    })),
  };
}

async function hasPersistedData(userId: string): Promise<boolean> {
  const data = await loadAllPersistedData(userId);
  return Boolean(
    data.selectedTeam
    || data.currentDeck.length
    || data.savedDecks.length
    || data.bestScores.length
    || data.runHistory.length
    || data.seasonRuns.length
    || data.seasonProgress
    || data.trophies.length,
  );
}

async function copyProfileData(sourceUserId: string, targetUserId: string): Promise<boolean> {
  const data = await loadPersistedDataForKeys(legacyKeysFor(sourceUserId));
  if (!data.selectedTeam
    && !data.locale
    && data.currentDeck.length === 0
    && data.savedDecks.length === 0
    && data.bestScores.length === 0
    && data.runHistory.length === 0
    && data.seasonRuns.length === 0
    && !data.seasonProgress
    && data.trophies.length === 0) {
    return false;
  }

  await replaceAllPersistedData(targetUserId, data);
  return true;
}

// Copies the best-known previous local profile into the new offline profile.
// Old user/guest/legacy data is intentionally left in place.
export async function migrateToOfflineProfile(): Promise<void> {
  if (await hasPersistedData(OFFLINE_PROFILE_ID)) return;

  if (await copyProfileData(OFFLINE_PROFILE_ID, OFFLINE_PROFILE_ID)) return;

  const previousUserId = localStorage.getItem('boxbox-auth-user-id');
  if (previousUserId && previousUserId !== OFFLINE_PROFILE_ID) {
    if (await copyProfileData(previousUserId, OFFLINE_PROFILE_ID)) return;
  }

  const guestId = localStorage.getItem('boxbox-guest-id');
  if (guestId && guestId !== previousUserId && guestId !== OFFLINE_PROFILE_ID) {
    if (await copyProfileData(guestId, OFFLINE_PROFILE_ID)) return;
  }

  const legacyData = await loadLegacyPersistedData();
  if (legacyData.selectedTeam
    || legacyData.locale
    || legacyData.currentDeck.length
    || legacyData.savedDecks.length
    || legacyData.bestScores.length
    || legacyData.runHistory.length
    || legacyData.seasonRuns.length
    || legacyData.seasonProgress
    || legacyData.trophies.length) {
    await replaceAllPersistedData(OFFLINE_PROFILE_ID, legacyData);
  }
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

// --- Load all persisted data at startup ---
export async function loadAllPersistedData(userId: string): Promise<PersistedGameData> {
  return normalizePersistedData(await loadPersistedDataForKeys(keysFor(userId)));
}

async function loadPersistedDataForKeys(keys: PersistenceKeys): Promise<PersistedGameData> {
  const [selectedTeam, locale, currentDeck, savedDecks, bestScores, runHistory, seasonRuns, seasonProgress, trophies] =
    await Promise.all([
      get<TeamId>(keys.selectedTeam),
      get<Locale>(keys.locale),
      get<CardId[]>(keys.currentDeck),
      get<SavedDeck[]>(keys.savedDecks),
      get<BestScore[]>(keys.bestScores),
      get<RunHistoryEntry[]>(keys.runHistory),
      get<SeasonRunEntry[]>(keys.seasonRuns),
      get<SeasonProgress>(keys.seasonProgress),
      get<Trophy[]>(keys.trophies),
    ]);

  return normalizePersistedData({
    selectedTeam: selectedTeam ?? null,
    locale: locale ?? null,
    currentDeck: currentDeck ?? [],
    savedDecks: savedDecks ?? [],
    bestScores: bestScores ?? [],
    runHistory: runHistory ?? [],
    seasonRuns: seasonRuns ?? [],
    seasonProgress: seasonProgress
      ? {
        ...seasonProgress,
        playerDriverId: seasonProgress.playerDriverId ?? '',
        goalCardId: seasonProgress.goalCardId ?? null,
        championshipStandings: seasonProgress.championshipStandings ?? [],
      }
      : null,
    trophies: trophies ?? [],
  });
}

async function loadLegacyPersistedData(): Promise<PersistedGameData> {
  const [selectedTeam, locale, currentDeck, savedDecks, bestScores, runHistory, seasonRuns, seasonProgress, trophies] =
    await Promise.all([
      get<TeamId>(LEGACY_KEYS.selectedTeam),
      get<Locale>(LEGACY_KEYS.locale),
      get<CardId[]>(LEGACY_KEYS.currentDeck),
      get<SavedDeck[]>(LEGACY_KEYS.savedDecks),
      get<BestScore[]>(LEGACY_KEYS.bestScores),
      get<RunHistoryEntry[]>(LEGACY_KEYS.runHistory),
      get<SeasonRunEntry[]>(LEGACY_KEYS.seasonRuns),
      get<SeasonProgress>(LEGACY_KEYS.seasonProgress),
      get<Trophy[]>(LEGACY_KEYS.trophies),
    ]);

  return {
    selectedTeam: selectedTeam ?? null,
    locale: locale ?? null,
    currentDeck: currentDeck ?? [],
    savedDecks: savedDecks ?? [],
    bestScores: bestScores ?? [],
    runHistory: runHistory ?? [],
    seasonRuns: seasonRuns ?? [],
    seasonProgress: seasonProgress
      ? {
        ...seasonProgress,
        playerDriverId: seasonProgress.playerDriverId ?? '',
        goalCardId: seasonProgress.goalCardId ?? null,
        championshipStandings: seasonProgress.championshipStandings ?? [],
      }
      : null,
    trophies: trophies ?? [],
  };
}

export async function replaceAllPersistedData(userId: string, data: PersistedGameData): Promise<void> {
  const keys = keysFor(userId);
  const normalized = normalizePersistedData(data);
  await Promise.all([
    normalized.selectedTeam ? set(keys.selectedTeam, normalized.selectedTeam) : del(keys.selectedTeam),
    normalized.locale ? set(keys.locale, normalized.locale) : del(keys.locale),
    set(keys.currentDeck, normalized.currentDeck),
    set(keys.savedDecks, normalized.savedDecks),
    set(keys.bestScores, normalized.bestScores),
    set(keys.runHistory, normalized.runHistory),
    set(keys.seasonRuns, normalized.seasonRuns),
    normalized.seasonProgress ? set(keys.seasonProgress, normalized.seasonProgress) : del(keys.seasonProgress),
    set(keys.trophies, normalized.trophies),
  ]);
}
