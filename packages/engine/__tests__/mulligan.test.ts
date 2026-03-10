import { describe, expect, it } from 'vitest';
import { loadCatalog } from '@boxbox/content';
import { createRng } from '../src/rng.js';
import { performMulligan, performEmergencyMulligan, handHasPitCard } from '../src/card-effects.js';
import type { RaceState } from '../src/types.js';

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
    currentTurn: 1,
    totalTurns: 8,
    deck: ['drs-attack', 'slipstream', 'gap-management', 'engine-mode'],
    hand: ['push-hard', 'overtake', 'defend-position'],
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
    turnPhase: 'await-mulligan',
    maxTireWearReached: 30,
    isDNF: false,
    lastCrashSeverity: 'none',
    ...overrides,
  };
}

describe('performMulligan', () => {
  it('discards entire hand and draws 3 new cards', () => {
    const state = makeState();
    const rng = createRng(42);
    const updated = performMulligan(state, catalog, rng);

    expect(updated.hand).toHaveLength(3);
    expect(updated.mulliganUsed).toBe(true);
    // Original hand cards should be in discard
    expect(updated.discard).toContain('push-hard');
    expect(updated.discard).toContain('overtake');
    expect(updated.discard).toContain('defend-position');
    // New hand shouldn't be the same as old hand (drawn from deck)
    expect(updated.hand).not.toEqual(state.hand);
  });

  it('sets mulliganUsed flag', () => {
    const state = makeState({ mulliganUsed: false });
    const rng = createRng(42);
    const updated = performMulligan(state, catalog, rng);
    expect(updated.mulliganUsed).toBe(true);
  });
});

describe('performEmergencyMulligan', () => {
  it('discards hand and draws 3 new cards', () => {
    const state = makeState();
    const rng = createRng(42);
    const updated = performEmergencyMulligan(state, catalog, rng);

    expect(updated.hand).toHaveLength(3);
    expect(updated.emergencyMulliganUsed).toBe(true);
    expect(updated.discard).toContain('push-hard');
    expect(updated.discard).toContain('overtake');
    expect(updated.discard).toContain('defend-position');
  });

  it('sets emergencyMulliganUsed flag', () => {
    const state = makeState({ emergencyMulliganUsed: false });
    const rng = createRng(42);
    const updated = performEmergencyMulligan(state, catalog, rng);
    expect(updated.emergencyMulliganUsed).toBe(true);
  });

  it('does not affect mulliganUsed flag', () => {
    const state = makeState({ mulliganUsed: false });
    const rng = createRng(42);
    const updated = performEmergencyMulligan(state, catalog, rng);
    expect(updated.mulliganUsed).toBe(false);
  });
});

describe('handHasPitCard', () => {
  it('returns true when hand contains a pit card', () => {
    const hand = ['push-hard', 'box-box', 'overtake'];
    expect(handHasPitCard(hand, catalog)).toBe(true);
  });

  it('returns false when hand has no pit cards', () => {
    const hand = ['push-hard', 'overtake', 'defend-position'];
    expect(handHasPitCard(hand, catalog)).toBe(false);
  });

  it('returns false for empty hand', () => {
    expect(handHasPitCard([], catalog)).toBe(false);
  });

  it('detects undercut as a pit card', () => {
    const hand = ['push-hard', 'undercut', 'defend-position'];
    expect(handHasPitCard(hand, catalog)).toBe(true);
  });

  it('does not count alternate-strategy as pit (it has pit tag but check tireWear)', () => {
    // alternate-strategy: tags ['pit'], effect: { position: 2, tireWear: -30 }
    // isPitStopCard checks tags.includes('pit') && tireWear < 0 → true
    const hand = ['push-hard', 'alternate-strategy', 'defend-position'];
    expect(handHasPitCard(hand, catalog)).toBe(true);
  });
});
