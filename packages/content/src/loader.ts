import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CardData, GameCatalogData, GameStringsData, ScenarioData, TeamData } from './types.js';
import { cardsFileSchema, scenariosFileSchema, stringsFileSchema, teamsFileSchema } from './schemas.js';

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

export function loadCatalog(): GameCatalogData {
  const cardsFile = loadCards();
  const scenariosFile = loadScenarios();
  const teamsFile = loadTeams();
  const stringsFile = loadStrings();

  return {
    version: cardsFile.version,
    cards: cardsFile.cards,
    scenarios: scenariosFile.scenarios,
    teams: teamsFile.teams,
    strings: {
      events: stringsFile.events,
      radio: stringsFile.radio,
    },
  };
}
