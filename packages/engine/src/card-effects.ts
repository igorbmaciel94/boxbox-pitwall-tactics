import type { CardId, GameCatalogData, PlayerAgent, RaceState, TireCompound } from './types.js';
import { applyEffect, applyNoTiresPenalty } from './clamp.js';
import { isCurrentlyRaining } from './event-system.js';

/** Check if a card triggers a pit stop (has pit tag) */
function isPitStopCard(cardId: CardId, catalog: GameCatalogData): boolean {
  const card = catalog.cards.find((c) => c.id === cardId);
  if (!card) return false;
  return card.tags.includes('pit');
}

/** Check if any tire compounds are available for a pit stop */
export function hasAvailableCompounds(state: RaceState): boolean {
  const { tireAllocation, compoundSetsUsed } = state;
  // If tire tracking fields are missing, assume compounds are available
  if (!tireAllocation || !compoundSetsUsed) return true;
  const raining = isCurrentlyRaining(state);
  const dryCompounds: Array<'soft' | 'medium' | 'hard'> = ['soft', 'medium', 'hard'];
  const hasDry = dryCompounds.some((compound) => {
    const used = compoundSetsUsed.filter((c) => c === compound).length;
    return tireAllocation[compound] - used > 0;
  });
  return hasDry || raining;
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

  // Under Safety Car: special rules
  let effectToApply = card.effect;
  let scOvertakePenalty = 0;
  if (state.underSafetyCar) {
    const isPit = isPitStopCard(cardId, catalog);
    const isDefensive = card.tags.includes('defensive');
    const posChange = card.effect.position ?? 0;

    if (isPit) {
      // Pit cards: halve position loss (will be fully restored below)
      effectToApply = { ...card.effect, position: Math.floor(posChange / 2) };
    } else if (isDefensive) {
      // Defensive/overcut: bonus — gain 2 extra positions
      effectToApply = { ...card.effect, position: posChange - 2 };
    } else if (posChange < 0) {
      // Overtaking under SC: nullify gains + penalize +3
      scOvertakePenalty = 3;
      effectToApply = { ...card.effect, position: 0 };
    } else {
      // Other cards: halve position changes
      effectToApply = { ...card.effect, position: Math.floor(posChange / 2) };
    }
  }

  let updated = applyEffect(state, effectToApply);
  updated = {
    ...updated,
    hand: newHand,
    discard: [...state.discard, cardId],
    cardsPlayedTotal: [...state.cardsPlayedTotal, cardId],
  };

  // Apply SC overtake penalty
  if (scOvertakePenalty > 0) {
    updated = { ...updated, position: updated.position + scOvertakePenalty };
  }

  // Pit stop: reset tire wear and change compound
  if (isPitStopCard(cardId, catalog)) {
    // Under SC: free pit stop (restore position to before card)
    if (state.underSafetyCar) {
      updated = { ...updated, position: state.position };
    }

    if (hasAvailableCompounds(updated)) {
      // Normal pit: reset tires, select compound
      const newCompound = agent?.chooseCompound?.(updated) ?? 'medium';
      // New tire freshness: card's negative wear becomes a tire life bonus
      // e.g. Box Box (-15) → tire starts at -15 (lasts longer before degradation)
      const tireFreshness = Math.min(0, effectToApply.tireWear ?? 0);
      updated = {
        ...updated,
        tireWear: tireFreshness,
        tireCompound: newCompound,
        hasPitted: true,
        pitStopsMade: updated.pitStopsMade + 1,
      };
    } else {
      // No compounds available: keep current tires, apply difficulty-based penalty
      updated = applyNoTiresPenalty(updated);
      updated = {
        ...updated,
        hasPitted: true,
        pitStopsMade: updated.pitStopsMade + 1,
      };
    }
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

/** Emergency mulligan: available when mandatory pit needed but no pit card in hand */
export function performEmergencyMulligan(
  state: RaceState,
  catalog: GameCatalogData,
  rng: { shuffle<T>(arr: readonly T[]): T[] },
): RaceState {
  const discarded = { ...state, discard: [...state.discard, ...state.hand], hand: [] as string[], emergencyMulliganUsed: true };
  return refillHandWithRng(discarded, catalog, rng);
}

/** Check if hand has at least one pit card */
export function handHasPitCard(hand: string[], catalog: GameCatalogData): boolean {
  return hand.some((cardId) => isPitStopCard(cardId, catalog));
}
