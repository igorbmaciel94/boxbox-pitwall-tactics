import type {
  GameCatalogData,
  PlayerAgent,
  RaceDebrief,
  RaceEvent,
  RaceState,
  ScenarioData,
  ScoringConfig,
  SeededRng,
  TeamData,
  TurnSummary,
} from './types.js';
import { createRng } from './rng.js';
import { refillHandWithRng, applyCardEffect } from './card-effects.js';
import { selectEvent, applyEventEffect, updateEventTracking } from './event-system.js';
import { maybeApplyTeamPerk } from './team-perks.js';
import { clampRaceState, applyEndOfTurnPenalties } from './clamp.js';
import { calculateRaceScore } from './scoring.js';

export function initializeRaceState(
  scenario: ScenarioData,
  team: TeamData,
  catalog: GameCatalogData,
  seed: number,
  rng: SeededRng,
): RaceState {
  const allCardIds = catalog.cards.map((c) => c.id);
  const shuffledDeck = rng.fork(0).shuffle(allCardIds);

  return {
    scenarioId: scenario.id,
    teamId: team.id,
    seed,
    position: scenario.params.startingPosition,
    tireWear: scenario.params.baseTireWear,
    currentTurn: 0,
    totalTurns: scenario.turns,
    deck: shuffledDeck,
    hand: [],
    discard: [],
    currentEvent: null,
    eventHistory: [],
    scUsed: false,
    lastEventType: null,
    perkUsed: false,
    objectivesCompleted: [],
    cardsPlayedTotal: [],
    turnPhase: 'start',
    maxTireWearReached: scenario.params.baseTireWear,
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
  let s: RaceState = { ...state, currentTurn: state.currentTurn + 1, turnPhase: 'start' };

  // Phase 1: Refill hand to 3
  s = { ...s, turnPhase: 'refill-hand' };
  const handRng = rng.fork(s.currentTurn * 100 + 1);
  s = refillHandWithRng(s, catalog, handRng);

  // Phase 2: Reveal event & apply effect
  s = { ...s, turnPhase: 'reveal-event' };
  const eventRng = rng.fork(s.currentTurn * 100 + 2);
  const event = selectEvent(s, scenario, eventRng, catalog);
  s = updateEventTracking(s, event);
  s = applyEventEffect(s, event);

  // Phase 3: Team perk (optional, once per race)
  s = { ...s, turnPhase: 'await-perk' };
  const perkUsedBefore = s.perkUsed;
  s = maybeApplyTeamPerk(s, team, agent);
  const perkActivated = !perkUsedBefore && s.perkUsed;

  // Phase 4: Play 1 action card
  s = { ...s, turnPhase: 'play-card' };
  let actionCard: string;
  if (s.hand.length > 0) {
    actionCard = agent.chooseActionCard(s);
    if (!s.hand.includes(actionCard)) {
      actionCard = s.hand[0];
    }
    s = applyCardEffect(s, actionCard, catalog);
  } else {
    actionCard = '';
  }

  // Phase 5: Resolve - apply penalties & clamp
  s = { ...s, turnPhase: 'resolve' };
  s = applyEndOfTurnPenalties(s);
  s = clampRaceState(s);
  s = { ...s, turnPhase: 'end' };

  const summary: TurnSummary = {
    turn: s.currentTurn,
    event,
    actionCard,
    perkActivated,
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
): RaceDebrief {
  const rng = createRng(seed);
  let state = initializeRaceState(scenario, team, catalog, seed, rng);
  const turnLog: TurnSummary[] = [];

  for (let turn = 0; turn < scenario.turns; turn++) {
    const result = runTurn(state, scenario, team, catalog, agent, rng);
    state = result.state;
    turnLog.push(result.summary);
  }

  return calculateRaceScore(state, scenario, catalog, turnLog, config);
}
