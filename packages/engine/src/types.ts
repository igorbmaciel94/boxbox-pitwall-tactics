import type {
  CardData,
  CardEffect,
  EventType,
  GameCatalogData,
  ObjectiveData,
  ScenarioData,
  TeamData,
  TireCompound,
} from '@boxbox/content';

export type { CardData, CardEffect, EventType, GameCatalogData, ObjectiveData, ScenarioData, TeamData, TireCompound };

export type CardId = string;
export type TeamId = string;

export interface TireAllocation {
  soft: number;
  medium: number;
  hard: number;
}

export interface SeasonTireBank {
  soft: number;
  medium: number;
  hard: number;
}

export type TurnPhase =
  | 'start'
  | 'refill-hand'
  | 'await-mulligan'
  | 'reveal-event'
  | 'await-perk'
  | 'await-compound'
  | 'play-card'
  | 'resolve'
  | 'end';

export interface RaceEvent {
  type: EventType;
  name: string;
  flavorIndex: number;
  effect: CardEffect;
  flavorText: string;
}

export interface RaceState {
  scenarioId: string;
  teamId: TeamId;
  seed: number;

  position: number;
  tireWear: number;
  tireCompound: TireCompound;
  tireAllocation: TireAllocation;
  compoundSetsUsed: TireCompound[];
  hasPitted: boolean;
  pitStopsMade: number;

  currentTurn: number;
  totalTurns: number;

  deck: CardId[];
  hand: CardId[];
  discard: CardId[];

  currentEvent: RaceEvent | null;
  eventHistory: RaceEvent[];
  scUsed: boolean;
  underSafetyCar: boolean;
  lastEventType: EventType | null;

  perkUsed: boolean;
  mulliganUsed: boolean;
  emergencyMulliganUsed: boolean;
  turnsSkipped: number;
  trackLimitViolations: number;

  objectivesCompleted: string[];
  cardsPlayedTotal: CardId[];

  turnPhase: TurnPhase;

  maxTireWearReached: number;
  isDNF: boolean;
  lastCrashSeverity: 'none' | 'damage' | 'dnf';
}

export interface TurnSummary {
  turn: number;
  event: RaceEvent;
  actionCard: CardId;
  perkActivated: boolean;
  tireCompound: TireCompound;
  stateSnapshot: {
    position: number;
    tireWear: number;
  };
}

export interface RaceDebrief {
  scenarioId: string;
  teamId: TeamId;
  finalPosition: number;
  positionScore: number;
  objectivesCompleted: ObjectiveData[];
  objectivePoints: number;
  styleBonus: number;
  totalScore: number;
  eventHistory: RaceEvent[];
  cardsPlayed: CardId[];
  perkUsed: boolean;
  hasPitted: boolean;
  turnLog: TurnSummary[];
}

export interface SeasonState {
  teamId: TeamId;
  seed: number;
  raceOrder: string[];
  currentRaceIndex: number;
  raceResults: RaceDebrief[];
  cumulativeScore: number;
  cardSwapDone: boolean;
  availableCards: CardId[];
  tireBank: SeasonTireBank;
}

export interface SeasonResult {
  races: RaceDebrief[];
  finalScore: number;
  teamId: TeamId;
}

export interface ScoringConfig {
  styleBonusesEnabled: boolean;
}

export interface PlayerAgent {
  chooseTeamPerk(state: RaceState): boolean;
  chooseActionCard(state: RaceState): CardId;
  chooseCardSwap?(availableCards: CardId[], currentDeck: CardId[]): CardId[];
  chooseMulligan?(state: RaceState): boolean;
  chooseCompound?(state: RaceState): TireCompound;
}

export interface SeededRng {
  next(): number;
  nextInt(min: number, max: number): number;
  shuffle<T>(array: readonly T[]): T[];
  weightedSelect<T>(items: readonly T[], weights: readonly number[]): T;
  fork(salt: number): SeededRng;
  readonly seed: number;
}
