import { get, set } from 'idb-keyval';
import type { CardId, RaceDebrief, TeamId } from '@boxbox/engine';
import type { BestScore, RunHistoryEntry, SavedDeck, SeasonRunEntry } from '../lib/types';
import { calculateMedal } from '../lib/constants';

const KEYS = {
  selectedTeam: 'boxbox-team',
  savedDecks: 'boxbox-decks',
  currentDeck: 'boxbox-current-deck',
  bestScores: 'boxbox-best-scores',
  runHistory: 'boxbox-run-history',
  seasonRuns: 'boxbox-season-runs',
} as const;

// --- Team ---
export async function saveSelectedTeam(teamId: TeamId): Promise<void> {
  await set(KEYS.selectedTeam, teamId);
}

export async function loadSelectedTeam(): Promise<TeamId | null> {
  return (await get<TeamId>(KEYS.selectedTeam)) ?? null;
}

// --- Current Deck ---
export async function saveCurrentDeck(cards: CardId[]): Promise<void> {
  await set(KEYS.currentDeck, cards);
}

export async function loadCurrentDeck(): Promise<CardId[]> {
  return (await get<CardId[]>(KEYS.currentDeck)) ?? [];
}

// --- Saved Decks ---
export async function saveDeckList(decks: SavedDeck[]): Promise<void> {
  await set(KEYS.savedDecks, decks);
}

export async function loadDeckList(): Promise<SavedDeck[]> {
  return (await get<SavedDeck[]>(KEYS.savedDecks)) ?? [];
}

// --- Best Scores ---
export async function loadBestScores(): Promise<BestScore[]> {
  return (await get<BestScore[]>(KEYS.bestScores)) ?? [];
}

export async function saveBestScore(debrief: RaceDebrief): Promise<BestScore[]> {
  const scores = await loadBestScores();
  const existing = scores.findIndex((s) => s.scenarioId === debrief.scenarioId);
  const entry: BestScore = {
    scenarioId: debrief.scenarioId,
    score: debrief.totalScore,
    position: debrief.finalPosition,
    medal: calculateMedal(debrief.totalScore),
    timestamp: Date.now(),
  };

  if (existing >= 0) {
    if (debrief.totalScore > scores[existing].score) {
      scores[existing] = entry;
    }
  } else {
    scores.push(entry);
  }

  await set(KEYS.bestScores, scores);
  return scores;
}

// --- Run History ---
export async function loadRunHistory(): Promise<RunHistoryEntry[]> {
  return (await get<RunHistoryEntry[]>(KEYS.runHistory)) ?? [];
}

export async function addRunHistoryEntry(debrief: RaceDebrief): Promise<RunHistoryEntry[]> {
  const history = await loadRunHistory();
  history.unshift({
    scenarioId: debrief.scenarioId,
    teamId: debrief.teamId,
    debrief,
    timestamp: Date.now(),
  });
  if (history.length > 20) history.length = 20;
  await set(KEYS.runHistory, history);
  return history;
}

// --- Season Runs ---
export async function loadSeasonRuns(): Promise<SeasonRunEntry[]> {
  return (await get<SeasonRunEntry[]>(KEYS.seasonRuns)) ?? [];
}

export async function addSeasonRun(entry: SeasonRunEntry): Promise<SeasonRunEntry[]> {
  const runs = await loadSeasonRuns();
  runs.unshift(entry);
  if (runs.length > 10) runs.length = 10;
  await set(KEYS.seasonRuns, runs);
  return runs;
}

// --- Load all persisted data at startup ---
export async function loadAllPersistedData() {
  const [selectedTeam, currentDeck, savedDecks, bestScores, runHistory, seasonRuns] =
    await Promise.all([
      loadSelectedTeam(),
      loadCurrentDeck(),
      loadDeckList(),
      loadBestScores(),
      loadRunHistory(),
      loadSeasonRuns(),
    ]);

  return { selectedTeam, currentDeck, savedDecks, bestScores, runHistory, seasonRuns };
}
