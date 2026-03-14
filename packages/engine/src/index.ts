// Types
export type {
  CardData,
  CardEffect,
  CardId,
  Difficulty,
  DriverData,
  DriverStanding,
  EventType,
  GameCatalogData,
  GoalCardData,
  GoalCardTier,
  ObjectiveData,
  PlayerAgent,
  RaceDebrief,
  RaceEvent,
  RaceState,
  RivalRaceResult,
  ScenarioData,
  ScoringConfig,
  SeasonResult,
  SeasonState,
  SeasonTireBank,
  SeededRng,
  TeamData,
  TeamId,
  TireAllocation,
  TireCompound,
  TurnPhase,
  TurnSummary,
} from './types.js';

// RNG
export { createRng } from './rng.js';

// Engine
export { runRace, initializeRaceState, runTurn } from './race-engine.js';
export { runSeason, initializeSeasonState } from './season-engine.js';

// Subsystems
export {
  selectEvent,
  applyEventEffect,
  updateEventTracking,
  isCurrentlyRaining,
} from './event-system.js';
export {
  applyCardEffect,
  refillHandWithRng,
  performMulligan,
  performEmergencyMulligan,
  handHasPitCard,
  hasAvailableCompounds,
} from './card-effects.js';
export { maybeApplyTeamPerk } from './team-perks.js';
export {
  clampRaceState,
  applyEffect,
  applyEndOfTurnPenalties,
  applyCrashCheck,
  applyNoTiresPenalty,
} from './clamp.js';
export {
  getPositionScore,
  evaluateObjective,
  calculateRaceScore,
  calculateSeasonScore,
  POSITION_SCORE_TABLE,
} from './scoring.js';
export { validateRaceState, validateCatalog } from './validators.js';

// Rivals
export {
  simulateRivalPositions,
  buildFullClassification,
  updateChampionshipStandings,
} from './rival-engine.js';

// Goals
export {
  evaluateGoalCard,
  getGoalCardForTeam,
  getGoalCardsForTeam,
  getTeamTier,
} from './goal-engine.js';
