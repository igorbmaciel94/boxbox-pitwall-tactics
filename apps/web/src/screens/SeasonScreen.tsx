import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useGameStore } from '../stores/game-store';
import { Button } from '../components/shared/Button';
import { Modal } from '../components/shared/Modal';
import { CardComponent } from '../components/race/CardComponent';
import { getPositionColor } from '../lib/constants';
import type { CardId } from '@boxbox/engine';
import { useI18n } from '../i18n';

function hashCombine(a: number, b: number): number {
  let h = (a ^ (b * 0x9e3779b9 + 0x6d2b79f5)) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = h ^ (h >>> 16);
  return h >>> 0;
}

export function SeasonScreen() {
  const navigate = useNavigate();
  const { t, getScenarioName, getScenarioCircuit, getTeamName, getCardName } = useI18n();
  const catalog = useGameStore((s) => s.catalog);
  const selectedTeamId = useGameStore((s) => s.selectedTeamId);
  const seasonProgress = useGameStore((s) => s.seasonProgress);
  const currentDeck = useGameStore((s) => s.currentDeck);
  const startSeason = useGameStore((s) => s.startSeason);
  const startRace = useGameStore((s) => s.startRace);
  const setDeck = useGameStore((s) => s.setDeck);
  const setSeasonCardSwapDone = useGameStore((s) => s.setSeasonCardSwapDone);

  const [showCardSwap, setShowCardSwap] = useState(false);
  const [swapDeck, setSwapDeck] = useState<CardId[]>([]);

  const isComplete = seasonProgress ? seasonProgress.currentRaceIndex >= (seasonProgress.raceOrder?.length ?? 0) : false;

  useEffect(() => {
    if (!seasonProgress) {
      startSeason();
    }
  }, [seasonProgress, startSeason]);

  useEffect(() => {
    if (seasonProgress && seasonProgress.currentRaceIndex === 3 && !seasonProgress.cardSwapDone) {
      setSwapDeck([...currentDeck]);
      setShowCardSwap(true);
    }
  }, [seasonProgress?.currentRaceIndex, seasonProgress?.cardSwapDone, currentDeck]);

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

  if (!seasonProgress) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-metal-light">
        {t('season.loadingSeason')}
      </div>
    );
  }

  if (isComplete) {
    return null;
  }

  const { raceOrder, currentRaceIndex, raceResults, cumulativeScore } = seasonProgress;

  const currentScenarioId = raceOrder[currentRaceIndex];
  const currentScenario = catalog.scenarios.find((s) => s.id === currentScenarioId);
  const team = catalog.teams.find((t) => t.id === selectedTeamId);

  const handleStartNextRace = () => {
    // Navigate to race screen - tire setup will be shown there before race starts
    navigate('/race');
  };

  const handleCardSwapConfirm = () => {
    if (swapDeck.length === 9) {
      setDeck(swapDeck);
    }
    setSeasonCardSwapDone();
    setShowCardSwap(false);
  };

  const addToSwapDeck = (id: CardId) => {
    if (swapDeck.length >= 9) return;
    const count = swapDeck.filter((c) => c === id).length;
    if (count >= 2) return;
    setSwapDeck([...swapDeck, id]);
  };

  const removeFromSwapDeck = (index: number) => {
    setSwapDeck(swapDeck.filter((_, i) => i !== index));
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
                      ? 'bg-f1-red'
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
      <div className="mb-5 rounded-2xl border border-f1-red/30 bg-f1-red/5 p-4">
        <div className="mb-1 text-xs font-display uppercase tracking-wider text-f1-red/80">
          {t('season.raceOf', { current: currentRaceIndex + 1, total: raceOrder.length })}
        </div>
        <div className="font-display text-xl font-bold uppercase tracking-wide">
          {currentScenario ? getScenarioName(currentScenario.id, currentScenario.name) : '-'}
        </div>
        <div className="text-sm text-metal-light">
          {currentScenario ? getScenarioCircuit(currentScenario.id, currentScenario.circuit) : '-'}
        </div>
        <div className="mt-2 flex gap-3 text-xs text-metal-light">
          <span>{t('race.start')} P{currentScenario?.params.startingPosition}</span>
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
      </div>

      <Button variant="primary" size="lg" className="w-full" onClick={handleStartNextRace}>
        {t('season.startRace')}
      </Button>

      {/* Card Swap Modal */}
      <Modal
        open={showCardSwap}
        title={t('season.cardSwapTitle')}
        onClose={() => {
          setSeasonCardSwapDone();
          setShowCardSwap(false);
        }}
      >
        <div className="space-y-4">
          <p className="text-sm text-metal-light">
            {t('season.cardSwapDesc')}
          </p>

          <div className="text-xs font-display uppercase tracking-wider text-metal-light">
            {t('season.currentDeck')} ({swapDeck.length}/9)
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {Array.from({ length: 9 }).map((_, i) => {
              const cardId = swapDeck[i];
              const card = cardId ? catalog.cards.find((c) => c.id === cardId) : null;
              return (
                <button
                  key={i}
                  onClick={() => cardId && removeFromSwapDeck(i)}
                  className={`flex min-h-[40px] items-center justify-center rounded-xl p-2 text-center text-[10px] font-mono
                    ${
                      card
                        ? 'bg-white/8 hover:bg-hud-red/10'
                        : 'border border-dashed border-white/10 text-white/20'
                    }`}
                >
                  {card ? getCardName(card.id, card.name) : t('common.empty')}
                </button>
              );
            })}
          </div>

          <div className="text-xs font-display uppercase tracking-wider text-metal-light">
            {t('season.allCards')}
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {catalog.cards.map((card) => {
              const count = swapDeck.filter((c) => c === card.id).length;
              const canAdd = swapDeck.length < 9 && count < 2;
              return (
                <CardComponent
                  key={card.id}
                  card={card}
                  selected={count > 0}
                  disabled={!canAdd && count === 0}
                  compact
                  onClick={() => canAdd && addToSwapDeck(card.id)}
                />
              );
            })}
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full"
            disabled={swapDeck.length !== 9}
            onClick={handleCardSwapConfirm}
          >
            {t('deck.confirmDeck')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
