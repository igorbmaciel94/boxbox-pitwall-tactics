import type {
  Difficulty,
  GameCatalogData,
  PlayerAgent,
  RaceDebrief,
  RaceState,
  ScenarioData,
  ScoringConfig,
  SeededRng,
  TeamData,
  TireAllocation,
  TireCompound,
  TurnSummary,
} from './types.js';
import { createRng } from './rng.js';
import { refillHandWithRng, applyCardEffect, performMulligan } from './card-effects.js';
import {
  selectEvent,
  applyEventEffect,
  updateEventTracking,
  isCurrentlyRaining,
} from './event-system.js';
import { maybeApplyTeamPerk } from './team-perks.js';
import { clampRaceState, applyEndOfTurnPenalties, applyCrashCheck } from './clamp.js';
import { calculateRaceScore } from './scoring.js';

export function initializeRaceState(
  scenario: ScenarioData,
  team: TeamData,
  catalog: GameCatalogData,
  seed: number,
  rng: SeededRng,
  startingCompound: TireCompound = 'soft',
  tireAllocation: TireAllocation = { soft: 1, medium: 1, hard: 1 },
  difficulty: Difficulty = 'normal',
  startingPositionOverride?: number,
): RaceState {
  const allCardIds = catalog.cards.map((c) => c.id);
  const shuffledDeck = rng.fork(0).shuffle(allCardIds);

  return {
    scenarioId: scenario.id,
    teamId: team.id,
    seed,
    difficulty,
    position: startingPositionOverride ?? scenario.params.startingPosition,
    startingPosition: startingPositionOverride ?? scenario.params.startingPosition,
    tireWear: scenario.params.baseTireWear,
    tireCompound: startingCompound,
    tireAllocation,
    compoundSetsUsed: [startingCompound],
    hasPitted: false,
    pitStopsMade: 0,
    currentTurn: 0,
    totalTurns: scenario.turns,
    deck: shuffledDeck,
    hand: [],
    discard: [],
    currentEvent: null,
    eventHistory: [],
    cautionUsed: false,
    underCaution: false,
    lastEventType: null,
    perkUsed: false,
    mulliganUsed: false,
    emergencyMulliganUsed: false,
    turnsSkipped: 0,
    p1SkipsUsed: 0,
    objectivesCompleted: [],
    cardsPlayedTotal: [],
    turnPhase: 'start',
    maxTireWearReached: scenario.params.baseTireWear,
    isDNF: false,
    lastCrashSeverity: 'none',
  };
}

export function runTurn(
  state: RaceState,
  scenario: ScenarioData,
  team: TeamData,
  catalog: GameCatalogData,
  agent: PlayerAgent,
  rng: SeededRng,
): { state: RaceState; summary: TurnSummary } {
  let s: RaceState = {
    ...state,
    currentTurn: state.currentTurn + 1,
    turnPhase: 'start',
    lastCrashSeverity: 'none',
  };

  // Phase 1: Refill hand to 3
  s = { ...s, turnPhase: 'refill-hand' };
  const handRng = rng.fork(s.currentTurn * 100 + 1);
  s = refillHandWithRng(s, catalog, handRng);

  // Phase 1.5: Mulligan (optional, once per race)
  s = { ...s, turnPhase: 'await-mulligan' };
  if (!s.mulliganUsed && agent.chooseMulligan?.(s)) {
    const mulliganRng = rng.fork(s.currentTurn * 100 + 10);
    s = performMulligan(s, catalog, mulliganRng);
  }

  // Phase 2: Reveal event & apply effect
  s = { ...s, turnPhase: 'reveal-event' };
  const eventRng = rng.fork(s.currentTurn * 100 + 2);
  const event = selectEvent(s, scenario, eventRng, catalog);
  s = updateEventTracking(s, event);
  s = applyEventEffect(s, event);
  s = clampRaceState(s);

  // Phase 3: Team perk (optional, once per race)
  s = { ...s, turnPhase: 'await-perk' };
  const perkUsedBefore = s.perkUsed;
  s = maybeApplyTeamPerk(s, team, agent);
  s = clampRaceState(s);
  const perkActivated = !perkUsedBefore && s.perkUsed;

  // Phase 4: Play 1 action card
  s = { ...s, turnPhase: 'play-card' };
  let actionCard: string;
  if (s.hand.length > 0) {
    actionCard = agent.chooseActionCard(s);
    if (!s.hand.includes(actionCard)) {
      actionCard = s.hand[0];
    }
    s = applyCardEffect(s, actionCard, catalog, agent);
    s = clampRaceState(s);
  } else {
    actionCard = '';
  }

  // Phase 5: Resolve - apply penalties & clamp
  s = { ...s, turnPhase: 'resolve' };
  const raining = isCurrentlyRaining(s);
  s = applyEndOfTurnPenalties(s, raining, s.underCaution, s.difficulty);
  s = clampRaceState(s);

  // Crash check (after all effects are resolved)
  if (actionCard) {
    const crashRng = rng.fork(s.currentTurn * 100 + 50);
    s = applyCrashCheck(s, actionCard, catalog, raining, crashRng, s.difficulty);
    s = clampRaceState(s);
  }

  // Mandatory pit stop warning: if final turn and no pit, apply penalty
  if (s.currentTurn >= s.totalTurns && !s.hasPitted && !s.isDNF) {
    s = { ...s, position: s.position + 10 };
    s = clampRaceState(s);
  }

  s = { ...s, turnPhase: 'end' };

  const summary: TurnSummary = {
    turn: s.currentTurn,
    event,
    actionCard,
    perkActivated,
    tireCompound: s.tireCompound,
    stateSnapshot: {
      position: s.position,
      tireWear: s.tireWear,
    },
  };

  return { state: s, summary };
}

export function runRace(
  scenario: ScenarioData,
  team: TeamData,
  catalog: GameCatalogData,
  agent: PlayerAgent,
  seed: number,
  config: ScoringConfig = { styleBonusesEnabled: false },
  difficulty: Difficulty = 'normal',
): RaceDebrief {
  const rng = createRng(seed);
  let state = initializeRaceState(
    scenario,
    team,
    catalog,
    seed,
    rng,
    'soft',
    { soft: 1, medium: 1, hard: 1 },
    difficulty,
  );
  const turnLog: TurnSummary[] = [];

  for (let turn = 0; turn < scenario.turns; turn++) {
    const result = runTurn(state, scenario, team, catalog, agent, rng);
    state = result.state;
    turnLog.push(result.summary);
    if (state.isDNF) break;
  }

  return calculateRaceScore(state, scenario, catalog, turnLog, config);
}
