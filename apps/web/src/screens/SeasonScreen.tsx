import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useGameStore } from '../stores/game-store';
import { Button } from '../components/shared/Button';
import { Modal } from '../components/shared/Modal';
import { CardComponent } from '../components/race/CardComponent';
import { getPositionColor } from '../lib/constants';
import type { CardId } from '@boxbox/engine';

function hashCombine(a: number, b: number): number {
  let h = (a ^ (b * 0x9e3779b9 + 0x6d2b79f5)) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = h ^ (h >>> 16);
  return h >>> 0;
}

export function SeasonScreen() {
  const navigate = useNavigate();
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

  // Start season if not started
  useEffect(() => {
    if (!seasonProgress) {
      startSeason();
    }
  }, []);

  // Check for card swap after race 3
  useEffect(() => {
    if (seasonProgress && seasonProgress.currentRaceIndex === 3 && !seasonProgress.cardSwapDone) {
      setSwapDeck([...currentDeck]);
      setShowCardSwap(true);
    }
  }, [seasonProgress?.currentRaceIndex, seasonProgress?.cardSwapDone]);

  if (!catalog || !seasonProgress) {
    return (
      <div className="flex items-center justify-center h-64 text-metal-light text-xs">
        Loading season...
      </div>
    );
  }

  const { raceOrder, currentRaceIndex, raceResults, cumulativeScore } = seasonProgress;
  const isComplete = currentRaceIndex >= raceOrder.length;

  // Navigate to results in useEffect to avoid calling navigate during render
  useEffect(() => {
    if (isComplete) {
      navigate('/season/results');
    }
  }, [isComplete, navigate]);

  if (isComplete) {
    return null;
  }

  const currentScenarioId = raceOrder[currentRaceIndex];
  const currentScenario = catalog.scenarios.find((s) => s.id === currentScenarioId);
  const team = catalog.teams.find((t) => t.id === selectedTeamId);

  const handleStartNextRace = () => {
    const raceSeed = hashCombine(seasonProgress.seed, currentRaceIndex);
    startRace(currentScenarioId, raceSeed);
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
    <div className="flex flex-col px-4 pt-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-lg font-bold uppercase tracking-wider">Season</h1>
        <span className="font-mono text-sm">{cumulativeScore} pts</span>
      </div>
      {team && (
        <p className="text-[10px] mb-4" style={{ color: team.color }}>
          {team.name}
        </p>
      )}

      {/* Progress bar */}
      <div className="flex gap-1 mb-6">
        {raceOrder.map((scenarioId, i) => {
          const scenario = catalog.scenarios.find((s) => s.id === scenarioId);
          const result = raceResults[i];
          const isCurrent = i === currentRaceIndex;

          return (
            <div key={i} className="flex-1 text-center">
              <div
                className={`h-2 rounded-full mb-1 transition-colors ${
                  result
                    ? 'bg-hud-green'
                    : isCurrent
                      ? 'bg-hud-blue animate-pulse'
                      : 'bg-metal-dark'
                }`}
              />
              <div className="text-[8px] font-display uppercase tracking-wider text-metal-light truncate">
                {scenario?.name.split(' ')[0] ?? scenarioId}
              </div>
              {result && (
                <div className={`text-[9px] ${getPositionColor(result.finalPosition)}`}>
                  P{result.finalPosition}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Past results */}
      {raceResults.length > 0 && (
        <div className="mb-4 space-y-1.5">
          <div className="text-[10px] font-display uppercase tracking-wider text-metal-light">
            Completed Races
          </div>
          {raceResults.map((result, i) => {
            const sc = catalog.scenarios.find((s) => s.id === result.scenarioId);
            return (
              <div key={i} className="flex items-center justify-between rounded border border-metal-light/10 bg-carbon-mid/50 p-2 text-[10px]">
                <span>{sc?.name}</span>
                <div className="flex gap-3">
                  <span className={getPositionColor(result.finalPosition)}>P{result.finalPosition}</span>
                  <span>{result.totalScore} pts</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Next race */}
      <div className="rounded-lg border border-hud-blue/30 bg-carbon-mid p-4 mb-4">
        <div className="text-[10px] font-display uppercase tracking-wider text-hud-blue mb-1">
          Race {currentRaceIndex + 1} of {raceOrder.length}
        </div>
        <div className="font-display text-sm font-bold uppercase tracking-wider">{currentScenario?.name}</div>
        <div className="text-[10px] text-metal-light">{currentScenario?.circuit}</div>
        <div className="mt-2 flex gap-3 text-[9px] text-metal-light">
          <span>Start P{currentScenario?.params.startingPosition}</span>
          <span>{currentScenario?.turns} laps</span>
        </div>
      </div>

      <Button variant="primary" size="lg" className="w-full" onClick={handleStartNextRace}>
        Start Race
      </Button>

      {/* Card Swap Modal */}
      <Modal
        open={showCardSwap}
        title="Mid-Season Card Swap"
        onClose={() => {
          setSeasonCardSwapDone();
          setShowCardSwap(false);
        }}
      >
        <div className="space-y-3">
          <p className="text-xs text-metal-light">
            After 3 races, you may modify your deck for the remaining season.
          </p>

          <div className="text-[10px] font-display uppercase tracking-wider text-metal-light">
            Current Deck ({swapDeck.length}/9)
          </div>
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }).map((_, i) => {
              const cardId = swapDeck[i];
              const card = cardId ? catalog.cards.find((c) => c.id === cardId) : null;
              return (
                <button
                  key={i}
                  onClick={() => cardId && removeFromSwapDeck(i)}
                  className={`rounded border p-1.5 text-center text-[8px] font-mono min-h-[36px] flex items-center justify-center
                    ${card ? 'border-metal-light/40 bg-carbon-mid hover:border-hud-red/50' : 'border-metal-light/10 bg-carbon-mid/50 text-metal-light/30'}`}
                >
                  {card ? card.name : 'Empty'}
                </button>
              );
            })}
          </div>

          <div className="text-[10px] font-display uppercase tracking-wider text-metal-light">
            All Cards
          </div>
          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
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
            Confirm Deck
          </Button>
        </div>
      </Modal>
    </div>
  );
}
