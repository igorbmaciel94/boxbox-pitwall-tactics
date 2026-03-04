import { useCallback, useRef } from 'react';
import {
  createRng,
  refillHandWithRng,
  selectEvent,
  updateEventTracking,
  applyPreEffects,
  applyPostEffects,
  checkRainSpike,
  consumeQuickDecisionCard,
  applyCardEffect,
  applyEndOfTurnPerk,
  clampRaceState,
  applyEffect,
  calculateRaceScore,
} from '@boxbox/engine';
import type {
  CardId,
  RaceState,
  SeededRng,
  TurnSummary,
} from '@boxbox/engine';
import { useGameStore } from '../stores/game-store';

export function useTurnStepper() {
  const rngRef = useRef<SeededRng | null>(null);
  const turnLogRef = useRef<TurnSummary[]>([]);
  const currentEventRef = useRef<ReturnType<typeof selectEvent> | null>(null);
  const quickDecisionCardRef = useRef<CardId | null>(null);
  const perkActivatedRef = useRef(false);
  const actionCardRef = useRef<CardId>('');

  const store = useGameStore;

  const startNextTurn = useCallback(() => {
    const { raceState: state, catalog, scenario, seed } = store.getState();

    // Lazy-init RNG on first turn (picks up the seed from the store's startRace)
    if (!rngRef.current && seed) {
      rngRef.current = createRng(seed);
      turnLogRef.current = [];
    }
    const rng = rngRef.current;
    if (!state || !rng || !catalog || !scenario) return;

    // Save previous position for gap display
    store.getState().setPreviousPosition(state.position);

    // Increment turn
    let s: RaceState = { ...state, currentTurn: state.currentTurn + 1, turnPhase: 'start' };

    // Phase 1: Refill hand
    const handRng = rng.fork(s.currentTurn * 100 + 1);
    s = refillHandWithRng(s, catalog, handRng);
    s = { ...s, turnPhase: 'refill-hand' };
    store.getState().setRaceState(s);
    store.getState().setTurnPhaseUI('refill-hand');

    // Reset refs
    quickDecisionCardRef.current = null;
    perkActivatedRef.current = false;
    actionCardRef.current = '';
  }, []);

  const advanceToRevealEvent = useCallback(() => {
    const { raceState: state, catalog, scenario } = store.getState();
    const rng = rngRef.current;
    if (!state || !rng || !catalog || !scenario) return;

    // Phase 2: Reveal event
    const eventRng = rng.fork(state.currentTurn * 100 + 2);
    const event = selectEvent(state, scenario, eventRng, catalog);
    let s = updateEventTracking(state, event);
    s = { ...s, turnPhase: 'reveal-event' };
    currentEventRef.current = event;

    store.getState().setRaceState(s);
    store.getState().setCurrentEvent(event);
    store.getState().setTurnPhaseUI('reveal-event');
  }, []);

  const advanceToPreEffects = useCallback(() => {
    const { raceState: state } = store.getState();
    const event = currentEventRef.current;
    if (!state || !event) return;

    // Phase 3: Pre-effects
    let s = applyPreEffects(state, event);
    s = { ...s, turnPhase: 'pre-effects' };
    store.getState().setRaceState(s);
    store.getState().setTurnPhaseUI('pre-effects');
  }, []);

  const advanceToQuickDecisionOrPerk = useCallback(() => {
    const { raceState: state, catalog } = store.getState();
    const event = currentEventRef.current;
    if (!state || !event || !catalog) return;

    // Phase 4: Check if quick decision needed
    const needsQD = event.requiresQuickDecision || checkRainSpike(state);
    const hasEligible = needsQD && state.hand.some((id) => {
      const card = catalog.cards.find((c) => c.id === id);
      return card?.quickDecisionEligible;
    });

    if (hasEligible) {
      store.getState().setNeedsQuickDecision(true);
      store.getState().setTurnPhaseUI('await-quick-decision');
    } else {
      store.getState().setNeedsQuickDecision(false);
      advanceToPerkOrAction();
    }
  }, []);

  const submitQuickDecision = useCallback((cardId: CardId | null) => {
    const { raceState: state, catalog } = store.getState();
    if (!state || !catalog) return;

    let s: RaceState = { ...state, quickDecisionMade: false, turnPhase: 'quick-decision' };

    if (cardId !== null) {
      const card = catalog.cards.find((c) => c.id === cardId);
      if (card && card.quickDecisionEligible && s.hand.includes(cardId)) {
        s = consumeQuickDecisionCard(s, cardId, catalog);
        quickDecisionCardRef.current = cardId;
      }
    }

    store.getState().setRaceState(s);
    store.getState().setNeedsQuickDecision(false);
    advanceToPerkOrAction();
  }, []);

  const advanceToPerkOrAction = useCallback(() => {
    const { raceState: state, team } = store.getState();
    if (!state || !team) return;

    // Phase 5: Team perk (standard timing only)
    if (!state.perkUsed && team.perk.timing === 'standard') {
      store.getState().setTurnPhaseUI('await-perk');
    } else {
      store.getState().setTurnPhaseUI('await-action-card');
    }
  }, []);

  const submitPerkChoice = useCallback((usePerk: boolean) => {
    const { raceState: state, team } = store.getState();
    if (!state || !team) return;

    let s: RaceState = { ...state, turnPhase: 'team-perk' };

    if (usePerk && !state.perkUsed && team.perk.timing === 'standard') {
      s = applyEffect(s, team.perk.effect);
      s = { ...s, perkUsed: true };
      perkActivatedRef.current = true;
    }

    store.getState().setRaceState(s);
    store.getState().setTurnPhaseUI('await-action-card');
  }, []);

  const submitActionCard = useCallback((cardId: CardId) => {
    const { raceState: state, catalog, team, scenario } = store.getState();
    const event = currentEventRef.current;
    if (!state || !catalog || !team || !scenario || !event) return;

    // Phase 6: Play action card
    let s: RaceState = { ...state, turnPhase: 'play-card' };
    let usedCard = cardId;

    if (s.hand.length > 0) {
      if (!s.hand.includes(cardId)) {
        usedCard = s.hand[0];
      }
      s = applyCardEffect(s, usedCard, catalog);
    }
    actionCardRef.current = usedCard;

    store.getState().setRaceState(s);
    store.getState().setTurnPhaseUI('resolving');
  }, []);

  const advanceToPostEffects = useCallback(() => {
    const { raceState: state } = store.getState();
    const event = currentEventRef.current;
    if (!state || !event) return;

    // Phase 7: Post effects
    let s = applyPostEffects(state, event);
    s = { ...s, turnPhase: 'post-effects' };
    store.getState().setRaceState(s);
    store.getState().setTurnPhaseUI('post-effects');
  }, []);

  const advanceToClampAndHooks = useCallback(() => {
    const { raceState: state, team, scenario, catalog } = store.getState();
    if (!state || !team || !scenario || !catalog) return;

    // Phase 8: Clamp + end-of-turn hooks
    const perkBefore = state.perkUsed;
    let s = applyEndOfTurnPerk(state, team);
    const perkEOT = !perkBefore && s.perkUsed;
    s = clampRaceState(s);
    s = { ...s, turnPhase: 'end' };

    // Record turn summary
    const summary: TurnSummary = {
      turn: s.currentTurn,
      event: currentEventRef.current!,
      quickDecisionCard: quickDecisionCardRef.current,
      actionCard: actionCardRef.current,
      perkActivated: perkActivatedRef.current || perkEOT,
      stateSnapshot: {
        position: s.position,
        tireWear: s.tireWear,
        fuel: s.fuel,
        rainMeter: s.rainMeter,
      },
    };
    turnLogRef.current.push(summary);

    store.getState().setRaceState(s);
    store.getState().addTurnSummary(summary);

    // Check if race complete
    if (s.currentTurn >= s.totalTurns) {
      const debrief = calculateRaceScore(s, scenario, catalog, turnLogRef.current, {
        styleBonusesEnabled: true,
      });
      store.getState().setLastDebrief(debrief);
      store.getState().setTurnPhaseUI('race-complete');
    } else {
      store.getState().setTurnPhaseUI('turn-summary');
    }
  }, []);

  return {
    startNextTurn,
    advanceToRevealEvent,
    advanceToPreEffects,
    advanceToQuickDecisionOrPerk,
    submitQuickDecision,
    submitPerkChoice,
    submitActionCard,
    advanceToPostEffects,
    advanceToClampAndHooks,
  };
}
