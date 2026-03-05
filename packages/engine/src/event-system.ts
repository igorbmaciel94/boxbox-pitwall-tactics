import type { CardEffect, EventType, GameCatalogData, RaceEvent, RaceState, ScenarioData, SeededRng } from './types.js';

const EVENT_EFFECTS: Record<EventType, CardEffect> = {
  'safety-car': { tireWear: -5 },
  'rain': { tireWear: 10 },
  'rival-pits': { position: -1 },
  'rival-overtake': { position: 2 },
  'traffic': { position: 2, tireWear: 8 },
  'clear-air': { tireWear: -5 },
  'mechanical-issue': { position: 3, tireWear: 10 },
};

export function selectEvent(
  state: RaceState,
  scenario: ScenarioData,
  rng: SeededRng,
  catalog: GameCatalogData,
): RaceEvent {
  const weights = { ...scenario.params.eventWeights };

  // Max 1 safety car per race
  if (state.scUsed) {
    weights['safety-car'] = 0;
  }

  // No consecutive safety cars
  if (state.lastEventType === 'safety-car') {
    weights['safety-car'] = 0;
  }

  const eventTypes = Object.keys(weights) as EventType[];
  const weightValues = eventTypes.map((t) => weights[t]);
  const totalWeight = weightValues.reduce((sum, w) => sum + w, 0);

  if (totalWeight <= 0) {
    return buildEvent('clear-air', catalog, rng);
  }

  const selectedType = rng.weightedSelect(eventTypes, weightValues);
  return buildEvent(selectedType, catalog, rng);
}

function buildEvent(type: EventType, catalog: GameCatalogData, rng: SeededRng): RaceEvent {
  const effect = EVENT_EFFECTS[type];
  const flavorTexts = catalog.strings.events[type];
  const flavorIndex = rng.nextInt(0, flavorTexts.length - 1);
  const flavorText = flavorTexts[flavorIndex];

  return {
    type,
    name: type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    flavorIndex,
    effect,
    flavorText,
  };
}

export function applyEventEffect(state: RaceState, event: RaceEvent): RaceState {
  return {
    ...state,
    position: state.position + (event.effect.position ?? 0),
    tireWear: state.tireWear + (event.effect.tireWear ?? 0),
  };
}

export function updateEventTracking(state: RaceState, event: RaceEvent): RaceState {
  return {
    ...state,
    currentEvent: event,
    eventHistory: [...state.eventHistory, event],
    lastEventType: event.type,
    scUsed: state.scUsed || event.type === 'safety-car',
    underSafetyCar: event.type === 'safety-car',
  };
}

/** Check if it's currently raining based on recent event history */
export function isCurrentlyRaining(state: RaceState): boolean {
  const recentEvents = state.eventHistory.slice(-2);
  return recentEvents.some((e) => e.type === 'rain');
}
