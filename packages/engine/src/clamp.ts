import type { CardEffect, CardId, Difficulty, GameCatalogData, RaceState, SeededRng, TireCompound } from './types.js';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Base tire wear added each turn depending on compound */
export const COMPOUND_WEAR_PER_TURN: Record<TireCompound, number> = {
  soft: 7,
  medium: 5,
  hard: 3,
  intermediate: 5,
  wet: 3,
};

/** Wear multiplier when using wrong compound for conditions */
export const COMPOUND_WRONG_CONDITION_WEAR: Record<TireCompound, { dry: number; rain: number }> = {
  soft: { dry: 1.0, rain: 2.5 },
  medium: { dry: 1.0, rain: 2.0 },
  hard: { dry: 1.0, rain: 1.6 },
  intermediate: { dry: 2.5, rain: 1.0 },
  wet: { dry: 3.0, rain: 0.8 },
};

/** Difficulty scaling factors */
const DIFFICULTY_CONFIG: Record<Difficulty, {
  wearMultiplier: number;
  degradationReduction: number;
  crashMultiplier: number;
  blowoutPenalty: number;
  noTiresWearPenalty: number;
  noTiresPositionPenalty: number;
}> = {
  easy: { wearMultiplier: 0.7, degradationReduction: 1, crashMultiplier: 0.3, blowoutPenalty: 3, noTiresWearPenalty: 0, noTiresPositionPenalty: 0 },
  normal: { wearMultiplier: 1.0, degradationReduction: 0, crashMultiplier: 1.0, blowoutPenalty: 5, noTiresWearPenalty: 10, noTiresPositionPenalty: 2 },
  hard: { wearMultiplier: 1.4, degradationReduction: 0, crashMultiplier: 1.6, blowoutPenalty: 7, noTiresWearPenalty: 15, noTiresPositionPenalty: 4 },
};

/** Max grid position (18 cars = 6 teams × 3 drivers) */
const MAX_POSITION = 18;

export function clampRaceState(state: RaceState): RaceState {
  return {
    ...state,
    position: clamp(state.position, 1, MAX_POSITION),
    tireWear: clamp(state.tireWear, -20, 100),
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
export function applyEndOfTurnPenalties(
  state: RaceState,
  isRaining: boolean,
  underSafetyCar: boolean = false,
  difficulty: Difficulty = 'normal',
): RaceState {
  let updated = state;
  const cfg = DIFFICULTY_CONFIG[difficulty];

  // Apply compound-based wear per turn (scaled by difficulty)
  const baseWear = COMPOUND_WEAR_PER_TURN[updated.tireCompound];
  const condition = isRaining ? 'rain' : 'dry';
  const multiplier = COMPOUND_WRONG_CONDITION_WEAR[updated.tireCompound][condition];
  const compoundWear = Math.round(baseWear * multiplier * cfg.wearMultiplier);
  updated = { ...updated, tireWear: updated.tireWear + compoundWear };

  // Under Safety Car: no position changes from degradation (field is bunched)
  if (!underSafetyCar) {
    // Progressive degradation: high wear = lose positions
    if (updated.tireWear >= 90) {
      updated = { ...updated, position: updated.position + 3 - cfg.degradationReduction };
    } else if (updated.tireWear >= 75) {
      updated = { ...updated, position: updated.position + 2 - cfg.degradationReduction };
    } else if (updated.tireWear >= 55) {
      updated = { ...updated, position: updated.position + Math.max(0, 1 - cfg.degradationReduction) };
    }

    // Tire blowout: if tire wear >= 100, position penalty (scaled by difficulty)
    if (updated.tireWear >= 100) {
      updated = { ...updated, position: updated.position + cfg.blowoutPenalty };
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
  difficulty: Difficulty = 'normal',
): RaceState {
  if (state.underSafetyCar || state.isDNF) return state;

  const card = catalog.cards.find((c) => c.id === lastCardPlayed);
  const cfg = DIFFICULTY_CONFIG[difficulty];
  let crashChance = 0;

  // Aggressive driving with worn tires
  if (card?.tags.includes('aggressive') && state.tireWear > 75) {
    crashChance += 4;
  }

  // Rain on dry tires (risky)
  if (isRaining && (state.tireCompound === 'soft' || state.tireCompound === 'medium' || state.tireCompound === 'hard')) {
    crashChance += 6;
  }

  // Mechanical issues compound risk
  const mechIssues = state.eventHistory.filter((e) => e.type === 'mechanical-issue').length;
  crashChance += mechIssues * 2;

  // Extreme tire wear adds risk
  if (state.tireWear >= 95) {
    crashChance += 4;
  }

  // Scale by difficulty
  crashChance = Math.round(crashChance * cfg.crashMultiplier);

  if (crashChance <= 0) return { ...state, lastCrashSeverity: 'none' };

  const roll = rng.nextInt(1, 100);
  if (roll > crashChance) return { ...state, lastCrashSeverity: 'none' };

  // Crash occurred! Determine severity
  const severityRoll = rng.nextInt(1, 100);
  if (severityRoll <= 30) {
    // DNF - race over
    return { ...state, isDNF: true, position: MAX_POSITION, lastCrashSeverity: 'dnf' };
  } else {
    // Damage - survivable but costly
    return {
      ...state,
      position: state.position + 6,
      tireWear: Math.min(state.tireWear + 25, 100),
      lastCrashSeverity: 'damage',
    };
  }
}

/** Penalty for pitting with no available tire compounds (drive-through) */
export function applyNoTiresPenalty(state: RaceState): RaceState {
  const cfg = DIFFICULTY_CONFIG[state.difficulty];
  return {
    ...state,
    tireWear: state.tireWear + cfg.noTiresWearPenalty,
    position: state.position + cfg.noTiresPositionPenalty,
  };
}
