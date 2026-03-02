import { describe, expect, it } from 'vitest';
import { loadCatalog } from '@boxbox/content';
import { createRng } from '../src/rng.js';
import { applyPreEffects, applyPostEffects, checkRainSpike, selectEvent, updateEventTracking } from '../src/event-system.js';
import type { RaceState } from '../src/types.js';

function makeBaseState(overrides: Partial<RaceState> = {}): RaceState {
  return {
    scenarioId: 'monaco',
    teamId: 'crimson',
    seed: 42,
    position: 10,
    tireWear: 30,
    fuel: 50,
    rainMeter: 0,
    currentTurn: 1,
    totalTurns: 6,
    deck: [],
    hand: ['push-hard', 'box-box', 'overtake'],
    discard: [],
    currentEvent: null,
    eventHistory: [],
    scUsed: false,
    vscUsed: false,
    lastEventType: null,
    perkUsed: false,
    objectivesCompleted: [],
    cardsPlayedTotal: [],
    quickDecisionMade: false,
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

  it('never selects vsc when vscUsed is true', () => {
    const state = makeBaseState({ vscUsed: true });
    const rng = createRng(42);

    for (let i = 0; i < 100; i++) {
      const event = selectEvent(state, scenario, rng, catalog);
      expect(event.type).not.toBe('vsc');
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

  it('never selects vsc consecutively', () => {
    const state = makeBaseState({ lastEventType: 'vsc' });
    const rng = createRng(42);

    for (let i = 0; i < 100; i++) {
      const event = selectEvent(state, scenario, rng, catalog);
      expect(event.type).not.toBe('vsc');
    }
  });

  it('returns a valid event with flavor text', () => {
    const state = makeBaseState();
    const rng = createRng(42);
    const event = selectEvent(state, scenario, rng, catalog);

    expect(event.type).toBeTruthy();
    expect(event.name).toBeTruthy();
    expect(event.flavorText).toBeTruthy();
    expect(typeof event.requiresQuickDecision).toBe('boolean');
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

describe('applyPreEffects', () => {
  it('applies rain pre-effect to rain meter', () => {
    const state = makeBaseState({ rainMeter: 3 });
    const event = {
      type: 'rain' as const,
      name: 'Rain',
      preEffect: { rainMeter: 2 },
      requiresQuickDecision: false,
      flavorText: 'Rain.',
    };
    const updated = applyPreEffects(state, event);
    expect(updated.rainMeter).toBe(5);
  });

  it('does nothing when no preEffect', () => {
    const state = makeBaseState();
    const event = {
      type: 'rival-pits' as const,
      name: 'Rival Pits',
      requiresQuickDecision: false,
      flavorText: 'Rivals.',
    };
    const updated = applyPreEffects(state, event);
    expect(updated).toEqual(state);
  });
});

describe('applyPostEffects', () => {
  it('applies rival-pits post-effect (position pressure)', () => {
    const state = makeBaseState({ position: 5 });
    const event = {
      type: 'rival-pits' as const,
      name: 'Rival Pits',
      postEffect: { position: 1 },
      requiresQuickDecision: false,
      flavorText: 'Rivals.',
    };
    const updated = applyPostEffects(state, event);
    expect(updated.position).toBe(6);
  });

  it('applies traffic post-effect (position + tire wear)', () => {
    const state = makeBaseState({ position: 5, tireWear: 30 });
    const event = {
      type: 'traffic' as const,
      name: 'Traffic',
      postEffect: { position: 1, tireWear: 5 },
      requiresQuickDecision: false,
      flavorText: 'Traffic.',
    };
    const updated = applyPostEffects(state, event);
    expect(updated.position).toBe(6);
    expect(updated.tireWear).toBe(35);
  });
});

describe('checkRainSpike', () => {
  it('returns true when rainMeter >= 7', () => {
    expect(checkRainSpike(makeBaseState({ rainMeter: 7 }))).toBe(true);
    expect(checkRainSpike(makeBaseState({ rainMeter: 10 }))).toBe(true);
  });

  it('returns false when rainMeter < 7', () => {
    expect(checkRainSpike(makeBaseState({ rainMeter: 6 }))).toBe(false);
    expect(checkRainSpike(makeBaseState({ rainMeter: 0 }))).toBe(false);
  });
});

describe('updateEventTracking', () => {
  it('records safety-car usage', () => {
    const state = makeBaseState();
    const event = {
      type: 'safety-car' as const,
      name: 'Safety Car',
      requiresQuickDecision: true,
      flavorText: 'SC.',
    };
    const updated = updateEventTracking(state, event);
    expect(updated.scUsed).toBe(true);
    expect(updated.lastEventType).toBe('safety-car');
    expect(updated.eventHistory).toHaveLength(1);
  });

  it('records vsc usage', () => {
    const state = makeBaseState();
    const event = {
      type: 'vsc' as const,
      name: 'VSC',
      requiresQuickDecision: true,
      flavorText: 'VSC.',
    };
    const updated = updateEventTracking(state, event);
    expect(updated.vscUsed).toBe(true);
  });
});
