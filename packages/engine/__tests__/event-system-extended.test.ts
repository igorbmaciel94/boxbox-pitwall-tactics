import { describe, expect, it } from 'vitest';
import { loadCatalog } from '@boxbox/content';
import { createRng } from '../src/rng.js';
import { applyEventEffect, updateEventTracking, isCurrentlyRaining } from '../src/event-system.js';
import type { RaceEvent, RaceState } from '../src/types.js';

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
    objectivesCompleted: [],
    cardsPlayedTotal: [],
    turnPhase: 'start',
    maxTireWearReached: 30,
    isDNF: false,
    lastCrashSeverity: 'none',
    ...overrides,
  };
}

function makeEvent(type: string, effect: { position?: number; tireWear?: number } = {}): RaceEvent {
  return { type: type as RaceEvent['type'], name: type, flavorIndex: 0, effect, flavorText: '' };
}

describe('updateEventTracking', () => {
  it('sets underSafetyCar when SC event occurs', () => {
    const state = makeState();
    const updated = updateEventTracking(state, makeEvent('safety-car'));
    expect(updated.underSafetyCar).toBe(true);
    expect(updated.scUsed).toBe(true);
  });

  it('clears underSafetyCar for non-SC events', () => {
    const state = makeState({ underSafetyCar: true });
    const updated = updateEventTracking(state, makeEvent('rain'));
    expect(updated.underSafetyCar).toBe(false);
  });

  it('preserves scUsed after subsequent non-SC events', () => {
    const state = makeState({ scUsed: true });
    const updated = updateEventTracking(state, makeEvent('traffic'));
    expect(updated.scUsed).toBe(true);
  });

  it('appends to eventHistory', () => {
    const state = makeState({
      eventHistory: [makeEvent('rain')],
    });
    const updated = updateEventTracking(state, makeEvent('traffic'));
    expect(updated.eventHistory).toHaveLength(2);
    expect(updated.eventHistory[1].type).toBe('traffic');
  });
});

describe('applyEventEffect', () => {
  it('applies mechanical-issue effect (position loss + wear)', () => {
    const state = makeState({ position: 5, tireWear: 40 });
    const updated = applyEventEffect(state, makeEvent('mechanical-issue', { position: 2, tireWear: 8 }));
    expect(updated.position).toBe(7);
    expect(updated.tireWear).toBe(48);
  });

  it('applies rival-overtake effect (position loss)', () => {
    const state = makeState({ position: 3 });
    const updated = applyEventEffect(state, makeEvent('rival-overtake', { position: 2 }));
    expect(updated.position).toBe(5);
  });

  it('applies clear-air effect (tire wear reduction)', () => {
    const state = makeState({ tireWear: 40 });
    const updated = applyEventEffect(state, makeEvent('clear-air', { tireWear: -5 }));
    expect(updated.tireWear).toBe(35);
  });

  it('applies safety-car effect (tire wear reduction)', () => {
    const state = makeState({ tireWear: 40 });
    const updated = applyEventEffect(state, makeEvent('safety-car', { tireWear: -5 }));
    expect(updated.tireWear).toBe(35);
  });
});

describe('isCurrentlyRaining', () => {
  it('returns true when rain is in last 2 events', () => {
    const state = makeState({
      eventHistory: [makeEvent('traffic'), makeEvent('rain')],
    });
    expect(isCurrentlyRaining(state)).toBe(true);
  });

  it('returns false when rain was more than 2 events ago', () => {
    const state = makeState({
      eventHistory: [
        makeEvent('rain'),
        makeEvent('traffic'),
        makeEvent('clear-air'),
      ],
    });
    expect(isCurrentlyRaining(state)).toBe(false);
  });

  it('returns false when no rain events', () => {
    const state = makeState({
      eventHistory: [makeEvent('traffic'), makeEvent('clear-air')],
    });
    expect(isCurrentlyRaining(state)).toBe(false);
  });

  it('returns true when rain is second-to-last event', () => {
    const state = makeState({
      eventHistory: [
        makeEvent('traffic'),
        makeEvent('rain'),
        makeEvent('clear-air'),
      ],
    });
    expect(isCurrentlyRaining(state)).toBe(true);
  });

  it('returns false with empty event history', () => {
    const state = makeState({ eventHistory: [] });
    expect(isCurrentlyRaining(state)).toBe(false);
  });
});
