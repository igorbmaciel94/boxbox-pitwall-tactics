import type { PlayerAgent, RaceState, TeamData } from './types.js';
import { applyEffect } from './clamp.js';

export function maybeApplyTeamPerk(
  state: RaceState,
  team: TeamData,
  agent: PlayerAgent,
): RaceState {
  // Skip if perk already used
  if (state.perkUsed) return state;

  // Skip end-of-turn perks in the standard phase
  if (team.perk.timing === 'end-of-turn') return state;

  // Ask agent if they want to use the perk
  if (!agent.chooseTeamPerk(state)) return state;

  // Apply the perk effect
  let updated = applyEffect(state, team.perk.effect);
  updated = { ...updated, perkUsed: true };

  return updated;
}

export function applyEndOfTurnPerk(state: RaceState, team: TeamData): RaceState {
  // Only applies to end-of-turn timing perks
  if (team.perk.timing !== 'end-of-turn') return state;

  // Skip if perk already used
  if (state.perkUsed) return state;

  // Check condition
  if (!evaluatePerkCondition(state, team.perk.condition)) return state;

  // Apply the perk effect
  let updated = applyEffect(state, team.perk.effect);
  updated = { ...updated, perkUsed: true };

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
