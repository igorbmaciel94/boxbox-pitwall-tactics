import { create } from 'zustand';
import type {
  CardId,
  GameCatalogData,
  RaceDebrief,
  RaceEvent,
  RaceState,
  TeamId,
  TireAllocation,
  TireCompound,
  TurnSummary,
  ScenarioData,
  TeamData,
  SeasonTireBank,
  SeededRng,
} from '@boxbox/engine';
import { createRng, initializeRaceState } from '@boxbox/engine';
import type { TurnPhaseUI, GameMode, SavedDeck, BestScore, RunHistoryEntry, SeasonRunEntry } from '../lib/types';

interface SeasonProgress {
  raceOrder: string[];
  currentRaceIndex: number;
  raceResults: RaceDebrief[];
  cumulativeScore: number;
  cardSwapDone: boolean;
  seed: number;
  tireBank: SeasonTireBank;
}

interface GameState {
  // Catalog
  catalog: GameCatalogData | null;
  setCatalog: (catalog: GameCatalogData) => void;

  // Selection
  selectedTeamId: TeamId | null;
  selectTeam: (teamId: TeamId) => void;
  currentDeck: CardId[];
  setDeck: (cards: CardId[]) => void;

  // Game mode
  mode: GameMode;

  // Race state
  raceState: RaceState | null;
  scenario: ScenarioData | null;
  team: TeamData | null;
  seed: number;
  rng: SeededRng | null;
  turnSummaries: TurnSummary[];
  previousPosition: number | null;

  // Turn UI
  turnPhaseUI: TurnPhaseUI;
  currentEvent: RaceEvent | null;

  // Debrief
  lastDebrief: RaceDebrief | null;

  // Season
  seasonProgress: SeasonProgress | null;

  // Persistence data
  savedDecks: SavedDeck[];
  bestScores: BestScore[];
  runHistory: RunHistoryEntry[];
  seasonRuns: SeasonRunEntry[];

  // Actions — race
  startRace: (scenarioId: string, seed?: number, startingCompound?: TireCompound, tireAllocation?: TireAllocation) => void;
  setRaceState: (state: RaceState) => void;
  setTurnPhaseUI: (phase: TurnPhaseUI) => void;
  setCurrentEvent: (event: RaceEvent | null) => void;
  addTurnSummary: (summary: TurnSummary) => void;
  setPreviousPosition: (pos: number | null) => void;
  setLastDebrief: (debrief: RaceDebrief) => void;

  // Actions — season
  startSeason: (seed?: number) => void;
  advanceSeasonRace: (debrief: RaceDebrief) => void;
  setSeasonCardSwapDone: () => void;
  deductTireBank: (allocation: TireAllocation) => void;

  // Actions — persistence
  setSavedDecks: (decks: SavedDeck[]) => void;
  addSavedDeck: (deck: SavedDeck) => void;
  setBestScores: (scores: BestScore[]) => void;
  setRunHistory: (history: RunHistoryEntry[]) => void;
  setSeasonRuns: (runs: SeasonRunEntry[]) => void;

  // Reset
  resetRace: () => void;
  resetAll: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  catalog: null,
  setCatalog: (catalog) => set({ catalog }),

  selectedTeamId: null,
  selectTeam: (teamId) => set({ selectedTeamId: teamId }),
  currentDeck: [],
  setDeck: (cards) => set({ currentDeck: cards }),

  mode: 'idle',

  raceState: null,
  scenario: null,
  team: null,
  seed: 0,
  rng: null,
  turnSummaries: [],
  previousPosition: null,

  turnPhaseUI: 'idle',
  currentEvent: null,

  lastDebrief: null,

  seasonProgress: null,

  savedDecks: [],
  bestScores: [],
  runHistory: [],
  seasonRuns: [],

  startRace: (scenarioId, seed, startingCompound, tireAllocation) => {
    const { catalog, selectedTeamId, currentDeck } = get();
    if (!catalog || !selectedTeamId) return;

    const scenario = catalog.scenarios.find((s) => s.id === scenarioId);
    const team = catalog.teams.find((t) => t.id === selectedTeamId);
    if (!scenario || !team) return;

    const raceSeed = seed ?? Math.floor(Math.random() * 2147483647);
    const rng = createRng(raceSeed);
    const baseState = initializeRaceState(
      scenario, team, catalog, raceSeed, rng,
      startingCompound ?? 'soft',
      tireAllocation ?? { soft: 1, medium: 1, hard: 1 },
    );

    // Override deck with player's 9-card selection
    const deckToUse = currentDeck.length === 9 ? currentDeck : catalog.cards.map((c) => c.id);
    const shuffledDeck = rng.fork(0).shuffle(deckToUse);

    const state: RaceState = { ...baseState, deck: shuffledDeck, hand: [], discard: [] };

    set({
      mode: 'race',
      raceState: state,
      scenario,
      team,
      seed: raceSeed,
      rng,
      turnSummaries: [],
      previousPosition: null,
      turnPhaseUI: 'idle',
      currentEvent: null,
      lastDebrief: null,
    });
  },

  setRaceState: (state) => set({ raceState: state }),
  setTurnPhaseUI: (phase) => set({ turnPhaseUI: phase }),
  setCurrentEvent: (event) => set({ currentEvent: event }),
  addTurnSummary: (summary) => set((s) => ({ turnSummaries: [...s.turnSummaries, summary] })),
  setPreviousPosition: (pos) => set({ previousPosition: pos }),
  setLastDebrief: (debrief) => set({ lastDebrief: debrief }),

  startSeason: (seed) => {
    const { catalog, selectedTeamId } = get();
    if (!catalog || !selectedTeamId) return;

    const seasonSeed = seed ?? Math.floor(Math.random() * 2147483647);
    const rng = createRng(seasonSeed);
    const scenarioIds = catalog.scenarios.map((s) => s.id);
    const raceOrder = rng.shuffle(scenarioIds);

    set({
      mode: 'season',
      seasonProgress: {
        raceOrder,
        currentRaceIndex: 0,
        raceResults: [],
        cumulativeScore: 0,
        cardSwapDone: false,
        seed: seasonSeed,
        tireBank: { soft: 8, medium: 8, hard: 8 },
      },
    });
  },

  advanceSeasonRace: (debrief) => {
    set((s) => {
      if (!s.seasonProgress) return s;
      const results = [...s.seasonProgress.raceResults, debrief];
      return {
        seasonProgress: {
          ...s.seasonProgress,
          raceResults: results,
          currentRaceIndex: s.seasonProgress.currentRaceIndex + 1,
          cumulativeScore: results.reduce((sum, r) => sum + r.totalScore, 0),
        },
      };
    });
  },

  setSeasonCardSwapDone: () => {
    set((s) => {
      if (!s.seasonProgress) return s;
      return {
        seasonProgress: { ...s.seasonProgress, cardSwapDone: true },
      };
    });
  },

  deductTireBank: (allocation) => {
    set((s) => {
      if (!s.seasonProgress) return s;
      const bank = s.seasonProgress.tireBank;
      return {
        seasonProgress: {
          ...s.seasonProgress,
          tireBank: {
            soft: bank.soft - allocation.soft,
            medium: bank.medium - allocation.medium,
            hard: bank.hard - allocation.hard,
          },
        },
      };
    });
  },

  setSavedDecks: (decks) => set({ savedDecks: decks }),
  addSavedDeck: (deck) => set((s) => ({ savedDecks: [...s.savedDecks, deck] })),
  setBestScores: (scores) => set({ bestScores: scores }),
  setRunHistory: (history) => set({ runHistory: history }),
  setSeasonRuns: (runs) => set({ seasonRuns: runs }),

  resetRace: () =>
    set({
      raceState: null,
      scenario: null,
      team: null,
      rng: null,
      turnSummaries: [],
      previousPosition: null,
      turnPhaseUI: 'idle',
      currentEvent: null,
    }),

  resetAll: () =>
    set({
      mode: 'idle',
      raceState: null,
      scenario: null,
      team: null,
      rng: null,
      turnSummaries: [],
      previousPosition: null,
      turnPhaseUI: 'idle',
      currentEvent: null,
      lastDebrief: null,
      seasonProgress: null,
    }),
}));
