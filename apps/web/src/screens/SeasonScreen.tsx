import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useGameStore } from '../stores/game-store';
import { Button } from '../components/shared/Button';
import { Modal } from '../components/shared/Modal';
import { ChampionshipStandings } from '../components/season/ChampionshipStandings';
import { getPositionColor } from '../lib/constants';
import { useI18n } from '../i18n';

export function SeasonScreen() {
  const navigate = useNavigate();
  const { t, getScenarioName, getScenarioCircuit, getTeamName } = useI18n();
  const catalog = useGameStore((s) => s.catalog);
  const selectedTeamId = useGameStore((s) => s.selectedTeamId);
  const seasonProgress = useGameStore((s) => s.seasonProgress);
  const currentDeck = useGameStore((s) => s.currentDeck);

  const [showStandings, setShowStandings] = useState(false);

  const isComplete = seasonProgress ? seasonProgress.currentRaceIndex >= (seasonProgress.raceOrder?.length ?? 0) : false;

  // Enter season mode and redirect to setup if no season in progress
  useEffect(() => {
    if (seasonProgress) {
      useGameStore.getState().setMode('season');
    } else {
      navigate('/season/setup', { replace: true });
    }
  }, [seasonProgress, navigate]);

  // Navigate to results when complete
  useEffect(() => {
    if (isComplete) {
      navigate('/season/results');
    }
  }, [isComplete, navigate]);

  if (!catalog || !selectedTeamId || currentDeck.length !== 9) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 px-5 text-center">
        <div className="font-display text-base font-bold uppercase tracking-wide text-metal-light">
          {t('race.notReady')}
        </div>
        <p className="text-sm text-metal-light">
          {!selectedTeamId ? t('race.selectTeam') : t('race.buildDeck')} {t('race.beforeRacing')}
        </p>
        <Button variant="primary" size="md" onClick={() => navigate(!selectedTeamId ? '/team' : '/decks')}>
          {!selectedTeamId ? t('race.selectTeam') : t('race.buildDeck')}
        </Button>
      </div>
    );
  }

  if (!seasonProgress || isComplete) {
    return null;
  }

  const { raceOrder, currentRaceIndex, raceResults, cumulativeScore, initialTireBank } = seasonProgress;

  const currentScenarioId = raceOrder[currentRaceIndex];
  const currentScenario = catalog.scenarios.find((s) => s.id === currentScenarioId);
  const team = catalog.teams.find((t) => t.id === selectedTeamId);

  const handleStartNextRace = () => {
    navigate('/race');
  };

  return (
    <div className="flex flex-col px-5 pt-6">
      <button
        onClick={() => navigate('/')}
        className="mb-4 text-left text-xs uppercase tracking-wider text-metal-light transition-colors hover:text-white"
      >
        &larr; {t('common.back')}
      </button>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">{t('season.title')}</h1>
        <span className="font-mono text-base">{cumulativeScore} {t('common.scorePts')}</span>
      </div>
      {team && (
        <p className="mb-5 text-sm" style={{ color: team.color }}>
          {getTeamName(team.id, team.name)}
        </p>
      )}

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-6">
        {raceOrder.map((scenarioId, i) => {
          const scenario = catalog.scenarios.find((s) => s.id === scenarioId);
          const result = raceResults[i];
          const isCurrent = i === currentRaceIndex;

          return (
            <div key={i} className="flex-1 text-center">
              <div
                className={`h-1.5 rounded-full mb-1.5 transition-colors ${
                  result
                    ? 'bg-hud-green'
                    : isCurrent
                      ? 'bg-apex-red'
                      : 'bg-white/10'
                }`}
              />
              <div className="truncate text-[10px] uppercase tracking-wider text-metal-light">
                {scenario ? getScenarioName(scenario.id, scenario.name).split(' ')[0] : scenarioId}
              </div>
              {result && (
                <div className={`text-xs ${getPositionColor(result.finalPosition)}`}>
                  P{result.finalPosition}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Championship Standings toggle */}
      {seasonProgress.championshipStandings.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowStandings(!showStandings)}
            className="w-full flex items-center justify-between rounded-2xl bg-white/[0.04] p-3 text-xs font-display uppercase tracking-wider text-metal-light hover:bg-white/[0.06] transition-colors"
          >
            <span>{t('standings.title')}</span>
            <span>{showStandings ? '\u25B2' : '\u25BC'}</span>
          </button>
          {showStandings && (
            <div className="mt-2">
              <ChampionshipStandings
                standings={seasonProgress.championshipStandings}
                playerDriverId={seasonProgress.playerDriverId}
                teams={catalog.teams}
              />
            </div>
          )}
        </div>
      )}

      {/* Past results */}
      {raceResults.length > 0 && (
        <div className="mb-4 space-y-2 rounded-2xl bg-white/[0.04] p-4">
          <div className="text-xs font-display uppercase tracking-wider text-metal-light">
            {t('season.completedRaces')}
          </div>
          {raceResults.map((result, i) => {
            const sc = catalog.scenarios.find((s) => s.id === result.scenarioId);
            return (
              <div key={i} className="flex items-center justify-between rounded-xl bg-white/[0.04] p-3 text-xs">
                <span>{sc ? getScenarioName(sc.id, sc.name) : result.scenarioId}</span>
                <div className="flex gap-3">
                  <span className={getPositionColor(result.finalPosition)}>P{result.finalPosition}</span>
                  <span>{result.totalScore} {t('common.scorePts')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Next race */}
      <div className="mb-5 rounded-2xl border border-apex-red/30 bg-apex-red/5 p-4">
        <div className="mb-1 text-xs font-display uppercase tracking-wider text-apex-red/80">
          {t('season.raceOf', { current: currentRaceIndex + 1, total: raceOrder.length })}
        </div>
        <div className="font-display text-xl font-bold uppercase tracking-wide">
          {currentScenario ? getScenarioName(currentScenario.id, currentScenario.name) : '-'}
        </div>
        <div className="text-sm text-metal-light">
          {currentScenario ? getScenarioCircuit(currentScenario.id, currentScenario.circuit) : '-'}
        </div>
        <div className="mt-2 flex gap-3 text-xs text-metal-light">
          <span>{t('race.start')} {(() => {
            const goalCard = seasonProgress.goalCardId
              ? catalog.goalCards.find((g) => g.id === seasonProgress.goalCardId)
              : null;
            return goalCard
              ? `P${goalCard.startingPositionRange[0]}-P${goalCard.startingPositionRange[1]}`
              : `P${currentScenario?.params.startingPosition}`;
          })()}</span>
          <span>{currentScenario?.turns} {t('race.laps')}</span>
        </div>
      </div>

      {/* Tire budget */}
      <div className="mb-4 rounded-2xl bg-white/[0.04] p-4">
        <div className="mb-2 text-xs font-display uppercase tracking-wider text-metal-light">
          {t('tireSetup.seasonBudget')}
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-full bg-red-500" />
            <span className="font-mono text-xs">S: {seasonProgress.tireBank.soft}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-full bg-yellow-500" />
            <span className="font-mono text-xs">M: {seasonProgress.tireBank.medium}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-full bg-white" />
            <span className="font-mono text-xs">H: {seasonProgress.tireBank.hard}</span>
          </div>
        </div>
        {initialTireBank && (
          <div className="mt-2 text-[10px] text-metal-light">
            {t('season.initialBudget')}: S:{initialTireBank.soft} M:{initialTireBank.medium} H:{initialTireBank.hard}
          </div>
        )}
      </div>

      <div className="mb-4">
        <Button variant="primary" size="lg" className="w-full" onClick={handleStartNextRace}>
          {t('season.startRace')}
        </Button>
      </div>
    </div>
  );
}
