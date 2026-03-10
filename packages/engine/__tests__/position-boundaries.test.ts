import { describe, expect, it } from 'vitest';
import { loadCatalog } from '@boxbox/content';
import {
  clampRaceState,
  applyEndOfTurnPenalties,
  applyEffect,
} from '../src/clamp.js';
import { applyCardEffect } from '../src/card-effects.js';
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

describe('position boundaries — max position is 18', () => {
  it('clamps position to max 18 (not 20)', () => {
    const state = makeState({ position: 25 });
    const clamped = clampRaceState(state);
    expect(clamped.position).toBe(18);
  });

  it('clamps position to min 1', () => {
    const state = makeState({ position: -3 });
    const clamped = clampRaceState(state);
    expect(clamped.position).toBe(1);
  });

  it('position 18 is valid (not clamped)', () => {
    const state = makeState({ position: 18 });
    const clamped = clampRaceState(state);
    expect(clamped.position).toBe(18);
  });

  it('position 19 is clamped to 18', () => {
    const state = makeState({ position: 19 });
    const clamped = clampRaceState(state);
    expect(clamped.position).toBe(18);
  });
});

describe('P0 bug — event effect + clamp prevents invalid position', () => {
  it('rival-pits at P1 is clamped to P1 (not P0)', () => {
    const state = makeState({ position: 1 });
    const event = {
      type: 'rival-pits' as const,
      name: 'Rival Pits',
      flavorIndex: 0,
      effect: { position: -1 },
      flavorText: 'Rivals.',
    };
    // Simulate the fixed flow: applyEventEffect → clampRaceState
    const afterEvent = {
      ...state,
      position: state.position + (event.effect.position ?? 0),
    };
    expect(afterEvent.position).toBe(0); // Bug: unclamped = P0
    const clamped = clampRaceState(afterEvent);
    expect(clamped.position).toBe(1); // Fix: clamped = P1
  });

  it('rival-overtake at P18 is clamped to P18 (not P20)', () => {
    const state = makeState({ position: 18 });
    const event = {
      type: 'rival-overtake' as const,
      name: 'Rival Overtake',
      flavorIndex: 0,
      effect: { position: 2 },
      flavorText: 'Overtake.',
    };
    const afterEvent = {
      ...state,
      position: state.position + (event.effect.position ?? 0),
    };
    expect(afterEvent.position).toBe(20);
    const clamped = clampRaceState(afterEvent);
    expect(clamped.position).toBe(18);
  });

  it('mechanical-issue at P17 is clamped to P18 (not P19)', () => {
    const state = makeState({ position: 17 });
    const event = {
      type: 'mechanical-issue' as const,
      name: 'Mechanical Issue',
      flavorIndex: 0,
      effect: { position: 2, tireWear: 8 },
      flavorText: 'Issue.',
    };
    const afterEvent = {
      ...state,
      position: state.position + (event.effect.position ?? 0),
      tireWear: state.tireWear + (event.effect.tireWear ?? 0),
    };
    expect(afterEvent.position).toBe(19);
    const clamped = clampRaceState(afterEvent);
    expect(clamped.position).toBe(18);
  });

  it('clear-air at P1 stays at P1 (no position effect)', () => {
    const state = makeState({ position: 1, tireWear: 40 });
    const event = {
      type: 'clear-air' as const,
      name: 'Clear Air',
      flavorIndex: 0,
      effect: { tireWear: -5 },
      flavorText: 'Clear.',
    };
    const afterEvent = {
      ...state,
      position: state.position + (event.effect.position ?? 0),
      tireWear: state.tireWear + (event.effect.tireWear ?? 0),
    };
    const clamped = clampRaceState(afterEvent);
    expect(clamped.position).toBe(1);
    expect(clamped.tireWear).toBe(35);
  });
});

describe('P1 boundary — overtake cards at first position', () => {
  it('card with negative position change at P1 stays at P1 after clamp', () => {
    const state = makeState({ position: 1 });
    const effect = { position: -3, tireWear: 5 };
    const applied = applyEffect(state, effect);
    expect(applied.position).toBe(-2); // Before clamp
    const clamped = clampRaceState(applied);
    expect(clamped.position).toBe(1); // After clamp
  });

  it('card with -1 position at P1 stays at P1 after clamp', () => {
    const applied = applyEffect(makeState({ position: 1 }), { position: -1 });
    const clamped = clampRaceState(applied);
    expect(clamped.position).toBe(1);
  });

  it('multiple effects stacking below P1 are clamped to 1', () => {
    let state = makeState({ position: 1 });
    state = applyEffect(state, { position: -2 });
    state = applyEffect(state, { position: -3 });
    const clamped = clampRaceState(state);
    expect(clamped.position).toBe(1);
  });
});

describe('P18 boundary — position loss at last position', () => {
  it('card with positive position change at P18 stays at P18 after clamp', () => {
    const state = makeState({ position: 18 });
    const applied = applyEffect(state, { position: 3, tireWear: 5 });
    expect(applied.position).toBe(21); // Before clamp
    const clamped = clampRaceState(applied);
    expect(clamped.position).toBe(18); // After clamp
  });

  it('degradation penalties at P18 do not push beyond P18', () => {
    const state = makeState({ position: 18, tireWear: 88, tireCompound: 'soft' });
    const updated = applyEndOfTurnPenalties(state, false);
    // Wear goes to 95+, degradation penalty +3, but position stays at 18 after clamp
    const clamped = clampRaceState(updated);
    expect(clamped.position).toBe(18);
  });

  it('blowout + degradation at P18 stays at P18', () => {
    const state = makeState({ position: 18, tireWear: 95, tireCompound: 'soft' });
    const updated = applyEndOfTurnPenalties(state, false);
    // Wear 95 + 7 = 102, blowout + degradation, but clamped to 18
    const clamped = clampRaceState(updated);
    expect(clamped.position).toBe(18);
  });
});

describe('card play at position boundaries', () => {
  it('playing an overtake card at P1 results in P1 (clamped)', () => {
    // Find a card with negative position (gains positions)
    const overtakeCard = catalog.cards.find((c) => (c.effect.position ?? 0) < 0 && !c.tags.includes('pit'));
    if (!overtakeCard) return;

    const state = makeState({
      position: 1,
      hand: [overtakeCard.id],
      deck: ['card-a', 'card-b'],
    });
    const updated = applyCardEffect(state, overtakeCard.id, catalog);
    const clamped = clampRaceState(updated);
    expect(clamped.position).toBe(1);
  });

  it('playing a card that loses positions at P18 stays at P18 (clamped)', () => {
    // Find a card with positive position (loses positions)
    const loseCard = catalog.cards.find((c) => (c.effect.position ?? 0) > 0);
    if (!loseCard) return;

    const state = makeState({
      position: 18,
      hand: [loseCard.id],
      deck: ['card-a', 'card-b'],
    });
    const updated = applyCardEffect(state, loseCard.id, catalog);
    const clamped = clampRaceState(updated);
    expect(clamped.position).toBe(18);
  });
});

describe('combined penalty stacking with position clamp', () => {
  it('wrong compound + degradation + blowout clamped at P18', () => {
    const state = makeState({
      position: 16,
      tireWear: 95,
      tireCompound: 'soft',
    });
    const updated = applyEndOfTurnPenalties(state, true); // Rain + soft tires
    // Wear: 95 + round(7*2.5) = 95+18 = 113
    // Degradation >= 90: +3
    // Blowout >= 100: +5
    // Wrong compound in rain: +2
    // Position: 16 + 3 + 5 + 2 = 26 → clamped to 18
    const clamped = clampRaceState(updated);
    expect(clamped.position).toBe(18);
    expect(clamped.tireWear).toBe(100); // Clamped
  });

  it('event improving position at P1 stays at P1', () => {
    const state = makeState({ position: 1 });
    const improved = applyEffect(state, { position: -5 });
    const clamped = clampRaceState(improved);
    expect(clamped.position).toBe(1);
  });
});
