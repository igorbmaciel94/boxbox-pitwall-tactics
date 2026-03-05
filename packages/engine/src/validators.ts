import type { GameCatalogData, RaceState } from './types.js';

export function validateRaceState(state: RaceState): string[] {
  const errors: string[] = [];

  if (state.position < 1 || state.position > 20) {
    errors.push(`Position ${state.position} out of range [1, 20]`);
  }
  if (state.tireWear < 0 || state.tireWear > 100) {
    errors.push(`Tire wear ${state.tireWear} out of range [0, 100]`);
  }
  if (state.hand.length > 3) {
    errors.push(`Hand size ${state.hand.length} exceeds max of 3`);
  }
  if (state.currentTurn < 1 || state.currentTurn > state.totalTurns) {
    errors.push(`Current turn ${state.currentTurn} out of range [1, ${state.totalTurns}]`);
  }

  return errors;
}

export function validateCatalog(catalog: GameCatalogData): string[] {
  const errors: string[] = [];
  const cardIds = new Set(catalog.cards.map((c) => c.id));

  if (cardIds.size !== catalog.cards.length) {
    errors.push('Duplicate card IDs found');
  }

  const teamIds = new Set(catalog.teams.map((t) => t.id));
  if (teamIds.size !== catalog.teams.length) {
    errors.push('Duplicate team IDs found');
  }

  const scenarioIds = new Set(catalog.scenarios.map((s) => s.id));
  if (scenarioIds.size !== catalog.scenarios.length) {
    errors.push('Duplicate scenario IDs found');
  }

  for (const scenario of catalog.scenarios) {
    if (scenario.turns < 1) {
      errors.push(`Scenario ${scenario.id} has invalid turn count: ${scenario.turns}`);
    }
    if (scenario.objectives.length === 0) {
      errors.push(`Scenario ${scenario.id} has no objectives`);
    }
  }

  return errors;
}
