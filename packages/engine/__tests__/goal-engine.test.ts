import { describe, it, expect } from 'vitest';
import { getTeamTier, getGoalCardForTeam, getGoalCardsForTeam, evaluateGoalCard } from '../src/goal-engine.js';
import type { DriverData, GoalCardData } from '@boxbox/content';
import type { DriverStanding, RaceDebrief } from '../src/types.js';

const DRIVERS: DriverData[] = [
  { id: 'd1', firstName: 'A', lastName: 'One', abbreviation: 'AON', teamId: 'onyx', strength: 95 },
  { id: 'd2', firstName: 'B', lastName: 'Two', abbreviation: 'BTW', teamId: 'onyx', strength: 90 },
  { id: 'd3', firstName: 'C', lastName: 'Three', abbreviation: 'CTH', teamId: 'onyx', strength: 86 },
  { id: 'd4', firstName: 'D', lastName: 'Four', abbreviation: 'DFO', teamId: 'crimson', strength: 82 },
  { id: 'd5', firstName: 'E', lastName: 'Five', abbreviation: 'EFI', teamId: 'crimson', strength: 77 },
  { id: 'd6', firstName: 'F', lastName: 'Six', abbreviation: 'FSI', teamId: 'crimson', strength: 72 },
  { id: 'd7', firstName: 'G', lastName: 'Seven', abbreviation: 'GSE', teamId: 'violet', strength: 65 },
  { id: 'd8', firstName: 'H', lastName: 'Eight', abbreviation: 'HEI', teamId: 'violet', strength: 60 },
  { id: 'd9', firstName: 'I', lastName: 'Nine', abbreviation: 'INI', teamId: 'violet', strength: 55 },
];

const GOAL_CARDS: GoalCardData[] = [
  { id: 'championship-contender', tier: 'top', title: 'Championship Contender', description: 'Win or podium', startingPositionRange: [1, 6], evaluate: 'championship-position', params: { maxPosition: 3 } },
  { id: 'points-machine', tier: 'mid', title: 'Points Machine', description: 'Top 5 + points every race', startingPositionRange: [7, 12], evaluate: 'top5-and-points-every-race', params: { maxPosition: 5 } },
  { id: 'rising-star', tier: 'bottom', title: 'Rising Star', description: 'Beat teammates + 20 pts', startingPositionRange: [13, 18], evaluate: 'beat-teammates-and-min-points', params: { minPoints: 20 } },
];

describe('getTeamTier', () => {
  it('returns top for high-strength teams (avg >= 83)', () => {
    expect(getTeamTier('onyx', DRIVERS)).toBe('top');
  });

  it('returns mid for medium-strength teams (avg >= 68)', () => {
    expect(getTeamTier('crimson', DRIVERS)).toBe('mid');
  });

  it('returns bottom for low-strength teams', () => {
    expect(getTeamTier('violet', DRIVERS)).toBe('bottom');
  });

  it('returns bottom for unknown team', () => {
    expect(getTeamTier('unknown', DRIVERS)).toBe('bottom');
  });
});

describe('getGoalCardForTeam', () => {
  it('returns the single top-tier card for top teams', () => {
    const card = getGoalCardForTeam(GOAL_CARDS, 'onyx', DRIVERS);
    expect(card).not.toBeNull();
    expect(card!.tier).toBe('top');
    expect(card!.id).toBe('championship-contender');
  });

  it('returns the single mid-tier card for mid teams', () => {
    const card = getGoalCardForTeam(GOAL_CARDS, 'crimson', DRIVERS);
    expect(card).not.toBeNull();
    expect(card!.tier).toBe('mid');
    expect(card!.id).toBe('points-machine');
  });

  it('returns the single bottom-tier card for bottom teams', () => {
    const card = getGoalCardForTeam(GOAL_CARDS, 'violet', DRIVERS);
    expect(card).not.toBeNull();
    expect(card!.tier).toBe('bottom');
    expect(card!.id).toBe('rising-star');
  });

  it('returns null for unknown team with no matching tier', () => {
    const emptyCards: GoalCardData[] = [];
    const card = getGoalCardForTeam(emptyCards, 'unknown', DRIVERS);
    expect(card).toBeNull();
  });
});

describe('getGoalCardsForTeam (legacy)', () => {
  it('returns all cards for matching tier', () => {
    const cards = getGoalCardsForTeam(GOAL_CARDS, 'onyx', DRIVERS);
    expect(cards).toHaveLength(1);
    expect(cards[0].tier).toBe('top');
  });
});

describe('evaluateGoalCard', () => {
  const makeStanding = (id: string, pts: number, positions: number[]): DriverStanding => ({
    driverId: id,
    abbreviation: id.toUpperCase(),
    teamId: DRIVERS.find((d) => d.id === id)?.teamId ?? '',
    totalPoints: pts,
    racePositions: positions,
  });

  const makeDebrief = (pos: number): RaceDebrief => ({
    scenarioId: 'test',
    teamId: 'onyx',
    totalScore: 25,
    positionScore: 25,
    objectivePoints: 0,
    styleBonus: 0,
    finalPosition: pos,
    objectivesCompleted: [],
    turnLog: [],
  });

  describe('championship-position (top tier)', () => {
    it('passes when player is on podium (P1-P3)', () => {
      const standings = [makeStanding('d2', 50, [1]), makeStanding('d4', 40, [2]), makeStanding('d1', 35, [3])];
      expect(evaluateGoalCard(GOAL_CARDS[0], 'd1', standings, [], DRIVERS)).toBe(true);
    });

    it('passes when player wins championship (P1)', () => {
      const standings = [makeStanding('d1', 50, [1, 1]), makeStanding('d2', 30, [2, 3])];
      expect(evaluateGoalCard(GOAL_CARDS[0], 'd1', standings, [], DRIVERS)).toBe(true);
    });

    it('fails when player is below P3', () => {
      const standings = [makeStanding('d2', 50, [1]), makeStanding('d4', 40, [2]), makeStanding('d5', 35, [3]), makeStanding('d1', 30, [4])];
      expect(evaluateGoalCard(GOAL_CARDS[0], 'd1', standings, [], DRIVERS)).toBe(false);
    });
  });

  describe('top5-and-points-every-race (mid tier)', () => {
    it('passes when in top 5 and scored points every race', () => {
      const standings = [
        makeStanding('d1', 60, [1, 1]),
        makeStanding('d2', 50, [2, 2]),
        makeStanding('d4', 40, [3, 3]),
      ];
      const results = [makeDebrief(1), makeDebrief(5), makeDebrief(10)];
      expect(evaluateGoalCard(GOAL_CARDS[1], 'd4', standings, results, DRIVERS)).toBe(true);
    });

    it('fails when in top 5 but missed points in a race', () => {
      const standings = [
        makeStanding('d1', 60, [1, 1]),
        makeStanding('d4', 40, [3, 3]),
      ];
      const results = [makeDebrief(1), makeDebrief(11)]; // P11 = 0 points
      expect(evaluateGoalCard(GOAL_CARDS[1], 'd4', standings, results, DRIVERS)).toBe(false);
    });

    it('fails when scored points every race but not in top 5', () => {
      const standings = [
        makeStanding('d1', 60, [1, 1]),
        makeStanding('d2', 50, [2, 2]),
        makeStanding('d3', 45, [3, 3]),
        makeStanding('d5', 42, [4, 4]),
        makeStanding('d6', 40, [5, 5]),
        makeStanding('d4', 35, [6, 6]),
      ];
      const results = [makeDebrief(5), makeDebrief(8)];
      expect(evaluateGoalCard(GOAL_CARDS[1], 'd4', standings, results, DRIVERS)).toBe(false);
    });

    it('fails with no races', () => {
      const standings = [makeStanding('d4', 0, [])];
      expect(evaluateGoalCard(GOAL_CARDS[1], 'd4', standings, [], DRIVERS)).toBe(false);
    });
  });

  describe('beat-teammates-and-min-points (bottom tier)', () => {
    it('passes when outscoring teammates and reaching min points', () => {
      const standings = [
        makeStanding('d7', 25, [5, 8]),
        makeStanding('d8', 15, [8, 10]),
        makeStanding('d9', 10, [10, 12]),
      ];
      expect(evaluateGoalCard(GOAL_CARDS[2], 'd7', standings, [], DRIVERS)).toBe(true);
    });

    it('fails when outscoring teammates but below min points', () => {
      const standings = [
        makeStanding('d7', 15, [5, 8]),
        makeStanding('d8', 10, [8, 10]),
        makeStanding('d9', 5, [10, 12]),
      ];
      expect(evaluateGoalCard(GOAL_CARDS[2], 'd7', standings, [], DRIVERS)).toBe(false);
    });

    it('fails when reaching min points but not outscoring a teammate', () => {
      const standings = [
        makeStanding('d8', 30, [3, 5]),
        makeStanding('d7', 25, [5, 8]),
        makeStanding('d9', 10, [10, 12]),
      ];
      expect(evaluateGoalCard(GOAL_CARDS[2], 'd7', standings, [], DRIVERS)).toBe(false);
    });

    it('fails when tied with a teammate', () => {
      const standings = [
        makeStanding('d7', 25, [5, 8]),
        makeStanding('d8', 25, [5, 8]),
        makeStanding('d9', 10, [10, 12]),
      ];
      expect(evaluateGoalCard(GOAL_CARDS[2], 'd7', standings, [], DRIVERS)).toBe(false);
    });
  });
});
