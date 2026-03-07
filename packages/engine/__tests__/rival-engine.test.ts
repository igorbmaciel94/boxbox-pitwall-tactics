import { describe, it, expect } from 'vitest';
import { createRng } from '../src/rng.js';
import { simulateRivalPositions, buildFullClassification, updateChampionshipStandings } from '../src/rival-engine.js';
import type { DriverData } from '@boxbox/content';

const MOCK_DRIVERS: DriverData[] = [
  { id: 'd1', firstName: 'A', lastName: 'One', abbreviation: 'AON', teamId: 'onyx', strength: 95 },
  { id: 'd2', firstName: 'B', lastName: 'Two', abbreviation: 'BTW', teamId: 'onyx', strength: 90 },
  { id: 'd3', firstName: 'C', lastName: 'Three', abbreviation: 'CTH', teamId: 'onyx', strength: 86 },
  { id: 'd4', firstName: 'D', lastName: 'Four', abbreviation: 'DFO', teamId: 'azure', strength: 93 },
  { id: 'd5', firstName: 'E', lastName: 'Five', abbreviation: 'EFI', teamId: 'azure', strength: 89 },
  { id: 'd6', firstName: 'F', lastName: 'Six', abbreviation: 'FSI', teamId: 'azure', strength: 84 },
  { id: 'd7', firstName: 'G', lastName: 'Seven', abbreviation: 'GSE', teamId: 'crimson', strength: 82 },
  { id: 'd8', firstName: 'H', lastName: 'Eight', abbreviation: 'HEI', teamId: 'crimson', strength: 77 },
  { id: 'd9', firstName: 'I', lastName: 'Nine', abbreviation: 'INI', teamId: 'crimson', strength: 72 },
  { id: 'd10', firstName: 'J', lastName: 'Ten', abbreviation: 'JTE', teamId: 'amber', strength: 80 },
  { id: 'd11', firstName: 'K', lastName: 'Eleven', abbreviation: 'KEL', teamId: 'amber', strength: 75 },
  { id: 'd12', firstName: 'L', lastName: 'Twelve', abbreviation: 'LTW', teamId: 'amber', strength: 68 },
  { id: 'd13', firstName: 'M', lastName: 'Thirteen', abbreviation: 'MTH', teamId: 'emerald', strength: 67 },
  { id: 'd14', firstName: 'N', lastName: 'Fourteen', abbreviation: 'NFO', teamId: 'emerald', strength: 62 },
  { id: 'd15', firstName: 'O', lastName: 'Fifteen', abbreviation: 'OFI', teamId: 'emerald', strength: 57 },
  { id: 'd16', firstName: 'P', lastName: 'Sixteen', abbreviation: 'PSI', teamId: 'violet', strength: 65 },
  { id: 'd17', firstName: 'Q', lastName: 'Seventeen', abbreviation: 'QSE', teamId: 'violet', strength: 60 },
  { id: 'd18', firstName: 'R', lastName: 'Eighteen', abbreviation: 'REI', teamId: 'violet', strength: 55 },
];

describe('simulateRivalPositions', () => {
  it('returns 17 rival results when given 18 drivers', () => {
    const rng = createRng(42);
    const results = simulateRivalPositions(MOCK_DRIVERS, 'd1', 5, rng.fork(1));
    expect(results).toHaveLength(17);
  });

  it('assigns unique positions', () => {
    const rng = createRng(42);
    const results = simulateRivalPositions(MOCK_DRIVERS, 'd1', 5, rng.fork(1));
    const positions = results.map((r) => r.position);
    expect(new Set(positions).size).toBe(17);
  });

  it('skips the player position', () => {
    const rng = createRng(42);
    const playerPos = 5;
    const results = simulateRivalPositions(MOCK_DRIVERS, 'd1', playerPos, rng.fork(1));
    const positions = results.map((r) => r.position);
    expect(positions).not.toContain(playerPos);
  });

  it('produces deterministic results with the same seed', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);
    const results1 = simulateRivalPositions(MOCK_DRIVERS, 'd1', 5, rng1.fork(1));
    const results2 = simulateRivalPositions(MOCK_DRIVERS, 'd1', 5, rng2.fork(1));
    expect(results1).toEqual(results2);
  });

  it('produces different driver orderings with different seeds', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(999);
    const results1 = simulateRivalPositions(MOCK_DRIVERS, 'd1', 5, rng1.fork(1));
    const results2 = simulateRivalPositions(MOCK_DRIVERS, 'd1', 5, rng2.fork(1));
    // Compare driver IDs at each position — variance makes orderings differ
    const ids1 = results1.map((r) => r.driverId);
    const ids2 = results2.map((r) => r.driverId);
    expect(ids1).not.toEqual(ids2);
  });

  it('includes correct driver metadata', () => {
    const rng = createRng(42);
    const results = simulateRivalPositions(MOCK_DRIVERS, 'd1', 5, rng.fork(1));
    for (const result of results) {
      const driver = MOCK_DRIVERS.find((d) => d.id === result.driverId)!;
      expect(result.abbreviation).toBe(driver.abbreviation);
      expect(result.teamId).toBe(driver.teamId);
    }
  });
});

describe('buildFullClassification', () => {
  it('returns 18 entries including the player', () => {
    const rng = createRng(42);
    const rivals = simulateRivalPositions(MOCK_DRIVERS, 'd1', 5, rng.fork(1));
    const full = buildFullClassification('d1', 'AON', 'onyx', 5, rivals);
    expect(full).toHaveLength(18);
  });

  it('is sorted by position', () => {
    const rng = createRng(42);
    const rivals = simulateRivalPositions(MOCK_DRIVERS, 'd1', 5, rng.fork(1));
    const full = buildFullClassification('d1', 'AON', 'onyx', 5, rivals);
    for (let i = 1; i < full.length; i++) {
      expect(full[i].position).toBeGreaterThan(full[i - 1].position);
    }
  });

  it('includes the player at the correct position', () => {
    const rng = createRng(42);
    const rivals = simulateRivalPositions(MOCK_DRIVERS, 'd1', 5, rng.fork(1));
    const full = buildFullClassification('d1', 'AON', 'onyx', 5, rivals);
    const player = full.find((e) => e.driverId === 'd1')!;
    expect(player.position).toBe(5);
    expect(player.abbreviation).toBe('AON');
  });
});

describe('updateChampionshipStandings', () => {
  it('creates standings from empty', () => {
    const rng = createRng(42);
    const rivals = simulateRivalPositions(MOCK_DRIVERS, 'd1', 1, rng.fork(1));
    const full = buildFullClassification('d1', 'AON', 'onyx', 1, rivals);
    const standings = updateChampionshipStandings([], full);
    expect(standings).toHaveLength(18);
    expect(standings[0].totalPoints).toBeGreaterThan(0);
  });

  it('accumulates points across races', () => {
    const rng = createRng(42);

    const rivals1 = simulateRivalPositions(MOCK_DRIVERS, 'd1', 1, rng.fork(1));
    const full1 = buildFullClassification('d1', 'AON', 'onyx', 1, rivals1);
    const standings1 = updateChampionshipStandings([], full1);

    const rivals2 = simulateRivalPositions(MOCK_DRIVERS, 'd1', 3, rng.fork(2));
    const full2 = buildFullClassification('d1', 'AON', 'onyx', 3, rivals2);
    const standings2 = updateChampionshipStandings(standings1, full2);

    const player = standings2.find((s) => s.driverId === 'd1')!;
    expect(player.racePositions).toEqual([1, 3]);
    expect(player.totalPoints).toBe(25 + 15); // P1=25, P3=15
  });

  it('sorts by total points descending', () => {
    const rng = createRng(42);
    const rivals = simulateRivalPositions(MOCK_DRIVERS, 'd1', 1, rng.fork(1));
    const full = buildFullClassification('d1', 'AON', 'onyx', 1, rivals);
    const standings = updateChampionshipStandings([], full);

    for (let i = 1; i < standings.length; i++) {
      expect(standings[i].totalPoints).toBeLessThanOrEqual(standings[i - 1].totalPoints);
    }
  });
});
