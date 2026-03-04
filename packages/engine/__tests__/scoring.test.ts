import { describe, expect, it } from 'vitest';
import { loadCatalog } from '@boxbox/content';
import { calculateRaceScore, calculateSeasonScore, evaluateObjective, getPositionScore } from '../src/scoring.js';
import type { RaceDebrief, RaceState, ScoringConfig } from '../src/types.js';

const catalog = loadCatalog();

function makeBaseState(overrides: Partial<RaceState> = {}): RaceState {
  return {
    scenarioId: 'monaco',
    teamId: 'crimson',
    seed: 42,
    position: 10,
    tireWear: 30,
    fuel: 50,
    rainMeter: 0,
    currentTurn: 6,
    totalTurns: 6,
    deck: [],
    hand: [],
    discard: [],
    currentEvent: null,
    eventHistory: [],
    scUsed: false,
    vscUsed: false,
    rainCount: 0,
    lastEventType: null,
    perkUsed: false,
    objectivesCompleted: [],
    cardsPlayedTotal: [],
    quickDecisionMade: false,
    turnPhase: 'end',
    maxTireWearReached: 30,
    ...overrides,
  };
}

describe('getPositionScore', () => {
  it('returns 25 for P1', () => expect(getPositionScore(1)).toBe(25));
  it('returns 18 for P2', () => expect(getPositionScore(2)).toBe(18));
  it('returns 15 for P3', () => expect(getPositionScore(3)).toBe(15));
  it('returns 12 for P4', () => expect(getPositionScore(4)).toBe(12));
  it('returns 10 for P5', () => expect(getPositionScore(5)).toBe(10));
  it('returns 8 for P6', () => expect(getPositionScore(6)).toBe(8));
  it('returns 6 for P7', () => expect(getPositionScore(7)).toBe(6));
  it('returns 4 for P8', () => expect(getPositionScore(8)).toBe(4));
  it('returns 2 for P9', () => expect(getPositionScore(9)).toBe(2));
  it('returns 1 for P10', () => expect(getPositionScore(10)).toBe(1));
  it('returns 0 for P11', () => expect(getPositionScore(11)).toBe(0));
  it('returns 0 for P20', () => expect(getPositionScore(20)).toBe(0));
});

describe('evaluateObjective', () => {
  it('finish-above: true when position <= target', () => {
    const state = makeBaseState({ position: 3 });
    const objective = {
      id: 'test',
      description: 'Finish top 5',
      type: 'main' as const,
      evaluate: 'finish-above',
      params: { position: 5 },
      points: 10,
    };
    expect(evaluateObjective(objective, state, catalog)).toBe(true);
  });

  it('finish-above: false when position > target', () => {
    const state = makeBaseState({ position: 8 });
    const objective = {
      id: 'test',
      description: 'Finish top 5',
      type: 'main' as const,
      evaluate: 'finish-above',
      params: { position: 5 },
      points: 10,
    };
    expect(evaluateObjective(objective, state, catalog)).toBe(false);
  });

  it('tire-wear-below: true when tire wear <= threshold', () => {
    const state = makeBaseState({ tireWear: 40 });
    const objective = {
      id: 'test',
      description: 'Low wear',
      type: 'bonus' as const,
      evaluate: 'tire-wear-below',
      params: { threshold: 50 },
      points: 3,
    };
    expect(evaluateObjective(objective, state, catalog)).toBe(true);
  });

  it('fuel-above: true when fuel >= threshold', () => {
    const state = makeBaseState({ fuel: 30 });
    const objective = {
      id: 'test',
      description: 'Fuel good',
      type: 'bonus' as const,
      evaluate: 'fuel-above',
      params: { threshold: 20 },
      points: 3,
    };
    expect(evaluateObjective(objective, state, catalog)).toBe(true);
  });

  it('used-perk: true when perk was used', () => {
    const state = makeBaseState({ perkUsed: true });
    const objective = {
      id: 'test',
      description: 'Used perk',
      type: 'bonus' as const,
      evaluate: 'used-perk',
      params: {},
      points: 3,
    };
    expect(evaluateObjective(objective, state, catalog)).toBe(true);
  });

  it('min-cards-with-tag: counts tagged cards played', () => {
    const state = makeBaseState({
      cardsPlayedTotal: ['push-hard', 'overtake', 'defend-position'],
    });
    const objective = {
      id: 'test',
      description: 'Play aggressive cards',
      type: 'bonus' as const,
      evaluate: 'min-cards-with-tag',
      params: { tag: 'aggressive', count: 2 },
      points: 4,
    };
    expect(evaluateObjective(objective, state, catalog)).toBe(true);
  });

  it('max-tire-wear-below: checks max tire wear reached', () => {
    const state = makeBaseState({ maxTireWearReached: 75 });
    const objective = {
      id: 'test',
      description: 'Keep wear low',
      type: 'bonus' as const,
      evaluate: 'max-tire-wear-below',
      params: { threshold: 80 },
      points: 5,
    };
    expect(evaluateObjective(objective, state, catalog)).toBe(true);
  });

  it('returns false for unknown evaluator', () => {
    const state = makeBaseState();
    const objective = {
      id: 'test',
      description: 'Unknown',
      type: 'bonus' as const,
      evaluate: 'nonexistent-evaluator',
      params: {},
      points: 5,
    };
    expect(evaluateObjective(objective, state, catalog)).toBe(false);
  });
});

describe('calculateRaceScore', () => {
  const config: ScoringConfig = { styleBonusesEnabled: false };
  const scenario = catalog.scenarios.find((s) => s.id === 'monaco')!;

  it('calculates position score + objective points', () => {
    // Position 3 = 15 points; Monaco main objective = finish top 5 (10 pts)
    const state = makeBaseState({ position: 3, tireWear: 40 });
    const debrief = calculateRaceScore(state, scenario, catalog, [], config);

    expect(debrief.positionScore).toBe(15);
    expect(debrief.objectivesCompleted.length).toBeGreaterThanOrEqual(1);
    expect(debrief.totalScore).toBe(15 + debrief.objectivePoints);
  });

  it('includes style bonus when enabled', () => {
    const configWithStyle: ScoringConfig = { styleBonusesEnabled: true };
    const state = makeBaseState({ position: 1, tireWear: 85, fuel: 35 });
    const debrief = calculateRaceScore(state, scenario, catalog, [], configWithStyle);

    expect(debrief.styleBonus).toBeGreaterThan(0);
  });

  it('has zero style bonus when disabled', () => {
    const state = makeBaseState({ position: 1, tireWear: 85, fuel: 35 });
    const debrief = calculateRaceScore(state, scenario, catalog, [], config);

    expect(debrief.styleBonus).toBe(0);
  });
});

describe('calculateSeasonScore', () => {
  it('sums up all race total scores', () => {
    const debriefs = [
      { totalScore: 25 } as RaceDebrief,
      { totalScore: 18 } as RaceDebrief,
      { totalScore: 10 } as RaceDebrief,
    ];
    expect(calculateSeasonScore(debriefs)).toBe(53);
  });

  it('returns 0 for empty array', () => {
    expect(calculateSeasonScore([])).toBe(0);
  });
});
