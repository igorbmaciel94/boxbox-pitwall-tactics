import { describe, expect, it } from 'vitest';
import { loadCatalog } from '@boxbox/content';
import { createRng } from '../src/rng.js';
import { applyEventEffect, selectEvent, updateEventTracking } from '../src/event-system.js';
import type { RaceState } from '../src/types.js';

function makeBaseState(overrides: Partial<RaceState> = {}): RaceState {
  return {
    scenarioId: 'monaco',
    teamId: 'crimson',
    seed: 42,
    position: 10,
    tireWear: 30,
    currentTurn: 1,
    totalTurns: 6,
    deck: [],
    hand: ['push-hard', 'box-box', 'overtake'],
    discard: [],
    currentEvent: null,
    eventHistory: [],
    scUsed: false,
    lastEventType: null,
    perkUsed: false,
    objectivesCompleted: [],
    cardsPlayedTotal: [],
    turnPhase: 'start',
    maxTireWearReached: 30,
    ...overrides,
  };
}

describe('selectEvent', () => {
  const catalog = loadCatalog();
  const scenario = catalog.scenarios.find((s) => s.id === 'monaco')!;

  it('never selects safety-car when scUsed is true', () => {
    const state = makeBaseState({ scUsed: true });
    const rng = createRng(42);

    for (let i = 0; i < 100; i++) {
      const event = selectEvent(state, scenario, rng, catalog);
      expect(event.type).not.toBe('safety-car');
    }
  });

  it('never selects safety-car consecutively', () => {
    const state = makeBaseState({ lastEventType: 'safety-car' });
    const rng = createRng(42);

    for (let i = 0; i < 100; i++) {
      const event = selectEvent(state, scenario, rng, catalog);
      expect(event.type).not.toBe('safety-car');
    }
  });

  it('returns a valid event with flavor text', () => {
    const state = makeBaseState();
    const rng = createRng(42);
    const event = selectEvent(state, scenario, rng, catalog);

    expect(event.type).toBeTruthy();
    expect(event.name).toBeTruthy();
    expect(event.flavorIndex).toBeGreaterThanOrEqual(0);
    expect(event.flavorIndex).toBeLessThan(catalog.strings.events[event.type].length);
    expect(event.flavorText).toBeTruthy();
    expect(event.effect).toBeDefined();
  });

  it('produces deterministic events with same seed', () => {
    const state = makeBaseState();
    const rng1 = createRng(42);
    const rng2 = createRng(42);

    const events1 = Array.from({ length: 6 }, () => selectEvent(state, scenario, rng1, catalog));
    const events2 = Array.from({ length: 6 }, () => selectEvent(state, scenario, rng2, catalog));

    expect(events1.map((e) => e.type)).toEqual(events2.map((e) => e.type));
  });
});

describe('applyEventEffect', () => {
  it('applies rain effect (tire wear increase)', () => {
    const state = makeBaseState({ tireWear: 30 });
    const event = {
      type: 'rain' as const,
      name: 'Rain',
      flavorIndex: 0,
      effect: { tireWear: 10 },
      flavorText: 'Rain.',
    };
    const updated = applyEventEffect(state, event);
    expect(updated.tireWear).toBe(40);
  });

  it('applies rival-pits effect (position gain)', () => {
    const state = makeBaseState({ position: 5 });
    const event = {
      type: 'rival-pits' as const,
      name: 'Rival Pits',
      flavorIndex: 0,
      effect: { position: -1 },
      flavorText: 'Rivals.',
    };
    const updated = applyEventEffect(state, event);
    expect(updated.position).toBe(4);
  });

  it('applies traffic effect (position + tire wear)', () => {
    const state = makeBaseState({ position: 5, tireWear: 30 });
    const event = {
      type: 'traffic' as const,
      name: 'Traffic',
      flavorIndex: 0,
      effect: { position: 1, tireWear: 5 },
      flavorText: 'Traffic.',
    };
    const updated = applyEventEffect(state, event);
    expect(updated.position).toBe(6);
    expect(updated.tireWear).toBe(35);
  });
});

describe('updateEventTracking', () => {
  it('records safety-car usage', () => {
    const state = makeBaseState();
    const event = {
      type: 'safety-car' as const,
      name: 'Safety Car',
      flavorIndex: 0,
      effect: { tireWear: -5 },
      flavorText: 'SC.',
    };
    const updated = updateEventTracking(state, event);
    expect(updated.scUsed).toBe(true);
    expect(updated.lastEventType).toBe('safety-car');
    expect(updated.eventHistory).toHaveLength(1);
  });

  it('records non-SC event without marking scUsed', () => {
    const state = makeBaseState();
    const event = {
      type: 'rain' as const,
      name: 'Rain',
      flavorIndex: 0,
      effect: { tireWear: 10 },
      flavorText: 'Rain.',
    };
    const updated = updateEventTracking(state, event);
    expect(updated.scUsed).toBe(false);
    expect(updated.lastEventType).toBe('rain');
  });
});
