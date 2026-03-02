export type EventType =
  | 'safety-car'
  | 'vsc'
  | 'rain'
  | 'rival-pits'
  | 'track-limits'
  | 'traffic'
  | 'clear-air'
  | 'drs-train'
  | 'mechanical-issue';

export type PerkTiming = 'standard' | 'end-of-turn';

export interface CardEffect {
  position?: number;
  tireWear?: number;
  fuel?: number;
  rainMeter?: number;
}

export interface CardData {
  id: string;
  name: string;
  rulesText: string;
  effect: CardEffect;
  tags: string[];
  quickDecisionEligible: boolean;
}

export interface TeamPerkData {
  id: string;
  name: string;
  description: string;
  timing: PerkTiming;
  effect: CardEffect;
  condition?: string;
}

export interface TeamData {
  id: string;
  name: string;
  color: string;
  perk: TeamPerkData;
}

export interface ObjectiveData {
  id: string;
  description: string;
  type: 'main' | 'bonus';
  evaluate: string;
  params: Record<string, number | string>;
  points: number;
}

export interface ScenarioParamsData {
  startingPosition: number;
  baseTireWear: number;
  baseFuel: number;
  rainChance: number;
  eventWeights: Record<EventType, number>;
}

export interface ScenarioData {
  id: string;
  name: string;
  circuit: string;
  turns: number;
  params: ScenarioParamsData;
  objectives: ObjectiveData[];
}

export interface GameStringsData {
  events: Record<EventType, string[]>;
  radio: {
    stayOut: string[];
    boxBox: string[];
    generic: string[];
  };
}

export interface GameCatalogData {
  version: string;
  cards: CardData[];
  scenarios: ScenarioData[];
  teams: TeamData[];
  strings: GameStringsData;
}
