import { describe, expect, it } from 'vitest';
import { loadCatalog } from '@boxbox/content';
import { createRng } from '../src/rng.js';
import {
  applyEndOfTurnPenalties,
  applyCrashCheck,
  COMPOUND_WEAR_PER_TURN,
  COMPOUND_WRONG_CONDITION_WEAR,
} from '../src/clamp.js';
import type { Difficulty, RaceState } from '../src/types.js';

const catalog = loadCatalog();

function makeState(overrides: Partial<RaceState> = {}): RaceState {
  return {
    scenarioId: 'monaco',
    teamId: 'crimson',
    seed: 42,
    difficulty: 'normal',
    position: 10,
    tireWear: 30,
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
    scUsed: false,
    underSafetyCar: false,
    lastEventType: null,
    perkUsed: false,
    mulliganUsed: false,
    emergencyMulliganUsed: false,
    turnsSkipped: 0,
    p1SkipsUsed: 0,
    objectivesCompleted: [],
    cardsPlayedTotal: [],
    turnPhase: 'resolve',
    maxTireWearReached: 30,
    isDNF: false,
    lastCrashSeverity: 'none',
    ...overrides,
  };
}

describe('difficulty modes — wear scaling', () => {
  const difficulties: Difficulty[] = ['easy', 'normal', 'hard'];
  const expectedMultipliers: Record<Difficulty, number> = { easy: 0.7, normal: 1.0, hard: 1.4 };

  it('easy mode reduces tire wear per turn', () => {
    const state = makeState({ tireWear: 0, tireCompound: 'medium' });
    const updated = applyEndOfTurnPenalties(state, false, false, 'easy');
    // medium dry: 5 * 1.0 * 0.7 = 3.5 → 4 (rounded)
    expect(updated.tireWear).toBe(Math.round(5 * 1.0 * 0.7));
  });

  it('normal mode applies standard tire wear per turn', () => {
    const state = makeState({ tireWear: 0, tireCompound: 'medium' });
    const updated = applyEndOfTurnPenalties(state, false, false, 'normal');
    // medium dry: 5 * 1.0 * 1.0 = 5
    expect(updated.tireWear).toBe(5);
  });

  it('hard mode increases tire wear per turn', () => {
    const state = makeState({ tireWear: 0, tireCompound: 'medium' });
    const updated = applyEndOfTurnPenalties(state, false, false, 'hard');
    // medium dry: 5 * 1.0 * 1.4 = 7
    expect(updated.tireWear).toBe(7);
  });

  it('all difficulties produce correctly scaled wear for each compound', () => {
    for (const diff of difficulties) {
      for (const compound of ['soft', 'medium', 'hard'] as const) {
        const state = makeState({ tireWear: 0, tireCompound: compound });
        const updated = applyEndOfTurnPenalties(state, false, false, diff);
        const expected = Math.round(COMPOUND_WEAR_PER_TURN[compound] * expectedMultipliers[diff]);
        expect(updated.tireWear).toBe(expected);
      }
    }
  });
});

describe('difficulty modes — degradation reduction', () => {
  it('easy mode reduces degradation penalty at wear >= 55', () => {
    const state = makeState({ tireWear: 52, tireCompound: 'hard', position: 10 });
    const updated = applyEndOfTurnPenalties(state, false, false, 'easy');
    // hard dry: 3 * 1.0 * 0.7 = 2.1 → 2, so wear = 54
    // Wait, 52 + 2 = 54, which is < 55 so no degradation
    // Let's use higher starting wear
    const state2 = makeState({ tireWear: 53, tireCompound: 'hard', position: 10 });
    const updated2 = applyEndOfTurnPenalties(state2, false, false, 'easy');
    // 53 + 2 = 55, degradation threshold hit
    // easy degradationReduction = 1, so penalty = max(0, 1-1) = 0
    expect(updated2.position).toBe(10); // no position loss
  });

  it('normal mode applies full degradation at wear >= 55', () => {
    const state = makeState({ tireWear: 53, tireCompound: 'hard', position: 10 });
    const updated = applyEndOfTurnPenalties(state, false, false, 'normal');
    // 53 + 3 = 56 >= 55, degradation = +1 (degradationReduction=0)
    expect(updated.position).toBe(11);
  });

  it('easy mode reduces degradation penalty at wear >= 75', () => {
    const state = makeState({ tireWear: 73, tireCompound: 'hard', position: 10 });
    const updated = applyEndOfTurnPenalties(state, false, false, 'easy');
    // 73 + 2 = 75, degradation = 2 - 1 = 1
    expect(updated.position).toBe(11);
  });

  it('normal mode applies full degradation at wear >= 75', () => {
    const state = makeState({ tireWear: 73, tireCompound: 'hard', position: 10 });
    const updated = applyEndOfTurnPenalties(state, false, false, 'normal');
    // 73 + 3 = 76, degradation = 2 (degradationReduction=0)
    expect(updated.position).toBe(12);
  });

  it('easy mode reduces degradation penalty at wear >= 90', () => {
    const state = makeState({ tireWear: 88, tireCompound: 'hard', position: 10 });
    const updated = applyEndOfTurnPenalties(state, false, false, 'easy');
    // 88 + 2 = 90, degradation = 3 - 1 = 2
    expect(updated.position).toBe(12);
  });
});

describe('difficulty modes — blowout penalty', () => {
  it('easy mode applies +3 blowout penalty at wear >= 100', () => {
    const state = makeState({ tireWear: 98, tireCompound: 'soft', position: 5 });
    const updated = applyEndOfTurnPenalties(state, false, false, 'easy');
    // soft dry: 7 * 0.7 = 4.9 → 5, wear = 103 → clamped isn't applied here
    // wear >= 100, blowout penalty = 3
    // Also degradation at 90+: 3 - 1 = 2
    expect(updated.tireWear).toBeGreaterThanOrEqual(100);
    // Position: 5 + 2 (degradation) + 3 (blowout) = 10
    expect(updated.position).toBe(10);
  });

  it('normal mode applies +5 blowout penalty at wear >= 100', () => {
    const state = makeState({ tireWear: 98, tireCompound: 'soft', position: 5 });
    const updated = applyEndOfTurnPenalties(state, false, false, 'normal');
    // soft dry: 7, wear = 105
    // degradation at 90+: 3
    // blowout: 5
    expect(updated.tireWear).toBeGreaterThanOrEqual(100);
    expect(updated.position).toBe(5 + 3 + 5);
  });

  it('hard mode applies +7 blowout penalty at wear >= 100', () => {
    const state = makeState({ tireWear: 93, tireCompound: 'soft', position: 5 });
    const updated = applyEndOfTurnPenalties(state, false, false, 'hard');
    // soft dry: 7 * 1.4 = 9.8 → 10, wear = 103
    // degradation at 90+: 3 (no reduction on hard)
    // blowout: 7
    expect(updated.tireWear).toBeGreaterThanOrEqual(100);
    expect(updated.position).toBe(5 + 3 + 7);
  });
});

describe('difficulty modes — crash multiplier', () => {
  it('easy mode reduces crash chance significantly', () => {
    const rng = createRng(42);
    // Aggressive card + high wear = max crash chance setup
    const aggressiveCard = catalog.cards.find((c) => c.tags.includes('aggressive'));
    if (!aggressiveCard) return;

    let crashes = 0;
    const runs = 200;
    for (let i = 0; i < runs; i++) {
      const testRng = createRng(i);
      const state = makeState({ tireWear: 80 });
      const result = applyCrashCheck(state, aggressiveCard.id, catalog, true, testRng, 'easy');
      if (result.lastCrashSeverity !== 'none') crashes++;
    }
    // Easy: 0.3x multiplier → much fewer crashes
    expect(crashes).toBeLessThan(runs * 0.1);
  });

  it('hard mode increases crash chance significantly', () => {
    const aggressiveCard = catalog.cards.find((c) => c.tags.includes('aggressive'));
    if (!aggressiveCard) return;

    let crashesNormal = 0;
    let crashesHard = 0;
    const runs = 200;
    for (let i = 0; i < runs; i++) {
      const testRng1 = createRng(i);
      const testRng2 = createRng(i);
      const state = makeState({ tireWear: 80 });
      const resultNormal = applyCrashCheck(state, aggressiveCard.id, catalog, true, testRng1, 'normal');
      const resultHard = applyCrashCheck(state, aggressiveCard.id, catalog, true, testRng2, 'hard');
      if (resultNormal.lastCrashSeverity !== 'none') crashesNormal++;
      if (resultHard.lastCrashSeverity !== 'none') crashesHard++;
    }
    // Hard should have more crashes than normal
    expect(crashesHard).toBeGreaterThan(crashesNormal);
  });
});
