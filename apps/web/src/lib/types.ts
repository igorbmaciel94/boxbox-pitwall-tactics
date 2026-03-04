import type { CardId, RaceDebrief, TeamId } from '@boxbox/engine';

export type TurnPhaseUI =
  | 'idle'
  | 'refill-hand'
  | 'reveal-event'
  | 'pre-effects'
  | 'await-quick-decision'
  | 'await-perk'
  | 'await-action-card'
  | 'resolving'
  | 'post-effects'
  | 'clamp-and-hooks'
  | 'turn-summary'
  | 'race-complete';

export type GameMode = 'idle' | 'race' | 'season';

export interface SavedDeck {
  name: string;
  cards: CardId[];
  createdAt: number;
}

export interface BestScore {
  scenarioId: string;
  score: number;
  position: number;
  medal: 'gold' | 'silver' | 'bronze' | null;
  timestamp: number;
}

export interface RunHistoryEntry {
  scenarioId: string;
  teamId: TeamId;
  debrief: RaceDebrief;
  timestamp: number;
}

export interface SeasonRunEntry {
  teamId: TeamId;
  races: RaceDebrief[];
  finalScore: number;
  timestamp: number;
}
