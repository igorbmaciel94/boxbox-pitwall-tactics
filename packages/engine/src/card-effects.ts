import type { CardId, GameCatalogData, RaceState } from './types.js';
import { applyEffect } from './clamp.js';

export function applyCardEffect(state: RaceState, cardId: CardId, catalog: GameCatalogData): RaceState {
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

  return updated;
}

export function consumeQuickDecisionCard(
  state: RaceState,
  cardId: CardId,
  catalog: GameCatalogData,
): RaceState {
  const card = catalog.cards.find((c) => c.id === cardId);
  if (!card) {
    throw new Error(`Card not found: ${cardId}`);
  }

  if (!card.quickDecisionEligible) {
    throw new Error(`Card ${cardId} is not eligible for quick decisions`);
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
    quickDecisionMade: true,
  };

  return updated;
}

export function refillHand(state: RaceState, catalog: GameCatalogData): RaceState {
  let deck = [...state.deck];
  let hand = [...state.hand];
  let discard = [...state.discard];

  while (hand.length < 3) {
    if (deck.length === 0) {
      if (discard.length === 0) break; // No cards left at all
      // Reshuffle discard into deck -- note: this is a simple reshuffle
      // The caller should use the RNG for shuffling
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
