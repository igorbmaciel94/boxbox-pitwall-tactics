import { describe, expect, it } from 'vitest';
import {
  applyEndOfTurnPenalties,
  COMPOUND_WEAR_PER_TURN,
  COMPOUND_WRONG_CONDITION_WEAR,
} from '../src/clamp.js';
import type { RaceState, TireCompound } from '../src/types.js';

function makeState(overrides: Partial<RaceState> = {}): RaceState {
  return {
    scenarioId: 'harbor',
    teamId: 'crimson',
    seed: 42,
    difficulty: 'normal',
    position: 10,
    tireWear: 0,
    tireCompound: 'medium',
    tireAllocation: { soft: 1, medium: 1, hard: 1 },
    compoundSetsUsed: ['medium'],
    hasPitted: false,
    pitStopsMade: 0,
    currentTurn: 3,
    totalTurns: 8,
    deck: [],
    hand: [],
    discard: [],
    currentEvent: null,
    eventHistory: [],
    cautionUsed: false,
    underCaution: false,
    lastEventType: null,
    perkUsed: false,
    mulliganUsed: false,
    emergencyMulliganUsed: false,
    turnsSkipped: 0,
    p1SkipsUsed: 0,
    objectivesCompleted: [],
    cardsPlayedTotal: [],
    turnPhase: 'resolve',
    maxTireWearReached: 0,
    isDNF: false,
    lastCrashSeverity: 'none',
    ...overrides,
  };
}

const ALL_COMPOUNDS: TireCompound[] = ['soft', 'medium', 'hard', 'intermediate', 'wet'];

describe('tire compound wear — all compounds in dry conditions', () => {
  it.each([
    ['soft', 7, 1.0],
    ['medium', 5, 1.0],
    ['hard', 3, 1.0],
    ['intermediate', 5, 2.5],
    ['wet', 3, 3.0],
  ] as const)('%s in dry: base=%d, multiplier=%d', (compound, baseWear, multiplier) => {
    const state = makeState({ tireWear: 0, tireCompound: compound as TireCompound });
    const updated = applyEndOfTurnPenalties(state, false);
    const expected = Math.round(baseWear * multiplier);
    expect(updated.tireWear).toBe(expected);
  });
});

describe('tire compound wear — all compounds in rain conditions', () => {
  it.each([
    ['soft', 7, 2.5],
    ['medium', 5, 2.0],
    ['hard', 3, 1.6],
    ['intermediate', 5, 1.0],
    ['wet', 3, 0.8],
  ] as const)('%s in rain: base=%d, multiplier=%d', (compound, baseWear, multiplier) => {
    const state = makeState({ tireWear: 0, tireCompound: compound as TireCompound });
    const updated = applyEndOfTurnPenalties(state, true);
    const expected = Math.round(baseWear * multiplier);
    // Rain adds position penalty for dry tires, but we check wear
    expect(updated.tireWear).toBe(expected);
  });
});

describe('inter tires on dry — aggressive degradation', () => {
  it('inter on dry wears significantly in 3 turns', () => {
    let state = makeState({ tireWear: 0, tireCompound: 'intermediate' });
    for (let i = 0; i < 3; i++) {
      state = applyEndOfTurnPenalties(state, false);
      // Reset position changes for clean measurement
      state = { ...state, position: 10 };
    }
    // 3 turns × round(5 * 2.5) = 3 × 13 = 39
    expect(state.tireWear).toBe(39);
    expect(state.tireWear).toBeGreaterThan(30); // Must be noticeable
  });

  it('inter on dry wears much more than inter in rain', () => {
    let dryState = makeState({ tireWear: 0, tireCompound: 'intermediate' });
    let rainState = makeState({ tireWear: 0, tireCompound: 'intermediate' });
    for (let i = 0; i < 3; i++) {
      dryState = applyEndOfTurnPenalties(dryState, false);
      rainState = applyEndOfTurnPenalties(rainState, true);
      dryState = { ...dryState, position: 10 };
      rainState = { ...rainState, position: 10 };
    }
    // Dry: 3 × 13 = 39, Rain: 3 × 5 = 15
    expect(dryState.tireWear).toBeGreaterThan(rainState.tireWear * 2);
  });
});

describe('dry tires in rain — heavy penalties', () => {
  it('soft in rain causes severe wear and position penalty', () => {
    const state = makeState({ tireWear: 0, tireCompound: 'soft', position: 5 });
    const updated = applyEndOfTurnPenalties(state, true);
    // Wear: round(7 * 2.5) = 18
    expect(updated.tireWear).toBe(18);
    // Wrong compound penalty: +2 positions for dry tire in rain
    expect(updated.position).toBe(7);
  });

  it('medium in rain causes heavy wear and position penalty', () => {
    const state = makeState({ tireWear: 0, tireCompound: 'medium', position: 5 });
    const updated = applyEndOfTurnPenalties(state, true);
    // Wear: round(5 * 2.0) = 10
    expect(updated.tireWear).toBe(10);
    // Wrong compound penalty: +2
    expect(updated.position).toBe(7);
  });

  it('hard in rain causes moderate wear and position penalty', () => {
    const state = makeState({ tireWear: 0, tireCompound: 'hard', position: 5 });
    const updated = applyEndOfTurnPenalties(state, true);
    // Wear: round(3 * 1.6) = 5
    expect(updated.tireWear).toBe(5);
    // Wrong compound penalty: +2
    expect(updated.position).toBe(7);
  });
});

describe('wet tires on dry — heavy wear penalty', () => {
  it('wet on dry causes very high wear rate', () => {
    const state = makeState({ tireWear: 0, tireCompound: 'wet', position: 5 });
    const updated = applyEndOfTurnPenalties(state, false);
    // Wear: round(3 * 3.0) = 9
    expect(updated.tireWear).toBe(9);
    // Wrong compound penalty: +1 for wet on dry
    expect(updated.position).toBe(6);
  });

  it('wet in rain has reduced wear (optimal)', () => {
    const state = makeState({ tireWear: 0, tireCompound: 'wet', position: 5 });
    const updated = applyEndOfTurnPenalties(state, true);
    // Wear: round(3 * 0.8) = 2
    expect(updated.tireWear).toBe(2);
    // No wrong compound penalty
    expect(updated.position).toBe(5);
  });
});

describe('COMPOUND_WRONG_CONDITION_WEAR constants', () => {
  it('dry tires have 1.0 multiplier in dry conditions', () => {
    expect(COMPOUND_WRONG_CONDITION_WEAR.soft.dry).toBe(1.0);
    expect(COMPOUND_WRONG_CONDITION_WEAR.medium.dry).toBe(1.0);
    expect(COMPOUND_WRONG_CONDITION_WEAR.hard.dry).toBe(1.0);
  });

  it('rain tires have 1.0 or less multiplier in rain', () => {
    expect(COMPOUND_WRONG_CONDITION_WEAR.intermediate.rain).toBe(1.0);
    expect(COMPOUND_WRONG_CONDITION_WEAR.wet.rain).toBeLessThanOrEqual(1.0);
  });

  it('wrong-condition multipliers are > 1.5 for meaningful penalty', () => {
    // Dry tires in rain
    expect(COMPOUND_WRONG_CONDITION_WEAR.soft.rain).toBeGreaterThanOrEqual(2.0);
    expect(COMPOUND_WRONG_CONDITION_WEAR.medium.rain).toBeGreaterThanOrEqual(1.6);
    expect(COMPOUND_WRONG_CONDITION_WEAR.hard.rain).toBeGreaterThanOrEqual(1.5);
    // Rain tires in dry
    expect(COMPOUND_WRONG_CONDITION_WEAR.intermediate.dry).toBeGreaterThanOrEqual(2.0);
    expect(COMPOUND_WRONG_CONDITION_WEAR.wet.dry).toBeGreaterThanOrEqual(2.5);
  });
});
