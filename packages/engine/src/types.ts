import type {
  CardData,
  CardEffect,
  EventType,
  GameCatalogData,
  ObjectiveData,
  ScenarioData,
  TeamData,
} from '@boxbox/content';

export type { CardData, CardEffect, EventType, GameCatalogData, ObjectiveData, ScenarioData, TeamData };

export type CardId = string;
export type TeamId = string;

export type TurnPhase =
  | 'start'
  | 'refill-hand'
  | 'reveal-event'
  | 'pre-effects'
  | 'quick-decision'
  | 'team-perk'
  | 'play-card'
  | 'post-effects'
  | 'clamp-and-hooks'
  | 'end';

export interface RaceEvent {
  type: EventType;
  name: string;
  preEffect?: CardEffect;
  postEffect?: CardEffect;
  requiresQuickDecision: boolean;
  flavorText: string;
}

export interface RaceState {
  scenarioId: string;
  teamId: TeamId;
  seed: number;

  position: number;
  tireWear: number;
  fuel: number;
  rainMeter: number;

  currentTurn: number;
  totalTurns: number;

  deck: CardId[];
  hand: CardId[];
  discard: CardId[];

  currentEvent: RaceEvent | null;
  eventHistory: RaceEvent[];
  scUsed: boolean;
  vscUsed: boolean;
  lastEventType: EventType | null;

  perkUsed: boolean;

  objectivesCompleted: string[];
  cardsPlayedTotal: CardId[];

  quickDecisionMade: boolean;
  turnPhase: TurnPhase;

  maxTireWearReached: number;
}

export interface TurnSummary {
  turn: number;
  event: RaceEvent;
  quickDecisionCard: CardId | null;
  actionCard: CardId;
  perkActivated: boolean;
  stateSnapshot: {
    position: number;
    tireWear: number;
    fuel: number;
    rainMeter: number;
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
  chooseQuickDecisionCard(state: RaceState): CardId | null;
  chooseTeamPerk(state: RaceState): boolean;
  chooseActionCard(state: RaceState): CardId;
  chooseCardSwap?(availableCards: CardId[], currentDeck: CardId[]): CardId[];
}

export interface SeededRng {
  next(): number;
  nextInt(min: number, max: number): number;
  shuffle<T>(array: readonly T[]): T[];
  weightedSelect<T>(items: readonly T[], weights: readonly number[]): T;
  fork(salt: number): SeededRng;
  readonly seed: number;
}
