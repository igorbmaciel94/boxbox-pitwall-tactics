import type { CardEffect, RaceState, TeamData } from './types.js';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function clampRaceState(state: RaceState): RaceState {
  return {
    ...state,
    position: clamp(state.position, 1, 20),
    tireWear: clamp(state.tireWear, 0, 100),
    fuel: clamp(state.fuel, 0, 100),
    rainMeter: clamp(state.rainMeter, 0, 10),
    maxTireWearReached: Math.max(state.maxTireWearReached, state.tireWear),
  };
}

export function applyEffect(state: RaceState, effect: CardEffect): RaceState {
  return {
    ...state,
    position: state.position + (effect.position ?? 0),
    tireWear: state.tireWear + (effect.tireWear ?? 0),
    fuel: state.fuel + (effect.fuel ?? 0),
    rainMeter: state.rainMeter + (effect.rainMeter ?? 0),
  };
}

export function applyEndOfTurnHooks(state: RaceState, team: TeamData): RaceState {
  let updated = state;

  // Crimson-style end-of-turn perk
  if (team.perk.timing === 'end-of-turn' && !updated.perkUsed) {
    const shouldApply = evaluatePerkCondition(updated, team.perk.condition);
    if (shouldApply) {
      updated = applyEffect(updated, team.perk.effect);
      updated = { ...updated, perkUsed: true };
    }
  }

  // Tire blowout: if tire wear >= 100, massive position penalty
  if (updated.tireWear >= 100) {
    updated = { ...updated, position: updated.position + 5 };
  }

  // Fuel empty: if fuel <= 0, lose positions from slow pace
  if (updated.fuel <= 0) {
    updated = { ...updated, position: updated.position + 3 };
  }

  return updated;
}

function evaluatePerkCondition(state: RaceState, condition?: string): boolean {
  if (!condition) return true;

  switch (condition) {
    case 'tire-wear-above-60':
      return state.tireWear > 60;
    default:
      return false;
  }
}
