import { describe, expect, it } from 'vitest';
import { loadCatalog } from '@apex/content';
import { maybeApplyTeamPerk } from '../src/team-perks.js';
import type { PlayerAgent, RaceState } from '../src/types.js';

const catalog = loadCatalog();

function makeBaseState(overrides: Partial<RaceState> = {}): RaceState {
  return {
    scenarioId: 'harbor',
    teamId: 'azure',
    seed: 42,
    difficulty: 'normal',
    position: 10,
    tireWear: 30,
    currentTurn: 1,
    totalTurns: 6,
    deck: [],
    hand: ['push-hard', 'pit-call', 'overtake'],
    discard: [],
    currentEvent: null,
    eventHistory: [],
    cautionUsed: false,
    lastEventType: null,
    perkUsed: false,
    objectivesCompleted: [],
    cardsPlayedTotal: [],
    turnPhase: 'start',
    maxTireWearReached: 30,
    ...overrides,
  };
}

const alwaysYesAgent: PlayerAgent = {
  chooseTeamPerk: () => true,
  chooseActionCard: (state) => state.hand[0],
};

const alwaysNoAgent: PlayerAgent = {
  chooseTeamPerk: () => false,
  chooseActionCard: (state) => state.hand[0],
};

describe('maybeApplyTeamPerk', () => {
  it('applies perk when agent says yes', () => {
    const azure = catalog.teams.find((t) => t.id === 'azure')!;
    const state = makeBaseState();
    const updated = maybeApplyTeamPerk(state, azure, alwaysYesAgent);

    expect(updated.perkUsed).toBe(true);
    // Azure's perk: tireWear -20
    expect(updated.tireWear).toBe(10); // 30 - 20
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

  it('applies crimson perk (position + tire wear)', () => {
    const crimson = catalog.teams.find((t) => t.id === 'crimson')!;
    const state = makeBaseState({ teamId: 'crimson', position: 10, tireWear: 30 });
    const updated = maybeApplyTeamPerk(state, crimson, alwaysYesAgent);

    expect(updated.perkUsed).toBe(true);
    expect(updated.position).toBe(8); // 10 + (-2)
    expect(updated.tireWear).toBe(40); // 30 + 10
  });
});
