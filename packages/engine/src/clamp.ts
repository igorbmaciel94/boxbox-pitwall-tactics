import type { CardEffect, RaceState, TireCompound } from './types.js';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Base tire wear added each turn depending on compound */
export const COMPOUND_WEAR_PER_TURN: Record<TireCompound, number> = {
  soft: 8,
  medium: 5,
  hard: 3,
  intermediate: 5,
  wet: 4,
};

/** Wear multiplier when using wrong compound for conditions */
export const COMPOUND_WRONG_CONDITION_WEAR: Record<TireCompound, { dry: number; rain: number }> = {
  soft: { dry: 1.0, rain: 1.8 },
  medium: { dry: 1.0, rain: 1.5 },
  hard: { dry: 1.0, rain: 1.3 },
  intermediate: { dry: 1.5, rain: 1.0 },
  wet: { dry: 2.0, rain: 0.8 },
};

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

/**
 * Progressive tire degradation penalties + compound wear per turn.
 * Higher tire wear = worse performance (lose positions).
 * Also applies tire blowout at 100.
 */
export function applyEndOfTurnPenalties(state: RaceState, isRaining: boolean): RaceState {
  let updated = state;

  // Apply compound-based wear per turn
  const baseWear = COMPOUND_WEAR_PER_TURN[updated.tireCompound];
  const condition = isRaining ? 'rain' : 'dry';
  const multiplier = COMPOUND_WRONG_CONDITION_WEAR[updated.tireCompound][condition];
  const compoundWear = Math.round(baseWear * multiplier);
  updated = { ...updated, tireWear: updated.tireWear + compoundWear };

  // Progressive degradation: high wear = lose positions
  if (updated.tireWear >= 90) {
    updated = { ...updated, position: updated.position + 3 };
  } else if (updated.tireWear >= 70) {
    updated = { ...updated, position: updated.position + 2 };
  } else if (updated.tireWear >= 50) {
    updated = { ...updated, position: updated.position + 1 };
  }

  // Tire blowout: if tire wear >= 100, massive position penalty
  if (updated.tireWear >= 100) {
    updated = { ...updated, position: updated.position + 5 };
  }

  // Wrong compound penalty
  if (isRaining && (updated.tireCompound === 'soft' || updated.tireCompound === 'medium' || updated.tireCompound === 'hard')) {
    updated = { ...updated, position: updated.position + 2 };
  }
  if (!isRaining && (updated.tireCompound === 'wet')) {
    updated = { ...updated, position: updated.position + 1 };
  }

  return updated;
}
