import type { CardEffect, RaceState } from './types.js';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function clampRaceState(state: RaceState): RaceState {
  return {
    ...state,
    position: clamp(state.position, 1, 20),
    tireWear: clamp(state.tireWear, 0, 100),
    maxTireWearReached: Math.max(state.maxTireWearReached, state.tireWear),
  };
}

export function applyEffect(state: RaceState, effect: CardEffect): RaceState {
  return {
    ...state,
    position: state.position + (effect.position ?? 0),
    tireWear: state.tireWear + (effect.tireWear ?? 0),
  };
}

export function applyEndOfTurnPenalties(state: RaceState): RaceState {
  let updated = state;

  // Tire blowout: if tire wear >= 100, massive position penalty
  if (updated.tireWear >= 100) {
    updated = { ...updated, position: updated.position + 5 };
  }

  return updated;
}
