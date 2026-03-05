import { useCallback, useRef } from 'react';
import {
  createRng,
  refillHandWithRng,
  selectEvent,
  updateEventTracking,
  applyEventEffect,
  applyCardEffect,
  applyEndOfTurnPenalties,
  clampRaceState,
  applyEffect,
  calculateRaceScore,
  isCurrentlyRaining,
  performMulligan,
} from '@boxbox/engine';
import type {
  CardId,
  RaceState,
  SeededRng,
  TurnSummary,
  TireCompound,
} from '@boxbox/engine';
import { useGameStore } from '../stores/game-store';

export function useTurnStepper() {
  const rngRef = useRef<SeededRng | null>(null);
  const turnLogRef = useRef<TurnSummary[]>([]);
  const currentEventRef = useRef<ReturnType<typeof selectEvent> | null>(null);
  const perkActivatedRef = useRef(false);
  const actionCardRef = useRef<CardId>('');

  const store = useGameStore;

  const startNextTurn = useCallback(() => {
    const { raceState: state, catalog, scenario, seed } = store.getState();

    if (!rngRef.current && seed) {
      rngRef.current = createRng(seed);
      turnLogRef.current = [];
    }
    const rng = rngRef.current;
    if (!state || !rng || !catalog || !scenario) return;

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
    perkActivatedRef.current = false;
    actionCardRef.current = '';
  }, []);

  const advanceToRevealEvent = useCallback(() => {
    const { raceState: state, catalog, scenario } = store.getState();
    const rng = rngRef.current;
    if (!state || !rng || !catalog || !scenario) return;

    // Phase 2: Reveal event & apply its effect
    const eventRng = rng.fork(state.currentTurn * 100 + 2);
    const event = selectEvent(state, scenario, eventRng, catalog);
    let s = updateEventTracking(state, event);
    s = applyEventEffect(s, event);
    s = { ...s, turnPhase: 'reveal-event' };
    currentEventRef.current = event;

    store.getState().setRaceState(s);
    store.getState().setCurrentEvent(event);
    store.getState().setTurnPhaseUI('reveal-event');
  }, []);

  const advanceToPerkOrAction = useCallback(() => {
    const { raceState: state, team } = store.getState();
    if (!state || !team) return;

    // Phase 3: Team perk (if available)
    if (!state.perkUsed) {
      store.getState().setTurnPhaseUI('await-perk');
    } else {
      store.getState().setTurnPhaseUI('await-action-card');
    }
  }, []);

  const submitPerkChoice = useCallback((usePerk: boolean) => {
    const { raceState: state, team } = store.getState();
    if (!state || !team) return;

    let s: RaceState = { ...state, turnPhase: 'await-perk' };

    if (usePerk && !state.perkUsed) {
      s = applyEffect(s, team.perk.effect);
      s = { ...s, perkUsed: true };
      perkActivatedRef.current = true;
    }

    store.getState().setRaceState(s);
    store.getState().setTurnPhaseUI('await-action-card');
  }, []);

  const submitMulligan = useCallback(() => {
    const { raceState: state, catalog } = store.getState();
    const rng = rngRef.current;
    if (!state || !rng || !catalog) return;

    const mulliganRng = rng.fork(state.currentTurn * 100 + 10);
    const s = performMulligan(state, catalog, mulliganRng);
    store.getState().setRaceState(s);
  }, []);

  const submitActionCard = useCallback((cardId: CardId) => {
    const { raceState: state, catalog, team, scenario } = store.getState();
    const event = currentEventRef.current;
    if (!state || !catalog || !team || !scenario || !event) return;

    // Phase 4: Play action card
    let s: RaceState = { ...state, turnPhase: 'play-card' };
    let usedCard = cardId;

    if (s.hand.length > 0) {
      if (!s.hand.includes(cardId)) {
        usedCard = s.hand[0];
      }
      s = applyCardEffect(s, usedCard, catalog);
    }
    actionCardRef.current = usedCard;

    // Check if this was a pit stop card — if so, show compound selector
    const card = catalog.cards.find((c) => c.id === usedCard);
    const isPit = card && card.tags.includes('pit') && (card.effect.tireWear ?? 0) < 0;

    store.getState().setRaceState(s);
    store.getState().setTurnPhaseUI(isPit ? 'await-compound' : 'resolving');
  }, []);

  const submitCompoundChoice = useCallback((compound: TireCompound) => {
    const { raceState: state } = store.getState();
    if (!state) return;

    // Only update compound — tireWear/hasPitted/pitStopsMade already set by applyCardEffect
    const s: RaceState = {
      ...state,
      tireCompound: compound,
      compoundSetsUsed: [...state.compoundSetsUsed, compound],
    };
    store.getState().setRaceState(s);
    store.getState().setTurnPhaseUI('resolving');
  }, []);

  const advanceToResult = useCallback(() => {
    const { raceState: state, team, scenario, catalog } = store.getState();
    if (!state || !team || !scenario || !catalog) return;

    // Phase 5: Apply penalties & clamp
    const raining = isCurrentlyRaining(state);
    let s = applyEndOfTurnPenalties(state, raining);
    s = clampRaceState(s);

    // Mandatory pit stop penalty on final turn
    if (s.currentTurn >= s.totalTurns && !s.hasPitted) {
      s = { ...s, position: s.position + 10 };
      s = clampRaceState(s);
    }

    s = { ...s, turnPhase: 'end' };

    // Record turn summary
    const summary: TurnSummary = {
      turn: s.currentTurn,
      event: currentEventRef.current!,
      actionCard: actionCardRef.current,
      perkActivated: perkActivatedRef.current,
      tireCompound: s.tireCompound,
      stateSnapshot: {
        position: s.position,
        tireWear: s.tireWear,
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
    advanceToPerkOrAction,
    submitPerkChoice,
    submitMulligan,
    submitActionCard,
    submitCompoundChoice,
    advanceToResult,
  };
}
