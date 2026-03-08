import cardsData from '@content-data/cards.json';
import scenariosData from '@content-data/scenarios.json';
import teamsData from '@content-data/teams.json';
import stringsData from '@content-data/strings.json';
import driversData from '@content-data/drivers.json';
import goalCardsData from '@content-data/goal-cards.json';
import type { GameCatalogData } from '@boxbox/content';

let cachedCatalog: GameCatalogData | null = null;

export function loadBrowserCatalog(): GameCatalogData {
  if (cachedCatalog) return cachedCatalog;

  cachedCatalog = {
    version: cardsData.version,
    cards: cardsData.cards as GameCatalogData['cards'],
    scenarios: scenariosData.scenarios as GameCatalogData['scenarios'],
    teams: teamsData.teams as GameCatalogData['teams'],
    drivers: driversData.drivers as GameCatalogData['drivers'],
    goalCards: goalCardsData.goalCards as unknown as GameCatalogData['goalCards'],
    strings: {
      events: stringsData.events as GameCatalogData['strings']['events'],
      radio: stringsData.radio as GameCatalogData['strings']['radio'],
    },
  };

  return cachedCatalog;
}
