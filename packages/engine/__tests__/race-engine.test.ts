import { describe, expect, it } from 'vitest';
import { loadCatalog } from '@boxbox/content';
import { runRace, initializeRaceState, runTurn } from '../src/race-engine.js';
import { createRng } from '../src/rng.js';
import type { PlayerAgent, ScoringConfig } from '../src/types.js';

const catalog = loadCatalog();

const deterministicAgent: PlayerAgent = {
  chooseTeamPerk: () => true,
  chooseActionCard: (state) => state.hand[0],
};

const config: ScoringConfig = { styleBonusesEnabled: false };

describe('runRace', () => {
  it('completes a full race of 6 turns', () => {
    const scenario = catalog.scenarios[0];
    const team = catalog.teams[0];
    const debrief = runRace(scenario, team, catalog, deterministicAgent, 12345, config);

    expect(debrief.turnLog).toHaveLength(6);
    expect(debrief.scenarioId).toBe(scenario.id);
    expect(debrief.teamId).toBe(team.id);
  });

  it('produces deterministic results with same seed', () => {
    const scenario = catalog.scenarios[0];
    const team = catalog.teams[0];

    const debrief1 = runRace(scenario, team, catalog, deterministicAgent, 42, config);
    const debrief2 = runRace(scenario, team, catalog, deterministicAgent, 42, config);

    expect(debrief1.finalPosition).toBe(debrief2.finalPosition);
    expect(debrief1.positionScore).toBe(debrief2.positionScore);
    expect(debrief1.totalScore).toBe(debrief2.totalScore);
    expect(debrief1.cardsPlayed).toEqual(debrief2.cardsPlayed);
    expect(debrief1.turnLog.map((t) => t.event.type)).toEqual(
      debrief2.turnLog.map((t) => t.event.type),
    );
  });

  it('produces different results with different seeds', () => {
    const scenario = catalog.scenarios[0];
    const team = catalog.teams[0];

    const debrief1 = runRace(scenario, team, catalog, deterministicAgent, 111, config);
    const debrief2 = runRace(scenario, team, catalog, deterministicAgent, 999, config);

    const events1 = debrief1.turnLog.map((t) => t.event.type);
    const events2 = debrief2.turnLog.map((t) => t.event.type);
    expect(events1.join(',') === events2.join(',')).toBe(false);
  });

  it('records all events in event history', () => {
    const scenario = catalog.scenarios[0];
    const team = catalog.teams[0];
    const debrief = runRace(scenario, team, catalog, deterministicAgent, 42, config);

    expect(debrief.eventHistory).toHaveLength(6);
    for (const event of debrief.eventHistory) {
      expect(event.type).toBeTruthy();
      expect(event.name).toBeTruthy();
      expect(event.flavorIndex).toBeGreaterThanOrEqual(0);
      expect(event.flavorIndex).toBeLessThan(catalog.strings.events[event.type].length);
    }
  });

  it('records cards played (1 per turn)', () => {
    const scenario = catalog.scenarios[0];
    const team = catalog.teams[0];
    const debrief = runRace(scenario, team, catalog, deterministicAgent, 42, config);

    expect(debrief.cardsPlayed.length).toBe(6);
  });

  it('final position is within valid range', () => {
    const scenario = catalog.scenarios[0];
    const team = catalog.teams[0];

    for (let seed = 0; seed < 20; seed++) {
      const debrief = runRace(scenario, team, catalog, deterministicAgent, seed, config);
      expect(debrief.finalPosition).toBeGreaterThanOrEqual(1);
      expect(debrief.finalPosition).toBeLessThanOrEqual(20);
    }
  });

  it('works with all scenarios', () => {
    const team = catalog.teams[0];

    for (const scenario of catalog.scenarios) {
      const debrief = runRace(scenario, team, catalog, deterministicAgent, 42, config);
      expect(debrief.turnLog).toHaveLength(6);
      expect(debrief.scenarioId).toBe(scenario.id);
    }
  });

  it('works with all teams', () => {
    const scenario = catalog.scenarios[0];

    for (const team of catalog.teams) {
      const debrief = runRace(scenario, team, catalog, deterministicAgent, 42, config);
      expect(debrief.turnLog).toHaveLength(6);
      expect(debrief.teamId).toBe(team.id);
    }
  });

  it('respects SC envelope constraint (max 1 per race)', () => {
    const scenario = catalog.scenarios[0];
    const team = catalog.teams[0];

    for (let seed = 0; seed < 50; seed++) {
      const debrief = runRace(scenario, team, catalog, deterministicAgent, seed, config);
      const scCount = debrief.eventHistory.filter((e) => e.type === 'safety-car').length;
      expect(scCount).toBeLessThanOrEqual(1);

      // No consecutive safety cars
      for (let i = 1; i < debrief.eventHistory.length; i++) {
        const prev = debrief.eventHistory[i - 1].type;
        const curr = debrief.eventHistory[i].type;
        if (prev === 'safety-car') expect(curr).not.toBe('safety-car');
      }
    }
  });
});

describe('initializeRaceState', () => {
  it('creates state with correct starting values', () => {
    const scenario = catalog.scenarios[0];
    const team = catalog.teams[0];
    const rng = createRng(42);
    const state = initializeRaceState(scenario, team, catalog, 42, rng);

    expect(state.position).toBe(scenario.params.startingPosition);
    expect(state.tireWear).toBe(scenario.params.baseTireWear);
    expect(state.currentTurn).toBe(0);
    expect(state.totalTurns).toBe(6);
    expect(state.deck).toHaveLength(12);
    expect(state.hand).toHaveLength(0);
    expect(state.perkUsed).toBe(false);
    expect(state.scUsed).toBe(false);
  });

  it('shuffles deck deterministically', () => {
    const scenario = catalog.scenarios[0];
    const team = catalog.teams[0];
    const rng1 = createRng(42);
    const rng2 = createRng(42);

    const state1 = initializeRaceState(scenario, team, catalog, 42, rng1);
    const state2 = initializeRaceState(scenario, team, catalog, 42, rng2);

    expect(state1.deck).toEqual(state2.deck);
  });
});

describe('runTurn', () => {
  it('advances turn counter', () => {
    const scenario = catalog.scenarios[0];
    const team = catalog.teams[0];
    const rng = createRng(42);
    const state = initializeRaceState(scenario, team, catalog, 42, rng);

    const { state: updated } = runTurn(state, scenario, team, catalog, deterministicAgent, rng);
    expect(updated.currentTurn).toBe(1);
  });

  it('produces a turn summary with event info', () => {
    const scenario = catalog.scenarios[0];
    const team = catalog.teams[0];
    const rng = createRng(42);
    const state = initializeRaceState(scenario, team, catalog, 42, rng);

    const { summary } = runTurn(state, scenario, team, catalog, deterministicAgent, rng);
    expect(summary.turn).toBe(1);
    expect(summary.event.type).toBeTruthy();
    expect(summary.actionCard).toBeTruthy();
  });

  it('ends in end phase', () => {
    const scenario = catalog.scenarios[0];
    const team = catalog.teams[0];
    const rng = createRng(42);
    const state = initializeRaceState(scenario, team, catalog, 42, rng);

    const { state: updated } = runTurn(state, scenario, team, catalog, deterministicAgent, rng);
    expect(updated.turnPhase).toBe('end');
  });
});
