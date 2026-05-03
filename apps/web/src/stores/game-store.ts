import { create } from 'zustand';
import type {
  CardId,
  Difficulty,
  DriverStanding,
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
} from '@apex/engine';
import { createRng, initializeRaceState, updateChampionshipStandings } from '@apex/engine';
import type { TurnPhaseUI, GameMode, SavedDeck, BestScore, RunHistoryEntry, SeasonRunEntry, Trophy } from '../lib/types';

export const SEASON_TIRE_TOTALS: Record<Difficulty, number> = {
  easy: 18,
  normal: 18,
  hard: 18,
};

export interface SeasonProgress {
  raceOrder: string[];
  currentRaceIndex: number;
  raceResults: RaceDebrief[];
  cumulativeScore: number;
  seed: number;
  tireBank: SeasonTireBank;
  difficulty: Difficulty;
  initialTireBank: SeasonTireBank;
  pendingTireAllocation: TireAllocation | null;
  playerDriverId: string;
  goalCardId: string | null;
  championshipStandings: DriverStanding[];
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
  setMode: (mode: GameMode) => void;

  // Difficulty
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;

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
  noTiresPenaltyApplied: boolean;

  // Debrief
  lastDebrief: RaceDebrief | null;

  // Season
  seasonProgress: SeasonProgress | null;

  // Persistence data
  savedDecks: SavedDeck[];
  bestScores: BestScore[];
  runHistory: RunHistoryEntry[];
  seasonRuns: SeasonRunEntry[];
  trophies: Trophy[];

  // Actions — race
  startRace: (scenarioId: string, seed?: number, startingCompound?: TireCompound, tireAllocation?: TireAllocation, startingPositionOverride?: number) => void;
  setRaceState: (state: RaceState) => void;
  setTurnPhaseUI: (phase: TurnPhaseUI) => void;
  setCurrentEvent: (event: RaceEvent | null) => void;
  setNoTiresPenaltyApplied: (v: boolean) => void;
  addTurnSummary: (summary: TurnSummary) => void;
  setPreviousPosition: (pos: number | null) => void;
  setLastDebrief: (debrief: RaceDebrief) => void;

  // Actions — season
  startSeason: (difficulty: Difficulty, tireBank: SeasonTireBank, goalCardId: string | null, seed?: number) => void;
  advanceSeasonRace: (debrief: RaceDebrief) => void;
  deductTireBank: (allocation: TireAllocation) => void;
  restoreAbandonedTires: () => void;
  setSeasonProgress: (progress: SeasonProgress) => void;
  clearSeasonProgress: () => void;

  // Actions — deck management
  setSavedDecks: (decks: SavedDeck[]) => void;
  addSavedDeck: (deck: SavedDeck) => void;
  createSavedDeck: (name: string, cards: CardId[]) => string;
  updateSavedDeck: (id: string, name: string, cards: CardId[]) => void;
  deleteSavedDeck: (id: string) => void;
  loadDeckForPlay: (deckId: string) => void;

  // Actions — persistence
  setBestScores: (scores: BestScore[]) => void;
  setRunHistory: (history: RunHistoryEntry[]) => void;
  setSeasonRuns: (runs: SeasonRunEntry[]) => void;
  setTrophies: (trophies: Trophy[]) => void;

  // Reset
  resetRace: () => void;
  resetAll: () => void;
  clearGameState: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  catalog: null,
  setCatalog: (catalog) => set({ catalog }),

  selectedTeamId: null,
  selectTeam: (teamId) => set({ selectedTeamId: teamId }),
  currentDeck: [],
  setDeck: (cards) => set({ currentDeck: cards }),

  mode: 'idle',
  setMode: (mode) => set({ mode }),

  difficulty: 'normal' as Difficulty,
  setDifficulty: (d) => set({ difficulty: d }),

  raceState: null,
  scenario: null,
  team: null,
  seed: 0,
  rng: null,
  turnSummaries: [],
  previousPosition: null,

  turnPhaseUI: 'idle',
  currentEvent: null,
  noTiresPenaltyApplied: false,

  lastDebrief: null,

  seasonProgress: null,

  savedDecks: [],
  bestScores: [],
  runHistory: [],
  seasonRuns: [],
  trophies: [],

  startRace: (scenarioId, seed, startingCompound, tireAllocation, startingPositionOverride) => {
    const { catalog, selectedTeamId, currentDeck, difficulty, mode } = get();
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
      difficulty,
      startingPositionOverride,
    );

    // Override deck with player's 9-card selection
    const deckToUse = currentDeck.length === 9 ? currentDeck : catalog.cards.map((c) => c.id);
    const shuffledDeck = rng.fork(0).shuffle(deckToUse);

    const state: RaceState = { ...baseState, deck: shuffledDeck, hand: [], discard: [] };

    set({
      mode: mode === 'season' ? 'season' : 'race',
      raceState: state,
      scenario,
      team,
      seed: raceSeed,
      rng,
      turnSummaries: [],
      previousPosition: null,
      turnPhaseUI: 'idle',
      currentEvent: null,
      noTiresPenaltyApplied: false,
      lastDebrief: null,
    });
  },

  setRaceState: (state) => set({ raceState: state }),
  setTurnPhaseUI: (phase) => set({ turnPhaseUI: phase }),
  setCurrentEvent: (event) => set({ currentEvent: event }),
  setNoTiresPenaltyApplied: (v) => set({ noTiresPenaltyApplied: v }),
  addTurnSummary: (summary) => set((s) => ({ turnSummaries: [...s.turnSummaries, summary] })),
  setPreviousPosition: (pos) => set({ previousPosition: pos }),
  setLastDebrief: (debrief) => set({ lastDebrief: debrief }),

  startSeason: (difficulty, tireBank, goalCardId, seed) => {
    const { catalog, selectedTeamId } = get();
    if (!catalog || !selectedTeamId) return;

    const seasonSeed = seed ?? Math.floor(Math.random() * 2147483647);
    // Fixed race order — use scenario list order
    const raceOrder = catalog.scenarios.map((s) => s.id);

    // Determine player driver (first driver of selected team)
    const playerDriver = catalog.drivers.find((d) => d.teamId === selectedTeamId);
    const playerDriverId = playerDriver?.id ?? `player-${selectedTeamId}`;

    set({
      mode: 'season',
      difficulty,
      seasonProgress: {
        raceOrder,
        currentRaceIndex: 0,
        raceResults: [],
        cumulativeScore: 0,
        seed: seasonSeed,
        tireBank: { ...tireBank },
        difficulty,
        initialTireBank: { ...tireBank },
        pendingTireAllocation: null,
        playerDriverId,
        goalCardId,
        championshipStandings: [],
      },
    });
  },

  advanceSeasonRace: (debrief) => {
    set((s) => {
      if (!s.seasonProgress) return s;
      const results = [...s.seasonProgress.raceResults, debrief];
      // Update championship standings if classification data exists
      let standings = s.seasonProgress.championshipStandings;
      if (debrief.fullClassification) {
        standings = updateChampionshipStandings(standings, debrief.fullClassification);
      }
      return {
        seasonProgress: {
          ...s.seasonProgress,
          raceResults: results,
          currentRaceIndex: s.seasonProgress.currentRaceIndex + 1,
          cumulativeScore: results.reduce((sum, r) => sum + r.totalScore, 0),
          pendingTireAllocation: null,
          championshipStandings: standings,
        },
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
          pendingTireAllocation: { ...allocation },
        },
      };
    });
  },

  restoreAbandonedTires: () => {
    set((s) => {
      if (!s.seasonProgress || !s.seasonProgress.pendingTireAllocation) return s;
      const bank = s.seasonProgress.tireBank;
      const pending = s.seasonProgress.pendingTireAllocation;
      return {
        seasonProgress: {
          ...s.seasonProgress,
          tireBank: {
            soft: bank.soft + pending.soft,
            medium: bank.medium + pending.medium,
            hard: bank.hard + pending.hard,
          },
          pendingTireAllocation: null,
        },
      };
    });
  },

  setSeasonProgress: (progress) => set({ seasonProgress: progress }),

  clearSeasonProgress: () => set({ seasonProgress: null, mode: 'idle' }),

  setSavedDecks: (decks) => set({ savedDecks: decks }),
  addSavedDeck: (deck) => set((s) => ({ savedDecks: [...s.savedDecks, deck] })),

  createSavedDeck: (name, cards) => {
    const id = crypto.randomUUID();
    const deck: SavedDeck = { id, name, cards, createdAt: Date.now() };
    set((s) => ({ savedDecks: [...s.savedDecks, deck] }));
    return id;
  },

  updateSavedDeck: (id, name, cards) => {
    set((s) => ({
      savedDecks: s.savedDecks.map((d) =>
        d.id === id ? { ...d, name, cards } : d,
      ),
    }));
  },

  deleteSavedDeck: (id) => {
    set((s) => ({
      savedDecks: s.savedDecks.filter((d) => d.id !== id),
    }));
  },

  loadDeckForPlay: (deckId) => {
    const { savedDecks } = get();
    const deck = savedDecks.find((d) => d.id === deckId);
    if (deck) {
      set({ currentDeck: deck.cards });
    }
  },

  setBestScores: (scores) => set({ bestScores: scores }),
  setRunHistory: (history) => set({ runHistory: history }),
  setSeasonRuns: (runs) => set({ seasonRuns: runs }),
  setTrophies: (trophies) => set({ trophies }),

  resetRace: () =>
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
      noTiresPenaltyApplied: false,
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
      noTiresPenaltyApplied: false,
      lastDebrief: null,
      seasonProgress: null,
    }),

  clearGameState: () =>
    set({
      selectedTeamId: null,
      currentDeck: [],
      mode: 'idle',
      raceState: null,
      scenario: null,
      team: null,
      rng: null,
      turnSummaries: [],
      previousPosition: null,
      turnPhaseUI: 'idle',
      currentEvent: null,
      noTiresPenaltyApplied: false,
      lastDebrief: null,
      seasonProgress: null,
      savedDecks: [],
      bestScores: [],
      runHistory: [],
      seasonRuns: [],
      trophies: [],
    }),
}));
