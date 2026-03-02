import { describe, expect, it } from 'vitest';
import { loadCatalog } from '@boxbox/content';
import { applyEndOfTurnPerk, maybeApplyTeamPerk } from '../src/team-perks.js';
import type { PlayerAgent, RaceState } from '../src/types.js';

const catalog = loadCatalog();

function makeBaseState(overrides: Partial<RaceState> = {}): RaceState {
  return {
    scenarioId: 'monaco',
    teamId: 'azure',
    seed: 42,
    position: 10,
    tireWear: 30,
    fuel: 50,
    rainMeter: 0,
    currentTurn: 1,
    totalTurns: 6,
    deck: [],
    hand: ['push-hard', 'box-box', 'overtake'],
    discard: [],
    currentEvent: null,
    eventHistory: [],
    scUsed: false,
    vscUsed: false,
    lastEventType: null,
    perkUsed: false,
    objectivesCompleted: [],
    cardsPlayedTotal: [],
    quickDecisionMade: false,
    turnPhase: 'start',
    maxTireWearReached: 30,
    ...overrides,
  };
}

const alwaysYesAgent: PlayerAgent = {
  chooseQuickDecisionCard: (state) => state.hand[0] ?? null,
  chooseTeamPerk: () => true,
  chooseActionCard: (state) => state.hand[0],
};

const alwaysNoAgent: PlayerAgent = {
  chooseQuickDecisionCard: () => null,
  chooseTeamPerk: () => false,
  chooseActionCard: (state) => state.hand[0],
};

describe('maybeApplyTeamPerk', () => {
  it('applies standard perk when agent says yes', () => {
    const azure = catalog.teams.find((t) => t.id === 'azure')!;
    const state = makeBaseState();
    const updated = maybeApplyTeamPerk(state, azure, alwaysYesAgent);

    expect(updated.perkUsed).toBe(true);
    // Azure's perk: tireWear -15
    expect(updated.tireWear).toBe(15); // 30 - 15
  });

  it('does not apply perk when agent says no', () => {
    const azure = catalog.teams.find((t) => t.id === 'azure')!;
    const state = makeBaseState();
    const updated = maybeApplyTeamPerk(state, azure, alwaysNoAgent);

    expect(updated.perkUsed).toBe(false);
    expect(updated.tireWear).toBe(30);
  });

  it('does not apply perk when already used', () => {
    const azure = catalog.teams.find((t) => t.id === 'azure')!;
    const state = makeBaseState({ perkUsed: true, tireWear: 30 });
    const updated = maybeApplyTeamPerk(state, azure, alwaysYesAgent);

    expect(updated.tireWear).toBe(30); // No change
  });

  it('skips end-of-turn perks in standard phase', () => {
    const crimson = catalog.teams.find((t) => t.id === 'crimson')!;
    const state = makeBaseState({ teamId: 'crimson' });
    const updated = maybeApplyTeamPerk(state, crimson, alwaysYesAgent);

    expect(updated.perkUsed).toBe(false); // Crimson is end-of-turn, so standard phase skips it
  });

  it('perk can only be used once per race', () => {
    const violet = catalog.teams.find((t) => t.id === 'violet')!;
    const state = makeBaseState({ teamId: 'violet' });

    // First use
    const afterFirst = maybeApplyTeamPerk(state, violet, alwaysYesAgent);
    expect(afterFirst.perkUsed).toBe(true);

    // Second attempt
    const afterSecond = maybeApplyTeamPerk(afterFirst, violet, alwaysYesAgent);
    expect(afterSecond.position).toEqual(afterFirst.position); // No additional change
  });
});

describe('applyEndOfTurnPerk', () => {
  it('applies Crimson perk when tire wear > 60', () => {
    const crimson = catalog.teams.find((t) => t.id === 'crimson')!;
    const state = makeBaseState({ teamId: 'crimson', tireWear: 70, position: 10 });
    const updated = applyEndOfTurnPerk(state, crimson);

    expect(updated.perkUsed).toBe(true);
    expect(updated.position).toBe(9); // 10 + (-1)
  });

  it('does not apply Crimson perk when tire wear <= 60', () => {
    const crimson = catalog.teams.find((t) => t.id === 'crimson')!;
    const state = makeBaseState({ teamId: 'crimson', tireWear: 50, position: 10 });
    const updated = applyEndOfTurnPerk(state, crimson);

    expect(updated.perkUsed).toBe(false);
    expect(updated.position).toBe(10);
  });

  it('does not apply end-of-turn perk if already used', () => {
    const crimson = catalog.teams.find((t) => t.id === 'crimson')!;
    const state = makeBaseState({ teamId: 'crimson', tireWear: 70, perkUsed: true, position: 10 });
    const updated = applyEndOfTurnPerk(state, crimson);

    expect(updated.position).toBe(10); // No change
  });

  it('does nothing for standard-timing teams', () => {
    const azure = catalog.teams.find((t) => t.id === 'azure')!;
    const state = makeBaseState();
    const updated = applyEndOfTurnPerk(state, azure);

    expect(updated).toEqual(state);
  });
});
