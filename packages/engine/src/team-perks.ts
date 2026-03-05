import type { PlayerAgent, RaceState, TeamData } from './types.js';
import { applyEffect } from './clamp.js';

export function maybeApplyTeamPerk(
  state: RaceState,
  team: TeamData,
  agent: PlayerAgent,
): RaceState {
  if (state.perkUsed) return state;

  if (!agent.chooseTeamPerk(state)) return state;

  let updated = applyEffect(state, team.perk.effect);
  updated = { ...updated, perkUsed: true };

  return updated;
}
