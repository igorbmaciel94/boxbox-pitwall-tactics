import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useGameStore } from '../stores/game-store';
import { Button } from '../components/shared/Button';
import { ChampionshipStandings } from '../components/season/ChampionshipStandings';
import { getPositionColor, calculateMedal, MEDAL_COLORS } from '../lib/constants';
import { evaluateGoalCard } from '@boxbox/engine';
import { addTrophy, addSeasonRun } from '../stores/persistence';
import { useI18n } from '../i18n';

export function SeasonResultsScreen() {
  const navigate = useNavigate();
  const { t, getTeamName, getScenarioName, getMedalLabel } = useI18n();
  const catalog = useGameStore((s) => s.catalog);
  const seasonProgress = useGameStore((s) => s.seasonProgress);
  const selectedTeamId = useGameStore((s) => s.selectedTeamId);
  const resetAll = useGameStore((s) => s.resetAll);
  const savedRef = useRef(false);

  if (!catalog || !seasonProgress || seasonProgress.raceResults.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-metal-light">
        {t('seasonResults.noData')}
      </div>
    );
  }

  const { raceResults, cumulativeScore, championshipStandings, goalCardId, playerDriverId } = seasonProgress;
  const team = catalog.teams.find((t) => t.id === selectedTeamId);
  const medal = calculateMedal(cumulativeScore);

  const bestRace = raceResults.reduce((best, r) => (r.totalScore > best.totalScore ? r : best), raceResults[0]);
  const worstRace = raceResults.reduce((worst, r) => (r.totalScore < worst.totalScore ? r : worst), raceResults[0]);

  // Evaluate goal card
  const goalCard = goalCardId ? catalog.goalCards.find((g) => g.id === goalCardId) : null;
  const goalAchieved = goalCard
    ? evaluateGoalCard(goalCard, playerDriverId, championshipStandings, raceResults, catalog.drivers)
    : null;

  // Player championship position
  const playerStandingIdx = championshipStandings.findIndex((s) => s.driverId === playerDriverId);
  const championshipPosition = playerStandingIdx >= 0 ? playerStandingIdx + 1 : null;

  // Auto-save trophy and season run on mount (once)
  useEffect(() => {
    if (savedRef.current || !selectedTeamId) return;
    savedRef.current = true;

    if (goalCardId && championshipPosition !== null) {
      addTrophy({
        goalCardId,
        teamId: selectedTeamId,
        championshipPosition,
        goalAchieved: goalAchieved ?? false,
        finalScore: cumulativeScore,
        timestamp: Date.now(),
      }).then((trophies) => useGameStore.getState().setTrophies(trophies));
    }

    addSeasonRun({
      teamId: selectedTeamId,
      races: raceResults,
      finalScore: cumulativeScore,
      timestamp: Date.now(),
      goalCardId,
      goalAchieved: goalAchieved ?? false,
      championshipPosition: championshipPosition ?? undefined,
    }).then((runs) => useGameStore.getState().setSeasonRuns(runs));
  }, []);

  return (
    <div className="flex flex-col px-5 pt-6">
      <h1 className="mb-1 font-display text-2xl font-bold uppercase tracking-wide">{t('seasonResults.title')}</h1>
      {team && (
        <p className="mb-5 text-sm" style={{ color: team.color }}>{getTeamName(team.id, team.name)}</p>
      )}

      <div className="mb-5 rounded-2xl bg-white/[0.04] p-6 text-center">
        <div className="text-xs font-display uppercase tracking-wider text-metal-light">{t('seasonResults.finalScore')}</div>
        <div className="font-display text-4xl font-black mt-2">{cumulativeScore}</div>
        <div className="mt-1 text-sm text-metal-light">{raceResults.length} {t('common.racesCompleted')}</div>
        {championshipPosition && (
          <div className={`mt-1 font-display text-sm font-bold uppercase ${getPositionColor(championshipPosition)}`}>
            {t('seasonResults.championshipPosition', { position: championshipPosition })}
          </div>
        )}
        {medal && (
          <div className={`mt-2 font-display text-sm font-bold uppercase ${MEDAL_COLORS[medal]}`}>{getMedalLabel(medal, medal)} {t('seasonResults.seasonSuffix')}</div>
        )}
      </div>

      {/* Goal card evaluation */}
      {goalCard && goalAchieved !== null && (
        <div className={`mb-5 rounded-2xl p-4 text-center ${
          goalAchieved
            ? 'bg-hud-green/10 border border-hud-green/30'
            : 'bg-hud-red/10 border border-hud-red/30'
        }`}>
          <div className="text-xs font-display uppercase tracking-wider text-metal-light mb-1">
            {t('seasonResults.goalResult')}
          </div>
          <div className="font-display text-base font-bold uppercase tracking-wide">
            {goalCard.title}
          </div>
          <div className="mt-1 text-xs text-metal-light">{goalCard.description}</div>
          <div className={`mt-2 font-display text-sm font-bold uppercase ${
            goalAchieved ? 'text-hud-green' : 'text-hud-red'
          }`}>
            {goalAchieved ? t('seasonResults.goalAchieved') : t('seasonResults.goalFailed')}
          </div>
        </div>
      )}

      {/* Championship Standings */}
      {championshipStandings.length > 0 && (
        <div className="mb-5">
          <ChampionshipStandings
            standings={championshipStandings}
            playerDriverId={playerDriverId}
            teams={catalog.teams}
          />
        </div>
      )}

      <div className="mb-5 rounded-2xl bg-white/[0.04] p-4">
        <div className="mb-3 text-xs font-display uppercase tracking-wider text-metal-light">{t('seasonResults.raceResults')}</div>
        <div className="space-y-2">
          {raceResults.map((result, i) => {
            const sc = catalog.scenarios.find((s) => s.id === result.scenarioId);
            const isBest = result === bestRace;
            const isWorst = result === worstRace;
            return (
              <div
                key={i}
                className={`flex items-center justify-between rounded-xl p-3 text-xs
                  ${
                    isBest
                      ? 'bg-hud-green/8 border border-hud-green/20'
                      : isWorst
                        ? 'bg-hud-red/8 border border-hud-red/20'
                        : 'bg-white/[0.04]'
                  }`}
              >
                <div>
                  <div className="font-display text-xs font-semibold uppercase tracking-wide">{sc ? getScenarioName(sc.id, sc.name) : result.scenarioId}</div>
                  <div className="text-[9px] text-metal-light mt-0.5">
                    {isBest && `${t('common.bestRace')} `}
                    {isWorst && `${t('common.worstRace')} `}
                    {result.objectivesCompleted.length}/{sc?.objectives.length ?? 0} {t('common.objectivesWord')}
                  </div>
                </div>
                <div className="text-right">
                  <div className={getPositionColor(result.finalPosition)}>P{result.finalPosition}</div>
                  <div className="font-mono font-bold">{result.totalScore} {t('common.scorePts')}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2.5 pb-4">
        <Button variant="ghost" size="md" className="flex-1" onClick={() => { resetAll(); navigate('/'); }}>
          {t('common.home')}
        </Button>
        <Button variant="primary" size="md" className="flex-1" onClick={() => { resetAll(); navigate('/season/setup'); }}>
          {t('seasonResults.newSeason')}
        </Button>
      </div>
    </div>
  );
}
