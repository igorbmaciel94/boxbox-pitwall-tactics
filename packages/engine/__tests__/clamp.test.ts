import { describe, expect, it } from 'vitest';
import { loadCatalog } from '@boxbox/content';
import { createRng } from '../src/rng.js';
import {
  clampRaceState,
  applyEndOfTurnPenalties,
  applyCrashCheck,
  COMPOUND_WEAR_PER_TURN,
} from '../src/clamp.js';
import type { RaceState } from '../src/types.js';

const catalog = loadCatalog();

function makeState(overrides: Partial<RaceState> = {}): RaceState {
  return {
    scenarioId: 'monaco',
    teamId: 'crimson',
    seed: 42,
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
    trackLimitViolations: 0,
    objectivesCompleted: [],
    cardsPlayedTotal: [],
    turnPhase: 'resolve',
    maxTireWearReached: 30,
    isDNF: false,
    lastCrashSeverity: 'none',
    ...overrides,
  };
}

describe('clampRaceState', () => {
  it('clamps position to 1-20 range', () => {
    const low = clampRaceState(makeState({ position: -5 }));
    expect(low.position).toBe(1);

    const high = clampRaceState(makeState({ position: 25 }));
    expect(high.position).toBe(20);
  });

  it('clamps tire wear to 0-100 range', () => {
    const low = clampRaceState(makeState({ tireWear: -10 }));
    expect(low.tireWear).toBe(0);

    const high = clampRaceState(makeState({ tireWear: 150 }));
    expect(high.tireWear).toBe(100);
  });

  it('updates maxTireWearReached', () => {
    const state = clampRaceState(makeState({ tireWear: 80, maxTireWearReached: 60 }));
    expect(state.maxTireWearReached).toBe(80);
  });

  it('does not decrease maxTireWearReached', () => {
    const state = clampRaceState(makeState({ tireWear: 40, maxTireWearReached: 60 }));
    expect(state.maxTireWearReached).toBe(60);
  });
});

describe('applyEndOfTurnPenalties', () => {
  it('adds compound-based wear per turn (medium, dry)', () => {
    const state = makeState({ tireWear: 30, tireCompound: 'medium' });
    const updated = applyEndOfTurnPenalties(state, false);
    // medium dry: 5 wear * 1.0 multiplier = 5
    expect(updated.tireWear).toBe(35);
  });

  it('adds compound-based wear per turn (soft, dry)', () => {
    const state = makeState({ tireWear: 30, tireCompound: 'soft' });
    const updated = applyEndOfTurnPenalties(state, false);
    // soft dry: 7 * 1.0 = 7
    expect(updated.tireWear).toBe(37);
  });

  it('applies rain multiplier on dry tires', () => {
    const state = makeState({ tireWear: 30, tireCompound: 'soft' });
    const updated = applyEndOfTurnPenalties(state, true);
    // soft rain: 7 * 1.8 = 12.6 ≈ 13
    expect(updated.tireWear).toBe(43); // 30 + 13
  });

  it('applies degradation penalty at wear >= 55', () => {
    const state = makeState({ tireWear: 53, tireCompound: 'hard', position: 5 });
    const updated = applyEndOfTurnPenalties(state, false);
    // hard dry: +3 wear → 56, which is >= 55 → +1 position
    expect(updated.tireWear).toBe(56);
    expect(updated.position).toBe(6);
  });

  it('applies degradation penalty at wear >= 75', () => {
    const state = makeState({ tireWear: 73, tireCompound: 'hard', position: 5 });
    const updated = applyEndOfTurnPenalties(state, false);
    // +3 → 76, >= 75 → +2 positions
    expect(updated.tireWear).toBe(76);
    expect(updated.position).toBe(7);
  });

  it('applies degradation penalty at wear >= 90', () => {
    const state = makeState({ tireWear: 88, tireCompound: 'hard', position: 5 });
    const updated = applyEndOfTurnPenalties(state, false);
    // +3 → 91, >= 90 → +3 positions
    expect(updated.position).toBe(8);
  });

  it('applies tire blowout at wear >= 100', () => {
    const state = makeState({ tireWear: 98, tireCompound: 'hard', position: 5 });
    const updated = applyEndOfTurnPenalties(state, false);
    // +3 → 101, >= 90 → +3, >= 100 → +5 blowout
    expect(updated.position).toBe(13); // 5 + 3 + 5 = 13
  });

  it('applies wrong compound penalty (dry tires in rain)', () => {
    const state = makeState({ tireWear: 20, tireCompound: 'soft', position: 5 });
    const updated = applyEndOfTurnPenalties(state, true);
    // +2 for wrong compound in rain
    expect(updated.position).toBeGreaterThanOrEqual(7);
  });

  it('applies wrong compound penalty (wet tires in dry)', () => {
    const state = makeState({ tireWear: 20, tireCompound: 'wet', position: 5 });
    const updated = applyEndOfTurnPenalties(state, false);
    // +1 for wet in dry
    expect(updated.position).toBeGreaterThanOrEqual(6);
  });

  it('no position penalties under Safety Car', () => {
    const state = makeState({ tireWear: 95, tireCompound: 'soft', position: 5 });
    const updated = applyEndOfTurnPenalties(state, false, true);
    // Under SC: compound wear still applies but no position penalties
    expect(updated.position).toBe(5);
    // Wear increased by compound (soft dry: 7)
    expect(updated.tireWear).toBeGreaterThan(95);
  });
});

describe('applyCrashCheck', () => {
  it('no crash under Safety Car', () => {
    const state = makeState({ underSafetyCar: true, tireWear: 99 });
    const rng = createRng(1);
    const updated = applyCrashCheck(state, 'push-hard', catalog, true, rng);
    expect(updated.isDNF).toBe(false);
    expect(updated.lastCrashSeverity).toBe('none');
  });

  it('no crash if already DNF', () => {
    const state = makeState({ isDNF: true });
    const rng = createRng(1);
    const updated = applyCrashCheck(state, 'push-hard', catalog, false, rng);
    expect(updated).toBe(state); // Same reference, no modification
  });

  it('no crash chance with low wear and no risk factors', () => {
    const state = makeState({ tireWear: 20, tireCompound: 'medium' });
    const rng = createRng(42);
    // defend-position is defensive, no aggressive tag, dry tires, no mech issues
    const updated = applyCrashCheck(state, 'defend-position', catalog, false, rng);
    expect(updated.lastCrashSeverity).toBe('none');
  });

  it('aggressive on worn tires adds crash chance', () => {
    // Run many times to verify crash can occur
    let crashOccurred = false;
    for (let seed = 1; seed <= 200; seed++) {
      const state = makeState({
        tireWear: 80,
        tireCompound: 'soft',
        eventHistory: [
          { type: 'mechanical-issue', name: '', flavorIndex: 0, effect: {}, flavorText: '' },
          { type: 'mechanical-issue', name: '', flavorIndex: 0, effect: {}, flavorText: '' },
        ],
      });
      const rng = createRng(seed);
      // aggressive + wear > 75: 4%, rain on dry: 6%, 2 mech issues: 4%, wear >= 95: no
      // Total: ~14% chance
      const updated = applyCrashCheck(state, 'push-hard', catalog, true, rng);
      if (updated.lastCrashSeverity !== 'none') {
        crashOccurred = true;
        break;
      }
    }
    expect(crashOccurred).toBe(true);
  });

  it('crash damage: position loss and tire wear increase', () => {
    // Find a seed that produces a damage crash (not DNF)
    let damageFound = false;
    for (let seed = 1; seed <= 500; seed++) {
      const state = makeState({
        tireWear: 80,
        tireCompound: 'soft',
        position: 5,
        eventHistory: [
          { type: 'mechanical-issue', name: '', flavorIndex: 0, effect: {}, flavorText: '' },
        ],
      });
      const rng = createRng(seed);
      const updated = applyCrashCheck(state, 'push-hard', catalog, true, rng);
      if (updated.lastCrashSeverity === 'damage') {
        expect(updated.position).toBe(11); // 5 + 6
        expect(updated.tireWear).toBe(100); // min(80+25, 100)
        expect(updated.isDNF).toBe(false);
        damageFound = true;
        break;
      }
    }
    expect(damageFound).toBe(true);
  });

  it('crash DNF: race over, position = 20', () => {
    let dnfFound = false;
    for (let seed = 1; seed <= 500; seed++) {
      const state = makeState({
        tireWear: 80,
        tireCompound: 'soft',
        position: 5,
        eventHistory: [
          { type: 'mechanical-issue', name: '', flavorIndex: 0, effect: {}, flavorText: '' },
        ],
      });
      const rng = createRng(seed);
      const updated = applyCrashCheck(state, 'push-hard', catalog, true, rng);
      if (updated.lastCrashSeverity === 'dnf') {
        expect(updated.isDNF).toBe(true);
        expect(updated.position).toBe(20);
        dnfFound = true;
        break;
      }
    }
    expect(dnfFound).toBe(true);
  });
});
