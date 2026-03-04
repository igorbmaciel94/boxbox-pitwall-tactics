import { describe, expect, it } from 'vitest';
import { loadCatalog } from '@boxbox/content';
import { applyCardEffect, consumeQuickDecisionCard, refillHandWithRng } from '../src/card-effects.js';
import { createRng } from '../src/rng.js';
import type { RaceState } from '../src/types.js';

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
    currentTurn: 1,
    totalTurns: 6,
    deck: [],
    hand: ['push-hard', 'box-box', 'overtake'],
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
    turnPhase: 'start',
    maxTireWearReached: 30,
    ...overrides,
  };
}

describe('applyCardEffect', () => {
  it('applies push-hard effect correctly', () => {
    const state = makeBaseState();
    const updated = applyCardEffect(state, 'push-hard', catalog);

    expect(updated.position).toBe(8); // 10 + (-2)
    expect(updated.tireWear).toBe(45); // 30 + 15
    expect(updated.hand).toHaveLength(2);
    expect(updated.hand).not.toContain('push-hard');
    expect(updated.discard).toContain('push-hard');
    expect(updated.cardsPlayedTotal).toContain('push-hard');
  });

  it('applies box-box effect correctly', () => {
    const state = makeBaseState({ tireWear: 80 });
    const updated = applyCardEffect(state, 'box-box', catalog);

    expect(updated.position).toBe(13); // 10 + 3
    expect(updated.tireWear).toBe(0); // 80 + (-80)
    expect(updated.hand).toHaveLength(2);
  });

  it('throws if card not in hand', () => {
    const state = makeBaseState({ hand: ['push-hard'] });
    expect(() => applyCardEffect(state, 'overtake', catalog)).toThrow('not in hand');
  });

  it('throws if card does not exist', () => {
    const state = makeBaseState({ hand: ['nonexistent'] });
    expect(() => applyCardEffect(state, 'nonexistent', catalog)).toThrow('not found');
  });

  it('moves card from hand to discard', () => {
    const state = makeBaseState({ hand: ['push-hard', 'box-box', 'overtake'], discard: ['defend-position'] });
    const updated = applyCardEffect(state, 'push-hard', catalog);

    expect(updated.hand).toEqual(['box-box', 'overtake']);
    expect(updated.discard).toEqual(['defend-position', 'push-hard']);
  });
});

describe('consumeQuickDecisionCard', () => {
  it('consumes an eligible quick-decision card', () => {
    const state = makeBaseState({ hand: ['box-box', 'push-hard', 'overtake'] });
    const updated = consumeQuickDecisionCard(state, 'box-box', catalog);

    expect(updated.hand).toHaveLength(2);
    expect(updated.hand).not.toContain('box-box');
    expect(updated.discard).toContain('box-box');
    expect(updated.quickDecisionMade).toBe(true);
    expect(updated.cardsPlayedTotal).toContain('box-box');
  });

  it('throws if card is not quick-decision eligible', () => {
    const state = makeBaseState({ hand: ['push-hard'] });
    expect(() => consumeQuickDecisionCard(state, 'push-hard', catalog)).toThrow('not eligible');
  });

  it('applies the card effect during quick decision', () => {
    const state = makeBaseState({ hand: ['box-box', 'push-hard', 'overtake'], tireWear: 80 });
    const updated = consumeQuickDecisionCard(state, 'box-box', catalog);

    expect(updated.tireWear).toBe(0); // 80 + (-80)
    expect(updated.position).toBe(13); // 10 + 3
  });
});

describe('refillHandWithRng', () => {
  it('draws cards to fill hand to 3', () => {
    const state = makeBaseState({
      hand: ['push-hard'],
      deck: ['overtake', 'defend-position', 'slipstream', 'fuel-save'],
    });
    const rng = createRng(42);
    const updated = refillHandWithRng(state, catalog, rng);

    expect(updated.hand).toHaveLength(3);
    expect(updated.deck).toHaveLength(2);
  });

  it('reshuffles discard when deck is empty', () => {
    const state = makeBaseState({
      hand: [],
      deck: [],
      discard: ['push-hard', 'box-box', 'overtake', 'defend-position'],
    });
    const rng = createRng(42);
    const updated = refillHandWithRng(state, catalog, rng);

    expect(updated.hand).toHaveLength(3);
    expect(updated.discard).toHaveLength(0);
    expect(updated.deck).toHaveLength(1);
  });

  it('does nothing when hand is already 3', () => {
    const state = makeBaseState({ hand: ['push-hard', 'box-box', 'overtake'] });
    const rng = createRng(42);
    const updated = refillHandWithRng(state, catalog, rng);

    expect(updated.hand).toEqual(state.hand);
  });

  it('handles case where not enough cards exist', () => {
    const state = makeBaseState({
      hand: [],
      deck: ['push-hard'],
      discard: [],
    });
    const rng = createRng(42);
    const updated = refillHandWithRng(state, catalog, rng);

    expect(updated.hand).toHaveLength(1);
    expect(updated.hand).toEqual(['push-hard']);
  });
});
