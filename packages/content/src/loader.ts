import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CardData, DriverData, GameCatalogData, GameStringsData, GoalCardData, ScenarioData, TeamData } from './types.js';
import { cardsFileSchema, driversFileSchema, goalCardsFileSchema, scenariosFileSchema, stringsFileSchema, teamsFileSchema } from './schemas.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');

function loadJson(filename: string): unknown {
  const raw = readFileSync(join(dataDir, filename), 'utf-8');
  return JSON.parse(raw);
}

export function loadCards(): { version: string; cards: CardData[] } {
  const data = loadJson('cards.json');
  return cardsFileSchema.parse(data);
}

export function loadScenarios(): { version: string; scenarios: ScenarioData[] } {
  const data = loadJson('scenarios.json');
  return scenariosFileSchema.parse(data);
}

export function loadTeams(): { version: string; teams: TeamData[] } {
  const data = loadJson('teams.json');
  return teamsFileSchema.parse(data);
}

export function loadStrings(): { version: string } & GameStringsData {
  const data = loadJson('strings.json');
  return stringsFileSchema.parse(data);
}

export function loadDrivers(): { version: string; drivers: DriverData[] } {
  const data = loadJson('drivers.json');
  return driversFileSchema.parse(data);
}

export function loadGoalCards(): { version: string; goalCards: GoalCardData[] } {
  const data = loadJson('goal-cards.json');
  return goalCardsFileSchema.parse(data);
}

export function loadCatalog(): GameCatalogData {
  const cardsFile = loadCards();
  const scenariosFile = loadScenarios();
  const teamsFile = loadTeams();
  const stringsFile = loadStrings();
  const driversFile = loadDrivers();
  const goalCardsFile = loadGoalCards();

  return {
    version: cardsFile.version,
    cards: cardsFile.cards,
    scenarios: scenariosFile.scenarios,
    teams: teamsFile.teams,
    drivers: driversFile.drivers,
    goalCards: goalCardsFile.goalCards,
    strings: {
      events: stringsFile.events,
      radio: stringsFile.radio,
    },
  };
}
