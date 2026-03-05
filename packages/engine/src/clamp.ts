import type { CardEffect, CardId, GameCatalogData, RaceState, SeededRng, TireCompound } from './types.js';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Base tire wear added each turn depending on compound */
export const COMPOUND_WEAR_PER_TURN: Record<TireCompound, number> = {
  soft: 6,
  medium: 4,
  hard: 2,
  intermediate: 4,
  wet: 3,
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
export function applyEndOfTurnPenalties(state: RaceState, isRaining: boolean, underSafetyCar: boolean = false): RaceState {
  let updated = state;

  // Apply compound-based wear per turn
  const baseWear = COMPOUND_WEAR_PER_TURN[updated.tireCompound];
  const condition = isRaining ? 'rain' : 'dry';
  const multiplier = COMPOUND_WRONG_CONDITION_WEAR[updated.tireCompound][condition];
  const compoundWear = Math.round(baseWear * multiplier);
  updated = { ...updated, tireWear: updated.tireWear + compoundWear };

  // Under Safety Car: no position changes from degradation (field is bunched)
  if (!underSafetyCar) {
    // Progressive degradation: high wear = lose positions
    if (updated.tireWear >= 95) {
      updated = { ...updated, position: updated.position + 3 };
    } else if (updated.tireWear >= 80) {
      updated = { ...updated, position: updated.position + 2 };
    } else if (updated.tireWear >= 60) {
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
  }

  return updated;
}

/**
 * Check for crash/incident after turn resolution.
 * Risk increases with aggressive play, rain on dry tires, and high wear.
 * Under Safety Car: no crash risk (controlled pace).
 */
export function applyCrashCheck(
  state: RaceState,
  lastCardPlayed: CardId,
  catalog: GameCatalogData,
  isRaining: boolean,
  rng: SeededRng,
): RaceState {
  if (state.underSafetyCar || state.isDNF) return state;

  const card = catalog.cards.find((c) => c.id === lastCardPlayed);
  let crashChance = 0;

  // Aggressive driving with worn tires
  if (card?.tags.includes('aggressive') && state.tireWear > 80) {
    crashChance += 3;
  }

  // Rain on dry tires (risky)
  if (isRaining && (state.tireCompound === 'soft' || state.tireCompound === 'medium' || state.tireCompound === 'hard')) {
    crashChance += 5;
  }

  // Mechanical issues compound risk
  const mechIssues = state.eventHistory.filter((e) => e.type === 'mechanical-issue').length;
  crashChance += mechIssues * 2;

  // Extreme tire wear adds risk
  if (state.tireWear >= 95) {
    crashChance += 3;
  }

  if (crashChance <= 0) return { ...state, lastCrashSeverity: 'none' };

  const roll = rng.nextInt(1, 100);
  if (roll > crashChance) return { ...state, lastCrashSeverity: 'none' };

  // Crash occurred! Determine severity
  const severityRoll = rng.nextInt(1, 100);
  if (severityRoll <= 25) {
    // DNF - race over
    return { ...state, isDNF: true, position: 20, lastCrashSeverity: 'dnf' };
  } else {
    // Damage - survivable but costly
    return {
      ...state,
      position: state.position + 5,
      tireWear: Math.min(state.tireWear + 20, 100),
      lastCrashSeverity: 'damage',
    };
  }
}
