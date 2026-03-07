import type { DriverData, GoalCardData, GoalCardTier } from '@boxbox/content';
import type { DriverStanding, RaceDebrief } from './types.js';
import { getPositionScore } from './scoring.js';

/**
 * Get the team tier based on average driver strength.
 */
export function getTeamTier(teamId: string, drivers: DriverData[]): GoalCardTier {
  const teamDrivers = drivers.filter((d) => d.teamId === teamId);
  if (teamDrivers.length === 0) return 'bottom';

  const avgStrength = teamDrivers.reduce((sum, d) => sum + d.strength, 0) / teamDrivers.length;

  if (avgStrength >= 83) return 'top';
  if (avgStrength >= 68) return 'mid';
  return 'bottom';
}

/**
 * Get the single goal card for a team based on its tier.
 * Returns the first matching card (one per tier).
 */
export function getGoalCardForTeam(
  goalCards: GoalCardData[],
  teamId: string,
  drivers: DriverData[],
): GoalCardData | null {
  const tier = getTeamTier(teamId, drivers);
  return goalCards.find((g) => g.tier === tier) ?? null;
}

/**
 * @deprecated Use getGoalCardForTeam instead. Kept for backwards compatibility.
 */
export function getGoalCardsForTeam(
  goalCards: GoalCardData[],
  teamId: string,
  drivers: DriverData[],
): GoalCardData[] {
  const tier = getTeamTier(teamId, drivers);
  return goalCards.filter((g) => g.tier === tier);
}

/**
 * Evaluate whether a goal card objective has been achieved.
 */
export function evaluateGoalCard(
  goalCard: GoalCardData,
  playerDriverId: string,
  standings: DriverStanding[],
  raceResults: RaceDebrief[],
  drivers: DriverData[],
): boolean {
  switch (goalCard.evaluate) {
    case 'championship-position': {
      const maxPosition = goalCard.params.maxPosition as number;
      const playerIndex = standings.findIndex((s) => s.driverId === playerDriverId);
      // Index is 0-based, championship position is 1-based
      return playerIndex >= 0 && playerIndex + 1 <= maxPosition;
    }

    case 'points-every-race': {
      // Player must have scored points (P1-P10) in every race
      for (const race of raceResults) {
        const points = getPositionScore(race.finalPosition);
        if (points === 0) return false;
      }
      return raceResults.length > 0;
    }

    case 'top5-and-points-every-race': {
      // Combined: championship P1-P5 AND scored points in every race
      const maxPosition = goalCard.params.maxPosition as number;
      const playerIndex = standings.findIndex((s) => s.driverId === playerDriverId);
      const inTop = playerIndex >= 0 && playerIndex + 1 <= maxPosition;
      if (!inTop) return false;

      for (const race of raceResults) {
        const points = getPositionScore(race.finalPosition);
        if (points === 0) return false;
      }
      return raceResults.length > 0;
    }

    case 'beat-teammates': {
      const playerStanding = standings.find((s) => s.driverId === playerDriverId);
      if (!playerStanding) return false;

      const playerDriver = drivers.find((d) => d.id === playerDriverId);
      if (!playerDriver) return false;

      const teammates = drivers.filter(
        (d) => d.teamId === playerDriver.teamId && d.id !== playerDriverId,
      );

      for (const teammate of teammates) {
        const teammateStanding = standings.find((s) => s.driverId === teammate.id);
        const teammatePoints = teammateStanding?.totalPoints ?? 0;
        if (playerStanding.totalPoints <= teammatePoints) return false;
      }

      return true;
    }

    case 'beat-teammates-and-min-points': {
      // Combined: beat all teammates AND reach minimum points
      const minPoints = goalCard.params.minPoints as number;
      const playerStanding = standings.find((s) => s.driverId === playerDriverId);
      if (!playerStanding) return false;
      if (playerStanding.totalPoints < minPoints) return false;

      const playerDriver = drivers.find((d) => d.id === playerDriverId);
      if (!playerDriver) return false;

      const teammates = drivers.filter(
        (d) => d.teamId === playerDriver.teamId && d.id !== playerDriverId,
      );

      for (const teammate of teammates) {
        const teammateStanding = standings.find((s) => s.driverId === teammate.id);
        const teammatePoints = teammateStanding?.totalPoints ?? 0;
        if (playerStanding.totalPoints <= teammatePoints) return false;
      }

      return true;
    }

    case 'min-total-points': {
      const minPoints = goalCard.params.minPoints as number;
      const playerStanding = standings.find((s) => s.driverId === playerDriverId);
      return (playerStanding?.totalPoints ?? 0) >= minPoints;
    }

    default:
      return false;
  }
}
