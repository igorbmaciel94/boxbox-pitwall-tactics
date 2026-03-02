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
import { refillHandWithRng, applyCardEffect, consumeQuickDecisionCard } from './card-effects.js';
import { selectEvent, applyPreEffects, applyPostEffects, checkRainSpike, updateEventTracking } from './event-system.js';
import { maybeApplyTeamPerk, applyEndOfTurnPerk } from './team-perks.js';
import { clampRaceState } from './clamp.js';
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
    fuel: scenario.params.baseFuel,
    rainMeter: 0,
    currentTurn: 0,
    totalTurns: scenario.turns,
    deck: shuffledDeck,
    hand: [],
    discard: [],
    currentEvent: null,
    eventHistory: [],
    scUsed: false,
    vscUsed: false,
    lastEventType: null,
    perkUsed: false,
    objectivesCompleted: [],
    cardsPlayedTotal: [],
    quickDecisionMade: false,
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

  // Phase 2: Reveal event
  s = { ...s, turnPhase: 'reveal-event' };
  const eventRng = rng.fork(s.currentTurn * 100 + 2);
  const event = selectEvent(s, scenario, eventRng, catalog);
  s = updateEventTracking(s, event);

  // Phase 3: Apply pre-effects
  s = { ...s, turnPhase: 'pre-effects' };
  s = applyPreEffects(s, event);

  // Phase 4: Quick decision (SC/VSC/Rain spike)
  s = { ...s, turnPhase: 'quick-decision', quickDecisionMade: false };
  let quickDecisionCard: string | null = null;
  const needsQuickDecision = event.requiresQuickDecision || checkRainSpike(s);

  if (needsQuickDecision && s.hand.length > 0) {
    const chosen = agent.chooseQuickDecisionCard(s);
    if (chosen !== null) {
      const card = catalog.cards.find((c) => c.id === chosen);
      if (card && card.quickDecisionEligible && s.hand.includes(chosen)) {
        s = consumeQuickDecisionCard(s, chosen, catalog);
        quickDecisionCard = chosen;
      }
    }
  }

  // Phase 5: Team perk (standard timing)
  s = { ...s, turnPhase: 'team-perk' };
  const perkUsedBefore = s.perkUsed;
  s = maybeApplyTeamPerk(s, team, agent);
  const perkActivatedStandard = !perkUsedBefore && s.perkUsed;

  // Phase 6: Play 1 action card
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

  // Phase 7: Apply post-effects
  s = { ...s, turnPhase: 'post-effects' };
  s = applyPostEffects(s, event);

  // Phase 8: Clamp + end-of-turn hooks
  s = { ...s, turnPhase: 'clamp-and-hooks' };
  const perkUsedBeforeEOT = s.perkUsed;
  s = applyEndOfTurnPerk(s, team);
  const perkActivatedEOT = !perkUsedBeforeEOT && s.perkUsed;
  s = clampRaceState(s);
  s = { ...s, turnPhase: 'end' };

  const summary: TurnSummary = {
    turn: s.currentTurn,
    event,
    quickDecisionCard,
    actionCard,
    perkActivated: perkActivatedStandard || perkActivatedEOT,
    stateSnapshot: {
      position: s.position,
      tireWear: s.tireWear,
      fuel: s.fuel,
      rainMeter: s.rainMeter,
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
