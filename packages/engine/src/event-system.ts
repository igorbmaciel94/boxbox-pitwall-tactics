import type { CardEffect, EventType, GameCatalogData, RaceEvent, RaceState, ScenarioData, SeededRng } from './types.js';
import { applyEffect } from './clamp.js';

const EVENT_DEFINITIONS: Record<EventType, { requiresQuickDecision: boolean; preEffect?: CardEffect; postEffect?: CardEffect }> = {
  'safety-car': {
    requiresQuickDecision: true,
    preEffect: { position: 0 }, // Field bunches up -- neutralizes gaps
  },
  'vsc': {
    requiresQuickDecision: true,
    preEffect: { fuel: -5 }, // Slower pace saves fuel
  },
  'rain': {
    requiresQuickDecision: false,
    preEffect: { rainMeter: 2 },
  },
  'rival-pits': {
    requiresQuickDecision: false,
    postEffect: { position: 1 }, // Pressure from rivals pitting
  },
  'track-limits': {
    requiresQuickDecision: false,
    postEffect: { position: 1 }, // Penalty risk
  },
  'traffic': {
    requiresQuickDecision: false,
    postEffect: { position: 1, tireWear: 5 }, // Dirty air + wear
  },
  'clear-air': {
    requiresQuickDecision: false,
    preEffect: { tireWear: -5 }, // Clean air is gentle on tires
  },
  'drs-train': {
    requiresQuickDecision: false,
    postEffect: { tireWear: 5 }, // Close following increases wear
  },
  'mechanical-issue': {
    requiresQuickDecision: false,
    postEffect: { position: 2, fuel: 5 }, // Nursing the car
  },
};

export function selectEvent(
  state: RaceState,
  scenario: ScenarioData,
  rng: SeededRng,
  catalog: GameCatalogData,
): RaceEvent {
  const weights = { ...scenario.params.eventWeights };

  // Envelope constraint: max 1 SC per race
  if (state.scUsed) {
    weights['safety-car'] = 0;
  }

  // Envelope constraint: max 1 VSC per race
  if (state.vscUsed) {
    weights['vsc'] = 0;
  }

  // Envelope constraint: max 2 rain events per race
  if (state.rainCount >= 2) {
    weights['rain'] = 0;
  }

  // Envelope constraint: no consecutive SC/VSC
  if (state.lastEventType === 'safety-car') {
    weights['safety-car'] = 0;
  }
  if (state.lastEventType === 'vsc') {
    weights['vsc'] = 0;
  }

  // Cooldown: after any dramatic event, halve dramatic weights next turn
  const dramaticEvents: EventType[] = ['safety-car', 'vsc', 'rain'];
  if (state.lastEventType && dramaticEvents.includes(state.lastEventType)) {
    for (const de of dramaticEvents) {
      weights[de] = Math.floor(weights[de] / 2);
    }
  }

  const eventTypes = Object.keys(weights) as EventType[];
  const weightValues = eventTypes.map((t) => weights[t]);
  const totalWeight = weightValues.reduce((sum, w) => sum + w, 0);

  // Fallback: if all weights are 0, default to clear-air
  if (totalWeight <= 0) {
    return buildEvent('clear-air', catalog, rng);
  }

  const selectedType = rng.weightedSelect(eventTypes, weightValues);

  // Rain spike: if rain meter >= 7 after a rain event, it becomes a quick-decision event
  const event = buildEvent(selectedType, catalog, rng);

  return event;
}

function buildEvent(type: EventType, catalog: GameCatalogData, rng: SeededRng): RaceEvent {
  const def = EVENT_DEFINITIONS[type];
  const flavorTexts = catalog.strings.events[type];
  const flavorText = flavorTexts[rng.nextInt(0, flavorTexts.length - 1)];

  return {
    type,
    name: type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    preEffect: def.preEffect,
    postEffect: def.postEffect,
    requiresQuickDecision: def.requiresQuickDecision,
    flavorText,
  };
}

export function applyPreEffects(state: RaceState, event: RaceEvent): RaceState {
  if (!event.preEffect) return state;
  return applyEffect(state, event.preEffect);
}

export function applyPostEffects(state: RaceState, event: RaceEvent): RaceState {
  if (!event.postEffect) return state;
  return applyEffect(state, event.postEffect);
}

export function checkRainSpike(state: RaceState): boolean {
  return state.rainMeter >= 7;
}

export function updateEventTracking(state: RaceState, event: RaceEvent): RaceState {
  return {
    ...state,
    currentEvent: event,
    eventHistory: [...state.eventHistory, event],
    lastEventType: event.type,
    scUsed: state.scUsed || event.type === 'safety-car',
    vscUsed: state.vscUsed || event.type === 'vsc',
    rainCount: state.rainCount + (event.type === 'rain' ? 1 : 0),
  };
}
