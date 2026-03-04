import cardsData from '@content-data/cards.json';
import scenariosData from '@content-data/scenarios.json';
import teamsData from '@content-data/teams.json';
import stringsData from '@content-data/strings.json';
import type { GameCatalogData } from '@boxbox/content';

let cachedCatalog: GameCatalogData | null = null;

export function loadBrowserCatalog(): GameCatalogData {
  if (cachedCatalog) return cachedCatalog;

  const cards = cardsData as { version: string; cards: GameCatalogData['cards'] };
  const scenarios = scenariosData as { version: string; scenarios: GameCatalogData['scenarios'] };
  const teams = teamsData as { version: string; teams: GameCatalogData['teams'] };
  const strings = stringsData as {
    version: string;
    events: GameCatalogData['strings']['events'];
    radio: GameCatalogData['strings']['radio'];
  };

  cachedCatalog = {
    version: cards.version,
    cards: cards.cards,
    scenarios: scenarios.scenarios,
    teams: teams.teams,
    strings: {
      events: strings.events,
      radio: strings.radio,
    },
  };

  return cachedCatalog;
}
