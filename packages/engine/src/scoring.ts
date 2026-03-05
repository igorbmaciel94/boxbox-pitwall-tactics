import type { GameCatalogData, ObjectiveData, RaceDebrief, RaceState, ScenarioData, ScoringConfig, TurnSummary } from './types.js';

export const POSITION_SCORE_TABLE: Record<number, number> = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1,
};

export function getPositionScore(position: number): number {
  return POSITION_SCORE_TABLE[position] ?? 0;
}

export function evaluateObjective(
  objective: ObjectiveData,
  state: RaceState,
  catalog: GameCatalogData,
): boolean {
  const evaluator = EVALUATORS[objective.evaluate];
  if (!evaluator) {
    return false;
  }
  return evaluator(state, objective.params, catalog);
}

type EvaluatorFn = (
  state: RaceState,
  params: Record<string, number | string>,
  catalog: GameCatalogData,
) => boolean;

const EVALUATORS: Record<string, EvaluatorFn> = {
  'finish-above': (state, params) => {
    const target = params.position as number;
    return state.position <= target;
  },

  'tire-wear-below': (state, params) => {
    const threshold = params.threshold as number;
    return state.tireWear <= threshold;
  },

  'used-perk': (state) => {
    return state.perkUsed;
  },

  'min-cards-with-tag': (state, params, catalog) => {
    const tag = params.tag as string;
    const minCount = params.count as number;
    let count = 0;
    for (const cardId of state.cardsPlayedTotal) {
      const card = catalog.cards.find((c) => c.id === cardId);
      if (card && card.tags.includes(tag)) {
        count++;
      }
    }
    return count >= minCount;
  },

  'max-tire-wear-below': (state, params) => {
    const threshold = params.threshold as number;
    return state.maxTireWearReached <= threshold;
  },
};

export function calculateRaceScore(
  state: RaceState,
  scenario: ScenarioData,
  catalog: GameCatalogData,
  turnLog: TurnSummary[],
  config: ScoringConfig,
): RaceDebrief {
  const positionScore = getPositionScore(state.position);

  const completedObjectives: ObjectiveData[] = [];
  let objectivePoints = 0;

  for (const objective of scenario.objectives) {
    if (evaluateObjective(objective, state, catalog)) {
      completedObjectives.push(objective);
      objectivePoints += objective.points;
    }
  }

  const styleBonus = config.styleBonusesEnabled ? calculateStyleBonus(state) : 0;

  const totalScore = positionScore + objectivePoints + styleBonus;

  return {
    scenarioId: scenario.id,
    teamId: state.teamId,
    finalPosition: state.position,
    positionScore,
    objectivesCompleted: completedObjectives,
    objectivePoints,
    styleBonus,
    totalScore,
    eventHistory: state.eventHistory,
    cardsPlayed: state.cardsPlayedTotal,
    perkUsed: state.perkUsed,
    hasPitted: state.hasPitted,
    turnLog,
  };
}

function calculateStyleBonus(state: RaceState): number {
  let bonus = 0;

  // Bonus for finishing on worn tires (aggressive style)
  if (state.tireWear >= 80) bonus += 2;

  // Bonus for using many different cards
  const uniqueCards = new Set(state.cardsPlayedTotal);
  if (uniqueCards.size >= 5) bonus += 2;

  return bonus;
}

export function calculateSeasonScore(debriefs: RaceDebrief[]): number {
  return debriefs.reduce((sum, d) => sum + d.totalScore, 0);
}
