import type {
  GameCatalogData,
  PlayerAgent,
  RaceDebrief,
  ScoringConfig,
  SeasonResult,
  SeasonState,
  TeamId,
} from './types.js';
import { createRng } from './rng.js';
import { runRace } from './race-engine.js';
import { calculateSeasonScore } from './scoring.js';

function hashCombine(a: number, b: number): number {
  let h = (a ^ (b * 0x9e3779b9 + 0x6d2b79f5)) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = h ^ (h >>> 16);
  return h >>> 0;
}

export function runSeason(
  catalog: GameCatalogData,
  teamId: TeamId,
  agent: PlayerAgent,
  seed: number,
  config: ScoringConfig = { styleBonusesEnabled: false },
): SeasonResult {
  const team = catalog.teams.find((t) => t.id === teamId);
  if (!team) {
    throw new Error(`Team not found: ${teamId}`);
  }

  const rng = createRng(seed);

  // Shuffle scenario order
  const scenarioIds = catalog.scenarios.map((s) => s.id);
  const raceOrder = rng.shuffle(scenarioIds);

  const raceResults: RaceDebrief[] = [];

  for (let raceIndex = 0; raceIndex < raceOrder.length; raceIndex++) {
    const scenarioId = raceOrder[raceIndex];
    const scenario = catalog.scenarios.find((s) => s.id === scenarioId)!;

    // Derive per-race seed
    const raceSeed = hashCombine(seed, raceIndex);

    // Mid-season card swap after race 3 (index 2)
    if (raceIndex === 3 && agent.chooseCardSwap) {
      const allCardIds = catalog.cards.map((c) => c.id);
      agent.chooseCardSwap(allCardIds, allCardIds);
      // Note: In M0 the card swap is a no-op for the deterministic agent.
      // A real UI agent would modify the deck composition here.
    }

    const debrief = runRace(scenario, team, catalog, agent, raceSeed, config);
    raceResults.push(debrief);
  }

  const finalScore = calculateSeasonScore(raceResults);

  return {
    races: raceResults,
    finalScore,
    teamId,
  };
}

export function initializeSeasonState(
  catalog: GameCatalogData,
  teamId: TeamId,
  seed: number,
): SeasonState {
  const rng = createRng(seed);
  const scenarioIds = catalog.scenarios.map((s) => s.id);
  const raceOrder = rng.shuffle(scenarioIds);
  const allCardIds = catalog.cards.map((c) => c.id);

  return {
    teamId,
    seed,
    raceOrder,
    currentRaceIndex: 0,
    raceResults: [],
    cumulativeScore: 0,
    cardSwapDone: false,
    availableCards: allCardIds,
    tireBank: { soft: 8, medium: 8, hard: 8 },
  };
}
