import { useNavigate } from 'react-router';
import { useGameStore } from '../stores/game-store';
import { getPositionColor, calculateMedal, MEDAL_COLORS, EVENT_ICONS } from '../lib/constants';
import { Button } from '../components/shared/Button';
import { RaceClassification } from '../components/race/RaceClassification';
import { useI18n } from '../i18n';

export function DebriefScreen() {
  const navigate = useNavigate();
  const {
    t,
    getScenarioName,
    getScenarioCircuit,
    getTeamName,
    getObjectiveDescription,
    getCardName,
    getEventName,
    getMedalLabel,
  } = useI18n();
  const lastDebrief = useGameStore((s) => s.lastDebrief);
  const catalog = useGameStore((s) => s.catalog);
  const mode = useGameStore((s) => s.mode);
  const advanceSeasonRace = useGameStore((s) => s.advanceSeasonRace);
  const resetRace = useGameStore((s) => s.resetRace);
  const seasonProgress = useGameStore((s) => s.seasonProgress);

  if (!lastDebrief || !catalog) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-metal-light">
        {t('debrief.noData')}
      </div>
    );
  }

  const scenario = catalog.scenarios.find((s) => s.id === lastDebrief.scenarioId);
  const team = catalog.teams.find((t) => t.id === lastDebrief.teamId);
  const medal = calculateMedal(lastDebrief.finalPosition);

  const handleContinue = () => {
    if (mode === 'season') {
      advanceSeasonRace(lastDebrief);
      resetRace();
      navigate('/season');
    } else {
      resetRace();
      navigate('/');
    }
  };

  const handleHome = () => {
    if (mode === 'season') {
      advanceSeasonRace(lastDebrief);
    }
    resetRace();
    navigate('/');
  };

  return (
    <div className="flex flex-col px-5 pt-6">
      <h1 className="mb-1 font-display text-2xl font-bold uppercase tracking-wide">{t('debrief.title')}</h1>
      <p className="mb-5 text-sm text-metal-light">
        {scenario ? getScenarioName(scenario.id, scenario.name) : '-'} - {scenario ? getScenarioCircuit(scenario.id, scenario.circuit) : '-'}
      </p>

      {/* Position + Score hero */}
      <div className="mb-4 rounded-2xl bg-white/[0.04] p-5 text-center">
        <div className={`font-display text-4xl font-black ${getPositionColor(lastDebrief.finalPosition)}`}>
          P{lastDebrief.finalPosition}
        </div>
        <div className="mt-2 font-mono text-2xl font-bold">{lastDebrief.totalScore} {t('common.scorePts')}</div>
        {medal && (
          <div className={`mt-1 font-display text-sm font-bold uppercase ${MEDAL_COLORS[medal]}`}>
            {getMedalLabel(medal, medal)} {t('debrief.medalSuffix')}
          </div>
        )}
        {team && (
          <div className="mt-1 text-sm" style={{ color: team.color }}>
            {getTeamName(team.id, team.name)}
          </div>
        )}
      </div>

      {/* Score breakdown */}
      <div className="mb-4 rounded-2xl bg-white/[0.04] p-4">
        <div className="mb-3 text-xs font-display uppercase tracking-wider text-metal-light">
          {t('debrief.scoreBreakdown')}
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-metal-light">{t('debrief.positionLine', { position: lastDebrief.finalPosition })}</span>
            <span>{lastDebrief.positionScore} {t('common.scorePts')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-metal-light">{t('debrief.objectives')}</span>
            <span>{lastDebrief.objectivePoints} {t('common.scorePts')}</span>
          </div>
          {lastDebrief.styleBonus > 0 && (
            <div className="flex justify-between">
              <span className="text-metal-light">{t('debrief.styleBonus')}</span>
              <span className="text-hud-amber">+{lastDebrief.styleBonus} {t('common.scorePts')}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-white/8 pt-2 font-bold">
            <span>{t('debrief.total')}</span>
            <span>{lastDebrief.totalScore} {t('common.scorePts')}</span>
          </div>
        </div>
      </div>

      {/* Objectives */}
      <div className="mb-4 rounded-2xl bg-white/[0.04] p-4">
        <div className="mb-3 text-xs font-display uppercase tracking-wider text-metal-light">
          {t('debrief.objectives')}
        </div>
        <div className="space-y-2">
          {scenario?.objectives.map((obj) => {
            const completed = lastDebrief.objectivesCompleted.some((o) => o.id === obj.id);
            return (
              <div key={obj.id} className="flex items-center gap-2.5 text-sm">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${completed ? 'bg-hud-green/20 text-hud-green' : 'bg-white/5 text-white/30'}`}>
                  {completed ? 'OK' : '--'}
                </span>
                <span className={completed ? 'text-white' : 'text-metal-light'}>
                  {getObjectiveDescription(obj.id, obj.description)}
                </span>
                <span className="ml-auto text-metal-light">{obj.points}{t('common.scorePts')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Turn timeline */}
      <div className="mb-4 rounded-2xl bg-white/[0.04] p-4">
        <div className="mb-3 text-xs font-display uppercase tracking-wider text-metal-light">
          {t('debrief.lapSummary')}
        </div>
        <div className="space-y-2">
          {lastDebrief.turnLog.map((turn) => {
            const actionCard = catalog.cards.find((c) => c.id === turn.actionCard);
            return (
              <div key={turn.turn} className="flex items-start gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-xs">
                <span className="w-8 shrink-0 font-display font-semibold text-metal-light">
                  L{turn.turn}
                </span>
                <div className="flex-1">
                  <span className="text-metal-light">
                    {EVENT_ICONS[turn.event.type] ?? '?'} {getEventName(turn.event.type, turn.event.name)}
                  </span>
                  <span className="ml-2 text-f1-red">{actionCard ? getCardName(actionCard.id, actionCard.name) : turn.actionCard}</span>
                  {turn.perkActivated && <span className="text-hud-green ml-2">{t('debrief.perkActivated')}</span>}
                </div>
                <span className="shrink-0 text-metal-light">
                  P{turn.stateSnapshot.position}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Race Classification */}
      {lastDebrief.fullClassification && lastDebrief.fullClassification.length > 0 && (
        <div className="mb-4">
          <RaceClassification
            classification={lastDebrief.fullClassification}
            playerDriverId={seasonProgress?.playerDriverId ?? catalog.drivers.find((d) => d.teamId === lastDebrief.teamId)?.id ?? ''}
            teams={catalog.teams}
            seed={lastDebrief.seed}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2.5 pb-4">
        {mode === 'season' ? (
          <>
            <Button variant="ghost" size="md" className="flex-1" onClick={handleHome}>
              {t('common.home')}
            </Button>
            <Button variant="primary" size="md" className="flex-1" onClick={handleContinue}>
              {seasonProgress && seasonProgress.currentRaceIndex >= seasonProgress.raceOrder.length - 1
                ? t('debrief.seasonComplete')
                : t('debrief.nextRace')}
            </Button>
          </>
        ) : (
          <Button variant="primary" size="lg" className="w-full" onClick={handleContinue}>
            {t('common.done')}
          </Button>
        )}
      </div>
    </div>
  );
}
