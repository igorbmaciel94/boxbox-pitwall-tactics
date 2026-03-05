import { describe, expect, it } from 'vitest';
import { loadCatalog } from '@boxbox/content';
import { applyCardEffect } from '../src/card-effects.js';
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
    hand: ['push-hard', 'box-box', 'defend-position'],
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
    turnPhase: 'play-card',
    maxTireWearReached: 30,
    isDNF: false,
    lastCrashSeverity: 'none',
    ...overrides,
  };
}

describe('Black & White Flag — track limit violations', () => {
  it('aggressive card increments trackLimitViolations', () => {
    const state = makeState({ trackLimitViolations: 0 });
    // push-hard has 'aggressive' tag
    const updated = applyCardEffect(state, 'push-hard', catalog);
    expect(updated.trackLimitViolations).toBe(1);
  });

  it('non-aggressive card does not increment violations', () => {
    const state = makeState({ trackLimitViolations: 2 });
    // defend-position has 'defensive' tag
    const updated = applyCardEffect(state, 'defend-position', catalog);
    expect(updated.trackLimitViolations).toBe(2);
  });

  it('3rd violation: no penalty yet (warning only)', () => {
    const state = makeState({ trackLimitViolations: 2, position: 5 });
    // push-hard: position -2, aggressive → violation becomes 3
    const updated = applyCardEffect(state, 'push-hard', catalog);
    expect(updated.trackLimitViolations).toBe(3);
    // Position: 5 - 2 = 3, no penalty at 3 violations
    expect(updated.position).toBe(3);
  });

  it('4th violation: +3 position penalty applied', () => {
    const state = makeState({ trackLimitViolations: 3, position: 5 });
    // push-hard: position -2 (5-2=3), then +3 penalty = 6
    const updated = applyCardEffect(state, 'push-hard', catalog);
    expect(updated.trackLimitViolations).toBe(4);
    expect(updated.position).toBe(6);
  });

  it('5th+ violation: penalty applied each time', () => {
    const state = makeState({ trackLimitViolations: 4, position: 5 });
    const updated = applyCardEffect(state, 'push-hard', catalog);
    expect(updated.trackLimitViolations).toBe(5);
    // 5 - 2 + 3 = 6
    expect(updated.position).toBe(6);
  });

  it('aggressive card under Safety Car: NO violation counted', () => {
    const state = makeState({
      trackLimitViolations: 2,
      underSafetyCar: true,
    });
    const updated = applyCardEffect(state, 'push-hard', catalog);
    // Violations should NOT increment under SC
    expect(updated.trackLimitViolations).toBe(2);
  });

  it('pit card does not increment violations', () => {
    const state = makeState({ trackLimitViolations: 1 });
    const updated = applyCardEffect(state, 'box-box', catalog);
    expect(updated.trackLimitViolations).toBe(1);
  });

  it('violations accumulate across multiple plays', () => {
    let state = makeState({
      trackLimitViolations: 0,
      hand: ['push-hard', 'overtake', 'drs-attack'],
    });

    // Play push-hard (aggressive)
    state = applyCardEffect(state, 'push-hard', catalog);
    expect(state.trackLimitViolations).toBe(1);

    // Play overtake (aggressive)
    state = { ...state, hand: ['overtake', 'drs-attack', 'late-brake'] };
    state = applyCardEffect(state, 'overtake', catalog);
    expect(state.trackLimitViolations).toBe(2);

    // Play drs-attack (aggressive)
    state = { ...state, hand: ['drs-attack', 'late-brake', 'push-hard'] };
    state = applyCardEffect(state, 'drs-attack', catalog);
    expect(state.trackLimitViolations).toBe(3);

    // 4th: penalty kicks in
    state = { ...state, hand: ['late-brake', 'push-hard', 'box-box'] };
    const beforePos = state.position;
    state = applyCardEffect(state, 'late-brake', catalog);
    expect(state.trackLimitViolations).toBe(4);
    // late-brake: position -3, then +3 penalty
    expect(state.position).toBe(beforePos - 3 + 3);
  });
});
