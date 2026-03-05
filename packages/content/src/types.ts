export type EventType =
  | 'safety-car'
  | 'rain'
  | 'rival-pits'
  | 'rival-overtake'
  | 'traffic'
  | 'clear-air'
  | 'mechanical-issue';

export type TireCompound = 'soft' | 'medium' | 'hard' | 'intermediate' | 'wet';

export interface CardEffect {
  position?: number;
  tireWear?: number;
}

export interface CardData {
  id: string;
  name: string;
  rulesText: string;
  effect: CardEffect;
  tags: string[];
}

export interface TeamPerkData {
  id: string;
  name: string;
  description: string;
  effect: CardEffect;
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
