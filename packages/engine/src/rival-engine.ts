import type { DriverData } from '@apex/content';
import type { RivalRaceResult, DriverStanding, SeededRng, TeamId } from './types.js';
import { getPositionScore } from './scoring.js';

/**
 * Simulate rival finishing positions for a race.
 * Each driver gets a performance score based on strength + random variance,
 * then they are sorted and assigned positions (skipping the player's position).
 */
export function simulateRivalPositions(
  drivers: DriverData[],
  playerDriverId: string,
  playerPosition: number,
  rng: SeededRng,
): RivalRaceResult[] {
  // Filter out the player's driver
  const rivals = drivers.filter((d) => d.id !== playerDriverId);

  // Generate performance scores: strength + random variance (-15 to +15)
  const scored = rivals.map((driver) => ({
    driver,
    performance: driver.strength + rng.nextInt(-15, 15),
  }));

  // Sort by performance descending (higher = better position)
  scored.sort((a, b) => b.performance - a.performance);

  // Assign positions 1..18, skipping player position
  const results: RivalRaceResult[] = [];
  let posSlot = 1;

  for (const { driver } of scored) {
    // Skip the player's position
    if (posSlot === playerPosition) posSlot++;

    const position = posSlot;
    posSlot++;

    results.push({
      driverId: driver.id,
      abbreviation: driver.abbreviation,
      teamId: driver.teamId,
      position,
      points: getPositionScore(position),
    });
  }

  return results;
}

/**
 * Build a full 18-driver classification combining player + rivals.
 */
export function buildFullClassification(
  playerDriverId: string,
  playerAbbreviation: string,
  playerTeamId: TeamId,
  playerPosition: number,
  rivalResults: RivalRaceResult[],
): RivalRaceResult[] {
  const playerEntry: RivalRaceResult = {
    driverId: playerDriverId,
    abbreviation: playerAbbreviation,
    teamId: playerTeamId,
    position: playerPosition,
    points: getPositionScore(playerPosition),
  };

  return [...rivalResults, playerEntry].sort((a, b) => a.position - b.position);
}

/**
 * Update championship standings with results from a new race.
 */
export function updateChampionshipStandings(
  currentStandings: DriverStanding[],
  raceClassification: RivalRaceResult[],
): DriverStanding[] {
  const standingsMap = new Map<string, DriverStanding>();

  // Initialize from current standings
  for (const standing of currentStandings) {
    standingsMap.set(standing.driverId, {
      ...standing,
      racePositions: [...standing.racePositions],
    });
  }

  // Add race results
  for (const result of raceClassification) {
    const existing = standingsMap.get(result.driverId);
    if (existing) {
      existing.totalPoints += result.points;
      existing.racePositions.push(result.position);
    } else {
      standingsMap.set(result.driverId, {
        driverId: result.driverId,
        abbreviation: result.abbreviation,
        teamId: result.teamId,
        totalPoints: result.points,
        racePositions: [result.position],
      });
    }
  }

  // Sort by total points descending, then by best position (tiebreaker)
  return Array.from(standingsMap.values()).sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    const bestA = Math.min(...a.racePositions);
    const bestB = Math.min(...b.racePositions);
    return bestA - bestB;
  });
}
