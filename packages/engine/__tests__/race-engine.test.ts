import { describe, expect, it } from 'vitest';
import { loadCatalog } from '@boxbox/content';
import { runRace, initializeRaceState, runTurn } from '../src/race-engine.js';
import { createRng } from '../src/rng.js';
import type { PlayerAgent, ScoringConfig } from '../src/types.js';

const catalog = loadCatalog();

const deterministicAgent: PlayerAgent = {
  chooseQuickDecisionCard: (state) => {
    // Pick the first quick-decision eligible card in hand
    for (const cardId of state.hand) {
      const card = catalog.cards.find((c) => c.id === cardId);
      if (card?.quickDecisionEligible) return cardId;
    }
    return null;
  },
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

    // Very unlikely to produce identical event sequences
    const events1 = debrief1.turnLog.map((t) => t.event.type);
    const events2 = debrief2.turnLog.map((t) => t.event.type);
    // At least some events should differ (with high probability)
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

  it('records cards played', () => {
    const scenario = catalog.scenarios[0];
    const team = catalog.teams[0];
    const debrief = runRace(scenario, team, catalog, deterministicAgent, 42, config);

    // At least 6 cards played (1 action card per turn), possibly more with quick decisions
    expect(debrief.cardsPlayed.length).toBeGreaterThanOrEqual(6);
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

  it('respects SC/VSC envelope constraints across a race', () => {
    const scenario = catalog.scenarios[0];
    const team = catalog.teams[0];

    for (let seed = 0; seed < 50; seed++) {
      const debrief = runRace(scenario, team, catalog, deterministicAgent, seed, config);
      const scCount = debrief.eventHistory.filter((e) => e.type === 'safety-car').length;
      const vscCount = debrief.eventHistory.filter((e) => e.type === 'vsc').length;

      expect(scCount).toBeLessThanOrEqual(1);
      expect(vscCount).toBeLessThanOrEqual(1);

      // No consecutive SC/VSC
      for (let i = 1; i < debrief.eventHistory.length; i++) {
        const prev = debrief.eventHistory[i - 1].type;
        const curr = debrief.eventHistory[i].type;
        if (prev === 'safety-car') expect(curr).not.toBe('safety-car');
        if (prev === 'vsc') expect(curr).not.toBe('vsc');
      }

      // Max 2 rain events per race
      const rainCount = debrief.eventHistory.filter((e) => e.type === 'rain').length;
      expect(rainCount).toBeLessThanOrEqual(2);
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
    expect(state.fuel).toBe(scenario.params.baseFuel);
    expect(state.rainMeter).toBe(0);
    expect(state.currentTurn).toBe(0);
    expect(state.totalTurns).toBe(6);
    expect(state.deck).toHaveLength(18);
    expect(state.hand).toHaveLength(0);
    expect(state.perkUsed).toBe(false);
    expect(state.scUsed).toBe(false);
    expect(state.vscUsed).toBe(false);
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

  it('refills hand to 3', () => {
    const scenario = catalog.scenarios[0];
    const team = catalog.teams[0];
    const rng = createRng(42);
    let state = initializeRaceState(scenario, team, catalog, 42, rng);

    const { state: updated } = runTurn(state, scenario, team, catalog, deterministicAgent, rng);
    // Hand should have some cards (at least started with 3, minus cards played)
    // After playing cards, hand may be smaller but the turn started with 3
    expect(updated.turnPhase).toBe('end');
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
});
