import type { CardId, GameCatalogData, PlayerAgent, RaceState, TireCompound } from './types.js';
import { applyEffect } from './clamp.js';

/** Check if a card triggers a pit stop (has pit tag and reduces tire wear) */
function isPitStopCard(cardId: CardId, catalog: GameCatalogData): boolean {
  const card = catalog.cards.find((c) => c.id === cardId);
  if (!card) return false;
  return card.tags.includes('pit') && (card.effect.tireWear ?? 0) < 0;
}

export function applyCardEffect(
  state: RaceState,
  cardId: CardId,
  catalog: GameCatalogData,
  agent?: PlayerAgent,
): RaceState {
  const card = catalog.cards.find((c) => c.id === cardId);
  if (!card) {
    throw new Error(`Card not found: ${cardId}`);
  }

  const handIndex = state.hand.indexOf(cardId);
  if (handIndex === -1) {
    throw new Error(`Card ${cardId} not in hand: [${state.hand.join(', ')}]`);
  }

  const newHand = [...state.hand];
  newHand.splice(handIndex, 1);

  let updated = applyEffect(state, card.effect);
  updated = {
    ...updated,
    hand: newHand,
    discard: [...state.discard, cardId],
    cardsPlayedTotal: [...state.cardsPlayedTotal, cardId],
  };

  // Pit stop: reset tire wear and change compound
  if (isPitStopCard(cardId, catalog)) {
    const newCompound = agent?.chooseCompound?.(updated) ?? 'medium';
    updated = {
      ...updated,
      tireWear: 0,
      tireCompound: newCompound,
      hasPitted: true,
      pitStopsMade: updated.pitStopsMade + 1,
    };
  }

  return updated;
}

export function refillHand(state: RaceState, catalog: GameCatalogData): RaceState {
  let deck = [...state.deck];
  let hand = [...state.hand];
  let discard = [...state.discard];

  while (hand.length < 3) {
    if (deck.length === 0) {
      if (discard.length === 0) break;
      deck = [...discard];
      discard = [];
    }
    hand.push(deck.shift()!);
  }

  return {
    ...state,
    deck,
    hand,
    discard,
  };
}

export function refillHandWithRng(
  state: RaceState,
  catalog: GameCatalogData,
  rng: { shuffle<T>(arr: readonly T[]): T[] },
): RaceState {
  let deck = [...state.deck];
  let hand = [...state.hand];
  let discard = [...state.discard];

  while (hand.length < 3) {
    if (deck.length === 0) {
      if (discard.length === 0) break;
      deck = rng.shuffle(discard);
      discard = [];
    }
    hand.push(deck.shift()!);
  }

  return {
    ...state,
    deck,
    hand,
    discard,
  };
}

/** Mulligan: discard entire hand and draw 3 new cards (once per race) */
export function performMulligan(
  state: RaceState,
  catalog: GameCatalogData,
  rng: { shuffle<T>(arr: readonly T[]): T[] },
): RaceState {
  const discarded = { ...state, discard: [...state.discard, ...state.hand], hand: [] as string[], mulliganUsed: true };
  return refillHandWithRng(discarded, catalog, rng);
}
