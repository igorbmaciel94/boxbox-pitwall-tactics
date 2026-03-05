import { describe, expect, it } from 'vitest';
import { loadCards, loadCatalog, loadScenarios, loadStrings, loadTeams } from '../src/index.js';

describe('loadCatalog', () => {
  it('loads full catalog with correct counts', () => {
    const catalog = loadCatalog();

    expect(catalog.version).toBe('2.0.0');
    expect(catalog.cards).toHaveLength(12);
    expect(catalog.scenarios).toHaveLength(6);
    expect(catalog.teams).toHaveLength(6);
  });

  it('has all required card fields', () => {
    const catalog = loadCatalog();

    for (const card of catalog.cards) {
      expect(card.id).toBeTruthy();
      expect(card.name).toBeTruthy();
      expect(card.rulesText).toBeTruthy();
      expect(card.effect).toBeDefined();
      expect(Array.isArray(card.tags)).toBe(true);
    }
  });

  it('has unique card IDs', () => {
    const catalog = loadCatalog();
    const ids = catalog.cards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique scenario IDs', () => {
    const catalog = loadCatalog();
    const ids = catalog.scenarios.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique team IDs', () => {
    const catalog = loadCatalog();
    const ids = catalog.teams.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all scenarios have 6 turns', () => {
    const catalog = loadCatalog();
    for (const scenario of catalog.scenarios) {
      expect(scenario.turns).toBe(6);
    }
  });

  it('all scenarios have at least one main objective', () => {
    const catalog = loadCatalog();
    for (const scenario of catalog.scenarios) {
      const mainObjectives = scenario.objectives.filter((o) => o.type === 'main');
      expect(mainObjectives.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('has event strings for all event types', () => {
    const catalog = loadCatalog();
    const eventTypes = [
      'safety-car',
      'rain',
      'rival-pits',
      'traffic',
      'clear-air',
      'mechanical-issue',
    ] as const;

    for (const eventType of eventTypes) {
      expect(catalog.strings.events[eventType].length).toBeGreaterThanOrEqual(1);
    }
  });

  it('has radio string pools', () => {
    const catalog = loadCatalog();
    expect(catalog.strings.radio.stayOut.length).toBeGreaterThanOrEqual(1);
    expect(catalog.strings.radio.boxBox.length).toBeGreaterThanOrEqual(1);
    expect(catalog.strings.radio.generic.length).toBeGreaterThanOrEqual(1);
  });
});

describe('individual loaders', () => {
  it('loadCards returns versioned cards', () => {
    const result = loadCards();
    expect(result.version).toBe('2.0.0');
    expect(result.cards).toHaveLength(12);
  });

  it('loadScenarios returns versioned scenarios', () => {
    const result = loadScenarios();
    expect(result.version).toBe('2.0.0');
    expect(result.scenarios).toHaveLength(6);
  });

  it('loadTeams returns versioned teams', () => {
    const result = loadTeams();
    expect(result.version).toBe('2.0.0');
    expect(result.teams).toHaveLength(6);
  });

  it('loadStrings returns versioned strings', () => {
    const result = loadStrings();
    expect(result.version).toBe('2.0.0');
    expect(result.events).toBeDefined();
    expect(result.radio).toBeDefined();
  });
});
