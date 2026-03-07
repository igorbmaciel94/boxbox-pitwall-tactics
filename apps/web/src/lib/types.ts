import type { CardId, RaceDebrief, TeamId } from '@boxbox/engine';

export type TurnPhaseUI =
  | 'idle'
  | 'pre-race-setup'
  | 'refill-hand'
  | 'await-mulligan'
  | 'reveal-event'
  | 'await-perk'
  | 'await-action-card'
  | 'await-compound'
  | 'resolving'
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
  goalCardId?: string | null;
  goalAchieved?: boolean;
  championshipPosition?: number;
}

export interface Trophy {
  goalCardId: string;
  teamId: TeamId;
  championshipPosition: number;
  goalAchieved: boolean;
  finalScore: number;
  timestamp: number;
}
