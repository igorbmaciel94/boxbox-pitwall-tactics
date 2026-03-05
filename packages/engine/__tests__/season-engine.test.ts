import { describe, expect, it } from 'vitest';
import { loadCatalog } from '@boxbox/content';
import { runSeason } from '../src/season-engine.js';
import type { PlayerAgent, ScoringConfig } from '../src/types.js';

const catalog = loadCatalog();

const deterministicAgent: PlayerAgent = {
  chooseTeamPerk: () => true,
  chooseActionCard: (state) => state.hand[0],
};

const config: ScoringConfig = { styleBonusesEnabled: false };

describe('runSeason', () => {
  it('runs 6 races for a full season', () => {
    const result = runSeason(catalog, 'crimson', deterministicAgent, 42, config);

    expect(result.races).toHaveLength(6);
    expect(result.teamId).toBe('crimson');
    expect(typeof result.finalScore).toBe('number');
  });

  it('uses all 6 scenarios exactly once', () => {
    const result = runSeason(catalog, 'azure', deterministicAgent, 42, config);

    const scenarioIds = result.races.map((r) => r.scenarioId);
    const allScenarioIds = catalog.scenarios.map((s) => s.id);

    expect(scenarioIds.sort()).toEqual(allScenarioIds.sort());
  });

  it('produces deterministic results with same seed', () => {
    const result1 = runSeason(catalog, 'crimson', deterministicAgent, 12345, config);
    const result2 = runSeason(catalog, 'crimson', deterministicAgent, 12345, config);

    expect(result1.finalScore).toBe(result2.finalScore);
    expect(result1.races.map((r) => r.scenarioId)).toEqual(
      result2.races.map((r) => r.scenarioId),
    );
    expect(result1.races.map((r) => r.totalScore)).toEqual(
      result2.races.map((r) => r.totalScore),
    );
  });

  it('produces different results with different seeds', () => {
    const result1 = runSeason(catalog, 'crimson', deterministicAgent, 111, config);
    const result2 = runSeason(catalog, 'crimson', deterministicAgent, 999, config);

    const order1 = result1.races.map((r) => r.scenarioId);
    const order2 = result2.races.map((r) => r.scenarioId);
    expect(order1).not.toEqual(order2);
  });

  it('cumulative score equals sum of individual race scores', () => {
    const result = runSeason(catalog, 'emerald', deterministicAgent, 42, config);
    const expectedTotal = result.races.reduce((sum, r) => sum + r.totalScore, 0);

    expect(result.finalScore).toBe(expectedTotal);
  });

  it('works with all teams', () => {
    for (const team of catalog.teams) {
      const result = runSeason(catalog, team.id, deterministicAgent, 42, config);
      expect(result.races).toHaveLength(6);
      expect(result.teamId).toBe(team.id);
    }
  });

  it('throws for unknown team', () => {
    expect(() =>
      runSeason(catalog, 'nonexistent', deterministicAgent, 42, config),
    ).toThrow('Team not found');
  });

  it('each race has 6 turns', () => {
    const result = runSeason(catalog, 'crimson', deterministicAgent, 42, config);

    for (const race of result.races) {
      expect(race.turnLog).toHaveLength(6);
    }
  });

  it('final positions are within valid range', () => {
    const result = runSeason(catalog, 'crimson', deterministicAgent, 42, config);

    for (const race of result.races) {
      expect(race.finalPosition).toBeGreaterThanOrEqual(1);
      expect(race.finalPosition).toBeLessThanOrEqual(20);
    }
  });
});
