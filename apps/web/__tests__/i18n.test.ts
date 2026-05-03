import { describe, expect, it } from 'vitest';
import cardsData from '@content-data/cards.json';
import scenariosData from '@content-data/scenarios.json';
import teamsData from '@content-data/teams.json';
import stringsData from '@content-data/strings.json';
import { DICTIONARIES } from '../src/i18n/translations';

const en = DICTIONARIES.en;
const ptBR = DICTIONARIES['pt-BR'];

function collectStringValues(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStringValues);
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectStringValues);
  }
  return [];
}

describe('i18n dictionaries', () => {
  it('has translated card names and rules for all card ids', () => {
    for (const card of cardsData.cards) {
      expect(en.content.cards[card.id]?.name).toBeTruthy();
      expect(en.content.cards[card.id]?.rulesText).toBeTruthy();
      expect(ptBR.content.cards[card.id]?.name).toBeTruthy();
      expect(ptBR.content.cards[card.id]?.rulesText).toBeTruthy();
    }
  });

  it('has translated teams and perks for all ids', () => {
    for (const team of teamsData.teams) {
      expect(en.content.teams[team.id]?.name).toBeTruthy();
      expect(ptBR.content.teams[team.id]?.name).toBeTruthy();

      expect(en.content.perks[team.perk.id]?.name).toBeTruthy();
      expect(en.content.perks[team.perk.id]?.description).toBeTruthy();
      expect(ptBR.content.perks[team.perk.id]?.name).toBeTruthy();
      expect(ptBR.content.perks[team.perk.id]?.description).toBeTruthy();
    }
  });

  it('has translated scenarios and objectives for all ids', () => {
    for (const scenario of scenariosData.scenarios) {
      expect(en.content.scenarios[scenario.id]?.name).toBeTruthy();
      expect(en.content.scenarios[scenario.id]?.circuit).toBeTruthy();
      expect(ptBR.content.scenarios[scenario.id]?.name).toBeTruthy();
      expect(ptBR.content.scenarios[scenario.id]?.circuit).toBeTruthy();

      for (const objective of scenario.objectives) {
        expect(en.content.objectives[objective.id]).toBeTruthy();
        expect(ptBR.content.objectives[objective.id]).toBeTruthy();
      }
    }
  });

  it('keeps event flavor pools parity between en and pt-BR', () => {
    for (const [eventType, englishMessages] of Object.entries(stringsData.events)) {
      const enMessages = en.content.events.flavors[eventType as keyof typeof stringsData.events];
      const ptMessages = ptBR.content.events.flavors[eventType as keyof typeof stringsData.events];
      expect(enMessages).toHaveLength(englishMessages.length);
      expect(ptMessages).toHaveLength(englishMessages.length);
    }
  });

  it('keeps radio pools parity between en and pt-BR', () => {
    for (const context of ['stayOut', 'pitCall', 'generic'] as const) {
      const englishMessages = stringsData.radio[context];
      expect(en.content.radio[context]).toHaveLength(englishMessages.length);
      expect(ptBR.content.radio[context]).toHaveLength(englishMessages.length);
    }
  });

  it('has localized labels for tags, filters, and medals', () => {
    for (const tag of ['aggressive', 'defensive', 'pit', 'weather']) {
      expect(en.content.tags[tag]).toBeTruthy();
      expect(ptBR.content.tags[tag]).toBeTruthy();
    }

    for (const filter of ['all', 'drive', 'pit', 'tactics'] as const) {
      expect(en.content.filters[filter]).toBeTruthy();
      expect(ptBR.content.filters[filter]).toBeTruthy();
    }

    for (const medal of ['gold', 'silver', 'bronze'] as const) {
      expect(en.content.medals[medal]).toBeTruthy();
      expect(ptBR.content.medals[medal]).toBeTruthy();
    }
  });

  it('does not expose legacy motorsport brand terms in user-facing text', () => {
    const bannedTerms = [
      /\bFormula 1\b/i,
      /\bF1\b/i,
      /\bDRS\b/i,
      /\bSafety Car\b/i,
      /\bGrand Prix\b/i,
      /\bBox Box\b/i,
      /\bPit Wall\b/i,
    ];

    const visibleText = collectStringValues({
      en,
      ptBR,
      cards: cardsData.cards.map((card) => ({ name: card.name, rulesText: card.rulesText })),
      scenarios: scenariosData.scenarios.map((scenario) => ({ name: scenario.name, circuit: scenario.circuit })),
      teams: teamsData.teams.map((team) => ({
        name: team.name,
        perkName: team.perk.name,
        perkDescription: team.perk.description,
      })),
      strings: stringsData,
    }).join('\n');

    for (const term of bannedTerms) {
      expect(visibleText).not.toMatch(term);
    }
  });
});
