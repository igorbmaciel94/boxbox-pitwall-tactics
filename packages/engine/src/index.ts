// Types
export type {
  CardData,
  CardEffect,
  CardId,
  EventType,
  GameCatalogData,
  ObjectiveData,
  PlayerAgent,
  RaceDebrief,
  RaceEvent,
  RaceState,
  ScenarioData,
  ScoringConfig,
  SeasonResult,
  SeasonState,
  SeededRng,
  TeamData,
  TeamId,
  TurnPhase,
  TireAllocation,
  TireCompound,
  SeasonTireBank,
  TurnSummary,
} from './types.js';

// RNG
export { createRng } from './rng.js';

// Engine
export { runRace, initializeRaceState, runTurn } from './race-engine.js';
export { runSeason, initializeSeasonState } from './season-engine.js';

// Subsystems
export { selectEvent, applyEventEffect, updateEventTracking, isCurrentlyRaining } from './event-system.js';
export { applyCardEffect, refillHandWithRng, performMulligan, performEmergencyMulligan, handHasPitCard } from './card-effects.js';
export { maybeApplyTeamPerk } from './team-perks.js';
export { clampRaceState, applyEffect, applyEndOfTurnPenalties, applyCrashCheck } from './clamp.js';
export { getPositionScore, evaluateObjective, calculateRaceScore, calculateSeasonScore, POSITION_SCORE_TABLE } from './scoring.js';
export { validateRaceState, validateCatalog } from './validators.js';
