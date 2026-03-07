import { describe, expect, it, beforeEach } from 'vitest';
import { useGameStore, SEASON_TIRE_TOTALS } from '../src/stores/game-store';
import type { SeasonProgress } from '../src/stores/game-store';
import { loadBrowserCatalog } from '../src/catalog/browser-loader';
import type { RaceDebrief, TireAllocation } from '@boxbox/engine';

const catalog = loadBrowserCatalog();

function resetStore() {
  useGameStore.setState({
    catalog,
    selectedTeamId: 'crimson',
    currentDeck: catalog.cards.slice(0, 9).map((c) => c.id),
    mode: 'idle',
    seasonProgress: null,
    difficulty: 'normal',
  });
}

function makeFakeDebrief(scenarioId: string): RaceDebrief {
  return {
    scenarioId,
    teamId: 'crimson',
    finalPosition: 5,
    positionScore: 40,
    objectivePoints: 10,
    styleBonus: 0,
    totalScore: 50,
    objectivesCompleted: [],
    turnLog: [],
  } as RaceDebrief;
}

describe('Season store actions', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('SEASON_TIRE_TOTALS', () => {
    it('easy = 24, normal = 21, hard = 18', () => {
      expect(SEASON_TIRE_TOTALS.easy).toBe(24);
      expect(SEASON_TIRE_TOTALS.normal).toBe(21);
      expect(SEASON_TIRE_TOTALS.hard).toBe(18);
    });
  });

  describe('startSeason', () => {
    it('initializes season with correct tire bank and difficulty', () => {
      const bank = { soft: 10, medium: 8, hard: 6 };
      useGameStore.getState().startSeason('normal', bank, 42);

      const { seasonProgress, mode, difficulty } = useGameStore.getState();
      expect(mode).toBe('season');
      expect(difficulty).toBe('normal');
      expect(seasonProgress).not.toBeNull();
      expect(seasonProgress!.tireBank).toEqual({ soft: 10, medium: 8, hard: 6 });
      expect(seasonProgress!.initialTireBank).toEqual({ soft: 10, medium: 8, hard: 6 });
      expect(seasonProgress!.difficulty).toBe('normal');
      expect(seasonProgress!.pendingTireAllocation).toBeNull();
      expect(seasonProgress!.currentRaceIndex).toBe(0);
      expect(seasonProgress!.raceResults).toEqual([]);
      expect(seasonProgress!.cumulativeScore).toBe(0);
    });

    it('creates race order with all scenarios', () => {
      useGameStore.getState().startSeason('easy', { soft: 8, medium: 8, hard: 8 }, 42);

      const { seasonProgress } = useGameStore.getState();
      const allScenarioIds = catalog.scenarios.map((s) => s.id);
      expect(seasonProgress!.raceOrder.sort()).toEqual(allScenarioIds.sort());
    });

    it('produces deterministic race order with same seed', () => {
      useGameStore.getState().startSeason('normal', { soft: 7, medium: 7, hard: 7 }, 12345);
      const order1 = useGameStore.getState().seasonProgress!.raceOrder;

      resetStore();
      useGameStore.getState().startSeason('normal', { soft: 7, medium: 7, hard: 7 }, 12345);
      const order2 = useGameStore.getState().seasonProgress!.raceOrder;

      expect(order1).toEqual(order2);
    });

    it('sets difficulty on store level for races to use', () => {
      useGameStore.getState().startSeason('hard', { soft: 6, medium: 6, hard: 6 }, 42);
      expect(useGameStore.getState().difficulty).toBe('hard');
    });
  });

  describe('deductTireBank', () => {
    beforeEach(() => {
      useGameStore.getState().startSeason('normal', { soft: 7, medium: 7, hard: 7 }, 42);
    });

    it('subtracts allocation from tire bank', () => {
      const allocation: TireAllocation = { soft: 2, medium: 1, hard: 0 };
      useGameStore.getState().deductTireBank(allocation);

      const bank = useGameStore.getState().seasonProgress!.tireBank;
      expect(bank).toEqual({ soft: 5, medium: 6, hard: 7 });
    });

    it('stores allocation as pendingTireAllocation', () => {
      const allocation: TireAllocation = { soft: 1, medium: 1, hard: 1 };
      useGameStore.getState().deductTireBank(allocation);

      const pending = useGameStore.getState().seasonProgress!.pendingTireAllocation;
      expect(pending).toEqual({ soft: 1, medium: 1, hard: 1 });
    });
  });

  describe('advanceSeasonRace', () => {
    beforeEach(() => {
      useGameStore.getState().startSeason('normal', { soft: 7, medium: 7, hard: 7 }, 42);
      useGameStore.getState().deductTireBank({ soft: 1, medium: 1, hard: 1 });
    });

    it('increments currentRaceIndex', () => {
      const scenarioId = useGameStore.getState().seasonProgress!.raceOrder[0];
      useGameStore.getState().advanceSeasonRace(makeFakeDebrief(scenarioId));

      expect(useGameStore.getState().seasonProgress!.currentRaceIndex).toBe(1);
    });

    it('adds debrief to raceResults', () => {
      const scenarioId = useGameStore.getState().seasonProgress!.raceOrder[0];
      const debrief = makeFakeDebrief(scenarioId);
      useGameStore.getState().advanceSeasonRace(debrief);

      expect(useGameStore.getState().seasonProgress!.raceResults).toHaveLength(1);
      expect(useGameStore.getState().seasonProgress!.raceResults[0]).toBe(debrief);
    });

    it('updates cumulativeScore', () => {
      const scenarioId = useGameStore.getState().seasonProgress!.raceOrder[0];
      useGameStore.getState().advanceSeasonRace(makeFakeDebrief(scenarioId));

      expect(useGameStore.getState().seasonProgress!.cumulativeScore).toBe(50);
    });

    it('clears pendingTireAllocation', () => {
      expect(useGameStore.getState().seasonProgress!.pendingTireAllocation).not.toBeNull();

      const scenarioId = useGameStore.getState().seasonProgress!.raceOrder[0];
      useGameStore.getState().advanceSeasonRace(makeFakeDebrief(scenarioId));

      expect(useGameStore.getState().seasonProgress!.pendingTireAllocation).toBeNull();
    });
  });

  describe('restoreAbandonedTires', () => {
    beforeEach(() => {
      useGameStore.getState().startSeason('normal', { soft: 7, medium: 7, hard: 7 }, 42);
    });

    it('restores tires from pendingTireAllocation back to bank', () => {
      useGameStore.getState().deductTireBank({ soft: 2, medium: 1, hard: 0 });

      expect(useGameStore.getState().seasonProgress!.tireBank).toEqual({ soft: 5, medium: 6, hard: 7 });

      useGameStore.getState().restoreAbandonedTires();

      expect(useGameStore.getState().seasonProgress!.tireBank).toEqual({ soft: 7, medium: 7, hard: 7 });
      expect(useGameStore.getState().seasonProgress!.pendingTireAllocation).toBeNull();
    });

    it('is a no-op when pendingTireAllocation is null', () => {
      const bankBefore = { ...useGameStore.getState().seasonProgress!.tireBank };

      useGameStore.getState().restoreAbandonedTires();

      expect(useGameStore.getState().seasonProgress!.tireBank).toEqual(bankBefore);
    });

    it('is a no-op when seasonProgress is null', () => {
      useGameStore.setState({ seasonProgress: null });

      // Should not throw
      useGameStore.getState().restoreAbandonedTires();
      expect(useGameStore.getState().seasonProgress).toBeNull();
    });
  });

  describe('clearSeasonProgress', () => {
    it('sets seasonProgress to null and mode to idle', () => {
      useGameStore.getState().startSeason('normal', { soft: 7, medium: 7, hard: 7 }, 42);
      expect(useGameStore.getState().seasonProgress).not.toBeNull();
      expect(useGameStore.getState().mode).toBe('season');

      useGameStore.getState().clearSeasonProgress();

      expect(useGameStore.getState().seasonProgress).toBeNull();
      expect(useGameStore.getState().mode).toBe('idle');
    });
  });

  describe('setSeasonProgress', () => {
    it('restores season progress without changing mode (used by persistence load)', () => {
      const progress: SeasonProgress = {
        raceOrder: ['monaco', 'spa', 'monza', 'silverstone', 'suzuka', 'interlagos'],
        currentRaceIndex: 2,
        raceResults: [makeFakeDebrief('monaco'), makeFakeDebrief('spa')],
        cumulativeScore: 100,
        seed: 42,
        tireBank: { soft: 5, medium: 5, hard: 5 },
        difficulty: 'hard',
        initialTireBank: { soft: 6, medium: 6, hard: 6 },
        pendingTireAllocation: null,
      };

      useGameStore.getState().setSeasonProgress(progress);

      expect(useGameStore.getState().seasonProgress).toEqual(progress);
      // mode stays idle — it's only set to 'season' when user navigates to SeasonScreen
      expect(useGameStore.getState().mode).toBe('idle');
    });
  });

  describe('startRace preserves season mode', () => {
    it('keeps mode as season when starting race during season', () => {
      useGameStore.getState().startSeason('normal', { soft: 7, medium: 7, hard: 7 }, 42);
      expect(useGameStore.getState().mode).toBe('season');

      const scenarioId = useGameStore.getState().seasonProgress!.raceOrder[0];
      useGameStore.getState().startRace(scenarioId, 123);

      expect(useGameStore.getState().mode).toBe('season');
    });

    it('sets mode to race for quick race', () => {
      expect(useGameStore.getState().mode).toBe('idle');
      useGameStore.getState().startRace('monaco', 123);

      expect(useGameStore.getState().mode).toBe('race');
    });
  });

  describe('full season flow', () => {
    it('can complete a full season with tire tracking', () => {
      useGameStore.getState().startSeason('normal', { soft: 7, medium: 7, hard: 7 }, 42);
      const { raceOrder } = useGameStore.getState().seasonProgress!;

      for (let i = 0; i < raceOrder.length; i++) {
        // Deduct tires for race
        useGameStore.getState().deductTireBank({ soft: 1, medium: 1, hard: 1 });
        // Complete race
        useGameStore.getState().advanceSeasonRace(makeFakeDebrief(raceOrder[i]));
      }

      const final = useGameStore.getState().seasonProgress!;
      expect(final.currentRaceIndex).toBe(raceOrder.length);
      expect(final.raceResults).toHaveLength(raceOrder.length);
      expect(final.cumulativeScore).toBe(50 * raceOrder.length);
      expect(final.pendingTireAllocation).toBeNull();
      // Each race used 1 of each, 6 races
      expect(final.tireBank).toEqual({ soft: 1, medium: 1, hard: 1 });
    });

    it('handles abandon and restore mid-race', () => {
      useGameStore.getState().startSeason('easy', { soft: 8, medium: 8, hard: 8 }, 42);
      const { raceOrder } = useGameStore.getState().seasonProgress!;

      // Complete race 1
      useGameStore.getState().deductTireBank({ soft: 1, medium: 1, hard: 1 });
      useGameStore.getState().advanceSeasonRace(makeFakeDebrief(raceOrder[0]));

      // Start race 2 but abandon
      useGameStore.getState().deductTireBank({ soft: 2, medium: 0, hard: 1 });
      expect(useGameStore.getState().seasonProgress!.tireBank).toEqual({ soft: 5, medium: 7, hard: 6 });

      // Restore abandoned tires
      useGameStore.getState().restoreAbandonedTires();
      expect(useGameStore.getState().seasonProgress!.tireBank).toEqual({ soft: 7, medium: 7, hard: 7 });
      expect(useGameStore.getState().seasonProgress!.currentRaceIndex).toBe(1);
    });
  });
});
